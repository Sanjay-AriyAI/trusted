import { z } from "zod";
import { quizQuestions } from "@/lib/content/quiz";

/** One answer index (0–2) per quiz question, in order. */
export const assessmentSchema = z.object({
  answers: z
    .array(z.number().int().min(0).max(2))
    .length(quizQuestions.length, `Expected ${quizQuestions.length} answers`),
  turnstileToken: z.string().min(1, "Please complete the security check"),
});

export type AssessmentInput = z.infer<typeof assessmentSchema>;
