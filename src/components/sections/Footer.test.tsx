import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { AUDIT_PATH, SOCIAL_LINKS } from "@/shared/constants";
import { Footer } from "./Footer";

describe("Footer", () => {
  it.each([
    ["Services", "/services"],
    ["Pricing", "/pricing"],
    ["How it works", "/#how-it-works"],
    ["About", "/#about"],
    ["Free audit", AUDIT_PATH],
    ["Privacy Policy", "/privacy-policy"],
    ["Terms", "/terms"],
  ])("links to %s", (name, href) => {
    render(<Footer />);

    expect(screen.getByRole("link", { name })).toHaveAttribute("href", href);
  });

  it("links to each social profile", () => {
    render(<Footer />);

    expect(screen.getByRole("link", { name: "LinkedIn" })).toHaveAttribute("href", SOCIAL_LINKS.linkedin);
    expect(screen.getByRole("link", { name: "X" })).toHaveAttribute("href", SOCIAL_LINKS.x);
    expect(screen.getByRole("link", { name: "Instagram" })).toHaveAttribute("href", SOCIAL_LINKS.instagram);
  });
});
