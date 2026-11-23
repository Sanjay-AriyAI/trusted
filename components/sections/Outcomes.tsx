import { outcomes } from "@/lib/content/outcomes";

export function Outcomes() {
  return (
    <section className="outcomes section-shell" id="outcomes">
      <div className="section-heading compact">
        <div>
          <p className="eyebrow">What graduates build</p>
          <h2>
            Work that makes
            <br />
            <span>a measurable difference.</span>
          </h2>
        </div>
        <p>Not toy demos. Useful systems designed around real teams, real risks and real outcomes.</p>
      </div>
      <div className="project-grid">
        {outcomes.map((outcome, i) => (
          <article key={outcome.title}>
            <div className="project-top">
              <span>{String(i + 1).padStart(2, "0")}</span>
            </div>
            <strong>{outcome.metric}</strong>
            <h3>{outcome.title}</h3>
            <p>{outcome.body}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
