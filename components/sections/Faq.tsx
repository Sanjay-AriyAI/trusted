import { ModalTrigger } from "@/components/modals/ModalTrigger";
import { FaqList } from "@/components/sections/FaqList";
import { faqs } from "@/lib/content/faqs";

export function Faq() {
  return (
    <section className="faq section-shell" id="faq">
      <div className="faq-heading">
        <p className="eyebrow">Questions, answered</p>
        <h2>
          Before you
          <br />
          <span>make the move.</span>
        </h2>
        <ModalTrigger action="assessment" className="inline-link">
          Not sure where to start? Take the assessment{" "}
        </ModalTrigger>
      </div>
      <FaqList faqs={faqs} />
    </section>
  );
}
