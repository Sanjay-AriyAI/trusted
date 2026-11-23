/** Cookie-consent state shared by the banner and any future analytics loader. Client only. */
export type ConsentChoice = "accepted" | "declined";

export const CONSENT_KEY = "tt-consent";
export const CONSENT_EVENT = "tt-consent-change";

/** Fallback when localStorage is unavailable (private mode / blocked storage): lasts for this page view. */
let memoryChoice: ConsentChoice | null = null;

export function readConsent(): ConsentChoice | null {
  try {
    const value = window.localStorage.getItem(CONSENT_KEY);
    if (value === "accepted" || value === "declined") return value;
  } catch {
    /* storage unavailable */
  }
  return memoryChoice;
}

export function writeConsent(choice: ConsentChoice) {
  memoryChoice = choice;
  try {
    window.localStorage.setItem(CONSENT_KEY, choice);
  } catch {
    /* storage unavailable: memoryChoice covers this page view */
  }
  window.dispatchEvent(new CustomEvent<ConsentChoice>(CONSENT_EVENT, { detail: choice }));
}

/** Analytics must only load when this returns true. */
export function hasAnalyticsConsent(): boolean {
  return readConsent() === "accepted";
}
