import { clsx } from "clsx";
import type { ReactNode } from "react";
import { portalPillars, portalPose } from "@/lib/content/portal";

type Props = {
  /** Index of the front card. */
  current: number;
  /** Close button slot (modal version only). */
  closeButton?: ReactNode;
  onSelect?: (index: number) => void;
  onPrev?: () => void;
  onNext?: () => void;
};

/**
 * The 3D academy carousel markup from the POC (#portal-modal-root .portal-3d-stage).
 * Shared by the MethodPortal modal (React-driven) and the cinematic PortalScroll scene (driven by CineScroll).
 * No "use client": it renders on the server inside PortalScroll and on the client inside MethodPortal.
 */
export function PortalStage({ current, closeButton, onSelect, onPrev, onNext }: Props) {
  const total = portalPillars.length;
  return (
    <div className="portal-3d-stage">
      {closeButton}

      <div className="portal-hud-header">
        <span className="portal-badge">3D SPATIAL METHOD PORTAL</span>
        <div className="portal-nav-hints">
          <span>Scroll wheel, drag or arrows to rotate through 3D cards</span>
        </div>
      </div>

      <div className="portal-viewport">
        <div className="portal-circular-rim" />
        <div className="portal-3d-track">
          {portalPillars.map((pillar, i) => (
            <div
              key={pillar.tag}
              className={`portal-card ${portalPose(i, current, total)}`}
              data-index={i}
              onClick={onSelect && i !== current ? () => onSelect(i) : undefined}
            >
              <div className="portal-card-inner">
                <div className="portal-card-tag">{pillar.tag}</div>
                <h3>{pillar.title}</h3>
                <p>{pillar.body}</p>
                <ul className="portal-feature-list">
                  {pillar.features.map((feature) => (
                    <li key={feature}>
                      <i aria-hidden="true">✓</i> {feature}
                    </li>
                  ))}
                </ul>
                <div className="portal-card-footer">
                  <span className="card-step">
                    {String(i + 1).padStart(2, "0")} / {String(total).padStart(2, "0")}
                  </span>
                  <button type="button" className="portal-card-btn" tabIndex={i === current ? 0 : -1}>
                    {pillar.cta}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="portal-controls">
        <button type="button" className="portal-nav-btn prev-btn" aria-label="Previous card" onClick={onPrev}>
          ←
        </button>
        <div className="portal-dots">
          {portalPillars.map((pillar, i) => (
            <button
              type="button"
              key={pillar.tag}
              className={clsx("dot p-0", i === current && "active")}
              data-index={i}
              aria-label={`Show ${pillar.title.toLowerCase()}`}
              aria-current={i === current ? "true" : undefined}
              onClick={onSelect ? () => onSelect(i) : undefined}
            />
          ))}
        </div>
        <button type="button" className="portal-nav-btn next-btn" aria-label="Next card" onClick={onNext}>
          →
        </button>
      </div>
    </div>
  );
}
