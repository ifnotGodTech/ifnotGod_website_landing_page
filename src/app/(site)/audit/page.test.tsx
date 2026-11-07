import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { CONTACT_INFO } from "@/shared/constants";
import AuditPage, { metadata } from "./page";

const renderPage = async (plan?: string | string[]) =>
  render(await AuditPage({ params: Promise.resolve({}), searchParams: Promise.resolve({ plan }) }));

describe("audit page", () => {
  it("has its own title and canonical URL, and can be indexed", () => {
    expect(metadata.title).toContain("Free Automation Audit");
    expect(metadata.alternates?.canonical).toBe("/audit");
    expect(metadata.robots).toBeUndefined();
  });

  it("explains what happens next, in order", async () => {
    await renderPage();

    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("Tell us what's wasting your time.");
    expect(screen.getAllByRole("listitem").map((item) => item.textContent)).toEqual([
      "We contact you to arrange the call.",
      "We go through your work and find what to automate.",
      "You get a short written plan and the package that fits.",
    ]);
  });

  it("offers WhatsApp, email and phone for people who'd rather message", async () => {
    await renderPage();

    expect(screen.getByRole("link", { name: `WhatsApp ${CONTACT_INFO.phoneDisplay}` })).toHaveAttribute(
      "href",
      CONTACT_INFO.whatsappHref
    );
    expect(screen.getByRole("link", { name: CONTACT_INFO.email })).toHaveAttribute("href", `mailto:${CONTACT_INFO.email}`);
    expect(screen.getByRole("link", { name: `Call ${CONTACT_INFO.phoneDisplay}` })).toHaveAttribute(
      "href",
      CONTACT_INFO.phoneHref
    );
  });

  it("preselects the plan from the link", async () => {
    await renderPage("growth");

    expect(screen.getByLabelText(/interested in a plan/i)).toHaveValue("growth");
  });

  it.each([undefined, "platinum", ["growth", "pro"]])("starts on 'Not sure yet' for %j", async (plan) => {
    await renderPage(plan);

    expect(screen.getByLabelText(/interested in a plan/i)).toHaveValue("");
  });
});
