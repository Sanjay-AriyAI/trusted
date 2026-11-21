import { describe, expect, it } from "vitest";
import { portalPose } from "@/lib/content/portal";
import { formatPrice, programs } from "@/lib/content/programs";
import { quizQuestions, scoreAssessment } from "@/lib/content/quiz";
import { TRACKS } from "@/lib/content/tracks";

describe("scoreAssessment (POC rules: ≤2 Practitioner, ≤4 Engineer, else Leadership)", () => {
  it.each([
    [[0, 0, 0], "AI Practitioner"],
    [[1, 1, 0], "AI Practitioner"],
    [[0, 0, 2], "AI Practitioner"],
    [[1, 1, 1], "Certified AI Engineer"],
    [[2, 2, 0], "Certified AI Engineer"],
    [[2, 1, 2], "AI Leadership"],
    [[2, 2, 2], "AI Leadership"],
  ])("%j → %s", (answers, track) => {
    expect(scoreAssessment(answers).track).toBe(track);
  });

  it("always recommends a selectable track with a blurb", () => {
    for (let a = 0; a <= 2; a++)
      for (let b = 0; b <= 2; b++)
        for (let c = 0; c <= 2; c++) {
          const result = scoreAssessment([a, b, c]);
          expect(TRACKS).toContain(result.track);
          expect(result.blurb.length).toBeGreaterThan(10);
        }
  });

  it("has three questions with three answers each", () => {
    expect(quizQuestions).toHaveLength(3);
    quizQuestions.forEach((q) => expect(q.answers).toHaveLength(3));
  });
});

describe("programs", () => {
  it("formats whole-pound prices like the POC", () => {
    expect(formatPrice(399)).toBe("£399");
    expect(formatPrice(1095)).toBe("£1,095");
    expect(formatPrice(null)).toBe("On request");
  });

  it("stores prices as whole GBP integers", () => {
    programs.forEach((p) => {
      if (p.priceGbp !== null) expect(Number.isInteger(p.priceGbp)).toBe(true);
    });
  });

  it("has exactly one featured programme", () => {
    expect(programs.filter((p) => p.featured)).toHaveLength(1);
  });
});

describe("portalPose", () => {
  it("matches the POC carousel classes for 4 cards", () => {
    expect([0, 1, 2, 3].map((i) => portalPose(i, 0, 4))).toEqual(["active", "next", "far-next", "prev"]);
    expect([0, 1, 2, 3].map((i) => portalPose(i, 3, 4))).toEqual(["next", "far-next", "prev", "active"]);
  });
});
