import type { Metadata } from "next";
import { Manrope, Public_Sans, IBM_Plex_Mono } from "next/font/google";
import { SITE_URL } from "@/shared/constants";
import "./globals.css";

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
});

const publicSans = Public_Sans({
  variable: "--font-public-sans",
  subsets: ["latin"],
});

const plexMono = IBM_Plex_Mono({
  variable: "--font-plex-mono",
  subsets: ["latin"],
  weight: ["400", "500"],
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: "IFNOTGOD TECH LTD | Every Problem Has a Tech Solution",
  description:
    "IFNOTGOD TECH LTD helps businesses and organisations solve real problems with custom software, AI, automation, integrations and digital solutions.",
  openGraph: {
    title: "IFNOTGOD TECH LTD | Every Problem Has a Tech Solution",
    description:
      "IFNOTGOD TECH LTD helps businesses and organisations solve real problems with custom software, AI, automation, integrations and digital solutions.",
    type: "website",
    locale: "en_NG",
  },
  twitter: {
    card: "summary_large_image",
    title: "IFNOTGOD TECH LTD | Every Problem Has a Tech Solution",
    description:
      "IFNOTGOD TECH LTD helps businesses and organisations solve real problems with custom software, AI, automation, integrations and digital solutions.",
  },
  alternates: {
    canonical: "/",
  },
  robots: {
    index: true,
    follow: true,
  },
  verification: {
    google: "YGcpjOpqy7A7Yqv5UqYR1Q0V7DBypubytnwpce6hF_E",
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${manrope.variable} ${publicSans.variable} ${plexMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col" suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
