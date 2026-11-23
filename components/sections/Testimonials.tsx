import { clsx } from "clsx";
import { SpatialParallax } from "@/components/webgl/SpatialParallax";
import { testimonials } from "@/lib/content/testimonials";

export function Testimonials() {
  return (
    <section className="stories section-shell" id="spatial-testimonials">
      <div className="section-index">05 — Trusted outcomes</div>
      <div className="stories-header">
        <p className="eyebrow">Spatial Exhibition</p>
        <h2>Real proof from real graduates.</h2>
      </div>
      <div className="spatial-stage" id="spatial-stage">
        {testimonials.map((t) => (
          <div key={t.name} className={`spatial-card card-${t.position}`} data-depth={t.depth}>
            <div className={clsx("card-badge", t.featured && "featured")}>{t.badge}</div>
            <blockquote style={t.quoteSize}>{t.quote}</blockquote>
            <div className="story-person">
              <span aria-hidden="true">{t.initials}</span>
              <p>
                <strong>{t.name}</strong>
                <small>{t.journey}</small>
              </p>
            </div>
          </div>
        ))}
        <SpatialParallax />
      </div>
    </section>
  );
}
