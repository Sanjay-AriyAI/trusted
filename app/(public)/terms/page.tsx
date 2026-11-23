import type { Metadata } from "next";
import { LegalPage } from "@/components/layout/LegalPage";
import { site } from "@/lib/content/site";

export const metadata: Metadata = {
  title: "Terms of use",
  description: "The terms that apply when you use the TrustedtrAiner website.",
  alternates: { canonical: "/terms" },
};

// TODO(legal): draft website terms. Programme enrolment terms are separate. Have both reviewed before launch.
export default function TermsPage() {
  return (
    <LegalPage eyebrow="Legal" title="Terms of use" updated="20 November 2026">
      <p>
        These terms apply when you use the TrustedtrAiner website. By using the site you agree to them. Enrolling on a
        programme is covered by separate terms that we’ll share before you commit.
      </p>

      <h2>Using this site</h2>
      <p>
        You may browse the site and submit the application and assessment forms for your own personal or business use.
        Please don’t misuse the site, for example by submitting false information, attempting to disrupt it or trying to
        access it by automated means.
      </p>

      <h2>Programme information</h2>
      <p>
        We work to keep programme descriptions, schedules and prices accurate, but they may change. Submitting the
        application form is a request for a conversation, not a booking. Prices shown are in pounds sterling.
      </p>

      <h2>Outcomes</h2>
      <p>
        Graduate stories and outcome figures describe real experiences but aren’t a guarantee of individual results,
        employment or salary.
      </p>

      <h2>Intellectual property</h2>
      <p>
        The site’s content, design and branding belong to TrustedtrAiner or our licensors. You may not copy or reuse
        them without our permission.
      </p>

      <h2>Liability</h2>
      <p>
        The site is provided as is. To the extent the law allows, we aren’t liable for losses arising from your use of
        it. Nothing in these terms limits liability that can’t be limited by law.
      </p>

      <h2>Governing law</h2>
      <p>These terms are governed by the law of England and Wales.</p>

      <h2>Contact</h2>
      <p>
        Questions about these terms? Email <a href={`mailto:${site.contactEmail}`}>{site.contactEmail}</a>.
      </p>
    </LegalPage>
  );
}
