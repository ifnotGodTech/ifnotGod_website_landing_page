import type { PlanId } from "@/types/catalogue";

export type ContactSubmission = {
  fullName: string;
  organisation?: string;
  email: string;
  phone?: string;
  challenge: string;
  /** The plan the visitor says they're interested in. Left out when they're not sure. */
  plan?: PlanId;
};
