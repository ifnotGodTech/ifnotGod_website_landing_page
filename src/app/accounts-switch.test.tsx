import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

// With NEXT_PUBLIC_ACCOUNTS_ENABLED unset, as in production for now.
const mocks = vi.hoisted(() => ({
  notFound: vi.fn(() => {
    throw new Error("NOT_FOUND");
  }),
}));
vi.mock("next/navigation", () => ({ notFound: mocks.notFound, redirect: vi.fn(), usePathname: () => "/" }));
vi.mock("next/headers", () => ({ cookies: async () => ({ get: () => undefined }) }));

import AccountLayout from "./(account)/layout";
import LogInPage from "./(site)/login/page";
import ResetPasswordPage from "./(site)/reset-password/page";
import SignUpPage from "./(site)/signup/page";
import { GET as googleSignIn } from "./(site)/login/google/route";
import { Navigation } from "@/components/sections/Navigation";

const props = { params: Promise.resolve({}), searchParams: Promise.resolve({}) };

describe("with accounts switched off", () => {
  it("has no Log in link in the navigation", () => {
    render(<Navigation />);

    expect(screen.queryByRole("link", { name: "Log in", hidden: true })).not.toBeInTheDocument();
  });

  it.each([
    ["log in", () => LogInPage(props)],
    ["sign up", () => SignUpPage(props)],
    ["reset password", async () => ResetPasswordPage()],
    ["the account area", async () => AccountLayout({ children: null })],
  ])("shows not found for %s", async (_, page) => {
    await expect(page()).rejects.toThrow("NOT_FOUND");
  });

  it("refuses Google sign-in", async () => {
    const { NextRequest } = await import("next/server");
    const response = await googleSignIn(new NextRequest("http://localhost/login/google"));

    expect(response.status).toBe(404);
  });
});
