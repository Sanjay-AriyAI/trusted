import { InViewClass } from "@/components/sections/InViewClass";

const steps = [
  {
    title: "Learn with signal.",
    body: "Live labs, expert feedback and only the concepts that survive contact with work.",
  },
  {
    title: "Build under pressure.",
    body: "Real briefs, production constraints and human judgement woven into every system.",
  },
  {
    title: "Prove your capability.",
    body: "Independent assessment, a verified portfolio and a credential that travels with you.",
  },
];

export function Method() {
  return (
    <section className="method section-shell" id="method">
      <InViewClass target="#method" />
      <div className="method-visual" aria-hidden="true">
        <div className="orbit orbit-one">
          <span>01</span>
        </div>
        <div className="orbit orbit-two">
          <span>02</span>
        </div>
        <div className="orbit orbit-three">
          <span>03</span>
        </div>
        <div className="method-core">YOU</div>
      </div>
      <div className="method-content">
        <p className="eyebrow">The Trusted method</p>
        <h2 className="method-title-animated" id="method-title">
          <span className="method-line line-1">LEARN IT.</span>
          <span className="method-line line-2">BUILD IT.</span>
          <span className="method-line line-3">
            <span>PROVE IT.</span>
          </span>
        </h2>
        <div className="method-list">
          {steps.map((step, i) => (
            <div key={step.title}>
              <b>{String(i + 1).padStart(2, "0")}</b>
              <p>
                <strong>{step.title}</strong>
                <span>{step.body}</span>
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
