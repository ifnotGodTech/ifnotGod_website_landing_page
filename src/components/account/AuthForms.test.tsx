import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import type { AuthFormState } from "@/lib/accounts/formState";
import { LogInForm, ResetPasswordForm, SignUpForm } from "./AuthForms";

const returning = (state: Partial<AuthFormState>) =>
  vi.fn(async () => ({ status: "error", fieldErrors: {}, formError: null, values: {}, ...state }) as AuthFormState);

describe("log in form", () => {
  it("offers Google first, carrying where to go next", () => {
    render(<LogInForm action={returning({})} next="/account/services" />);

    expect(screen.getByRole("link", { name: "Continue with Google" })).toHaveAttribute(
      "href",
      "/login/google?next=%2Faccount%2Fservices"
    );
  });

  it("sends the email, password and destination", async () => {
    const action = returning({});
    const user = userEvent.setup();
    render(<LogInForm action={action} next="/account" />);

    await user.type(screen.getByLabelText("Email"), "ada@example.com");
    await user.type(screen.getByLabelText("Password"), "secret");
    await user.click(screen.getByRole("button", { name: "Log in" }));

    const sent = (action.mock.calls[0] as unknown as [AuthFormState, FormData])[1];
    expect(Object.fromEntries(sent)).toEqual({ email: "ada@example.com", password: "secret", next: "/account" });
  });

  it("shows field errors, keeps the email, and clears the password", async () => {
    const user = userEvent.setup();
    render(
      <LogInForm
        action={returning({ fieldErrors: { password: "Enter your password." }, values: { email: "ada@example.com" } })}
        next="/account"
      />
    );

    await user.type(screen.getByLabelText("Password"), "secret");
    await user.click(screen.getByRole("button", { name: "Log in" }));

    expect(await screen.findByText("Enter your password.")).toBeInTheDocument();
    expect(screen.getByLabelText("Email")).toHaveValue("ada@example.com");
    expect(screen.getByLabelText("Password")).toHaveValue("");
    expect(screen.getByLabelText("Password")).toHaveAttribute("aria-invalid", "true");
  });

  it("shows the backend's message", async () => {
    const user = userEvent.setup();
    render(<LogInForm action={returning({ formError: "That email and password don't match." })} next="/account" />);

    await user.click(screen.getByRole("button", { name: "Log in" }));

    expect(await screen.findByRole("status")).toHaveTextContent("That email and password don't match.");
  });

  it("links to resetting a password", () => {
    render(<LogInForm action={returning({})} next="/account" />);

    expect(screen.getByRole("link", { name: "Forgot password?" })).toHaveAttribute("href", "/reset-password");
  });
});

describe("sign up form", () => {
  it("describes the password rule and links to the Terms and Privacy Policy", () => {
    render(<SignUpForm action={returning({})} next="/account" />);

    expect(screen.getByLabelText("Password")).toHaveAccessibleDescription("At least 10 characters.");
    expect(screen.getByRole("link", { name: "Terms" })).toHaveAttribute("href", "/terms");
    expect(screen.getByRole("link", { name: "Privacy Policy" })).toHaveAttribute("href", "/privacy-policy");
  });

  it("offers autofill for every field", () => {
    render(<SignUpForm action={returning({})} next="/account" />);

    expect(screen.getByLabelText("Full name")).toHaveAttribute("autocomplete", "name");
    expect(screen.getByLabelText("Email")).toHaveAttribute("autocomplete", "email");
    expect(screen.getByLabelText("Password")).toHaveAttribute("autocomplete", "new-password");
  });
});

describe("reset password form", () => {
  it("confirms without saying whether the account exists", async () => {
    const user = userEvent.setup();
    render(<ResetPasswordForm action={returning({ status: "success", values: { email: "ada@example.com" } })} />);

    await user.type(screen.getByLabelText("Email"), "ada@example.com");
    await user.click(screen.getByRole("button", { name: "Send reset link" }));

    expect(await screen.findByRole("heading", { name: "Check your email" })).toBeInTheDocument();
    expect(screen.getByText(/If there's an account for ada@example.com/)).toBeInTheDocument();
  });
});
