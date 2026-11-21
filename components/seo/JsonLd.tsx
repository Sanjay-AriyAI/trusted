import { programs } from "@/lib/content/programs";
import { site } from "@/lib/content/site";

/** Structured data for search engines: the academy and its courses. */
export function JsonLd() {
  const url = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  const data = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "EducationalOrganization",
        "@id": `${url}/#organization`,
        name: site.name,
        url,
        email: site.contactEmail,
        description: site.description,
        address: { "@type": "PostalAddress", addressLocality: "London", addressCountry: "GB" },
      },
      ...programs.map((program) => ({
        "@type": "Course",
        name: program.name,
        description: program.summary,
        provider: { "@id": `${url}/#organization` },
        ...(program.priceGbp !== null && {
          offers: { "@type": "Offer", price: program.priceGbp, priceCurrency: "GBP", category: "Paid" },
        }),
      })),
    ],
  };
  return (
    <script
      type="application/ld+json"
      // escape "<" so the JSON can never close the script tag
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }}
    />
  );
}
