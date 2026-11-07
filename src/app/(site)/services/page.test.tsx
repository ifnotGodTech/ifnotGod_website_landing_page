import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { AUDIT_PATH } from "@/shared/constants";
import ServicesPage, { metadata } from "./page";

// An async server component, which can't render here. It has its own tests.
vi.mock("@/components/sections/ServiceGroups", () => ({ ServiceGroups: () => null }));

describe("services page", () => {
  it("has its own title and canonical URL, and can be indexed", () => {
    expect(metadata.title).toContain("Services");
    expect(metadata.alternates?.canonical).toBe("/services");
    expect(metadata.robots).toBeUndefined();
  });

  it("points people with other problems to the audit", () => {
    render(<ServicesPage />);

    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("Start with the problem.");
    expect(screen.getByText(/bring it to the free audit/)).toBeInTheDocument();
  });

  it("notes what's included and larger builds, with calls to action", () => {
    render(<ServicesPage />);

    expect(screen.getByRole("heading", { name: "Included with every plan" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Need something larger?" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Book a free automation audit" })).toHaveAttribute("href", AUDIT_PATH);
    expect(screen.getByRole("link", { name: "See plans and prices" })).toHaveAttribute("href", "/pricing");
  });
});
