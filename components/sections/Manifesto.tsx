import { ModalTrigger } from "@/components/modals/ModalTrigger";
import { site } from "@/lib/content/site";

export function Manifesto() {
  return (
    <section className="manifesto section-shell">
      <div className="section-index">01 — The shift</div>
      <div className="manifesto-grid">
        <p className="eyebrow">AI confidence is no longer enough</p>
        <h2>
          Proof beats prompts.
          <br />
          <span>Capability beats hype.</span>
        </h2>
        <div className="manifesto-link-center">
          <ModalTrigger
            action="portal"
            className="inline-link method-portal-trigger"
            id="open-3d-method-portal"
            aria-label="Open 3D Academy Portal"
          >
            See how the academy works <span className="portal-icon">✦</span>
          </ModalTrigger>
        </div>
        <div className="manifesto-copy">
          <p>
            TrustedtrAiner turns knowledge into demonstrable skill. You learn with practitioners, build against real
            briefs and leave with work an employer can inspect.
          </p>
        </div>
      </div>
      <div className="metric-rail">
        {site.metrics.map((metric) => (
          <div key={metric.value}>
            <strong>{metric.value}</strong>
            <span>{metric.label}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
