import type { Metadata } from "next";
import { PlaceholderPage } from "@/components/sections/PlaceholderPage";

export const metadata: Metadata = {
  title: "Pricing | IFNOTGOD TECH LTD",
  robots: { index: false, follow: false },
};

export default function PricingPage() {
  return <PlaceholderPage title="Pricing" />;
}
