import { describe, expect, it } from "vitest";
import { assessmentSchema } from "@/lib/validation/assessment";
import { leadSchema } from "@/lib/validation/lead";

const validLead = {
  name: "Alex Morgan",
  email: "alex@company.com",
  track: "Certified AI Engineer",
  turnstileToken: "token",
};

describe("leadSchema", () => {
  it("accepts a valid application", () => {
    expect(leadSchema.safeParse(validLead).success).toBe(true);
  });

  it("trims the name and trims + lowercases the email", () => {
    const parsed = leadSchema.parse({ ...validLead, name: "  Alex Morgan  ", email: "  Alex@Company.COM " });
    expect(parsed.name).toBe("Alex Morgan");
    expect(parsed.email).toBe("alex@company.com");
  });

  it.each([
    ["name too short", { name: "A" }, "name"],
    ["name too long", { name: "x".repeat(101) }, "name"],
    ["invalid email", { email: "not-an-email" }, "email"],
    ["unknown track", { track: "Prompt Wizard" }, "track"],
    ["missing bot-check token", { turnstileToken: "" }, "turnstileToken"],
  ])("rejects %s", (_label, override, field) => {
    const result = leadSchema.safeParse({ ...validLead, ...override });
    expect(result.success).toBe(false);
    expect(result.error?.issues.some((issue) => issue.path[0] === field)).toBe(true);
  });

  it("accepts every POC track", () => {
    for (const track of ["AI Practitioner", "Certified AI Engineer", "AI Leadership", "Team training"]) {
      expect(leadSchema.safeParse({ ...validLead, track }).success).toBe(true);
    }
  });
});

describe("assessmentSchema", () => {
  it("accepts three answers between 0 and 2", () => {
    expect(assessmentSchema.safeParse({ answers: [0, 1, 2], turnstileToken: "t" }).success).toBe(true);
  });

  it.each([
    ["too few answers", [0, 1]],
    ["too many answers", [0, 1, 2, 0]],
    ["out-of-range index", [0, 1, 3]],
    ["negative index", [-1, 1, 2]],
    ["non-integer index", [0, 1.5, 2]],
  ])("rejects %s", (_label, answers) => {
    expect(assessmentSchema.safeParse({ answers, turnstileToken: "t" }).success).toBe(false);
  });
});
