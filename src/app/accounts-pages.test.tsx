import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  user: null as null | { id: string; fullName: string; email: string; signInMethod: "password" | "google"; businessName?: string },
  redirect: vi.fn((path: string) => {
    throw new Error(`REDIRECT ${path}`);
  }),
}));
vi.mock("@/shared/features", () => ({ ACCOUNTS_ENABLED: true }));
vi.mock("next/navigation", () => ({ redirect: mocks.redirect, notFound: vi.fn(), usePathname: () => "/" }));
vi.mock("@/lib/accounts/session", () => ({ readSession: async () => mocks.user }));
vi.mock("@/lib/accounts/actions", () => ({ logInAction: vi.fn(), signUpAction: vi.fn(), logOutAction: vi.fn() }));
vi.mock("@/lib/accounts/account", () => ({
  loadAccount: async () => ({ subscription: null, plan: null, pendingPlan: null, choices: [], payments: [], setupFeePaid: false }),
}));

import AccountPage from "./(account)/account/page";
import LogInPage from "./(site)/login/page";
import { Navigation } from "@/components/sections/Navigation";

const accountProps = { params: Promise.resolve({}), searchParams: Promise.resolve({}) };
const withNext = (next?: string) => ({ params: Promise.resolve({}), searchParams: Promise.resolve({ next }) });

describe("with accounts switched on", () => {
  beforeEach(() => {
    mocks.user = null;
    mocks.redirect.mockClear();
  });

  it("adds Log in to the navigation", () => {
    render(<Navigation />);

    screen.getAllByRole("link", { name: "Log in", hidden: true }).forEach((link) => expect(link).toHaveAttribute("href", "/login"));
  });

  it("shows the log in form to signed-out visitors", async () => {
    render(await LogInPage(withNext("/account/services")));

    expect(screen.getByRole("heading", { level: 1, name: "Welcome back" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Create an account" })).toHaveAttribute("href", "/signup?next=%2Faccount%2Fservices");
  });

  it("sends signed-in visitors straight on", async () => {
    mocks.user = { id: "u1", fullName: "Ada Obi", email: "ada@example.com", signInMethod: "password" };

    await expect(LogInPage(withNext("/account/services"))).rejects.toThrow("REDIRECT /account/services");
  });

  it("sends signed-out visitors from the account page to log in", async () => {
    await expect(AccountPage(accountProps)).rejects.toThrow("REDIRECT /login");
  });

  it("greets the signed-in client with their details", async () => {
    mocks.user = { id: "u1", fullName: "Ada Obi", email: "ada@example.com", businessName: "Obi Logistics", signInMethod: "google" };

    render(await AccountPage(accountProps));

    expect(screen.getByRole("heading", { level: 1, name: "Hello, Ada" })).toBeInTheDocument();
    expect(screen.getByText("Obi Logistics · ada@example.com")).toBeInTheDocument();
    expect(screen.getByText("Google")).toBeInTheDocument();
  });
});
