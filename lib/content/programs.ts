import type { Track } from "@/lib/content/tracks";

export type Program = {
  slug: string;
  level: string;
  name: string;
  track: Track;
  summary: string;
  meta: [string, string];
  /** Whole GBP; null = "On request". */
  priceGbp: number | null;
  featured: boolean;
  badge?: string;
};

export const programs: Program[] = [
  {
    slug: "ai-practitioner",
    level: "01 / Foundation",
    name: "AI Practitioner",
    track: "AI Practitioner",
    summary:
      "Turn curiosity into capability. Master practical prompting, workflow design and the judgement to use AI safely at work.",
    meta: ["4 weeks · Flexible", "Practitioner Certificate"],
    priceGbp: 399,
    featured: false,
  },
  {
    slug: "certified-ai-engineer",
    level: "02 / Flagship",
    name: "Certified AI Engineer",
    track: "Certified AI Engineer",
    summary:
      "Design, build and ship production AI systems. Graduate with an assessed portfolio and direct access to our hiring network.",
    meta: ["7 weeks · Live cohort", "12+ reviewed builds"],
    priceGbp: 1095,
    featured: true,
    badge: "Most sought-after",
  },
  {
    slug: "ai-leadership",
    level: "03 / Leadership",
    name: "AI Leadership",
    track: "AI Leadership",
    summary:
      "Find the right use cases, create an adoption roadmap and lead the organisational shift from experiments to measurable value.",
    meta: ["Executive intensive", "Team transformation plan"],
    priceGbp: null,
    featured: false,
  },
];

const gbp = new Intl.NumberFormat("en-GB", { style: "currency", currency: "GBP", maximumFractionDigits: 0 });

/** 399 -> "£399", 1095 -> "£1,095", null -> "On request". */
export function formatPrice(priceGbp: number | null): string {
  return priceGbp === null ? "On request" : gbp.format(priceGbp);
}
