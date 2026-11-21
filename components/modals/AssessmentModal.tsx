"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { useRef, useState } from "react";
import { Turnstile } from "@/components/modals/Turnstile";
import { submitAssessment, type AssessmentOutcome } from "@/lib/actions/submitAssessment";
import { quizQuestions } from "@/lib/content/quiz";
import type { Track } from "@/lib/content/tracks";

type Props = {
  onClose: () => void;
  onApply: (track: Track, options: { assessmentId: string | null }) => void;
};

type Phase =
  | { kind: "question"; step: number }
  | { kind: "scoring" }
  | { kind: "result"; outcome: AssessmentOutcome }
  | { kind: "error"; message: string };

const total = quizQuestions.length;

export function AssessmentModal({ onClose, onApply }: Props) {
  const [phase, setPhase] = useState<Phase>({ kind: "question", step: 0 });
  /* Turnstile tokens are single-use: each attempt gets a fresh widget */
  const [attempt, setAttempt] = useState(0);
  const answers = useRef<number[]>([]);
  const token = useRef("");
  /** All answers given but the bot check hadn't finished: score as soon as the token arrives. */
  const waitingForToken = useRef(false);

  const score = async (turnstileToken: string) => {
    const result = await submitAssessment({ answers: answers.current, turnstileToken });
    if (result.ok) setPhase({ kind: "result", outcome: result.data });
    else setPhase({ kind: "error", message: result.message ?? "We couldn't score your answers. Please try again." });
  };

  const onToken = (value: string) => {
    token.current = value;
    if (value && waitingForToken.current) {
      waitingForToken.current = false;
      void score(value);
    }
  };

  const choose = (answerIndex: number) => {
    if (phase.kind !== "question") return;
    answers.current = [...answers.current, answerIndex];
    if (phase.step + 1 < total) {
      setPhase({ kind: "question", step: phase.step + 1 });
      return;
    }
    setPhase({ kind: "scoring" });
    if (token.current) void score(token.current);
    else waitingForToken.current = true;
  };

  const retake = () => {
    answers.current = [];
    token.current = "";
    waitingForToken.current = false;
    setAttempt((n) => n + 1);
    setPhase({ kind: "question", step: 0 });
  };

  return (
    <Dialog.Root open onOpenChange={(open) => !open && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="modal-backdrop">
          <Dialog.Content className="modal" aria-describedby={undefined}>
            <Dialog.Close className="modal-close" aria-label="Close">
              ×
            </Dialog.Close>
            <div id="assessment-content">
              {phase.kind === "question" && <QuestionStep step={phase.step} onChoose={choose} />}

              {phase.kind === "scoring" && (
                <div className="assessment-result" aria-live="polite">
                  <div className="result-orbit" aria-hidden="true" />
                  <p className="eyebrow">Your recommended path</p>
                  <Dialog.Title asChild>
                    <h2>Finding your route…</h2>
                  </Dialog.Title>
                </div>
              )}

              {phase.kind === "result" && (
                <div className="assessment-result" aria-live="polite">
                  <div className="result-orbit" aria-hidden="true" />
                  <p className="eyebrow">Your recommended path</p>
                  <Dialog.Title asChild>
                    <h2>{phase.outcome.track}</h2>
                  </Dialog.Title>
                  <p>{phase.outcome.blurb}</p>
                  <button
                    type="button"
                    className="button button-gold"
                    onClick={() => onApply(phase.outcome.track, { assessmentId: phase.outcome.id })}
                  >
                    Reserve a conversation <span></span>
                  </button>
                  <button type="button" className="text-button" onClick={retake}>
                    Retake assessment
                  </button>
                </div>
              )}

              {phase.kind === "error" && (
                <div className="assessment-result" role="alert">
                  <p className="eyebrow">Something went wrong</p>
                  <Dialog.Title asChild>
                    <h2>Let’s try that again.</h2>
                  </Dialog.Title>
                  <p>{phase.message}</p>
                  <button type="button" className="button button-gold" onClick={retake}>
                    Retake assessment <span></span>
                  </button>
                </div>
              )}
            </div>
            {/* bot check runs in the background while the visitor answers */}
            {(phase.kind === "question" || phase.kind === "scoring") && <Turnstile key={attempt} onToken={onToken} />}
          </Dialog.Content>
        </Dialog.Overlay>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

function QuestionStep({ step, onChoose }: { step: number; onChoose: (answerIndex: number) => void }) {
  const question = quizQuestions[step];
  if (!question) return null;
  return (
    <>
      <div className="modal-kicker">
        AI level assessment{" "}
        <span>
          {step + 1}/{total}
        </span>
      </div>
      <div className="assessment-progress" aria-hidden="true">
        <i style={{ width: `${((step + 1) / total) * 100}%` }} />
      </div>
      <Dialog.Title asChild>
        <h2>{question.question}</h2>
      </Dialog.Title>
      <div className="answer-list">
        {question.answers.map((answer, index) => (
          <button type="button" key={answer} onClick={() => onChoose(index)}>
            <span>0{index + 1}</span>
            {answer}
            <span></span>
          </button>
        ))}
      </div>
    </>
  );
}
