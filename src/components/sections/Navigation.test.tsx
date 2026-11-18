import { act, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { AUDIT_PATH, NAV_LINKS } from "@/shared/constants";
import { Navigation } from "./Navigation";

const navigation = vi.hoisted(() => ({ pathname: "/" }));
vi.mock("next/navigation", () => ({ usePathname: () => navigation.pathname }));

describe("Navigation links", () => {
  it.each([
    ["Services", "/services"],
    ["Pricing", "/pricing"],
    ["How it works", "/#how-it-works"],
    ["About", "/#about"],
  ])("offers %s in both the desktop and mobile menus", (name, href) => {
    render(<Navigation />);

    const links = screen.getAllByRole("link", { name, hidden: true });

    expect(links).toHaveLength(2);
    links.forEach((link) => expect(link).toHaveAttribute("href", href));
  });

  it("uses a full path for every link, so they work from any page", () => {
    NAV_LINKS.forEach((link) => expect(link.href).toMatch(/^\//));
  });

  it("makes booking the audit the main button", () => {
    render(<Navigation />);

    const buttons = screen.getAllByRole("link", { name: "Book a free audit", hidden: true });

    expect(buttons).toHaveLength(2);
    buttons.forEach((button) => expect(button).toHaveAttribute("href", AUDIT_PATH));
  });

  it("takes the logo to the home page", () => {
    render(<Navigation />);

    expect(screen.getByRole("img", { name: "IFNOTGOD TECH LTD logo" }).closest("a")).toHaveAttribute("href", "/");
  });
});

describe("Navigation mobile menu", () => {
  let desktopNavListener: ((event: { matches: boolean }) => void) | undefined;

  beforeEach(() => {
    navigation.pathname = "/";
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

  it("closes when the page changes, such as through the back button", async () => {
    const user = userEvent.setup();
    const { rerender } = render(<Navigation />);

    await user.click(screen.getByRole("button", { name: "Open menu" }));

    navigation.pathname = "/pricing";
    rerender(<Navigation />);

    expect(screen.getByRole("button", { name: "Open menu" })).toHaveAttribute("aria-expanded", "false");
    expect(menu()).toHaveAttribute("inert");
    expect(document.body.style.overflow).toBe("");
  });

  it("closes when a link to the current page is chosen", async () => {
    const user = userEvent.setup();
    render(<Navigation />);

    await user.click(screen.getByRole("button", { name: "Open menu" }));
    const aboutInMenu = within(menu()).getByRole("link", { name: "About" });
    aboutInMenu.addEventListener("click", (event) => event.preventDefault());
    await user.click(aboutInMenu);

    expect(screen.getByRole("button", { name: "Open menu" })).toHaveAttribute("aria-expanded", "false");
  });
});
