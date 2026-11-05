# IFNOTGOD TECH LTD website

The company's one-page marketing site. Its main job is to get business owners and organisations to tell us about a problem they want solved. Built with Next.js (App Router), React, TypeScript and Tailwind CSS.

## Getting started

```bash
npm install
cp .env.example .env.local   # then fill in the values below
npm run dev
```

Open <http://localhost:3000>.

## Environment variables

| Variable | Required | Purpose |
| --- | --- | --- |
| `BREVO_API_KEY` | Yes, for the form to deliver | Sends contact form leads by email. Without it, the form shows visitors an error asking them to use WhatsApp or email. |
| `CONTACT_RECIPIENT_EMAIL` | Recommended | The inbox that receives leads. Defaults to the public contact email in `src/shared/constants.ts`. |
| `BREVO_SENDER_EMAIL` | Recommended | Sender address, verified in Brevo. A sender on your own authenticated domain is the most reliable. Defaults to `no-reply@ifnotgod.com`. |
| `BREVO_SENDER_NAME` | Optional | Sender name. |
| `NEXT_PUBLIC_SITE_URL` | Recommended | The site's main address, used for the canonical URL, sitemap, sharing image and structured data. Defaults to `https://www.ifnotgod.com`. Takes effect at build time, so redeploy after changing it. |

Running the site locally with a real `BREVO_API_KEY` means form submissions send real email.

## Commands

| Command | What it does |
| --- | --- |
| `npm run dev` | Starts the development server |
| `npm run build` | Creates the production build |
| `npm start` | Runs the production build |
| `npm run lint` | Runs ESLint |
| `npm test` | Runs unit and component tests with Vitest |
| `npm run test:e2e` | Runs browser tests against the production build. Run `npm run build` first. The first time, also run `npx playwright install chromium`. |

## Where things live

- `src/app`: the page, layout, metadata and `api/contact` route
- `src/components/sections`: one component per page section
- `src/components/ui`: shared components such as buttons and cards
- `src/lib`: the contact form's request code and email delivery
- `src/shared`: constants (including contact details), validation and helpers
- `src/app/globals.css`: colour and font tokens, and animations
- `e2e`: browser tests

Engineering standards are in [`AGENTS.md`](./AGENTS.md).
