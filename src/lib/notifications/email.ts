import { getPlan } from "@/lib/catalogue";
import { config } from "@/lib/config";
import type { ContactSubmission } from "@/types/contact";

const BREVO_ENDPOINT = "https://api.brevo.com/v3/smtp/email";
const BREVO_TIMEOUT_MS = 10_000;

export class EmailDeliveryError extends Error {
  constructor(message: string, readonly cause?: unknown) {
    super(message);
    this.name = "EmailDeliveryError";
  }
}

export class EmailNotConfiguredError extends Error {
  constructor() {
    super("BREVO_API_KEY is not configured.");
    this.name = "EmailNotConfiguredError";
  }
}

async function buildContent(submission: ContactSubmission): Promise<{ subject: string; html: string }> {
  const plan = submission.plan ? await getPlan(submission.plan) : undefined;
  const rows: Array<[string, string]> = [
    ["Full name", submission.fullName],
    ["Business or brand", submission.organisation || "—"],
    ["Email", submission.email],
    ["Phone / WhatsApp", submission.phone || "—"],
    ["Task or problem", submission.challenge],
    ["Interested in", plan?.name ?? "Not sure yet"],
  ];

  const html = `
    <h2>New free audit request via ifnotgod.com</h2>
    <table cellpadding="6" cellspacing="0">
      ${rows
        .map(
          ([label, value]) =>
            `<tr><td><strong>${escapeHtml(label)}</strong></td><td>${escapeHtml(value).replace(/\n/g, "<br/>")}</td></tr>`
        )
        .join("")}
    </table>
  `;

  return {
    subject: `New audit request from ${submission.fullName}${submission.organisation ? ` (${submission.organisation})` : ""}`
      .replace(/\s+/g, " "),
    html,
  };
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export async function sendContactNotification(submission: ContactSubmission): Promise<void> {
  const { apiKey, senderEmail, senderName, recipientEmail } = config.brevo;

  if (!apiKey) {
    console.error(
      "[contact] BREVO_API_KEY is not set — contact submission was validated but not delivered.",
      { fullName: submission.fullName, email: submission.email }
    );
    throw new EmailNotConfiguredError();
  }

  const { subject, html } = await buildContent(submission);

  let response: Response;
  try {
    response = await fetch(BREVO_ENDPOINT, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        accept: "application/json",
        "api-key": apiKey,
      },
      body: JSON.stringify({
        sender: { name: senderName, email: senderEmail },
        to: [{ email: recipientEmail }],
        replyTo: { email: submission.email, name: submission.fullName },
        subject,
        htmlContent: html,
      }),
      signal: AbortSignal.timeout(BREVO_TIMEOUT_MS),
    });
  } catch (error) {
    throw new EmailDeliveryError("Brevo request failed or timed out.", error);
  }

  if (!response.ok) {
    const body = await response.text().catch(() => "");
    throw new EmailDeliveryError(`Brevo request failed with status ${response.status}: ${body}`);
  }
}
