import { z } from "zod";
import type { CatalogueData, SiteText } from "@/types/catalogue";

// The backend's catalogue response, checked before any page uses it. Matches backend/schema.yml.

const planId = z.enum(["starter", "growth", "pro", "custom"]);
const allowance = z.union([z.number().int().min(0), z.literal("agreed")]);

const plan = z.object({
  id: planId,
  name: z.string(),
  tag: z.string(),
  summary: z.string(),
  ctaLabel: z.string(),
  monthlyPrice: z.number().int().positive().nullable(),
  monthlyChanges: allowance,
  changes: z.string(),
  allowances: z.record(z.string(), allowance),
  lines: z.array(z.string()),
  recommended: z.boolean(),
  highlightExample: z.object({ serviceId: z.string(), label: z.string() }).nullable(),
});

const service = z.object({
  id: z.string(),
  group: z.string(),
  name: z.string(),
  problem: z.string(),
  note: z.string(),
  plans: z.array(planId),
  available: z.boolean(),
  catchAll: z.boolean(),
});

export const catalogueSchema: z.ZodType<CatalogueData> = z
  .object({
    plans: z.array(plan),
    groups: z.array(z.object({ id: z.string(), name: z.string(), unitSingular: z.string(), unitPlural: z.string() })),
    services: z.array(service),
    billingTerms: z.object({
      setupFee: z.number().int().positive(),
      setupFeeWaivedFromMonths: z.number().int().positive(),
      freeMonthsOnTwelve: z.number().int().min(0),
    }),
  })
  // The site's types use optional fields where the API sends empty or null values.
  .transform((data) => ({
    ...data,
    plans: data.plans.map(({ highlightExample, ...rest }) => ({ ...rest, ...(highlightExample ? { highlightExample } : {}) })),
    services: data.services.map(({ note, catchAll, ...rest }) => ({ ...rest, ...(note ? { note } : {}), ...(catchAll ? { catchAll } : {}) })),
  }));

export const siteTextSchema: z.ZodType<SiteText> = z.object({
  headline: z.string(),
  introduction: z.string(),
  closingCallToAction: z.string(),
});
