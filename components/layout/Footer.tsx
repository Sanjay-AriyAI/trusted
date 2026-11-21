import { cacheLife } from "next/cache";
import Link from "next/link";
import { AnchorLink } from "@/components/layout/AnchorLink";
import { Brand } from "@/components/layout/Brand";
import { ModalTrigger } from "@/components/modals/ModalTrigger";
import { site } from "@/lib/content/site";

/** Current year, cached (Cache Components requires timestamps to be cached or request-time). */
async function CopyrightYear() {
  "use cache";
  cacheLife("days");
  return <>{new Date().getFullYear()}</>;
}

/** Site footer (POC .site-footer). */
export function Footer() {
  return (
    <footer className="site-footer">
      <div>
        <Brand />
        <p>Train. Build. Prove. Transform.</p>
      </div>
      <div className="footer-links">
        <div>
          <strong>Academy</strong>
          <AnchorLink href="/#programs">Programs</AnchorLink>
          <AnchorLink href="/#method">Method</AnchorLink>
          <AnchorLink href="/#outcomes">Outcomes</AnchorLink>
        </div>
        <div>
          <strong>Connect</strong>
          <AnchorLink href="/#employers">Hire talent</AnchorLink>
          <ModalTrigger action="apply">Apply</ModalTrigger>
          <a href={`mailto:${site.contactEmail}`}>Contact</a>
        </div>
      </div>
      <div className="footer-bottom">
        <span>
          © <CopyrightYear /> TrustedtrAiner
        </span>
        <span>London · Learning everywhere</span>
        <span>
          <Link href="/privacy">Privacy</Link> · <Link href="/terms">Terms</Link>
        </span>
      </div>
    </footer>
  );
}
