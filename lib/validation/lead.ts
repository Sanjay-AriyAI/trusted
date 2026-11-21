import { z } from "zod";
import { TRACKS } from "@/lib/content/tracks";

export { TRACKS };

/** Shared by ApplyModal (React Hook Form) and submitApplication (server). Doc §8. */
export const leadSchema = z.object({
  name: z.string().trim().min(2, "Please enter your name").max(100),
  email: z.string().trim().toLowerCase().pipe(z.email("Please enter a valid work email").max(200)),
  track: z.enum(TRACKS),
  turnstileToken: z.string().min(1, "Please complete the security check"),
  assessmentId: z.string().max(40).optional(),
  /** utm_* params / referrer captured on the client; stored in Lead.source. */
  source: z.string().max(500).optional(),
});

export type LeadInput = z.infer<typeof leadSchema>;
/** Shape the form holds before parsing. */
export type LeadFormValues = z.input<typeof leadSchema>;
