export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.ifnotgod.com";

export const AUDIT_PATH = "/audit";

export const NAV_LINKS = [
  { label: "Services", href: "/services" },
  { label: "Pricing", href: "/pricing" },
  { label: "How it works", href: "/#how-it-works" },
  { label: "About", href: "/#about" },
] as const;

export const CONTACT_INFO = {
  email: "ifnotgodtech@gmail.com",
  phoneDisplay: "+234 806 146 4092",
  phoneHref: "tel:+2348061464092",
  whatsappHref: "https://wa.me/2348061464092",
  location: "Lagos, Nigeria",
} as const;

// Used by the Privacy Policy and Terms. Section 27(1)(a) of the Nigeria Data Protection
// Act requires the business address.
export const LEGAL_INFO = {
  companyName: "IFNOTGOD TECH LTD",
  registeredAddress: "3, Kingsley Uwagbale Street, Off Mopo Road, United Estate, Lagos, Nigeria",
  registrationNumber: "8384966",
  lastUpdated: "6 November 2026",
} as const;

// Hidden form field that only bots fill in. The name avoids words browsers autofill,
// so real visitors can't trip it by accident.
export const HONEYPOT_FIELD = "hp_field";

export const SOCIAL_LINKS = {
  linkedin: "https://www.linkedin.com/in/ifnotgod-tech-71233036b/",
  x: "https://x.com/Ifnotgodtech",
  instagram: "https://www.instagram.com/ifnotgodtech/",
} as const;
