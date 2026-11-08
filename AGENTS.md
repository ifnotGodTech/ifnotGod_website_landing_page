# AGENTS.md - IFNOTGOD TECH LTD

Engineering standards for `WEB`, the IFNOTGOD TECH LTD website: a multi-page, conversion-focused public site whose main action is booking a free automation audit, and later the account area where clients subscribe and manage their subscription.

This spec covers `WEB` only. The other projects are built separately, with their own specs:
- `backend`: the Django APIs used by `WEB` and `dashboard`.
- `dashboard`: a simple internal tool for our team to log in and manage users, subscriptions and the site's content.

Until the backend reaches a feature, its data stays in code.

## Engineering Standards
- Use TypeScript for all code in this project.
- Use Next.js App Router (`src/app`) for all route definitions.
- Add public pages inside the `src/app/(site)` route group, so they share its navigation, footer and floating button. Keep each page composed from section components.
- Validate incoming data at boundary layers (client form and server route handler).
- Favor explicit types for domain entities (`ContactSubmission`).
- All modules must be thoroughly tested.
- Minimum expectation:
  - unit tests for form validation logic and edge cases
  - integration test for the contact submission API route
  - UI interaction tests for form states (idle, submitting, success, error)
  - browser tests in `e2e` for behavior jsdom can't check, such as whether content is actually visible

## Folder Structure
- `src/app` (App Router: root layout, `api/contact` route handler, metadata files, global styles and theme tokens in `globals.css`)
- `src/app/(site)` (public pages and their shared layout, which owns `<main>`, so pages must not render their own)
- `src/components/sections` (Navigation, Footer, the audit page's AuditForm, LegacyContactRedirect for old `/#contact` links, the home page's Hero, HowItWorks, YourWeek, PlanSummary, About and PastWork, the pricing page's PricingPlans, PlanSelector and PlanTerms, the services page's ServiceGroups, and the shared ClosingCta)
- `src/components/ui` (shared reusable UI primitives: Button, Container, Eyebrow, FormField, RevealOnScroll, FloatingCta)
- `src/components/legal` (shared layout for the Privacy Policy and Terms pages, which live at `src/app/(site)/privacy-policy` and `src/app/(site)/terms`. Update the Privacy Policy whenever the site adds cookies, analytics, a new data recipient or a new use of personal data.)
- `src/content` (plans and services data, read only by `src/lib/catalogue`, which a lint rule enforces)
- `src/lib` (contact form client, email/notification client, config)
- `src/lib/catalogue` (async functions for reading plans and services, plus the rules for what each plan includes)
- `src/lib/api` (the one server-only client for every backend call: WEB's app key, the visitor's address, timeouts, and failures turned into plain messages)
- `src/lib/accounts` (the only route to the account backend: its interface, the stand-in, the login session cookie, and the form actions)
- `src/app/(account)` (signed-in pages, with their own layout; sign-in pages live in `(site)` and read no session in its layout)
- `src/components/account` (sign-in forms and account screens)
- `src/shared` (constants, validators, shared helpers)
- `src/types` (`ContactSubmission`, plan and service types, account types that form the contract with the backend, and other shared contracts)
- `e2e` (Playwright browser tests)

## Next.js Architecture Rules
- Keep route concerns in `src/app`; keep section composition and any submission logic in `src/components/sections` and `src/lib`.
- Prefer Server Components by default; use Client Components only where interactivity is required (contact form, nav hamburger, scroll/fade animations).
- Co-locate section-specific UI/hooks within `src/components/sections`.
- Use shared UI components from `src/components/ui` to maintain design consistency.
- Components in the shared layout (Navigation, FloatingCta) stay mounted between pages. Reset their page-specific state and re-find page elements when the pathname changes.
- Mark each page's hero with `data-page-hero`, so the floating button doesn't cover it.

## Performance Standards
- Optimize for Core Web Vitals on every public page:
  - LCP under 2.5s on standard broadband
  - INP under 200ms for core interactions (nav, form, CTAs)
  - CLS under 0.1
- Use lazy loading for below-the-fold media and non-critical sections.
- Minimize client bundle size:
  - avoid unnecessary client components
  - use dynamic imports for heavy optional UI (e.g. animation-heavy sections)
- Optimize images (hero visuals, icons) using Next.js image optimization patterns.
- Check for performance regressions on the Vercel preview before release.

## Delivery Approach
- Work in vertical slices: the backend project writes the API, then this project implements it on the interface.
- Exception: account screens are built before their API, against `src/lib/accounts` with a stand-in backend, behind the `NEXT_PUBLIC_ACCOUNTS_ENABLED` switch. The stand-in refuses to run in production, and the switch stays off there until the real API is connected.
- Until a slice reaches a feature, keep that feature's data behind one module in `src/lib`, so the API can replace it without page changes.

## Definition of Done (Feature Level)
A feature/section is done when:
- The task's acceptance criteria are met, and it matches the approved design (copy, CTAs, layout intent)
- Client and server validation checks are in place for any data entry
- Error, empty, loading, and success states are handled where applicable
- Tests are implemented and passing for affected modules
- Documentation is updated if behavior or structure changes

## Change Management
- Keep the `ContactSubmission` shape synchronized between client form, validator, and API route. Once a backend API owns a feature, its published schema is the contract, and `src/types` must match it.
- Any change to the contact/lead capture flow must consider what happens to in-flight or failed submissions (no silent data loss).
- Update this `AGENTS.md` when section structure, naming, or module boundaries change.

## Resource Cleanup Rules
- Always clean up subscriptions, timers, event listeners, observers, and custom browser integrations.
- Clean up side effects properly on unmount and dependency changes.
- Abort stale requests when needed.
- Prevent state updates after unmount.
- Do not leak scroll/intersection observers across re-renders.

## Heavy Work Rules
- Never block the browser main thread.
- Do not perform expensive transformations inside render paths.
- Prefer server-side rendering for static content; keep client-side JS limited to interactivity and animation.

## Network Rules
- Use a centralized HTTP/client abstraction for the contact submission call and for all backend API calls.
- The security policy in `next.config.ts` only allows browser requests to this site's own address. Calling another address from the browser means changing that policy on purpose, so prefer calling the backend from the server.
- Handle errors with typed exceptions or normalized failures.
- Normalize the contact form payload before it reaches the API route.
- Do not let raw request/response shapes leak into presentation code.

## Caching and Data Ownership Rules
- Site content is source-of-truth in code until the backend takes it over, then in the backend, where the team manages it through `dashboard`. Don't duplicate it in client state.
- Public pages must stay fast and indexable once content comes from the API: serve cached pages that refresh when content is saved, and keep showing the last good version if the API is unavailable.
- Pages read plans and services through `src/lib/catalogue`, never directly from content files.
- `src/lib/catalogue` reads from the backend when `BACKEND_API_URL` is set, cached and tagged `catalogue` so saves can refresh it, and from `src/content` otherwise. A failed backend request throws, so the last good page stays up. `src/content` goes once the backend is live.
- Keep any filter/tab UI state (if introduced, e.g. solutions filtering) in local state; use URL state only if it needs to be shareable.
- Derived UI state should be computed, not redundantly stored.

## Data Parsing and Mapping Rules
- Do not perform expensive data shaping inside components.
- Validate and normalize the contact form payload in the data/API layer, not in presentation code.

## State Management Rules
- Keep state minimal.
- Use local state for isolated interactions (form fields, nav toggle, accordion/tab UI).
- Use immutable updates.
- Avoid global state. Public pages don't need a client store.

## Error Handling Rules
- Use exceptions in the data/integration layer (e.g. email/lead delivery failures).
- Use typed failures or normalized error objects in the application layer.
- Never expose raw exceptions directly to the UI.
- Presentation layer must map failures into clear, human user-facing messages (e.g. "Something went wrong sending your message — try again or reach us on WhatsApp").
- The audit form must support loading, empty, error, and success states.
- Add retry-friendly UX on submission failure (do not clear the user's input on error).

## Dependency Management Rules
- Centralize the email/lead-delivery client construction in `src/lib`.
- Avoid ad hoc instantiation of shared clients across sections.
- Keep the contact-delivery dependency swappable (e.g. email provider, form backend, CRM webhook) behind one interface.

## UI, Responsive, and Motion Rules
- Follow consistent spacing, typography, hierarchy, and interaction patterns across all sections.
- Use `Container` for page width and side padding.
- Use reusable components and avoid duplicated UI code (cards, buttons, headings).
- UI files must remain focused on presentation and interaction wiring, not business/validation logic.
- Standardize repeated UI patterns: buttons, inputs, cards, and the section-header pattern used throughout the site.
- All sections must support adaptive layouts across mobile, tablet, and desktop.
- Do not build fixed mobile-only layouts.
- Use responsive primitives: CSS Grid, Flexbox, container constraints, and breakpoint composition.
- Ensure text remains usable under zoom and larger text settings.
- Before marking any phase complete, test key flows (nav, scroll, form submission) at mobile, tablet, and desktop widths.
- Before marking any phase complete, confirm no overflow, clipped CTAs, or inaccessible controls.
- Use motion sparingly and intentionally: fade-in on scroll, slight card movement, smooth section transitions, gentle hero animation.
- Avoid continuous or decorative motion.
- Animations must never block interaction.
- Respect reduced-motion preferences.
- Content must be visible by default, without JavaScript. Use CSS for entrance and scroll animations, and never server-render content hidden.
- Verify no visible jank on scroll or hover interactions.

## Brand and CTA Color Rules
- Brand palette:
  - Maroon/Burgundy `#6B1F2A` — primary brand color; primary CTA background, key accents.
  - Ink `#0B0706` — primary dark background/base for the site's dark aesthetic.
  - Paper `#F7F1EC` — primary text on dark surfaces, CTA text on maroon, and the background of light sections.
  - Orange `#E07B2A` — secondary accent; secondary/tertiary CTA background, highlights, icon accents, matches the logo's gradient warmth.
- Sections and cards with their own background use `surface-light`, `surface-dark`, `surface-maroon` or `surface-ink`, which also set their heading and focus colours. On light surfaces, use `on-light`, `on-light-dim` or maroon for text: orange and `mute` fail contrast there.
- Define all colors as theme tokens (`src/app/globals.css`), not hardcoded hex in components; derive hover/active shades from the tokens (e.g. `color-mix` or a small shade scale) rather than inventing new one-off hex values per component.
- Do not overuse orange as decorative/neon — reserve it for CTAs, highlights, and small accent moments.
- Keep button/CTA text contrast accessible (minimum WCAG AA): paper on maroon passes for normal-size text. White on orange is only about 3:1 and fails, so use dark ink text on orange. Verify any smaller/lighter text combinations before shipping.

## UI File Size and Composition Rules
- Avoid oversized UI files; split components when a file grows beyond a maintainable size.
- As a guideline, refactor UI files approaching ~250-300 lines, especially when multiple concerns are mixed.
- Separate concerns clearly:
  - presentation in section/component files
  - validation/parsing/mapping in `src/lib` or `src/shared`
- Extract repeated JSX sections (e.g. card grids) into subcomponents instead of long monolithic files.
- Keep the page-level file thin by composing section components.
- Keep component props explicit and typed.

## Frontend Security Rules
- Never trust client input; validate the contact form again at the server boundary.
- Never expose secrets (email API keys, webhook URLs) in the client bundle.
- Keep client-safe and server-only environment variables clearly separated.
- Sensitive actions (sending the contact submission) must go through a trusted server-side route handler, not a direct client-side call to a third-party service.
- Rate-limit or otherwise guard the contact endpoint against spam/abuse.

## Client Account Rules
Clients log in on this site to subscribe, and to see, renew, upgrade or cancel their subscription. Details are settled when each slice is built, but these rules apply from the start:
- Keep account pages in their own route group, separate from `src/app/(site)`.
- Don't read the session in the `(site)` layout or its pages. That would stop public pages being statically generated.
- The backend enforces who can see and do what. Hiding something in the UI isn't security.
- Keep session tokens out of JavaScript-readable storage.
- Keep account pages out of search results and the sitemap, and never cache one client's page for another.
- Never handle or store full card details in this project.
- Update the Privacy Policy and Terms before login or payments go live. The Privacy Policy currently says the site sets no cookies.

<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
