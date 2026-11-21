import type { ReactNode } from "react";

/**
 * Scene wrapper used by the cinematic scroll engine (POC: div.cine-scene > div.cine-fit, created at runtime).
 * Rendered up front so React owns the structure; without html.cine these are plain block divs.
 */
export function CineScene({ children }: { children: ReactNode }) {
  return (
    <div className="cine-scene">
      <div className="cine-fit">{children}</div>
    </div>
  );
}
