export type PortalPillar = {
  tag: string;
  title: string;
  body: string;
  features: [string, string, string];
  cta: string;
};

export const portalPillars: PortalPillar[] = [
  {
    tag: "PILLAR 01",
    title: "LEARN WITH SIGNAL",
    body: "Live labs, expert feedback and only the concepts that survive contact with work.",
    features: [
      "Real-world case study challenges",
      "Direct mentorship from senior AI leads",
      "Zero fluff curriculum built for impact",
    ],
    cta: "Explore Live Labs",
  },
  {
    tag: "PILLAR 02",
    title: "BUILD UNDER PRESSURE",
    body: "Real briefs, production constraints and human judgement woven into every system.",
    features: [
      "Multi-agent framework architectures",
      "Enterprise latency & cost benchmarks",
      "Production fallback & guardrail specs",
    ],
    cta: "View Architecture Briefs",
  },
  {
    tag: "PILLAR 03",
    title: "PROVE YOUR CAPABILITY",
    body: "Independent assessment, a verified portfolio and a credential that travels with you.",
    features: [
      "Verified cryptographic proof badge",
      "Code repository code audit checks",
      "Employer talent network spotlight",
    ],
    cta: "Inspect Credentials",
  },
  {
    tag: "PILLAR 04",
    title: "MASTER PRODUCTION SYSTEMS",
    body: "Architect resilient AI workflows and join top tier engineering teams worldwide.",
    features: [
      "LLM fine-tuning & RAG optimization",
      "Continuous evaluation pipelines",
      "Executive leadership alignment",
    ],
    cta: "Join Talent Network",
  },
];

export type PortalPose = "active" | "next" | "prev" | "far-next";

/** POC carousel pose for card i when card `current` is active. */
export function portalPose(i: number, current: number, total: number): PortalPose {
  const diff = (i - current + total) % total;
  if (diff === 0) return "active";
  if (diff === 1) return "next";
  if (diff === total - 1) return "prev";
  return "far-next";
}
