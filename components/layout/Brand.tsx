import { AnchorLink } from "@/components/layout/AnchorLink";

/** "TrustedtrAiner" wordmark with the gold "Ai". Links to the top of the home page. */
export function Brand() {
  return (
    <AnchorLink className="brand" href="/#top" aria-label="TrustedtrAiner home">
      <span>Trustedtr</span>
      <span className="gold-text">Ai</span>
      <span>ner</span>
    </AnchorLink>
  );
}
