// Built into the site when it's built, so changing it needs a new build. Turn the account
// area on with NEXT_PUBLIC_ACCOUNTS_ENABLED=true. Keep it off in production until the real
// backend is connected (phase 12): until then, accounts use a stand-in.
export const ACCOUNTS_ENABLED = process.env.NEXT_PUBLIC_ACCOUNTS_ENABLED === "true";

// The AI assistant chat, with NEXT_PUBLIC_CHAT_ENABLED=true. Also built in. Keep it off on the live site
// until it's approved and the Privacy Policy covers it.
export const CHAT_ENABLED = process.env.NEXT_PUBLIC_CHAT_ENABLED === "true";
