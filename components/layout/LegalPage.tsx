import type { ReactNode } from "react";
import { Footer } from "@/components/layout/Footer";
import { ParticleStage } from "@/components/webgl/ParticleStage";

/** Shared shell for Privacy / Terms: static planet backdrop, POC typography, readable measure. */
export function LegalPage({
  eyebrow,
  title,
  updated,
  children,
}: {
  eyebrow: string;
  title: string;
  updated: string;
  children: ReactNode;
}) {
  return (
    <>
      <ParticleStage animated={false} />
      <main>
        <article className="section-shell pt-36 pb-24">
          <p className="eyebrow">{eyebrow}</p>
          <h1 className="mt-4 mb-3 text-[clamp(36px,5vw,64px)] leading-none font-[535] tracking-[-0.05em] text-cream">
            {title}
          </h1>
          <p className="mb-14 text-xs tracking-[0.12em] text-muted-dark uppercase">Last updated {updated}</p>
          <div className="max-w-[68ch] space-y-5 text-[15px] leading-[1.75] text-muted [&_a]:text-gold-bright [&_a]:underline [&_a]:underline-offset-4 [&_h2]:mt-12 [&_h2]:mb-3 [&_h2]:text-xl [&_h2]:font-semibold [&_h2]:tracking-tight [&_h2]:text-cream [&_li]:ml-5 [&_li]:list-disc [&_strong]:text-cream">
            {children}
          </div>
        </article>
      </main>
      <Footer />
    </>
  );
}
