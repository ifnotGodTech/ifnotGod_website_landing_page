import { describe, expect, it, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Contact } from "./Contact";

describe("Contact form", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn());
  });

  it("shows validation errors and keeps input when required fields are missing", async () => {
    const user = userEvent.setup();
    render(<Contact />);

    await user.click(screen.getByRole("button", { name: /send my challenge/i }));

    expect(await screen.findByText(/enter your full name/i)).toBeInTheDocument();
    expect(fetch).not.toHaveBeenCalled();
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
