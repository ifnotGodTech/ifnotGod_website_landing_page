import { describe, expect, it, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { CONTACT_INFO, HONEYPOT_FIELD } from "@/shared/constants";
import { Contact } from "./Contact";

describe("Contact form", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn());
  });

  it("shows validation errors and keeps input when required fields are missing", async () => {
    const user = userEvent.setup();
    render(<Contact />);

    await user.type(screen.getByLabelText(/email address/i), "ada@obilogistics.com");
    await user.click(screen.getByRole("button", { name: /send my challenge/i }));

    expect(await screen.findByText(/enter your full name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/email address/i)).toHaveValue("ada@obilogistics.com");
    expect(fetch).not.toHaveBeenCalled();
  });

  it("sends the visitor's details, with the honeypot left empty", async () => {
    (fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ ok: true }),
    });

    const user = userEvent.setup();
    render(<Contact />);

    await user.type(screen.getByLabelText(/full name/i), "Ada Obi");
    await user.type(screen.getByLabelText(/email address/i), "ada@obilogistics.com");
    await user.type(
      screen.getByLabelText(/what challenge are you facing/i),
      "Our dispatch process is entirely manual and error-prone."
    );
    await user.click(screen.getByRole("button", { name: /send my challenge/i }));

    await screen.findByText(/we've received your challenge/i);
    const [url, options] = (fetch as ReturnType<typeof vi.fn>).mock.calls[0];
    expect(url).toBe("/api/contact");
    expect(JSON.parse(options.body)).toMatchObject({
      fullName: "Ada Obi",
      email: "ada@obilogistics.com",
      [HONEYPOT_FIELD]: "",
    });
  });

  it("keeps input and offers WhatsApp when the network fails", async () => {
    (fetch as ReturnType<typeof vi.fn>).mockRejectedValueOnce(new Error("offline"));

    const user = userEvent.setup();
    render(<Contact />);

    await user.type(screen.getByLabelText(/full name/i), "Ada Obi");
    await user.type(screen.getByLabelText(/email address/i), "ada@obilogistics.com");
    await user.type(
      screen.getByLabelText(/what challenge are you facing/i),
      "Our dispatch process is entirely manual and error-prone."
    );
    await user.click(screen.getByRole("button", { name: /send my challenge/i }));

    expect(await screen.findByText(/check your connection/i)).toHaveTextContent(/whatsapp/i);
    expect(screen.getByLabelText(/full name/i)).toHaveValue("Ada Obi");
  });

  it("keeps the honeypot out of the tab order and away from assistive tech", () => {
    const { container } = render(<Contact />);
    const honeypot = container.querySelector(`input[name="${HONEYPOT_FIELD}"]`) as HTMLInputElement;

    expect(honeypot).toHaveAttribute("tabindex", "-1");
    expect(honeypot.closest("[aria-hidden]")).not.toBeNull();
  });

  it("marks invalid fields, links their errors, and focuses the first one", async () => {
    const user = userEvent.setup();
    render(<Contact />);

    await user.type(screen.getByLabelText(/email address/i), "not-an-email");
    await user.click(screen.getByRole("button", { name: /send my challenge/i }));

    const fullName = screen.getByLabelText(/full name/i);
    expect(await screen.findByText(/enter your full name/i)).toHaveAttribute("id", "fullName-error");
    expect(fullName).toHaveAttribute("aria-invalid", "true");
    expect(fullName).toHaveAttribute("aria-describedby", "fullName-error");
    expect(fullName).toHaveFocus();
    expect(screen.getByLabelText(/email address/i)).toHaveAttribute("aria-invalid", "true");
    expect(screen.getByLabelText(/organisation/i)).not.toHaveAttribute("aria-invalid");
  });

  it("shows server field errors without a generic failure message", async () => {
    (fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: false,
      json: async () => ({ ok: false, errors: { email: "Enter a valid email address." } }),
    });

    const user = userEvent.setup();
    render(<Contact />);

    await user.type(screen.getByLabelText(/full name/i), "Ada Obi");
    await user.type(screen.getByLabelText(/email address/i), "ada@obilogistics.com");
    await user.type(
      screen.getByLabelText(/what challenge are you facing/i),
      "Our dispatch process is entirely manual and error-prone."
    );
    await user.click(screen.getByRole("button", { name: /send my challenge/i }));

    expect(await screen.findByText(/enter a valid email address/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/email address/i)).toHaveFocus();
    expect(screen.queryByText(/something went wrong/i)).not.toBeInTheDocument();
  });

  it("makes the email address a mail link", () => {
    render(<Contact />);

    expect(screen.getByRole("link", { name: CONTACT_INFO.email })).toHaveAttribute(
      "href",
      `mailto:${CONTACT_INFO.email}`
    );
  });

  it("makes the phone number a call link", () => {
    render(<Contact />);

    expect(screen.getByRole("link", { name: CONTACT_INFO.phoneDisplay })).toHaveAttribute(
      "href",
      "tel:+2348061464092"
    );
  });

  it("offers autofill and labels optional fields", () => {
    render(<Contact />);

    expect(screen.getByLabelText(/full name/i)).toHaveAttribute("autocomplete", "name");
    expect(screen.getByLabelText(/organisation \/ company \(optional\)/i)).toHaveAttribute(
      "autocomplete",
      "organization"
    );
    expect(screen.getByLabelText(/email address/i)).toHaveAttribute("autocomplete", "email");
    expect(screen.getByLabelText(/phone \/ whatsapp \(optional\)/i)).toHaveAttribute("autocomplete", "tel");
  });

  it("submits successfully and shows a success message", async () => {
    (fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ ok: true }),
    });

    const user = userEvent.setup();
    render(<Contact />);

    await user.type(screen.getByLabelText(/full name/i), "Ada Obi");
    await user.type(screen.getByLabelText(/email address/i), "ada@obilogistics.com");
    await user.type(
      screen.getByLabelText(/what challenge are you facing/i),
      "Our dispatch process is entirely manual and error-prone."
    );

    await user.click(screen.getByRole("button", { name: /send my challenge/i }));

    expect(await screen.findByText(/we've received your challenge/i)).toBeInTheDocument();
  });

  it("shows a server error and retains the entered values", async () => {
    (fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: false,
      json: async () => ({ ok: false, error: "Something went wrong sending your message. Please try again." }),
    });

    const user = userEvent.setup();
    render(<Contact />);

    const nameInput = screen.getByLabelText(/full name/i);
    await user.type(nameInput, "Ada Obi");
    await user.type(screen.getByLabelText(/email address/i), "ada@obilogistics.com");
    await user.type(
      screen.getByLabelText(/what challenge are you facing/i),
      "Our dispatch process is entirely manual and error-prone."
    );

    await user.click(screen.getByRole("button", { name: /send my challenge/i }));

    await waitFor(() => {
      expect(screen.getByText(/something went wrong sending your message/i)).toBeInTheDocument();
    });
    expect(nameInput).toHaveValue("Ada Obi");
  });
});
