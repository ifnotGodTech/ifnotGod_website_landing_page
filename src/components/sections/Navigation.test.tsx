import { act, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { Navigation } from "./Navigation";

describe("Navigation mobile menu", () => {
  let desktopNavListener: ((event: { matches: boolean }) => void) | undefined;

  beforeEach(() => {
    desktopNavListener = undefined;
    vi.stubGlobal("matchMedia", () => ({
      addEventListener: (_: string, listener: (event: { matches: boolean }) => void) => {
        desktopNavListener = listener;
      },
      removeEventListener: () => {
        desktopNavListener = undefined;
      },
    }));
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    document.body.style.overflow = "";
  });

  const menu = () => document.getElementById("mobile-menu") as HTMLElement;

  it("keeps the closed menu out of the tab order", () => {
    render(<Navigation />);

    expect(menu()).toHaveAttribute("inert");
    expect(screen.getByRole("button", { name: "Open menu" })).toHaveAttribute("aria-expanded", "false");
  });

  it("updates its label and locks scrolling while open", async () => {
    const user = userEvent.setup();
    render(<Navigation />);

    await user.click(screen.getByRole("button", { name: "Open menu" }));

    expect(screen.getByRole("button", { name: "Close menu" })).toHaveAttribute("aria-expanded", "true");
    expect(menu()).not.toHaveAttribute("inert");
    expect(document.body.style.overflow).toBe("hidden");
  });

  it("makes the page behind the menu inert until it closes", async () => {
    const user = userEvent.setup();
    const { container } = render(
      <>
        <Navigation />
        <main />
      </>
    );
    const main = container.querySelector("main") as HTMLElement;

    await user.click(screen.getByRole("button", { name: "Open menu" }));
    expect(main.inert).toBe(true);

    await user.keyboard("{Escape}");
    expect(main.inert).toBe(false);
  });

  it("closes on Escape and returns focus to the toggle", async () => {
    const user = userEvent.setup();
    render(<Navigation />);

    await user.click(screen.getByRole("button", { name: "Open menu" }));
    await user.keyboard("{Escape}");

    const toggle = screen.getByRole("button", { name: "Open menu" });
    expect(toggle).toHaveAttribute("aria-expanded", "false");
    expect(toggle).toHaveFocus();
    expect(document.body.style.overflow).toBe("");
  });

  it("closes and releases the scroll lock at the desktop breakpoint", async () => {
    const user = userEvent.setup();
    render(<Navigation />);

    await user.click(screen.getByRole("button", { name: "Open menu" }));
    act(() => desktopNavListener?.({ matches: true }));

    expect(screen.getByRole("button", { name: "Open menu" })).toHaveAttribute("aria-expanded", "false");
    expect(document.body.style.overflow).toBe("");
  });
});
