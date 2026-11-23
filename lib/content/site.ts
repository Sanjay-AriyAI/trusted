/** Site-wide copy blocks (hero, metrics, nav). In the ★ scope these move to the SiteContent table. */
export const site = {
  name: "TrustedtrAiner",
  title: "TrustedtrAiner — Become Trusted With AI",
  description: "Train. Build. Prove. Turn AI capability into opportunity.",
  contactEmail: "hello@trustedtrainer.ai",
  hero: {
    availability: "Applications open · Limited cohort",
    kicker: "AI training · Certification · Talent",
    line1: "DON'T JUST USE AI.",
    line2: "BECOME TRUSTED WITH IT.",
    copy: "Build production-ready AI capability, earn a credential employers respect and enter a talent network designed for the next era of work.",
  },
  signalRoles: ["Product", "Engineering", "Operations", "Strategy", "People"],
  metrics: [
    { value: "96%", label: "say the academy changed their career trajectory" },
    { value: "85%", label: "report high confidence applying AI at work" },
    { value: "40+", label: "employers in the growing talent network" },
  ],
  nav: [
    { href: "#programs", label: "Programs" },
    { href: "#method", label: "The method" },
    { href: "#outcomes", label: "Outcomes" },
    { href: "#employers", label: "For employers" },
  ],
} as const;
