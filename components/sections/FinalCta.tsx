import { ModalTrigger } from "@/components/modals/ModalTrigger";

export function FinalCta() {
  return (
    <section className="final-cta section-shell">
      <div className="cta-orbit cta-orbit-one" />
      <div className="cta-orbit cta-orbit-two" />
      <p className="eyebrow">Your next move starts here</p>
      <h2>
        Ready to become
        <br />
        <span>trusted with AI?</span>
      </h2>
      <p>Take two minutes. Get a personalised route. Make the next cohort the start of something bigger.</p>
      <div>
        <ModalTrigger action="assessment" className="button button-gold button-large">
          Find my route{" "}
        </ModalTrigger>
        <ModalTrigger action="apply" className="button button-ghost button-large">
          Apply directly
        </ModalTrigger>
      </div>
    </section>
  );
}
