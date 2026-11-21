import type { Track } from "@/lib/content/tracks";

export type QuizQuestion = { id: string; question: string; answers: [string, string, string] };

/** The 3-question AI level assessment from the POC. In the ★ scope this moves to the database. */
export const quizQuestions: QuizQuestion[] = [
  {
    id: "usage",
    question: "How often do you use AI at work?",
    answers: ["Almost never", "A few times a week", "Every day"],
  },
  {
    id: "goal",
    question: "What do you want to achieve next?",
    answers: ["Work faster", "Build AI products", "Lead AI strategy"],
  },
  {
    id: "technical",
    question: "How technical do you feel today?",
    answers: ["Non-technical", "Comfortable with tools", "I build with code"],
  },
];

export type QuizResult = { track: Track; blurb: string };

/**
 * POC scoring: sum of answer indexes (0–2 each, total 0–6).
 * ≤2 → AI Practitioner, ≤4 → Certified AI Engineer, else AI Leadership.
 * Runs on the server only (lib/actions/submitAssessment.ts).
 */
export function scoreAssessment(answerIndexes: readonly number[]): QuizResult {
  const total = answerIndexes.reduce((sum, answer) => sum + answer, 0);
  if (total <= 2) {
    return { track: "AI Practitioner", blurb: "Build confident foundations and create immediate value in your role." };
  }
  if (total <= 4) {
    return {
      track: "Certified AI Engineer",
      blurb: "Turn practical confidence into production-grade systems and a verified portfolio.",
    };
  }
  return {
    track: "AI Leadership",
    blurb: "Translate your experience into an AI strategy your organisation can execute.",
  };
}
