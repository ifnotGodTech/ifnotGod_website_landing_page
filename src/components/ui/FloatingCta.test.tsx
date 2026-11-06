import { act, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { CONTACT_INFO } from "@/shared/constants";
import { FloatingCta } from "./FloatingCta";

type ObserverCallback = (entries: Array<{ target: Element; isIntersecting: boolean }>) => void;

describe("FloatingCta", () => {
  let notify: ObserverCallback;
  const disconnect = vi.fn();
  const observed: Element[] = [];

  beforeEach(() => {
    document.body.innerHTML = '<section id="top"></section><section id="contact"></section><footer></footer>';
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

  it("starts hidden and watches the hero, contact section and footer", () => {
    render(<FloatingCta />);

    expect(wrapper()).toHaveClass("invisible");
    expect(observed.map((element) => element.tagName + element.id)).toEqual([
      "SECTIONtop",
      "SECTIONcontact",
      "FOOTER",
    ]);
  });

  it("shows only when none of the watched areas are in view", () => {
    render(<FloatingCta />);

    act(() => notify([{ target: target("#top"), isIntersecting: true }]));
    expect(wrapper()).toHaveClass("invisible");

    act(() => notify([{ target: target("#top"), isIntersecting: false }]));
    expect(wrapper()).toHaveClass("visible");

    act(() => notify([{ target: target("#contact"), isIntersecting: true }]));
    expect(wrapper()).toHaveClass("invisible");

    act(() => notify([{ target: target("footer"), isIntersecting: true }]));
    act(() => notify([{ target: target("#contact"), isIntersecting: false }]));
    expect(wrapper()).toHaveClass("invisible");
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
