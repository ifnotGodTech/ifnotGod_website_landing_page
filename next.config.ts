import type { NextConfig } from "next";

const isDev = process.env.NODE_ENV === "development";

// Choosing a plan sends the form's result on to Flutterwave's payment page. The browser tests' fake
// Flutterwave is allowed only in their own build (npm run build:e2e).
// Flutterwave's test mode uses dev-flutterwave.com, for previews.
const paymentPages = ["https://*.flutterwave.com", "https://*.dev-flutterwave.com", process.env.E2E_FAKE_FLUTTERWAVE_ORIGIN]
  .filter(Boolean)
  .join(" ");

// The page is statically generated, so nonces aren't available and Next.js needs
// 'unsafe-inline' for its inline scripts. React needs 'unsafe-eval' only in development.
const contentSecurityPolicy = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ""}`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob:",
  "font-src 'self'",
  "object-src 'none'",
  "base-uri 'self'",
  `form-action 'self' ${paymentPages}`,
  "frame-ancestors 'none'",
].join("; ");

const nextConfig: NextConfig = {
  poweredByHeader: false,
  async headers() {
    // Pages with a visitor's own details must never be stored and shown to someone else.
    const privatePage = [{ key: "Cache-Control", value: "private, no-store" }];

    return [
      { source: "/account", headers: privatePage },
      { source: "/account/:path*", headers: privatePage },
      { source: "/login/:path*", headers: privatePage },
      {
        source: "/:path*",
        headers: [
          { key: "Content-Security-Policy", value: contentSecurityPolicy },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
        ],
      },
    ];
  },
};

export default nextConfig;
