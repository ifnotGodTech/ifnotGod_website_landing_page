import type { Metadata } from "next";
import { Manrope, Public_Sans, IBM_Plex_Mono } from "next/font/google";
import { SITE_URL } from "@/shared/constants";
import "./globals.css";

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
});

// "optional" keeps the fallback font if this one hasn't arrived almost at once, as on slow
// mobile data. Swapping it in later rewraps long text and moves the page (layout shift).
const publicSans = Public_Sans({
  variable: "--font-public-sans",
  subsets: ["latin"],
  display: "optional",
});

const plexMono = IBM_Plex_Mono({
  variable: "--font-plex-mono",
  subsets: ["latin"],
  weight: ["400", "500"],
});

// Site-wide defaults only. Each page sets its own title, description, canonical URL and
// sharing details through buildPageMetadata, so nothing inherits another page's values.
export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: "IFNOTGOD TECH LTD",
  description: "IFNOTGOD TECH LTD builds and runs AI automations for businesses and creators in Nigeria. Follow up leads, answer customers and cut repetitive work, for one monthly fee.",
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
      data-scroll-behavior="smooth"
      className={`${manrope.variable} ${publicSans.variable} ${plexMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col" suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
