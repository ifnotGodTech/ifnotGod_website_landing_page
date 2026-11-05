export const NAV_LINKS = [
  { label: "Solutions", href: "#solutions" },
  { label: "How We Work", href: "#how-we-work" },
  { label: "Why Us", href: "#why-us" },
  { label: "About", href: "#about" },
  { label: "Contact", href: "#contact" },
] as const;

export const CONTACT_INFO = {
  email: "ifnotgodtech@gmail.com",
  phoneDisplay: "+234 806 146 4092",
  phoneHref: "tel:+2348061464092",
  whatsappHref: "https://wa.me/2348061464092",
  location: "Lagos, Nigeria",
} as const;

// Hidden form field that only bots fill in. The name avoids words browsers autofill,
// so real visitors can't trip it by accident.
export const HONEYPOT_FIELD = "hp_field";

export const SOCIAL_LINKS = {
  linkedin: "https://www.linkedin.com/in/ifnotgod-tech-71233036b/",
  x: "https://x.com/Ifnotgodtech",
  instagram: "https://www.instagram.com/ifnotgodtech/",
} as const;
