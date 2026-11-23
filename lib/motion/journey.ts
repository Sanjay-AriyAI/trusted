/**
 * Shared, mutable animation state linking CineScroll (writer) to ParticleHero + Ribbons (readers).
 * Replaces the POC's window.__planetTarget / window.__planetJourney globals.
 * Deliberately not React state: it's read every animation frame and must never trigger re-renders.
 */
export type Journey = { move: number; explode: number; zoom: number };

/** Where the scroll timeline wants the planet to be (set by CineScroll.render). */
export const planetTarget: { current: Journey | null } = { current: null };

/** Damped value actually rendered (glided toward planetTarget each frame). */
export const planetJourney: { current: Journey | null } = { current: null };

export const ZERO_JOURNEY: Readonly<Journey> = { move: 0, explode: 0, zoom: 0 };

export function resetJourney() {
  planetTarget.current = null;
  planetJourney.current = null;
}
