import type { Metadata } from "next";
import { PlaceholderPage } from "@/components/sections/PlaceholderPage";

export const metadata: Metadata = {
  title: "Services | IFNOTGOD TECH LTD",
  robots: { index: false, follow: false },
};

export default function ServicesPage() {
  return <PlaceholderPage title="Services" />;
}
