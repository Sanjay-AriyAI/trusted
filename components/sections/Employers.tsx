import { ModalTrigger } from "@/components/modals/ModalTrigger";

const skills = [
  { label: "Applied AI", value: 96 },
  { label: "System design", value: 91 },
  { label: "Responsible delivery", value: 94 },
];

export function Employers() {
  return (
    <section className="employer-section" id="employers">
      <div className="employer-glow" />
      <div className="section-shell employer-inner">
        <div className="employer-copy">
          <p className="eyebrow">For employers</p>
          <h2>
            Hire people who
            <br />
            <span>have already proved it.</span>
          </h2>
          <p>
            Skip the claims and inspect the evidence. Every candidate in our network is certified, portfolio-vetted and
            matched to your use case.
          </p>
          <ModalTrigger action="apply" track="Team training" className="button button-light button-large">
            Access the talent network{" "}
          </ModalTrigger>
        </div>
        <div className="talent-card">
          <div className="talent-head">
            <span>Verified talent signal</span>
            <i>Live</i>
          </div>
          <div className="candidate">
            <div className="candidate-avatar">AR</div>
            <div>
              <strong>AI Systems Engineer</strong>
              <span>Certified · 14 reviewed builds</span>
            </div>
            <b>98</b>
          </div>
          <div className="skill-bars">
            {skills.map((skill) => (
              <div key={skill.label}>
                <span>
                  {skill.label}
                  <b>{skill.value}%</b>
                </span>
                <i>
                  <em style={{ width: `${skill.value}%` }} />
                </i>
              </div>
            ))}
          </div>
          <div className="talent-footer">
            <span>Portfolio verified</span>
            <span>Available for matching</span>
          </div>
        </div>
      </div>
    </section>
  );
}
