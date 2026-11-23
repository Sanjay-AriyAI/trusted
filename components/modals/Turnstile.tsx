"use client";

import { Turnstile as CfTurnstile } from "@marsidev/react-turnstile";

const SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY ?? "";

/** Cloudflare Turnstile bot check. Only shows a visible challenge when Cloudflare needs one. */
export function Turnstile({ onToken }: { onToken: (token: string) => void }) {
  if (!SITE_KEY) {
    if (process.env.NODE_ENV !== "production") {
      console.warn("[turnstile] NEXT_PUBLIC_TURNSTILE_SITE_KEY is not set.");
    }
    return null;
  }
  return (
    <CfTurnstile
      siteKey={SITE_KEY}
      onSuccess={onToken}
      onExpire={() => onToken("")}
      onError={() => onToken("")}
      options={{ theme: "dark", size: "flexible", appearance: "interaction-only" }}
    />
  );
}
