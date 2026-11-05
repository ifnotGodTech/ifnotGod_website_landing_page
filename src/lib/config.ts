// Server-only config. Never import this from a Client Component.
import { CONTACT_INFO } from "@/shared/constants";

export const config = {
  brevo: {
    apiKey: process.env.BREVO_API_KEY,
    senderEmail: process.env.BREVO_SENDER_EMAIL ?? "no-reply@ifnotgod.com",
    senderName: process.env.BREVO_SENDER_NAME ?? "IFNOTGOD TECH LTD Website",
    recipientEmail: process.env.CONTACT_RECIPIENT_EMAIL ?? CONTACT_INFO.email,
  },
} as const;
