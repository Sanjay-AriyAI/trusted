"use client";

import { useEffect, useRef } from "react";

/**
 * Toggles `className` on the closest ancestor matching `target` while it is in view
 * (POC: the #method "Learn it. Build it. Prove it." stagger). Renders nothing visible.
 */
export function InViewClass({
  target,
  className = "is-visible",
  threshold = 0.2,
}: {
  target: string;
  className?: string;
  threshold?: number;
}) {
  const markerRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const el = markerRef.current?.closest<HTMLElement>(target);
    if (!el) return;
    const observer = new IntersectionObserver(
      (entries) => entries.forEach((entry) => el.classList.toggle(className, entry.isIntersecting)),
      { threshold },
    );
    observer.observe(el);
    return () => {
      observer.disconnect();
      el.classList.remove(className);
    };
  }, [target, className, threshold]);

  return <span ref={markerRef} hidden />;
}
