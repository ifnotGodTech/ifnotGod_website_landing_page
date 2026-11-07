import type { Metadata } from "next";
import { PlaceholderPage } from "@/components/sections/PlaceholderPage";

export const metadata: Metadata = {
  title: "Book a free audit | IFNOTGOD TECH LTD",
  robots: { index: false, follow: false },
};

export default function AuditPage() {
  return <PlaceholderPage title="Book a free audit" />;
}
