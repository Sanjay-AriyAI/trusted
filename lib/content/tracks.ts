/** Single source of truth for the selectable tracks (Apply form + assessment results). */
export const TRACKS = ["AI Practitioner", "Certified AI Engineer", "AI Leadership", "Team training"] as const;
export type Track = (typeof TRACKS)[number];
export const DEFAULT_TRACK: Track = "Certified AI Engineer";

export function isTrack(value: unknown): value is Track {
  return typeof value === "string" && (TRACKS as readonly string[]).includes(value);
}
