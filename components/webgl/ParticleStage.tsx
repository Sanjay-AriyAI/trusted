"use client";

import { useEffect, useRef } from "react";

/**
 * Fixed background stage: CSS fallback image + WebGL planet + ribbons + vignette/grain,
 * plus the cursor aura, scroll progress bar and viewport edge fades from the POC.
 * The markup is server-rendered (fallback paints immediately); WebGL code is loaded after hydration.
 */
export function ParticleStage({ animated = true }: { animated?: boolean }) {
  const stageRef = useRef<HTMLDivElement>(null);
  const layerRef = useRef<HTMLDivElement>(null);
  const vignetteRef = useRef<HTMLDivElement>(null);
  const auraRef = useRef<HTMLDivElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const stage = stageRef.current;
    const layer = layerRef.current;
    if (!animated || !stage || !layer) return;
    let cancelled = false;
    const cleanups: (() => void)[] = [];

    void Promise.all([import("@/components/webgl/particleHero"), import("@/components/webgl/ribbons")]).then(
      ([{ startParticleHero }, { startRibbons }]) => {
        if (cancelled) return;
        const stopHero = startParticleHero({
          stage,
          layer,
          vignette: vignetteRef.current,
          aura: auraRef.current,
        });
        if (stopHero) {
          cleanups.push(stopHero);
          const stopRibbons = startRibbons(layer);
          if (stopRibbons) cleanups.push(stopRibbons);
        }
        // No WebGL: the .neural-fallback image stays visible (it only hides once .is-ready is set).
      },
    );

    return () => {
      cancelled = true;
      cleanups.reverse().forEach((fn) => fn());
    };
  }, [animated]);

  /* scroll progress bar */
  useEffect(() => {
    const bar = progressRef.current;
    if (!bar) return;
    const update = () => {
      const maximum = document.documentElement.scrollHeight - window.innerHeight;
      bar.style.width = (maximum > 0 ? (window.scrollY / maximum) * 100 : 0) + "%";
    };
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    update();
    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, []);

  return (
    <>
      <div className="particle-stage" ref={stageRef} aria-hidden="true">
        <div className="neural-fallback" />
        <div ref={layerRef} style={{ display: "contents" }} />
        <div className="particle-vignette" ref={vignetteRef} />
        <div className="particle-grain" />
      </div>
      <div className="cursor-aura" ref={auraRef} aria-hidden="true" />
      <div className="scroll-progress" ref={progressRef} style={{ width: "0%" }} />
      <div className="viewport-fade-top" aria-hidden="true" />
      <div className="viewport-fade-bottom" aria-hidden="true" />
      <div className="viewport-fade-left" aria-hidden="true" />
      <div className="viewport-fade-right" aria-hidden="true" />
    </>
  );
}
