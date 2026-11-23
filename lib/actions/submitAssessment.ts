"use server";

import { z } from "zod";
import { quizQuestions, scoreAssessment } from "@/lib/content/quiz";
import type { Track } from "@/lib/content/tracks";
import type { ActionResult } from "@/lib/actions/types";
import { assessmentSchema } from "@/lib/validation/assessment";
import { getDb } from "@/lib/server/db";
import { formRateLimit } from "@/lib/server/rateLimit";
import { getClientIp } from "@/lib/server/requestInfo";
import { verifyTurnstile } from "@/lib/server/turnstile";

export type AssessmentOutcome = { id: string | null; track: Track; blurb: string };

/** Scores the quiz on the server, stores answers + result, returns the recommended track. */
export async function submitAssessment(input: unknown): Promise<ActionResult<AssessmentOutcome>> {
  const parsed = assessmentSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, errors: z.flattenError(parsed.error).fieldErrors };
  }
  const { answers, turnstileToken } = parsed.data;

  const ip = await getClientIp();
  if (!formRateLimit(`assessment:${ip}`).ok) {
    return { ok: false, errors: {}, message: "Too many requests. Please try again in a few minutes." };
  }
  if (!(await verifyTurnstile(turnstileToken, ip))) {
    return { ok: false, errors: {}, message: "Security check failed. Please try again." };
  }

  const result = scoreAssessment(answers);

  let id: string | null = null;
  try {
    const saved = await getDb().assessmentResponse.create({
      data: {
        answers: answers.map((answerIndex, i) => ({ questionId: quizQuestions[i]?.id ?? String(i), answerIndex })),
        result: result.track,
      },
      select: { id: true },
    });
    id = saved.id;
  } catch (error) {
    // Still show the recommendation; the visitor shouldn't lose their result because of a DB hiccup.
    console.error("[submitAssessment] failed to save response", error);
  }

  return { ok: true, data: { id, track: result.track, blurb: result.blurb } };
}
