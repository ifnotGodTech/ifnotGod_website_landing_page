import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

vi.mock("@/shared/features", () => ({ ACCOUNTS_ENABLED: true }));
vi.mock("next/navigation", () => ({ notFound: vi.fn(), usePathname: () => "/" }));
vi.mock("@/lib/accounts/actions", () => ({ setNewPasswordAction: vi.fn() }));

import SetPasswordPage, { metadata } from "./(site)/reset-password/new/page";

const props = (searchParams: Record<string, string>) => ({ params: Promise.resolve({}), searchParams: Promise.resolve(searchParams) });

describe("Set a new password", () => {
  it("asks for the new password, carrying the link's parts in the form", async () => {
    const { container } = render(await SetPasswordPage(props({ uid: "Nw", token: "abc-123" })));

    expect(screen.getByRole("heading", { level: 1, name: "Set a new password" })).toBeInTheDocument();
    expect(screen.getByLabelText("New password")).toHaveAttribute("autocomplete", "new-password");
    expect(container.querySelector('input[name="uid"]')).toHaveValue("Nw");
    expect(container.querySelector('input[name="token"]')).toHaveValue("abc-123");
    expect(screen.getByRole("link", { name: "Ask for a new link" })).toHaveAttribute("href", "/reset-password");
  });

  it("explains a link missing its parts, with a way to ask for a new one", async () => {
    render(await SetPasswordPage(props({ uid: "Nw" })));

    expect(screen.getByRole("heading", { level: 1, name: "This link isn't complete" })).toBeInTheDocument();
    expect(screen.queryByLabelText("New password")).not.toBeInTheDocument();
  });

  it("is kept out of search results and never passes its address to another site", () => {
    expect(metadata.referrer).toBe("no-referrer");
    expect(metadata.robots).toMatchObject({ index: false });
  });
});
