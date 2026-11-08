import { withNext } from "@/lib/accounts/paths";

// A plain link, not a Next.js Link: it goes to a route that starts sign-in and redirects.
export function GoogleButton({ label, next }: { label: string; next: string }) {
  return (
    <>
      <a
        href={withNext("/login/google", next)}
        className="flex min-h-12.5 items-center justify-center gap-3 rounded-md border border-on-light-dim/70 bg-white font-semibold text-on-light transition-colors hover:border-maroon"
      >
        <svg aria-hidden width="20" height="20" viewBox="0 0 48 48">
          <path fill="#EA4335" d="M24 9.5c3.5 0 6.6 1.2 9 3.6l6.7-6.7C35.6 2.4 30.2 0 24 0 14.6 0 6.6 5.4 2.7 13.3l7.8 6.1C12.4 13.6 17.7 9.5 24 9.5z" />
          <path fill="#4285F4" d="M46.5 24.5c0-1.6-.1-3.1-.4-4.5H24v9h12.6c-.5 2.9-2.2 5.4-4.7 7l7.3 5.7c4.3-4 7.3-9.9 7.3-17.2z" />
          <path fill="#FBBC05" d="M10.5 28.6c-.5-1.4-.8-3-.8-4.6s.3-3.2.8-4.6l-7.8-6.1C1 16.6 0 20.2 0 24s1 7.4 2.7 10.7l7.8-6.1z" />
          <path fill="#34A853" d="M24 48c6.5 0 11.9-2.1 15.9-5.8l-7.3-5.7c-2.2 1.5-5 2.4-8.6 2.4-6.3 0-11.6-4.1-13.5-9.9l-7.8 6.1C6.6 42.6 14.6 48 24 48z" />
        </svg>
        {label}
      </a>
      <div className="flex items-center gap-3 text-[0.88rem] text-on-light-dim">
        <span aria-hidden className="h-px grow bg-line-light" />
        or use your email
        <span aria-hidden className="h-px grow bg-line-light" />
      </div>
    </>
  );
}
