import { readdir, readFile, stat } from "node:fs/promises";
import path from "node:path";

// The real backend the account tests run against. See playwright.config.ts.

export const API_PORT = 8101;
export const BACKEND_DIR = process.env.BACKEND_DIR ?? path.resolve(__dirname, "../../backend");
export const OUTBOX_DIR = path.join(BACKEND_DIR, ".outbox-e2e-web");

/** Client accounts serve_for_e2e.sh creates, all with this password. */
export const CLIENT_PASSWORD = "e2e client password";
export const ADA = "ada.obi@example.com";
export const SOMEONE_ELSE = "someone.else@example.com";
export const TAKEN = "taken@example.com";

/** A new address for each test that creates an account, so runs never collide. */
export const uniqueEmail = (name: string) => `${name}.${Date.now()}.${Math.floor(Math.random() * 1e6)}@example.com`;

const SEPARATOR = /^-{79}$/m;

/** Every email the backend has written, oldest first. A file may hold several. */
async function emails(): Promise<string[]> {
  const names = (await readdir(OUTBOX_DIR).catch(() => [])).filter((name) => name.endsWith(".log"));
  const files = await Promise.all(
    names.map(async (name) => ({ name, modified: (await stat(path.join(OUTBOX_DIR, name))).mtimeMs })),
  );
  files.sort((a, b) => a.modified - b.modified || a.name.localeCompare(b.name));
  const contents = await Promise.all(files.map(({ name }) => readFile(path.join(OUTBOX_DIR, name), "utf8")));
  return contents.flatMap((content) => content.split(SEPARATOR)).filter((email) => email.trim());
}

/** The path of the reset link in the latest reset email to this address, such as /reset-password/new?... */
export async function latestResetLink(email: string): Promise<string> {
  const sent = (await emails()).filter((message) => message.includes(`To: ${email}`));
  const link = sent.at(-1)?.match(/https?:\/\/[^/\s]+(\/reset-password\/new\?\S+)/)?.[1];
  if (!link) throw new Error(`No reset link has been emailed to ${email}`);
  return link;
}

/** The latest email the backend has written with this subject, or null. */
export async function latestEmailWithSubject(subject: string): Promise<string | null> {
  return (await emails()).filter((message) => message.includes(`Subject: ${subject}`)).at(-1) ?? null;
}
