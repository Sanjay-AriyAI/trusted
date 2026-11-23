import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({ submitApplication: vi.fn(), submitAssessment: vi.fn() }));

vi.mock("@/lib/actions/submitApplication", () => ({ submitApplication: mocks.submitApplication }));
vi.mock("@/lib/actions/submitAssessment", () => ({ submitAssessment: mocks.submitAssessment }));
// Turnstile can't load in jsdom: emit a token immediately.
vi.mock("@/components/modals/Turnstile", async () => {
  const { useEffect } = await import("react");
  return {
    Turnstile: ({ onToken }: { onToken: (t: string) => void }) => {
      // fire once per mount, like the real widget
      // eslint-disable-next-line react-hooks/exhaustive-deps
      useEffect(() => onToken("test-token"), []);
      return null;
    },
  };
});

import { MobileMenu } from "@/components/layout/MobileMenu";
import { ApplyModal } from "@/components/modals/ApplyModal";
import { AssessmentModal } from "@/components/modals/AssessmentModal";
import { FaqList } from "@/components/sections/FaqList";
import { faqs } from "@/lib/content/faqs";

beforeEach(() => vi.clearAllMocks());

describe("FaqList", () => {
  it("opens the first answer by default and keeps only one open", async () => {
    const user = userEvent.setup();
    render(<FaqList faqs={faqs} />);
    const buttons = screen.getAllByRole("button");
    expect(buttons[0]).toHaveAttribute("aria-expanded", "true");
    expect(buttons[1]).toHaveAttribute("aria-expanded", "false");

    await user.click(buttons[1]!);
    expect(buttons[0]).toHaveAttribute("aria-expanded", "false");
    expect(buttons[1]).toHaveAttribute("aria-expanded", "true");
    expect(buttons[1]!.closest("article")).toHaveClass("open");

    await user.click(buttons[1]!);
    expect(buttons[1]).toHaveAttribute("aria-expanded", "false");
  });

  it("makes closed answers inert", () => {
    render(<FaqList faqs={faqs} />);
    const regions = screen.getAllByRole("region", { hidden: true });
    expect(regions[0]).not.toHaveAttribute("inert");
    expect(regions[1]).toHaveAttribute("inert");
  });
});

describe("MobileMenu", () => {
  it("is hidden and inert when closed", () => {
    const { container } = render(<MobileMenu open={false} onNavigate={() => {}} onApply={() => {}} />);
    const menu = container.querySelector("#mobile-menu");
    expect(menu).toHaveAttribute("aria-hidden", "true");
    expect(menu).toHaveAttribute("inert");
  });

  it("closes on navigation and opens Apply", async () => {
    const user = userEvent.setup();
    const onNavigate = vi.fn();
    const onApply = vi.fn();
    render(<MobileMenu open onNavigate={onNavigate} onApply={onApply} />);
    await user.click(screen.getByRole("link", { name: /programs/i }));
    expect(onNavigate).toHaveBeenCalled();
    await user.click(screen.getByRole("button", { name: /apply now/i }));
    expect(onApply).toHaveBeenCalled();
  });
});

describe("ApplyModal", () => {
  it("preselects the track it was opened with", () => {
    render(<ApplyModal defaultTrack="AI Leadership" assessmentId={null} onClose={() => {}} />);
    expect(screen.getByRole("combobox")).toHaveValue("AI Leadership");
  });

  it("shows inline validation errors without calling the server", async () => {
    const user = userEvent.setup();
    render(<ApplyModal defaultTrack="AI Practitioner" assessmentId={null} onClose={() => {}} />);
    await user.click(screen.getByRole("button", { name: /request my roadmap/i }));
    expect(await screen.findByText(/please enter your name/i)).toBeInTheDocument();
    expect(mocks.submitApplication).not.toHaveBeenCalled();
  });

  it("submits valid details and shows the success screen", async () => {
    mocks.submitApplication.mockResolvedValue({ ok: true, data: null });
    const user = userEvent.setup();
    render(<ApplyModal defaultTrack="Certified AI Engineer" assessmentId="resp_1" onClose={() => {}} />);
    await user.type(screen.getByPlaceholderText("Alex Morgan"), "Priya R");
    await user.type(screen.getByPlaceholderText("alex@company.com"), "priya@example.com");
    await user.click(screen.getByRole("button", { name: /request my roadmap/i }));

    expect(await screen.findByRole("heading", { name: /you’re on the list/i })).toBeInTheDocument();
    expect(mocks.submitApplication).toHaveBeenCalledWith(
      expect.objectContaining({
        name: "Priya R",
        email: "priya@example.com",
        track: "Certified AI Engineer",
        turnstileToken: "test-token",
        assessmentId: "resp_1",
      }),
    );
  });

  it("shows server errors inline", async () => {
    mocks.submitApplication.mockResolvedValue({
      ok: false,
      errors: {},
      message: "Too many requests. Please try again in a few minutes.",
    });
    const user = userEvent.setup();
    render(<ApplyModal defaultTrack="Certified AI Engineer" assessmentId={null} onClose={() => {}} />);
    await user.type(screen.getByPlaceholderText("Alex Morgan"), "Priya R");
    await user.type(screen.getByPlaceholderText("alex@company.com"), "priya@example.com");
    await user.click(screen.getByRole("button", { name: /request my roadmap/i }));
    expect(await screen.findByRole("alert")).toHaveTextContent(/too many requests/i);
  });
});

describe("AssessmentModal", () => {
  it("walks through 3 questions, scores on the server and hands off to Apply", async () => {
    mocks.submitAssessment.mockResolvedValue({
      ok: true,
      data: { id: "resp_9", track: "AI Leadership", blurb: "Translate your experience…" },
    });
    const onApply = vi.fn();
    const user = userEvent.setup();
    render(<AssessmentModal onClose={() => {}} onApply={onApply} />);

    expect(screen.getByText("1/3")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: /every day/i }));
    expect(screen.getByText("2/3")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: /lead ai strategy/i }));
    await user.click(screen.getByRole("button", { name: /i build with code/i }));

    expect(await screen.findByRole("heading", { name: "AI Leadership" })).toBeInTheDocument();
    expect(mocks.submitAssessment).toHaveBeenCalledWith({ answers: [2, 2, 2], turnstileToken: "test-token" });

    await user.click(screen.getByRole("button", { name: /reserve a conversation/i }));
    expect(onApply).toHaveBeenCalledWith("AI Leadership", { assessmentId: "resp_9" });
  });

  it("can retake the assessment", async () => {
    mocks.submitAssessment.mockResolvedValue({
      ok: true,
      data: { id: "resp_1", track: "AI Practitioner", blurb: "Build confident foundations…" },
    });
    const user = userEvent.setup();
    render(<AssessmentModal onClose={() => {}} onApply={() => {}} />);
    for (const answer of [/almost never/i, /work faster/i, /non-technical/i]) {
      await user.click(screen.getByRole("button", { name: answer }));
    }
    await waitFor(() => expect(screen.getByRole("button", { name: /retake/i })).toBeInTheDocument());
    await user.click(screen.getByRole("button", { name: /retake/i }));
    expect(screen.getByText("1/3")).toBeInTheDocument();
  });
});

describe("state classes (regression: formatter once merged them into the base class)", () => {
  it("MobileMenu and PortalStage keep separate state classes", async () => {
    const { PortalStage } = await import("@/components/modals/PortalStage");
    const { container } = render(
      <>
        <MobileMenu open onNavigate={() => {}} onApply={() => {}} />
        <PortalStage current={1} />
      </>,
    );
    expect(container.querySelector("#mobile-menu")).toHaveClass("mobile-menu", "open");
    const dots = container.querySelectorAll(".portal-dots .dot");
    expect(dots[1]).toHaveClass("dot", "active");
    expect(dots[0]).not.toHaveClass("active");
    expect(container.querySelectorAll(".portal-card")[1]).toHaveClass("portal-card", "active");
  });
});
