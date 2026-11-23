"use client";

import { useEffect, useRef } from "react";
import { Disposer, prefersReducedMotion } from "@/lib/motion/env";

/**
 * Mouse parallax for the testimonial "spatial exhibition" cards (POC: Spatial Floating Cards Mouse Parallax).
 * Renders a hidden marker inside #spatial-stage; the loop only runs while the stage is on screen.
 */
export function SpatialParallax() {
  const markerRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const stage = markerRef.current?.closest<HTMLElement>("#spatial-stage");
    if (!stage) return;
    const cards = Array.from(stage.querySelectorAll<HTMLElement>(".spatial-card"));
    if (!cards.length) return;

    const reduced = prefersReducedMotion();
    const d = new Disposer();
    let mouseX = 0,
      mouseY = 0,
      targetX = 0,
      targetY = 0;
    let onScreen = false;

    if (!reduced) {
      d.on(
        window,
        "mousemove",
        (e) => {
          const rect = stage.getBoundingClientRect();
          if (rect.top < window.innerHeight && rect.bottom > 0) {
            const centerX = rect.left + rect.width / 2;
            const centerY = rect.top + rect.height / 2;
            targetX = (e.clientX - centerX) / (rect.width / 2);
            targetY = (e.clientY - centerY) / (rect.height / 2);
          }
        },
        { passive: true },
      );
    }

    const observer = new IntersectionObserver((entries) => {
      onScreen = entries.some((entry) => entry.isIntersecting);
    });
    observer.observe(stage);
    d.add(() => observer.disconnect());

    const place = () => {
      cards.forEach((card) => {
        if (card.matches(":hover")) return;
        const depth = parseFloat(card.dataset.depth || "0");
        const isCenter = card.classList.contains("card-center");
        const isLeft = card.classList.contains("card-left");
        const isRight = card.classList.contains("card-right");
        const baseRotY = isLeft ? 6 : isRight ? -6 : 0;
        const baseTransY = isLeft ? 20 : isRight ? -12 : 0;
        const baseScale = isCenter ? 1.04 : 0.93;
        const rotY = baseRotY + mouseX * 9;
        const rotX = -mouseY * 9;
        const transY = baseTransY + mouseY * 14;
        card.style.transform = `perspective(1200px) translateZ(${depth}px) translateY(${transY}px) rotateY(${rotY}deg) rotateX(${rotX}deg) scale(${baseScale})`;
      });
    };

    place();
    d.loop(() => {
      if (!onScreen || reduced) return;
      mouseX += (targetX - mouseX) * 0.07;
      mouseY += (targetY - mouseY) * 0.07;
      place();
    });

    return () => {
      d.dispose();
      cards.forEach((card) => (card.style.transform = ""));
    };
  }, []);

  return <span ref={markerRef} hidden />;
}
