import { clsx } from "clsx";
import { AnchorLink } from "@/components/layout/AnchorLink";
import { site } from "@/lib/content/site";

type Props = { open: boolean; onNavigate: () => void; onApply: () => void };

/** Full-screen mobile navigation (POC #mobile-menu). State lives in Header. */
export function MobileMenu({ open, onNavigate, onApply }: Props) {
  return (
    <div className={clsx("mobile-menu", open && "open")} id="mobile-menu" aria-hidden={!open} inert={!open}>
      <nav aria-label="Mobile navigation">
        {site.nav.map((item, i) => (
          <AnchorLink key={item.href} href={`/${item.href}`} onClick={onNavigate}>
            <span>{String(i + 1).padStart(2, "0")}</span>
            {item.label}
          </AnchorLink>
        ))}
      </nav>
      <button type="button" className="button button-gold" onClick={onApply}>
        Apply now{" "}
      </button>
    </div>
  );
}
