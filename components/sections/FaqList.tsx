"use client";

import { useId, useState } from "react";
import type { Faq } from "@/lib/content/faqs";

/**
 * Single-open accordion with the POC markup (.faq-list article.open > button + div > p).
 * Kept as plain React (not Radix Accordion) because the POC animates grid-template-rows on the
 * .open class, which needs the answer to stay mounted. Closed answers are inert, so they're
 * skipped by keyboard and screen readers.
 */
export function FaqList({ faqs }: { faqs: Faq[] }) {
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  const baseId = useId();

  return (
    <div className="faq-list">
      {faqs.map((faq, i) => {
        const open = openIndex === i;
        const panelId = `${baseId}-panel-${i}`;
        const buttonId = `${baseId}-button-${i}`;
        return (
          <article key={faq.question} className={open ? "open" : ""}>
            <button
              type="button"
              id={buttonId}
              aria-expanded={open}
              aria-controls={panelId}
              onClick={() => setOpenIndex(open ? null : i)}
            >
              <span>{String(i + 1).padStart(2, "0")}</span>
              {faq.question}
              <i aria-hidden="true">{open ? "−" : "+"}</i>
            </button>
            <div id={panelId} role="region" aria-labelledby={buttonId} inert={!open}>
              <p>{faq.answer}</p>
            </div>
          </article>
        );
      })}
    </div>
  );
}
