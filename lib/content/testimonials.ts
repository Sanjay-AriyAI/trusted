export type Testimonial = {
  position: "left" | "center" | "right";
  depth: number;
  badge: string;
  featured?: boolean;
  quote: string;
  quoteSize: { fontSize: string; lineHeight: string };
  initials: string;
  name: string;
  journey: string;
};

export const testimonials: Testimonial[] = [
  {
    position: "left",
    depth: -35,
    badge: "Verified Outcome",
    quote:
      "“I finally had evidence of what I could build—not just a certificate. That changed every conversation with employers.”",
    quoteSize: { fontSize: "15px", lineHeight: "1.6" },
    initials: "SK",
    name: "Sofia K.",
    journey: "Data Analyst → Applied AI Consultant",
  },
  {
    position: "center",
    depth: 45,
    badge: "Flagship Graduate",
    featured: true,
    quote:
      "“I arrived with prompts. I left with a deployed agent, a portfolio I was proud of and three interviews in the first week.”",
    quoteSize: { fontSize: "16.5px", lineHeight: "1.55" },
    initials: "PR",
    name: "Priya R.",
    journey: "Product Analyst → AI Engineer",
  },
  {
    position: "right",
    depth: -35,
    badge: "Team Lead",
    quote:
      "“The programme turned scattered experiments into a system my whole team could understand, measure and confidently ship.”",
    quoteSize: { fontSize: "15px", lineHeight: "1.6" },
    initials: "DM",
    name: "Daniel M.",
    journey: "Operations Lead → AI Product Lead",
  },
];
