"use server";

import { z } from "zod";
import { createElement } from "react";
import { leadSchema } from "@/lib/validation/lead";
import type { ActionResult } from "@/lib/actions/types";
import { getDb } from "@/lib/server/db";
import { getEnv } from "@/lib/server/env";
import { sendEmail } from "@/lib/server/email";
import { formRateLimit } from "@/lib/server/rateLimit";
import { getClientIp } from "@/lib/server/requestInfo";
import { verifyTurnstile } from "@/lib/server/turnstile";
import { ApplicantConfirmation } from "@/emails/ApplicantConfirmation";
import { LeadAlert } from "@/emails/LeadAlert";

/** Apply form: validate → rate limit → Turnstile → save → notify. Doc §8. */
export async function submitApplication(input: unknown): Promise<ActionResult> {
  const parsed = leadSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, errors: z.flattenError(parsed.error).fieldErrors };
  }
  const { name, email, track, turnstileToken, assessmentId, source } = parsed.data;

  const ip = await getClientIp();
  if (!formRateLimit(`apply:${ip}`).ok) {
    return { ok: false, errors: {}, message: "Too many requests. Please try again in a few minutes." };
  }

  if (!(await verifyTurnstile(turnstileToken, ip))) {
    return {
      ok: false,
      errors: { turnstileToken: ["Security check failed. Please try again."] },
      message: "Security check failed. Please try again.",
    };
  }

  let lead: { id: string; createdAt: Date };
  let assessmentResult: string | null = null;
  try {
    const db = getDb();
    lead = await db.lead.create({
      data: { name, email, track, source: source || null },
      select: { id: true, createdAt: true },
    });
    if (assessmentId) {
      // Link the quiz response to this lead (only if it isn't linked yet).
      const linked = await db.assessmentResponse.updateManyAndReturn({
        where: { id: assessmentId, leadId: null },
        data: { leadId: lead.id },
        select: { result: true },
      });
      assessmentResult = linked[0]?.result ?? null;
    }
  } catch (error) {
    console.error("[submitApplication] failed to save lead", error);
    return { ok: false, errors: {}, message: "Something went wrong on our side. Please try again shortly." };
  }

  // Email failures are logged inside sendEmail and never fail the submission.
  const notifyTo = getEnv().LEADS_NOTIFY_EMAIL;
  await Promise.all([
    sendEmail({
      to: email,
      subject: "You're on the list — TrustedtrAiner",
      react: createElement(ApplicantConfirmation, { name, track }),
    }),
    notifyTo
      ? sendEmail({
          to: notifyTo,
          subject: `New lead: ${name} — ${track}`,
          replyTo: email,
          react: createElement(LeadAlert, { name, email, track, source, assessmentResult, createdAt: lead.createdAt }),
        })
      : Promise.resolve(false),
  ]);

  return { ok: true, data: null };
}
