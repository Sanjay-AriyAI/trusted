"use client";

import dynamic from "next/dynamic";
import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import { DEFAULT_TRACK, type Track } from "@/lib/content/tracks";

const loadApply = () => import("@/components/modals/ApplyModal");
const loadAssessment = () => import("@/components/modals/AssessmentModal");
const loadPortal = () => import("@/components/modals/MethodPortal");

const ApplyModal = dynamic(() => loadApply().then((m) => m.ApplyModal), { ssr: false });
const AssessmentModal = dynamic(() => loadAssessment().then((m) => m.AssessmentModal), { ssr: false });
const MethodPortal = dynamic(() => loadPortal().then((m) => m.MethodPortal), { ssr: false });

type ApplyOptions = { assessmentId?: string | null };

type ModalApi = {
  openApply: (track?: Track, options?: ApplyOptions) => void;
  openAssessment: () => void;
  openPortal: () => void;
  close: () => void;
};

type ModalState =
  | { kind: "none" }
  | { kind: "apply"; track: Track; assessmentId: string | null; key: number }
  | { kind: "assessment"; key: number }
  | { kind: "portal"; key: number };

const ModalContext = createContext<ModalApi | null>(null);

/** Owns which modal is open. Buttons call openApply(track) / openAssessment() / openPortal() directly. */
export function ModalProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<ModalState>({ kind: "none" });

  /* Modal code stays out of the initial bundle but is fetched once the browser is idle,
     so the first click opens instantly. data-ready marks the page as interactive (used by e2e tests). */
  useEffect(() => {
    document.documentElement.dataset.ready = "true";
    const preload = () => void Promise.all([loadApply(), loadAssessment(), loadPortal()]);
    /* Safari has no requestIdleCallback */
    if (typeof window.requestIdleCallback === "function") {
      const id = window.requestIdleCallback(preload, { timeout: 3000 });
      return () => window.cancelIdleCallback(id);
    }
    const id = window.setTimeout(preload, 1500);
    return () => window.clearTimeout(id);
  }, []);

  /* Radix returns focus to its own <Dialog.Trigger>; our modals open from anywhere, so we remember the
     element that opened the first modal in a chain (e.g. assessment → apply) and restore focus to it. */
  const opener = useRef<HTMLElement | null>(null);
  const rememberOpener = () => {
    if (state.kind !== "none") return;
    const active = document.activeElement;
    opener.current = active instanceof HTMLElement && active !== document.body ? active : null;
  };

  useEffect(() => {
    if (state.kind !== "none" || !opener.current) return;
    const target = opener.current;
    opener.current = null;
    /* after Radix's own unmount focus handling */
    const id = requestAnimationFrame(() => {
      if (target.isConnected) target.focus({ preventScroll: true });
    });
    return () => cancelAnimationFrame(id);
  }, [state.kind]);

  const close = useCallback(() => setState({ kind: "none" }), []);
  const openApply = (track: Track = DEFAULT_TRACK, options?: ApplyOptions) => {
    rememberOpener();
    setState({ kind: "apply", track, assessmentId: options?.assessmentId ?? null, key: Date.now() });
  };
  const openAssessment = () => {
    rememberOpener();
    setState({ kind: "assessment", key: Date.now() });
  };
  const openPortal = () => {
    rememberOpener();
    setState({ kind: "portal", key: Date.now() });
  };

  const api: ModalApi = { openApply, openAssessment, openPortal, close };

  return (
    <ModalContext.Provider value={api}>
      {children}
      {state.kind === "apply" && (
        <ApplyModal key={state.key} defaultTrack={state.track} assessmentId={state.assessmentId} onClose={close} />
      )}
      {state.kind === "assessment" && <AssessmentModal key={state.key} onClose={close} onApply={openApply} />}
      {state.kind === "portal" && <MethodPortal key={state.key} onClose={close} />}
    </ModalContext.Provider>
  );
}

export function useModals(): ModalApi {
  const ctx = useContext(ModalContext);
  if (!ctx) throw new Error("useModals must be used inside <ModalProvider>");
  return ctx;
}
