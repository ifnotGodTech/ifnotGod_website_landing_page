import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { loadCatalogue, loadSiteText } from "./source";

vi.mock("next/headers", () => ({ headers: async () => new Headers() }));

const fetchMock = vi.fn();
const json = (status: number, body: unknown) => new Response(JSON.stringify(body), { status, headers: { "content-type": "application/json" } });

// A trimmed response in the backend's shape (backend/schema.yml).
const API_CATALOGUE = {
  plans: [
    {
      id: "pro",
      name: "Pro",
      tag: "Run several automations",
      summary: "For a busy organisation.",
      ctaLabel: "Start with an audit",
      monthlyPrice: 80_000,
      monthlyChanges: 2,
      changes: "2 changes or new builds a month",
      allowances: { agents: 2, websites: 1 },
      lines: ["Small multi-page site", "Monthly review call"],
      recommended: false,
      highlightExample: null,
    },
  ],
  groups: [{ id: "agents", name: "AI agents", unitSingular: "AI agent", unitPlural: "AI agents" }],
  services: [
    { id: "ai-call-agent", group: "agents", name: "AI call agent", problem: "I miss calls.", note: "Minutes billed separately.", plans: ["pro"], available: true, catchAll: false },
    { id: "staff-assistant", group: "agents", name: "Staff assistant", problem: "Same questions.", note: "", plans: ["growth", "pro"], available: true, catchAll: false },
  ],
  billingTerms: { setupFee: 100_000, setupFeeWaivedFromMonths: 6, freeMonthsOnTwelve: 2 },
};

describe("where the catalogue comes from", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", fetchMock);
    vi.spyOn(console, "error").mockImplementation(() => {});
    fetchMock.mockReset();
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it("uses the content files when no backend is set", async () => {
    vi.stubEnv("BACKEND_API_URL", "");

    expect((await loadCatalogue()).plans.map((plan) => plan.id)).toEqual(["starter", "growth", "pro", "custom"]);
    expect((await loadSiteText()).headline).toBe("Your business, answering back while you sleep.");
    expect(fetchMock).not.toHaveBeenCalled();
  });

  describe("with the backend", () => {
    beforeEach(() => {
      vi.stubEnv("BACKEND_API_URL", "https://api.example.com");
      vi.stubEnv("BACKEND_APP_KEY", "web-key");
    });

    it("reads the catalogue, cached for an hour and tagged so saves can refresh it", async () => {
      fetchMock.mockResolvedValueOnce(json(200, API_CATALOGUE));

      const catalogue = await loadCatalogue();

      const [url, options] = fetchMock.mock.calls[0];
      expect(url).toBe("https://api.example.com/api/v1/catalogue/");
      expect(options.next).toEqual({ revalidate: 3600, tags: ["catalogue"] });
      expect(options.cache).toBeUndefined();
      expect(options.headers).not.toHaveProperty("x-visitor-ip");
      expect(catalogue.plans[0].lines).toEqual(["Small multi-page site", "Monthly review call"]);
      expect(catalogue.plans[0].allowances).toEqual({ agents: 2, websites: 1 });
    });

    it("turns empty notes and missing examples into absent fields, as the site expects", async () => {
      fetchMock.mockResolvedValueOnce(json(200, API_CATALOGUE));

      const { plans, services } = await loadCatalogue();

      expect(plans[0]).not.toHaveProperty("highlightExample");
      expect(services[0].note).toBe("Minutes billed separately.");
      expect(services[1]).not.toHaveProperty("note");
      expect(services[1]).not.toHaveProperty("catchAll");
    });

    it("throws rather than show an empty catalogue, so the last good page stays up", async () => {
      fetchMock.mockResolvedValueOnce(json(503, {}));
      await expect(loadCatalogue()).rejects.toThrow("couldn't be loaded from the backend (UNAVAILABLE)");

      fetchMock.mockResolvedValueOnce(json(200, { plans: "nope" }));
      await expect(loadCatalogue()).rejects.toThrow("UNEXPECTED");
    });

    it("reads the site text", async () => {
      fetchMock.mockResolvedValueOnce(json(200, { headline: "Every problem has a tech solution.", introduction: "Intro.", closingCallToAction: "Talk to us." }));

      expect((await loadSiteText()).headline).toBe("Every problem has a tech solution.");
      expect(fetchMock.mock.calls[0][0]).toBe("https://api.example.com/api/v1/site-text/");
    });
  });
});
