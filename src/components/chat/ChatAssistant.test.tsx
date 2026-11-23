import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ChatAssistant } from "./ChatAssistant";

const json = (status: number, body: unknown) =>
  new Response(JSON.stringify(body), { status, headers: { "content-type": "application/json" } });

describe("ChatAssistant", () => {
  const fetchMock = vi.fn();

  beforeEach(() => {
    window.sessionStorage.clear();
    vi.stubGlobal("fetch", fetchMock);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    fetchMock.mockReset();
  });

  async function openChat() {
    const user = userEvent.setup();
    render(<ChatAssistant />);
    await user.click(screen.getByRole("button", { name: "Chat with our assistant" }));
    return user;
  }

  it("opens a branded window with a welcome, and closes with Escape", async () => {
    const user = await openChat();

    expect(screen.getByRole("dialog", { name: "Chat with the IFNOTGOD TECH assistant" })).toBeInTheDocument();
    expect(screen.getByText("IFNOTGOD TECH")).toBeInTheDocument();
    expect(screen.getByText(/AI assistant/)).toBeInTheDocument();
    expect(screen.getByText(/free 20-minute automation audit/)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Book a free audit" })).toHaveAttribute("href", "/audit");
    expect(screen.getByLabelText("Your message")).toHaveFocus();
    expect(screen.getByRole("button", { name: "Send" })).toBeDisabled();

    await user.keyboard("{Escape}");
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Chat with our assistant" })).toHaveFocus();
  });

  it("shows the visitor's message, a thinking state, then the reply", async () => {
    let answer!: (response: Response) => void;
    fetchMock.mockReturnValue(new Promise<Response>((resolve) => (answer = resolve)));
    const user = await openChat();

    await user.type(screen.getByLabelText("Your message"), "How much is Starter?{Enter}");

    expect(screen.getByText("How much is Starter?")).toBeInTheDocument();
    expect(screen.getByTestId("chat-thinking")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Sending…" })).toBeDisabled();
    expect(screen.getByLabelText("Your message")).toHaveValue("");

    answer(json(200, { ok: true, reply: "**Starter** is NGN 20,000 a month.\n- 1 automation" }));
    expect(await screen.findByText("Starter")).toContainHTML("strong");
    expect(screen.getByText("1 automation").closest("li")).not.toBeNull();
    expect(screen.queryByTestId("chat-thinking")).not.toBeInTheDocument();

    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe("/api/chat");
    expect(JSON.parse(init.body)).toMatchObject({ message: "How much is Starter?", sessionId: expect.any(String) });
  });

  it("keeps one conversation id per tab, and the messages, across reloads", async () => {
    fetchMock.mockResolvedValue(json(200, { ok: true, reply: "Hello!" }));
    const user = await openChat();
    await user.type(screen.getByLabelText("Your message"), "Hi{Enter}");
    await screen.findByText("Hello!");
    const firstId = JSON.parse(fetchMock.mock.calls[0][1].body).sessionId;

    const { unmount } = render(<></>);
    unmount();
    document.body.innerHTML = "";
    const again = await openChat();
    expect(screen.getByText("Hello!")).toBeInTheDocument();

    await again.type(screen.getByLabelText("Your message"), "Thanks{Enter}");
    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(2));
    expect(JSON.parse(fetchMock.mock.calls[1][1].body).sessionId).toBe(firstId);
  });

  it("shows the error and gives the message back to retry", async () => {
    fetchMock.mockResolvedValueOnce(json(502, { ok: false, error: "The assistant isn't available right now." }));
    const user = await openChat();

    await user.type(screen.getByLabelText("Your message"), "Hello?{Enter}");

    expect(await screen.findByRole("alert")).toHaveTextContent("The assistant isn't available right now.");
    expect(screen.getByLabelText("Your message")).toHaveValue("Hello?");

    fetchMock.mockResolvedValueOnce(json(200, { ok: true, reply: "Back now." }));
    await user.click(screen.getByRole("button", { name: "Send" }));
    expect(await screen.findByText("Back now.")).toBeInTheDocument();
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
    expect(screen.getAllByText("Hello?")).toHaveLength(1);
  });

  it("says so when the connection fails", async () => {
    fetchMock.mockRejectedValue(new TypeError("Failed to fetch"));
    const user = await openChat();

    await user.type(screen.getByLabelText("Your message"), "Hi{Enter}");
    expect(await screen.findByRole("alert")).toHaveTextContent("We couldn't reach the assistant");
  });

  it("starts a new conversation on request", async () => {
    fetchMock.mockResolvedValue(json(200, { ok: true, reply: "Hello!" }));
    const user = await openChat();
    await user.type(screen.getByLabelText("Your message"), "Hi{Enter}");
    await screen.findByText("Hello!");
    const firstId = JSON.parse(fetchMock.mock.calls[0][1].body).sessionId;

    await user.click(screen.getByRole("button", { name: "Start over" }));
    expect(screen.queryByText("Hello!")).not.toBeInTheDocument();

    await user.type(screen.getByLabelText("Your message"), "Hi again{Enter}");
    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(2));
    expect(JSON.parse(fetchMock.mock.calls[1][1].body).sessionId).not.toBe(firstId);
  });
});
