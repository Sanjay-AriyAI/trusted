"use client";

import { clsx } from "clsx";
import * as Dialog from "@radix-ui/react-dialog";
import { useEffect, useRef, useState, type KeyboardEvent } from "react";
import { PortalStage } from "@/components/modals/PortalStage";
import { portalPillars } from "@/lib/content/portal";

const total = portalPillars.length;

/** "See how the academy works" — the 3D spatial method portal modal (POC setup3DMethodPortal). */
export function MethodPortal({ onClose }: { onClose: () => void }) {
  const [current, setCurrent] = useState(0);
  const [visible, setVisible] = useState(false);
  const wheelLock = useRef(false);
  const touchStartX = useRef(0);

  const goTo = (index: number) => setCurrent(((index % total) + total) % total);

  /* fade in on the next frame so the POC's .open opacity transition runs */
  useEffect(() => {
    const id = requestAnimationFrame(() => setVisible(true));
    return () => cancelAnimationFrame(id);
  }, []);

  const onKeyDown = (e: KeyboardEvent) => {
    if (e.key === "ArrowRight") goTo(current + 1);
    if (e.key === "ArrowLeft") goTo(current - 1);
  };

  return (
    <Dialog.Root open onOpenChange={(open) => !open && onClose()}>
      <Dialog.Portal>
        <Dialog.Content
          className={clsx("portal-modal-backdrop", visible && "open")}
          aria-describedby={undefined}
          onKeyDown={onKeyDown}
          onWheel={(e) => {
            if (wheelLock.current) return;
            wheelLock.current = true;
            if (e.deltaY > 0) goTo(current + 1);
            else if (e.deltaY < 0) goTo(current - 1);
            window.setTimeout(() => (wheelLock.current = false), 350);
          }}
          onTouchStart={(e) => (touchStartX.current = e.touches[0]?.clientX ?? 0)}
          onTouchEnd={(e) => {
            const diffX = touchStartX.current - (e.changedTouches[0]?.clientX ?? 0);
            if (Math.abs(diffX) > 40) goTo(current + (diffX > 0 ? 1 : -1));
          }}
        >
          <Dialog.Title className="sr-only">How the academy works</Dialog.Title>
          <div className="portal-modal-overlay" onClick={onClose} />
          <PortalStage
            current={current}
            onSelect={goTo}
            onPrev={() => goTo(current - 1)}
            onNext={() => goTo(current + 1)}
            closeButton={
              <Dialog.Close className="portal-close-btn" aria-label="Close 3D portal">
                ×
              </Dialog.Close>
            }
          />
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
