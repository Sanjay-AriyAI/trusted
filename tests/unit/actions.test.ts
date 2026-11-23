import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  leadCreate: vi.fn(),
  assessmentLink: vi.fn(),
  assessmentCreate: vi.fn(),
  verifyTurnstile: vi.fn(),
  sendEmail: vi.fn(),
}));

vi.mock("@/lib/server/db", () => ({
  getDb: () => ({
    lead: { create: mocks.leadCreate },
    assessmentResponse: { updateManyAndReturn: mocks.assessmentLink, create: mocks.assessmentCreate },
  }),
}));
vi.mock("@/lib/server/turnstile", () => ({ verifyTurnstile: mocks.verifyTurnstile }));
vi.mock("@/lib/server/email", () => ({ sendEmail: mocks.sendEmail }));
vi.mock("@/lib/server/requestInfo", () => ({ getClientIp: async () => "203.0.113.7" }));
vi.mock("@/lib/server/env", () => ({ getEnv: () => ({ LEADS_NOTIFY_EMAIL: "team@example.com" }) }));

import { submitApplication } from "@/lib/actions/submitApplication";
import { submitAssessment } from "@/lib/actions/submitAssessment";
import { resetRateLimits } from "@/lib/server/rateLimit";

const validLead = { name: "Alex Morgan", email: "Alex@Company.com", track: "AI Leadership", turnstileToken: "tok" };

beforeEach(() => {
  vi.clearAllMocks();
  resetRateLimits();
  mocks.verifyTurnstile.mockResolvedValue(true);
  mocks.sendEmail.mockResolvedValue(true);
  mocks.leadCreate.mockResolvedValue({ id: "lead_1", createdAt: new Date("2026-11-20T10:00:00Z") });
  mocks.assessmentLink.mockResolvedValue([{ result: "AI Leadership" }]);
  mocks.assessmentCreate.mockResolvedValue({ id: "resp_1" });
});

describe("submitApplication", () => {
  it("returns field errors and saves nothing when input is invalid", async () => {
    const result = await submitApplication({ ...validLead, email: "nope" });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.errors.email).toBeDefined();
    expect(mocks.leadCreate).not.toHaveBeenCalled();
  });

  it("rejects a failed bot check before saving", async () => {
    mocks.verifyTurnstile.mockResolvedValue(false);
    const result = await submitApplication(validLead);
    expect(result.ok).toBe(false);
    expect(mocks.leadCreate).not.toHaveBeenCalled();
  });

  it("saves the lead (normalised email) and sends both emails", async () => {
    const result = await submitApplication(validLead);
    expect(result).toEqual({ ok: true, data: null });
    expect(mocks.leadCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        data: { name: "Alex Morgan", email: "alex@company.com", track: "AI Leadership", source: null },
      }),
    );
    expect(mocks.sendEmail).toHaveBeenCalledTimes(2);
    const recipients = mocks.sendEmail.mock.calls.map(([arg]) => (arg as { to: string }).to);
    expect(recipients).toEqual(["alex@company.com", "team@example.com"]);
  });

  it("links a prior assessment response to the new lead", async () => {
    await submitApplication({ ...validLead, assessmentId: "resp_1" });
    expect(mocks.assessmentLink).toHaveBeenCalledWith(
      expect.objectContaining({ where: { id: "resp_1", leadId: null }, data: { leadId: "lead_1" } }),
    );
  });

  it("still succeeds when email delivery fails (the lead is already saved)", async () => {
    mocks.sendEmail.mockResolvedValue(false);
    const result = await submitApplication(validLead);
    expect(result.ok).toBe(true);
  });

  it("returns a friendly error when the database is down", async () => {
    mocks.leadCreate.mockRejectedValue(new Error("connection refused"));
    vi.spyOn(console, "error").mockImplementation(() => {});
    const result = await submitApplication(validLead);
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.message).toMatch(/try again/i);
  });

  it("rate limits after 5 submissions from the same IP", async () => {
    for (let i = 0; i < 5; i++) expect((await submitApplication(validLead)).ok).toBe(true);
    const sixth = await submitApplication(validLead);
    expect(sixth.ok).toBe(false);
    if (!sixth.ok) expect(sixth.message).toMatch(/too many/i);
  });
});

describe("submitAssessment", () => {
  it("scores on the server and stores answers with question ids", async () => {
    const result = await submitAssessment({ answers: [2, 2, 2], turnstileToken: "tok" });
    expect(result).toEqual({
      ok: true,
      data: { id: "resp_1", track: "AI Leadership", blurb: expect.any(String) },
    });
    expect(mocks.assessmentCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        data: {
          answers: [
            { questionId: "usage", answerIndex: 2 },
            { questionId: "goal", answerIndex: 2 },
            { questionId: "technical", answerIndex: 2 },
          ],
          result: "AI Leadership",
        },
      }),
    );
  });

  it("rejects tampered answers", async () => {
    const result = await submitAssessment({ answers: [9, 9, 9], turnstileToken: "tok" });
    expect(result.ok).toBe(false);
    expect(mocks.assessmentCreate).not.toHaveBeenCalled();
  });

  it("still returns the recommendation if saving fails", async () => {
    mocks.assessmentCreate.mockRejectedValue(new Error("db down"));
    vi.spyOn(console, "error").mockImplementation(() => {});
    const result = await submitAssessment({ answers: [0, 0, 0], turnstileToken: "tok" });
    expect(result).toEqual({ ok: true, data: { id: null, track: "AI Practitioner", blurb: expect.any(String) } });
  });
});
