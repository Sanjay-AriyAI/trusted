import { HeroSequence } from "@/components/sections/HeroSequence";
import { site } from "@/lib/content/site";

/**
 * Adds .is-visible as soon as the hero is parsed, so the headline animates in before hydration
 * (the headline is the LCP element and starts at opacity 0). HeroSequence takes over after hydration.
 */
const revealEarly = `requestAnimationFrame(function(){var h=document.getElementById("top");if(h)h.classList.add("is-visible")})`;

export function Hero() {
  const { hero } = site;
  return (
    <>
      <section className="hero" id="top" suppressHydrationWarning>
        <div className="hero-content">
          <div className="availability hero-step-1">
            <i /> {hero.availability}
          </div>
          <p className="hero-kicker hero-step-2">{hero.kicker}</p>
          <h1 className="hero-title-animated">
            <span className="hero-line line-1 hero-step-3-line1">{hero.line1}</span>
            <span className="hero-line line-2 hero-step-3-line2">
              <span>{hero.line2}</span>
            </span>
          </h1>
          <HeroSequence copy={hero.copy} />
        </div>
        <a className="scroll-cue" href="#signal" aria-label="Explore the academy">
          <span>Explore</span>
          <i />
        </a>
      </section>
      <script dangerouslySetInnerHTML={{ __html: revealEarly }} />
    </>
  );
}
