import type { Metadata } from "next";
import { LegalPage } from "@/components/layout/LegalPage";
import { site } from "@/lib/content/site";

export const metadata: Metadata = {
  title: "Privacy policy",
  description: "How TrustedtrAiner collects, uses and protects your personal data.",
  alternates: { canonical: "/privacy" },
};

// TODO(legal): draft written from what the site actually collects. Have it reviewed before launch.
export default function PrivacyPage() {
  return (
    <LegalPage eyebrow="Legal" title="Privacy policy" updated="20 November 2026">
      <p>
        This policy explains what personal data TrustedtrAiner (“we”, “us”) collects through this website, why we
        collect it and the choices you have. We act as the data controller for this information.
      </p>

      <h2>What we collect</h2>
      <ul>
        <li>
          <strong>Application requests:</strong> your name, work email address, the programme you’re interested in and,
          where present, the campaign or referring site that brought you here.
        </li>
        <li>
          <strong>Assessment answers:</strong> your answers to the 2-minute AI level assessment and the programme we
          recommended. These are linked to your application only if you go on to request a conversation.
        </li>
        <li>
          <strong>Security checks:</strong> our forms use Cloudflare Turnstile to block spam and abuse. Cloudflare
          processes technical signals such as your IP address and browser characteristics for this purpose.
        </li>
        <li>
          <strong>Your cookie choice:</strong> stored in your browser so we don’t ask again.
        </li>
      </ul>

      <h2>How we use it</h2>
      <p>
        We use your details to respond to your request, recommend the right programme, send you a confirmation email and
        follow up with a conversation you asked for. Our lawful basis is our legitimate interest in responding to
        enquiries and taking steps at your request before entering into a contract.
      </p>
      <p>We don’t sell your personal data, and we don’t send marketing emails without your consent.</p>

      <h2>Analytics</h2>
      <p>
        We only use analytics cookies if you accept them in the cookie banner. You can change your choice at any time by
        clearing this site’s data in your browser.
      </p>

      <h2>Who we share it with</h2>
      <p>
        We use trusted service providers to run the site, store data securely, deliver email and protect our forms. They
        process data only on our instructions.
      </p>

      <h2>How long we keep it</h2>
      <p>
        We keep application and assessment data for as long as needed to handle your enquiry and for up to 24 months
        afterwards, unless you ask us to delete it sooner or you become a learner, in which case our learner terms
        apply.
      </p>

      <h2>Your rights</h2>
      <p>
        Under UK data protection law you can ask to access, correct or delete your personal data, object to or restrict
        how we use it, and ask for a copy in a portable format. Email{" "}
        <a href={`mailto:${site.contactEmail}`}>{site.contactEmail}</a>. You also have the right to complain to the
        Information Commissioner’s Office (ico.org.uk).
      </p>
    </LegalPage>
  );
}
