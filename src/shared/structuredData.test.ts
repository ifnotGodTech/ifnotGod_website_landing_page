import { describe, expect, it } from "vitest";
import { CONTACT_INFO } from "@/shared/constants";
import type { Plan } from "@/types/catalogue";
import { buildOrganizationJsonLd, buildPlanOffersJsonLd } from "./structuredData";

describe("buildOrganizationJsonLd", () => {
  it("describes the organisation and its contact details", () => {
    const data = JSON.parse(buildOrganizationJsonLd("https://example.com"));

    expect(data["@type"]).toBe("Organization");
    expect(data.url).toBe("https://example.com");
    expect(data.logo).toBe("https://example.com/ifnotgod-icon.png");
    expect(data.email).toBe(CONTACT_INFO.email);
    expect(data.telephone).toBe("+2348061464092");
    expect(data.address).toMatchObject({ addressLocality: "Lagos", addressCountry: "NG" });
  });

  it("escapes characters that could close the script tag", () => {
    expect(buildOrganizationJsonLd("https://example.com/</script>")).not.toContain("</script>");
  });
});

describe("buildPlanOffersJsonLd", () => {
  const plan = (overrides: Partial<Plan>): Plan => ({
    id: "growth",
    name: "Growth",
    monthlyPrice: 40_000,
    tag: "",
    summary: "For a team.",
    ctaLabel: "",
    recommended: true,
    allowances: { everyday: 3, social: 2, agents: 1 },
    website: "",
    changes: "",
  monthlyChanges: 1,
    support: "",
    ...overrides,
  });

  it("lists priced plans as monthly offers in naira", () => {
    const data = JSON.parse(buildPlanOffersJsonLd("https://example.com", [plan({})]));

    expect(data["@type"]).toBe("Service");
    expect(data.offers).toEqual([
      expect.objectContaining({
        name: "Growth",
        price: 40_000,
        priceCurrency: "NGN",
        url: "https://example.com/pricing",
        priceSpecification: expect.objectContaining({ unitCode: "MON" }),
      }),
    ]);
  });

  it("leaves out plans that are quoted after the audit", () => {
    const data = JSON.parse(buildPlanOffersJsonLd("https://example.com", [plan({ id: "custom", monthlyPrice: null })]));

    expect(data.offers).toEqual([]);
  });

  it("escapes characters that could close the script tag", () => {
    expect(buildPlanOffersJsonLd("https://example.com", [plan({ summary: "</script>" })])).not.toContain("</script>");
  });
});
