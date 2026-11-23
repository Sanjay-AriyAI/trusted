/** Browser capability checks shared by the animation islands. Call only in effects (client). */
export function prefersReducedMotion(): boolean {
  return typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export function isCoarsePointer(): boolean {
  return typeof window !== "undefined" && window.matchMedia("(pointer: coarse)").matches;
}

export const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v));
export const ease = (t: number) => t * t * (3 - 2 * t);
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

/**
 * Tracks listeners / frames / timers so an effect can tear everything down in one call.
 * Every animation island uses this so React Strict Mode's double-mount never leaks.
 */
export class Disposer {
  private fns: (() => void)[] = [];

  add(fn: () => void) {
    this.fns.push(fn);
  }

  on<K extends keyof WindowEventMap>(
    target: Window,
    type: K,
    handler: (e: WindowEventMap[K]) => void,
    options?: AddEventListenerOptions,
  ): void;
  on<K extends keyof DocumentEventMap>(
    target: Document,
    type: K,
    handler: (e: DocumentEventMap[K]) => void,
    options?: AddEventListenerOptions,
  ): void;
  on<K extends keyof HTMLElementEventMap>(
    target: HTMLElement,
    type: K,
    handler: (e: HTMLElementEventMap[K]) => void,
    options?: AddEventListenerOptions,
  ): void;
  on(target: EventTarget, type: string, handler: (e: Event) => void, options?: AddEventListenerOptions) {
    target.addEventListener(type, handler, options);
    this.fns.push(() => target.removeEventListener(type, handler, options));
  }

  /** A self-rescheduling requestAnimationFrame loop that stops on dispose. */
  loop(frame: (now: number) => void) {
    let id = 0;
    let stopped = false;
    const tick = (now: number) => {
      if (stopped) return;
      id = requestAnimationFrame(tick);
      frame(now);
    };
    id = requestAnimationFrame(tick);
    this.fns.push(() => {
      stopped = true;
      cancelAnimationFrame(id);
    });
  }

  timeout(fn: () => void, ms: number) {
    const id = window.setTimeout(fn, ms);
    this.fns.push(() => window.clearTimeout(id));
    return id;
  }

  dispose() {
    const fns = this.fns.splice(0).reverse();
    fns.forEach((fn) => {
      try {
        fn();
      } catch (error) {
        console.warn("[motion] cleanup failed", error);
      }
    });
  }
}

/** True while a modal/dialog is open — global scroll/keyboard handlers must stand down. */
export function isDialogOpen(): boolean {
  return Boolean(document.querySelector('[role="dialog"][data-state="open"], .portal-modal-backdrop.open'));
}

/** True when the key event belongs to a form field / editable element. */
export function isTypingTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  return target.isContentEditable || ["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName);
}
