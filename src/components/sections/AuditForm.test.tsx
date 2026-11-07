import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { HONEYPOT_FIELD } from "@/shared/constants";
import { AuditForm, type AuditPlanOption } from "./AuditForm";

const PLANS: AuditPlanOption[] = [
  { id: "starter", name: "Starter" },
  { id: "growth", name: "Growth" },
  { id: "pro", name: "Pro" },
  { id: "custom", name: "Custom" },
];

const fetchMock = () => fetch as ReturnType<typeof vi.fn>;
const submitButton = () => screen.getByRole("button", { name: /book my free audit/i });
const sentBody = () => JSON.parse(fetchMock().mock.calls[0][1].body);

async function fillRequiredFields(user: ReturnType<typeof userEvent.setup>) {
  await user.type(screen.getByLabelText(/full name/i), "Ada Obi");
  await user.type(screen.getByLabelText(/^email$/i), "ada@obilogistics.com");
  await user.type(
    screen.getByLabelText(/what task or problem/i),
    "We confirm every delivery by phone, one at a time."
  );
}

describe("Audit form", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn());
  });

  it("shows validation errors and keeps input when required fields are missing", async () => {
    const user = userEvent.setup();
    render(<AuditForm plans={PLANS} />);

    await user.type(screen.getByLabelText(/^email$/i), "ada@obilogistics.com");
    await user.click(submitButton());

    expect(await screen.findByText(/enter your full name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^email$/i)).toHaveValue("ada@obilogistics.com");
    expect(fetch).not.toHaveBeenCalled();
  });

  it("sends the visitor's details and chosen plan, with the honeypot left empty", async () => {
    fetchMock().mockResolvedValueOnce({ ok: true, json: async () => ({ ok: true }) });
    const user = userEvent.setup();
    render(<AuditForm plans={PLANS} />);

    await fillRequiredFields(user);
    await user.selectOptions(screen.getByLabelText(/interested in a plan/i), "Pro");
    await user.click(submitButton());

    await screen.findByText(/we've got your request/i);
    expect(fetchMock().mock.calls[0][0]).toBe("/api/contact");
    expect(sentBody()).toMatchObject({
      fullName: "Ada Obi",
      email: "ada@obilogistics.com",
      plan: "pro",
      [HONEYPOT_FIELD]: "",
    });
  });

  it("sends no plan when the visitor isn't sure", async () => {
    fetchMock().mockResolvedValueOnce({ ok: true, json: async () => ({ ok: true }) });
    const user = userEvent.setup();
    render(<AuditForm plans={PLANS} />);

    await fillRequiredFields(user);
    await user.click(submitButton());

    await screen.findByText(/we've got your request/i);
    expect(sentBody()).not.toHaveProperty("plan");
  });

  it("offers every plan, with 'Not sure yet' first", () => {
    render(<AuditForm plans={PLANS} />);

    const options = screen.getAllByRole("option").map((option) => option.textContent);
    expect(options).toEqual(["Not sure yet", "Starter", "Growth", "Pro", "Custom"]);
    expect(screen.getByLabelText(/interested in a plan/i)).toHaveValue("");
  });

  it("preselects the plan the visitor came from", () => {
    render(<AuditForm plans={PLANS} defaultPlan="growth" />);

    expect(screen.getByLabelText(/interested in a plan/i)).toHaveValue("growth");
  });

  it("keeps input and offers WhatsApp when the network fails", async () => {
    fetchMock().mockRejectedValueOnce(new Error("offline"));
    const user = userEvent.setup();
    render(<AuditForm plans={PLANS} defaultPlan="pro" />);

    await fillRequiredFields(user);
    await user.click(submitButton());

    expect(await screen.findByText(/check your connection/i)).toHaveTextContent(/whatsapp/i);
    expect(screen.getByLabelText(/full name/i)).toHaveValue("Ada Obi");
    expect(screen.getByLabelText(/interested in a plan/i)).toHaveValue("pro");
  });

  it("shows a server error and retains the entered values", async () => {
    fetchMock().mockResolvedValueOnce({
      ok: false,
      json: async () => ({ ok: false, error: "Something went wrong sending your message. Please try again." }),
    });
    const user = userEvent.setup();
    render(<AuditForm plans={PLANS} />);

    await fillRequiredFields(user);
    await user.click(submitButton());

    await waitFor(() => expect(screen.getByText(/something went wrong sending your message/i)).toBeInTheDocument());
    expect(screen.getByLabelText(/full name/i)).toHaveValue("Ada Obi");
  });

  it("shows server field errors without a generic failure message", async () => {
    fetchMock().mockResolvedValueOnce({
      ok: false,
      json: async () => ({ ok: false, errors: { email: "Enter a valid email address." } }),
    });
    const user = userEvent.setup();
    render(<AuditForm plans={PLANS} />);

    await fillRequiredFields(user);
    await user.click(submitButton());

    expect(await screen.findByText(/enter a valid email address/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^email$/i)).toHaveFocus();
    expect(screen.queryByText(/something went wrong/i)).not.toBeInTheDocument();
  });

  it("disables the button while sending, then clears the form on success", async () => {
    let finish: (value: unknown) => void = () => {};
    fetchMock().mockReturnValueOnce(new Promise((resolve) => (finish = resolve)));
    const user = userEvent.setup();
    render(<AuditForm plans={PLANS} />);

    await fillRequiredFields(user);
    await user.click(submitButton());

    expect(screen.getByRole("button", { name: "Sending…" })).toBeDisabled();

    finish({ ok: true, json: async () => ({ ok: true }) });

    expect(await screen.findByText(/we've got your request/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/full name/i)).toHaveValue("");
  });

  it("marks invalid fields, links their errors, and focuses the first one", async () => {
    const user = userEvent.setup();
    render(<AuditForm plans={PLANS} />);

    await user.type(screen.getByLabelText(/^email$/i), "not-an-email");
    await user.click(submitButton());

    const fullName = screen.getByLabelText(/full name/i);
    expect(await screen.findByText(/enter your full name/i)).toHaveAttribute("id", "fullName-error");
    expect(fullName).toHaveAttribute("aria-invalid", "true");
    expect(fullName).toHaveAttribute("aria-describedby", "fullName-error");
    expect(fullName).toHaveFocus();
    expect(screen.getByLabelText(/^email$/i)).toHaveAttribute("aria-invalid", "true");
    expect(screen.getByLabelText(/business or brand/i)).not.toHaveAttribute("aria-invalid");
  });

  it("keeps the honeypot out of the tab order and away from assistive tech", () => {
    const { container } = render(<AuditForm plans={PLANS} />);
    const honeypot = container.querySelector(`input[name="${HONEYPOT_FIELD}"]`) as HTMLInputElement;

    expect(honeypot).toHaveAttribute("tabindex", "-1");
    expect(honeypot.closest("[aria-hidden]")).not.toBeNull();
  });

  it("offers autofill and labels optional fields", () => {
    render(<AuditForm plans={PLANS} />);

    expect(screen.getByLabelText(/full name/i)).toHaveAttribute("autocomplete", "name");
    expect(screen.getByLabelText(/business or brand name \(optional\)/i)).toHaveAttribute("autocomplete", "organization");
    expect(screen.getByLabelText(/^email$/i)).toHaveAttribute("autocomplete", "email");
    expect(screen.getByLabelText(/phone or whatsapp \(optional\)/i)).toHaveAttribute("autocomplete", "tel");
  });

  it("is named for assistive tech, and links to the Privacy Policy", () => {
    render(<AuditForm plans={PLANS} />);

    expect(screen.getByRole("form", { name: "Book your free audit" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Privacy Policy" })).toHaveAttribute("href", "/privacy-policy");
  });
});
