import "server-only";
import nodemailer, { type Transporter } from "nodemailer";
import { render } from "@react-email/render";
import type { ReactElement } from "react";
import { getEnv } from "@/lib/server/env";

let transporter: Transporter | null | undefined;

/** Google SMTP transport. Returns null when SMTP credentials are not configured (dev). */
function getTransporter(): Transporter | null {
  if (transporter !== undefined) return transporter;
  const env = getEnv();
  if (!env.SMTP_USER || !env.SMTP_PASS) {
    transporter = null;
    return transporter;
  }
  transporter = nodemailer.createTransport({
    host: env.SMTP_HOST,
    port: env.SMTP_PORT,
    secure: env.SMTP_PORT === 465,
    auth: { user: env.SMTP_USER, pass: env.SMTP_PASS },
  });
  return transporter;
}

export type SendEmailInput = { to: string; subject: string; react: ReactElement; replyTo?: string };

/**
 * Renders a React Email template and sends it via SMTP.
 * Never throws: returns false and logs on failure so callers can carry on (the lead is already saved).
 */
export async function sendEmail({ to, subject, react, replyTo }: SendEmailInput): Promise<boolean> {
  const env = getEnv();
  try {
    const [html, text] = await Promise.all([render(react), render(react, { plainText: true })]);
    const transport = getTransporter();
    if (!transport) {
      console.info(`[email] SMTP not configured; would send "${subject}" to ${to}.\n${text}`);
      return false;
    }
    await transport.sendMail({ from: env.EMAIL_FROM || env.SMTP_USER, to, subject, html, text, replyTo });
    return true;
  } catch (error) {
    console.error(`[email] failed to send "${subject}" to ${to}`, error);
    return false;
  }
}
