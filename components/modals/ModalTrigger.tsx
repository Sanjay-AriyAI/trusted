"use client";

import type { ComponentPropsWithoutRef } from "react";
import { useModals } from "@/components/modals/ModalProvider";
import type { Track } from "@/lib/content/tracks";

type Props = Omit<ComponentPropsWithoutRef<"button">, "onClick" | "type"> & {
  action: "apply" | "assessment" | "portal";
  /** Preselected track for action="apply". */
  track?: Track;
};

/** A real <button> that opens one of the site modals, so server components can place modal CTAs. */
export function ModalTrigger({ action, track, ...buttonProps }: Props) {
  const { openApply, openAssessment, openPortal } = useModals();

  const onClick = () => {
    if (action === "apply") openApply(track);
    else if (action === "assessment") openAssessment();
    else openPortal();
  };

  return <button type="button" {...buttonProps} onClick={onClick} />;
}
