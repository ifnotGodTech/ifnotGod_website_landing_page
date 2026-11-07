import type { Metadata } from "next";
import { Contact } from "@/components/sections/Contact";
import { Container } from "@/components/ui/Container";

// Temporary: the existing contact form, until this becomes the full audit page.
export const metadata: Metadata = {
  title: "Book a free audit | IFNOTGOD TECH LTD",
  robots: { index: false, follow: false },
};

export default function AuditPage() {
  return (
    <Container className="pt-28 sm:pt-36">
      <h1 className="text-[clamp(2.2rem,5vw,3.2rem)] font-bold">Book a free audit</h1>
      <Contact />
    </Container>
  );
}
