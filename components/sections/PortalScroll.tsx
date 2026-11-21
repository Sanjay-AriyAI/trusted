import { PortalStage } from "@/components/modals/PortalStage";

/**
 * Scroll version of the academy portal (cinematic mode only; hidden otherwise by globals.css).
 * The POC cloned the modal's stage at runtime; here it's rendered up front and CineScroll animates it.
 */
export function PortalScroll() {
  return (
    <section className="portal-scroll" aria-label="How the academy works">
      <PortalStage current={0} />
    </section>
  );
}

/**
 * Copy of the "See how the academy works" pill that flies to the centre during the cinematic
 * transition into the portal (POC .cine-focus). Decorative, so hidden from assistive tech.
 */
export function CineFocusPill() {
  return (
    <div className="manifesto-link-center cine-focus" aria-hidden="true">
      <button type="button" className="inline-link method-portal-trigger" tabIndex={-1}>
        See how the academy works <span className="portal-icon">✦</span>
      </button>
    </div>
  );
}
