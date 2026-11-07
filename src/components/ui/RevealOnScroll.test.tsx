import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { Hero } from "@/components/sections/Hero";
import { RevealOnScroll } from "./RevealOnScroll";

// Content must never depend on JavaScript to become visible: server-rendered
// `opacity:0` once left the page blank for reduced-motion and no-JS visitors.
describe("server-rendered content visibility", () => {
  it("does not hide RevealOnScroll content with inline styles", () => {
    const html = renderToStaticMarkup(<RevealOnScroll>Visible</RevealOnScroll>);

    expect(html).toContain("Visible");
    expect(html).not.toMatch(/opacity:\s*0/);
  });

  it("does not hide the hero with inline styles", () => {
    const html = renderToStaticMarkup(<Hero />);

    expect(html).toContain("answering back while you sleep");
    expect(html).not.toMatch(/opacity:\s*0/);
  });
});
