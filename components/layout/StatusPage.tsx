import type { ReactNode } from "react";
import { Brand } from "@/components/layout/Brand";

/** Centred full-screen message in the POC style (used by 404 and error pages). */
export function StatusPage({
  code,
  title,
  accent,
  body,
  actions,
}: {
  code: string;
  title: string;
  accent: string;
  body: string;
  actions: ReactNode;
}) {
  return (
    <div className="relative grid min-h-svh place-items-center overflow-hidden bg-ink px-6 py-24 text-center">
      <div className="absolute top-7 left-6 sm:left-10">
        <Brand />
      </div>
      <div className="cta-orbit cta-orbit-one" aria-hidden="true" />
      <div className="cta-orbit cta-orbit-two" aria-hidden="true" />
      <main className="relative z-[2] flex max-w-xl flex-col items-center">
        <p className="eyebrow">{code}</p>
        <h1 className="mt-4 mb-5 text-[clamp(40px,6vw,76px)] leading-[0.98] font-[535] tracking-[-0.06em] text-cream">
          {title}
          <br />
          <span className="text-gold-bright">{accent}</span>
        </h1>
        <p className="mb-9 max-w-[46ch] text-[15px] leading-relaxed text-muted">{body}</p>
        <div className="flex flex-wrap justify-center gap-3">{actions}</div>
      </main>
    </div>
  );
}
