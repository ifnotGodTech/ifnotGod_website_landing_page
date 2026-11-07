import { act, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { AUDIT_PATH, CONTACT_INFO } from "@/shared/constants";
import { FloatingCta } from "./FloatingCta";

const navigation = vi.hoisted(() => ({ pathname: "/" }));
vi.mock("next/navigation", () => ({ usePathname: () => navigation.pathname }));

type ObserverCallback = (entries: Array<{ target: Element; isIntersecting: boolean }>) => void;

describe("FloatingCta", () => {
  let notify: ObserverCallback;
  const disconnect = vi.fn();
  const observed: Element[] = [];

  beforeEach(() => {
    navigation.pathname = "/";
    document.body.innerHTML = '<section data-page-hero></section><section id="contact"></section><footer></footer>';
    observed.length = 0;
    disconnect.mockReset();
    vi.stubGlobal(
      "IntersectionObserver",
      class {
        constructor(callback: ObserverCallback) {
          notify = callback;
        }
        observe(target: Element) {
          observed.push(target);
        }
        disconnect = disconnect;
      }
    );
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  const wrapper = () => screen.getByTestId("floating-cta");
  const target = (selector: string) => document.querySelector(selector) as Element;

  it("starts hidden and watches the page's hero, contact section and footer", () => {
    render(<FloatingCta />);

    expect(wrapper()).toHaveClass("invisible");
    expect(observed).toEqual([target("[data-page-hero]"), target("#contact"), target("footer")]);
  });

  it("shows only when none of the watched areas are in view", () => {
    render(<FloatingCta />);

    act(() => notify([{ target: target("[data-page-hero]"), isIntersecting: true }]));
    expect(wrapper()).toHaveClass("invisible");

    act(() => notify([{ target: target("[data-page-hero]"), isIntersecting: false }]));
    expect(wrapper()).toHaveClass("visible");

    act(() => notify([{ target: target("#contact"), isIntersecting: true }]));
    expect(wrapper()).toHaveClass("invisible");

    act(() => notify([{ target: target("footer"), isIntersecting: true }]));
    act(() => notify([{ target: target("#contact"), isIntersecting: false }]));
    expect(wrapper()).toHaveClass("invisible");
  });

  it("works on a page with only a footer to watch", () => {
    document.body.innerHTML = "<footer></footer>";
    render(<FloatingCta />);

    expect(observed).toEqual([target("footer")]);

    act(() => notify([{ target: target("footer"), isIntersecting: false }]));
    expect(wrapper()).toHaveClass("visible");
  });

  it("watches the new page's areas after a page change, forgetting the old ones", () => {
    const { rerender } = render(<FloatingCta />);
    act(() => notify([{ target: target("[data-page-hero]"), isIntersecting: true }]));

    target("[data-page-hero]").remove();
    target("#contact").remove();
    document.body.insertAdjacentHTML("afterbegin", '<section data-page-hero id="new-hero"></section>');
    observed.length = 0;
    navigation.pathname = "/pricing";
    rerender(<FloatingCta />);

    expect(disconnect).toHaveBeenCalledTimes(1);
    expect(observed).toEqual([target("#new-hero"), target("footer")]);

    act(() => notify([{ target: target("#new-hero"), isIntersecting: false }]));
    expect(wrapper()).toHaveClass("visible");
  });

  it.each([AUDIT_PATH, "/privacy-policy", "/terms"])("stays hidden on %s, even when nothing is in view", (pathname) => {
    navigation.pathname = pathname;
    render(<FloatingCta />);

    act(() => notify([{ target: target("footer"), isIntersecting: false }]));

    expect(wrapper()).toHaveClass("invisible");
  });

  it("links to the audit page, so it works on pages without a contact section", () => {
    render(<FloatingCta />);

    expect(screen.getByRole("link", { name: "Book a free audit", hidden: true })).toHaveAttribute("href", AUDIT_PATH);
  });

  it("offers WhatsApp alongside the main call to action", () => {
    render(<FloatingCta />);

    expect(screen.getByRole("link", { name: "Chat on WhatsApp", hidden: true })).toHaveAttribute(
      "href",
      CONTACT_INFO.whatsappHref
    );
  });

  it("disconnects its observer on unmount", () => {
    const { unmount } = render(<FloatingCta />);

    unmount();

    expect(disconnect).toHaveBeenCalledTimes(1);
  });
});
