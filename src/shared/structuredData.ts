import { CONTACT_INFO, SOCIAL_LINKS } from "@/shared/constants";
import type { Plan } from "@/types/catalogue";

export function buildOrganizationJsonLd(siteUrl: string): string {
  const organization = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "IFNOTGOD TECH LTD",
    url: siteUrl,
    logo: `${siteUrl}/ifnotgod-icon.png`,
    slogan: "Every problem has a tech solution.",
    description:
      "IFNOTGOD TECH LTD builds and runs AI automations for businesses and creators in Nigeria, for one monthly fee.",
    email: CONTACT_INFO.email,
    telephone: CONTACT_INFO.phoneHref.replace("tel:", ""),
    address: {
      "@type": "PostalAddress",
      addressLocality: "Lagos",
      addressCountry: "NG",
    },
    sameAs: Object.values(SOCIAL_LINKS),
  };

  return serialise(organization);
}

/** Plans with a published price, as offers. Quoted plans are left out because they have no price. */
export function buildPlanOffersJsonLd(siteUrl: string, plans: Plan[]): string {
  const service = {
    "@context": "https://schema.org",
    "@type": "Service",
    name: "AI automation plans",
    serviceType: "Business process automation",
    areaServed: { "@type": "Country", name: "Nigeria" },
    provider: { "@type": "Organization", name: "IFNOTGOD TECH LTD", url: siteUrl },
    offers: plans.flatMap((plan) =>
      plan.monthlyPrice === null
        ? []
        : [
            {
              "@type": "Offer",
              name: plan.name,
              description: plan.summary,
              url: `${siteUrl}/pricing`,
              priceCurrency: "NGN",
              price: plan.monthlyPrice,
              priceSpecification: {
                "@type": "UnitPriceSpecification",
                price: plan.monthlyPrice,
                priceCurrency: "NGN",
                unitCode: "MON",
              },
            },
          ]
    ),
  };

  return serialise(service);
}

// Escaping "<" stops the data closing the surrounding script tag.
function serialise(data: object): string {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}
