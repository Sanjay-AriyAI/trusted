"use client";

import { clsx } from "clsx";
import type { ReactNode } from "react";
import { useModals } from "@/components/modals/ModalProvider";
import type { Track } from "@/lib/content/tracks";

/** Program card: clicking anywhere on it (or its arrow button) opens Apply with this track preselected. */
export function ProgramCard({ track, featured, children }: { track: Track; featured: boolean; children: ReactNode }) {
  const { openApply } = useModals();
  return (
    <article className={clsx("program-card", featured && "featured")} onClick={() => openApply(track)}>
      {children}
    </article>
  );
}
