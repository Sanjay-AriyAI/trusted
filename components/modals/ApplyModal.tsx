"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import * as Dialog from "@radix-ui/react-dialog";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { useForm } from "react-hook-form";
import { Turnstile } from "@/components/modals/Turnstile";
import { submitApplication } from "@/lib/actions/submitApplication";
import { TRACKS, type Track } from "@/lib/content/tracks";
import { leadSchema, type LeadFormValues, type LeadInput } from "@/lib/validation/lead";

type Props = { defaultTrack: Track; assessmentId: string | null; onClose: () => void };

/** utm_* params + referrer, stored on the lead as its source. */
function captureSource(): string | undefined {
  const params = new URLSearchParams(window.location.search);
  const parts: string[] = [];
  params.forEach((value, key) => {
    if (key.startsWith("utm_")) parts.push(`${key}=${value}`);
  });
  if (document.referrer && !document.referrer.startsWith(window.location.origin)) {
    parts.push(`ref=${document.referrer}`);
  }
  return parts.length ? parts.join("; ").slice(0, 500) : undefined;
}

const fieldError = "mt-1 text-[12px] normal-case tracking-normal text-gold-bright";

export function ApplyModal({ defaultTrack, assessmentId, onClose }: Props) {
  const [submitted, setSubmitted] = useState(false);
  const [formMessage, setFormMessage] = useState<string | null>(null);
  /* Turnstile tokens are single-use: a failed submit needs a fresh widget */
  const [attempt, setAttempt] = useState(0);
  /* submitted before the bot check finished: send automatically once its token arrives */
  const [verifying, setVerifying] = useState(false);
  const waitingForToken = useRef(false);

  const {
    register,
    handleSubmit,
    setValue,
    getValues,
    trigger,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<LeadFormValues, unknown, LeadInput>({
    resolver: zodResolver(leadSchema),
    defaultValues: {
      name: "",
      email: "",
      track: defaultTrack,
      turnstileToken: "",
      assessmentId: assessmentId ?? undefined,
    },
  });

  useEffect(() => {
    setValue("source", captureSource());
  }, [setValue]);

  const onSubmit = handleSubmit(async (values) => {
    setFormMessage(null);
    const result = await submitApplication(values);
    if (result.ok) {
      setSubmitted(true);
      return;
    }
    setValue("turnstileToken", "");
    setAttempt((n) => n + 1);
    for (const [field, messages] of Object.entries(result.errors)) {
      const message = messages?.[0];
      if (message && field in values) setError(field as keyof LeadInput, { message });
    }
    setFormMessage(result.message ?? "Please check the highlighted fields.");
  });

  const onFormSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (getValues("turnstileToken")) {
      await onSubmit();
      return;
    }
    // Bot check still running: validate the visible fields now, then wait for the token.
    if (!(await trigger(["name", "email", "track"]))) return;
    waitingForToken.current = true;
    setVerifying(true);
  };

  const onToken = (token: string) => {
    setValue("turnstileToken", token, { shouldValidate: Boolean(token) });
    if (token && waitingForToken.current) {
      waitingForToken.current = false;
      setVerifying(false);
      void onSubmit();
    }
  };

  return (
    <Dialog.Root open onOpenChange={(open) => !open && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="modal-backdrop">
          <Dialog.Content className="modal" aria-describedby={submitted ? undefined : "apply-modal-copy"}>
            <Dialog.Close className="modal-close" aria-label="Close">
              ×
            </Dialog.Close>
            {submitted ? (
              <div className="assessment-result">
                <div className="success-mark" aria-hidden="true">
                  ✓
                </div>
                <p className="eyebrow">Request received</p>
                <Dialog.Title asChild>
                  <h2>You’re on the list.</h2>
                </Dialog.Title>
                <p>
                  Thanks for reaching out. We’ve emailed you a confirmation, and an academy adviser will be in touch
                  shortly to recommend the right next step.
                </p>
                <Dialog.Close className="button button-outline">Back to the academy</Dialog.Close>
              </div>
            ) : (
              <>
                <p className="eyebrow">Applications are open</p>
                <Dialog.Title asChild>
                  <h2>Start your AI career move.</h2>
                </Dialog.Title>
                <p className="modal-copy" id="apply-modal-copy">
                  Tell us where you are now. An academy adviser will recommend the right next step.
                </p>
                <form className="apply-form" onSubmit={onFormSubmit} noValidate>
                  <label>
                    Your name
                    <input
                      autoComplete="name"
                      placeholder="Alex Morgan"
                      aria-invalid={Boolean(errors.name)}
                      aria-describedby={errors.name ? "apply-name-error" : undefined}
                      {...register("name")}
                    />
                    {errors.name && (
                      <span id="apply-name-error" className={fieldError}>
                        {errors.name.message}
                      </span>
                    )}
                  </label>
                  <label>
                    Work email
                    <input
                      type="email"
                      autoComplete="email"
                      placeholder="alex@company.com"
                      aria-invalid={Boolean(errors.email)}
                      aria-describedby={errors.email ? "apply-email-error" : undefined}
                      {...register("email")}
                    />
                    {errors.email && (
                      <span id="apply-email-error" className={fieldError}>
                        {errors.email.message}
                      </span>
                    )}
                  </label>
                  <label>
                    I’m interested in
                    <select {...register("track")}>
                      {TRACKS.map((track) => (
                        <option key={track} value={track}>
                          {track}
                        </option>
                      ))}
                    </select>
                  </label>
                  <Turnstile key={attempt} onToken={onToken} />
                  {errors.turnstileToken && <span className={fieldError}>{errors.turnstileToken.message}</span>}
                  <button
                    className="button button-gold"
                    type="submit"
                    disabled={isSubmitting || verifying}
                    aria-busy={isSubmitting || verifying}
                  >
                    {verifying ? "Verifying…" : isSubmitting ? "Sending…" : "Request my roadmap"} <span></span>
                  </button>
                  {formMessage && (
                    <p role="alert" className={fieldError}>
                      {formMessage}
                    </p>
                  )}
                  <small>No spam. No hard sell. Just a useful conversation.</small>
                </form>
              </>
            )}
          </Dialog.Content>
        </Dialog.Overlay>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
