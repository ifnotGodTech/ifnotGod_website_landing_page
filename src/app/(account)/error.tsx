"use client";

// Shown when an account page fails, most often because our servers can't be reached. The error's
// own text is never shown.
export default function AccountError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <section className="mx-auto flex max-w-xl flex-col items-start gap-4 px-4 py-20">
      <h1 className="text-[2rem] font-extrabold tracking-[-0.02em]">We can&apos;t load your account right now</h1>
      <p className="text-on-light-dim">
        Our servers didn&apos;t answer. Nothing has changed on your account. Please try again in a moment, or reach us on
        WhatsApp if it keeps happening.
      </p>
      <button type="button" onClick={reset} className="cursor-pointer font-semibold text-maroon underline hover:text-maroon-bright">
        Try again
      </button>
    </section>
  );
}
