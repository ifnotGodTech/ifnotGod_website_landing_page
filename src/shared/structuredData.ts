import { CONTACT_INFO, SOCIAL_LINKS } from "@/shared/constants";

export function buildOrganizationJsonLd(siteUrl: string): string {
  const organization = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "IFNOTGOD TECH LTD",
    url: siteUrl,
    logo: `${siteUrl}/ifnotgod-icon.png`,
    slogan: "Every problem has a tech solution.",
    description:
      "IFNOTGOD TECH LTD helps businesses and organisations solve real problems with custom software, AI, automation, integrations and digital solutions.",
    email: CONTACT_INFO.email,
    telephone: CONTACT_INFO.phoneHref.replace("tel:", ""),
    address: {
      "@type": "PostalAddress",
      addressLocality: "Lagos",
      addressCountry: "NG",
    },
    sameAs: Object.values(SOCIAL_LINKS),
  };

  // Escaping "<" stops the data closing the surrounding script tag.
  return JSON.stringify(organization).replace(/</g, "\\u003c");
}
