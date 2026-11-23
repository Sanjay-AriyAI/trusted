"use client";

import { useEffect, useRef } from "react";
import { useModals } from "@/components/modals/ModalProvider";
import { prefersReducedMotion } from "@/lib/motion/env";

/**
 * The lower half of the hero, ported from the POC "Orchestrated Hero Sequence":
 * letter-by-letter copy → reveal actions → count 0→7 then 0K→12K+.
 * Text is written through refs (no React state), so typing never re-renders the tree.
 */
export function HeroSequence({ copy }: { copy: string }) {
  const { openApply, openAssessment } = useModals();
  const typedRef = useRef<HTMLSpanElement>(null);
  const actionsRef = useRef<HTMLDivElement>(null);
  const proofRef = useRef<HTMLDivElement>(null);
  const stat7Ref = useRef<HTMLElement>(null);
  const stat12kRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const typed = typedRef.current;
    const actions = actionsRef.current;
    const proof = proofRef.current;
    const stat7 = stat7Ref.current;
    const stat12k = stat12kRef.current;
    const heroSec = typed?.closest<HTMLElement>("#top");
    if (!typed || !actions || !proof || !stat7 || !stat12k || !heroSec) return;

    const reduced = prefersReducedMotion();
    let typingTimeout = 0;
    let stepTimeouts: number[] = [];
    let animFrameId = 0;

    const clearHeroTimeline = () => {
      window.clearTimeout(typingTimeout);
      stepTimeouts.forEach((t) => window.clearTimeout(t));
      stepTimeouts = [];
      cancelAnimationFrame(animFrameId);
      typed.textContent = "";
      actions.classList.remove("is-revealed");
      proof.classList.remove("is-revealed");
      stat7.textContent = "0";
      stat12k.textContent = "0K+";
    };

    const countUp = (el: HTMLElement, to: number, suffix: string, duration: number, done?: () => void) => {
      const start = performance.now();
      const animate = (now: number) => {
        const progress = Math.min((now - start) / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        el.textContent = Math.floor(to * eased) + suffix;
        if (progress < 1) animFrameId = requestAnimationFrame(animate);
        else {
          el.textContent = to + suffix;
          done?.();
        }
      };
      animFrameId = requestAnimationFrame(animate);
    };

    const typeTextLetterByLetter = () => {
      let charIndex = 0;
      const typeNextChar = () => {
        if (charIndex < copy.length) {
          typed.textContent += copy.charAt(charIndex);
          charIndex++;
          typingTimeout = window.setTimeout(typeNextChar, 14);
        } else {
          actions.classList.add("is-revealed");
          stepTimeouts.push(
            window.setTimeout(() => {
              proof.classList.add("is-revealed");
              countUp(stat7, 7, "", 900, () => countUp(stat12k, 12, "K+", 1100));
            }, 350),
          );
        }
      };
      typeNextChar();
    };

    const startHeroSequence = () => {
      clearHeroTimeline();
      if (reduced) {
        typed.textContent = copy;
        actions.classList.add("is-revealed");
        proof.classList.add("is-revealed");
        stat7.textContent = "7";
        stat12k.textContent = "12K+";
        return;
      }
      /* typing starts right after the heading finishes (t = 1250ms) */
      stepTimeouts.push(window.setTimeout(typeTextLetterByLetter, 1250));
    };

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            heroSec.classList.add("is-visible");
            startHeroSequence();
          } else {
            heroSec.classList.remove("is-visible");
            clearHeroTimeline();
          }
        });
      },
      { threshold: 0.15 },
    );
    observer.observe(heroSec);

    return () => {
      observer.disconnect();
      clearHeroTimeline();
    };
  }, [copy]);

  return (
    <>
      <p className="hero-copy hero-copy-animated" id="typed-hero-copy">
        <span className="sr-only">{copy}</span>
        <span aria-hidden="true" ref={typedRef} />
      </p>
      <div className="hero-actions hero-actions-animated" ref={actionsRef}>
        <button type="button" className="button button-gold button-large" onClick={() => openApply()}>
          Find your program{" "}
        </button>
        <button type="button" className="button button-ghost button-large" onClick={openAssessment}>
          <span className="play-dot" aria-hidden="true">
            ◆
          </span>{" "}
          Take the 2-minute assessment
        </button>
      </div>
      <div className="hero-proof hero-proof-animated" aria-label="Program highlights" ref={proofRef}>
        <div>
          <strong className="stat-count count-7" ref={stat7Ref}>
            0
          </strong>
          <span>
            week flagship
            <br />
            cohort
          </span>
        </div>
        <div>
          <strong className="stat-count count-12k" ref={stat12kRef}>
            0K+
          </strong>
          <span>
            reviewed
            <br />
            AI builds
          </span>
        </div>
        <div>
          <strong>1:1</strong>
          <span>
            career
            <br />
            matching
          </span>
        </div>
      </div>
    </>
  );
}
