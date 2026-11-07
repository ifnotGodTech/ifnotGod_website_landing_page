import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const brevo = vi.hoisted(() => ({
  apiKey: "test-key" as string | undefined,
  senderEmail: "sender@example.com",
  senderName: "Sender",
  recipientEmail: "leads@example.com",
}));

vi.mock("@/lib/config", () => ({ config: { brevo } }));

import { EmailDeliveryError, EmailNotConfiguredError, sendContactNotification } from "./email";

const submission = {
  fullName: "Ada Obi",
  organisation: "Obi Logistics",
  email: "ada@obilogistics.com",
  phone: "+2348012345678",
  challenge: "Line one\nLine two",
};

describe("sendContactNotification", () => {
  const fetchMock = vi.fn();
  const sentBody = () => JSON.parse(fetchMock.mock.calls[0][1].body);

  beforeEach(() => {
    brevo.apiKey = "test-key";
    fetchMock.mockReset();
    fetchMock.mockResolvedValue(new Response("{}", { status: 201 }));
    vi.stubGlobal("fetch", fetchMock);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it("sends the lead to the recipient, with replies going to the visitor", async () => {
    await sendContactNotification(submission);

    const [url, options] = fetchMock.mock.calls[0];
    expect(url).toBe("https://api.brevo.com/v3/smtp/email");
    expect(options.headers["api-key"]).toBe("test-key");
    expect(options.signal).toBeInstanceOf(AbortSignal);
    expect(sentBody()).toMatchObject({
      sender: { email: "sender@example.com", name: "Sender" },
      to: [{ email: "leads@example.com" }],
      replyTo: { email: "ada@obilogistics.com", name: "Ada Obi" },
      subject: "New audit request from Ada Obi (Obi Logistics)",
    });
  });

  it("keeps line breaks and shows a dash for empty optional fields", async () => {
    await sendContactNotification({ ...submission, phone: "" });

    expect(sentBody().htmlContent).toContain("Line one<br/>Line two");
    expect(sentBody().htmlContent).toContain("<td>—</td>");
  });

  it("names the plan the visitor chose", async () => {
    await sendContactNotification({ ...submission, plan: "growth" });

    expect(sentBody().htmlContent).toContain("<td><strong>Interested in</strong></td><td>Growth</td>");
  });

  it("says when the visitor isn't sure about a plan", async () => {
    await sendContactNotification(submission);

    expect(sentBody().htmlContent).toContain("<td><strong>Interested in</strong></td><td>Not sure yet</td>");
  });

  it("escapes HTML in visitor input", async () => {
    await sendContactNotification({ ...submission, challenge: '<script>alert("x")</script> & more' });

    const html = sentBody().htmlContent;
    expect(html).not.toContain("<script>");
    expect(html).toContain("&lt;script&gt;alert(&quot;x&quot;)&lt;/script&gt; &amp; more");
  });

  it("keeps the subject on one line", async () => {
    await sendContactNotification({ ...submission, fullName: "Ada\r\nObi", organisation: "" });

    expect(sentBody().subject).toBe("New audit request from Ada Obi");
  });

  it("throws EmailNotConfiguredError without calling Brevo when the key is missing", async () => {
    brevo.apiKey = undefined;
    vi.spyOn(console, "error").mockImplementation(() => {});

    await expect(sendContactNotification(submission)).rejects.toBeInstanceOf(EmailNotConfiguredError);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("throws EmailDeliveryError when Brevo rejects the request", async () => {
    fetchMock.mockResolvedValueOnce(new Response("bad sender", { status: 400 }));

    await expect(sendContactNotification(submission)).rejects.toBeInstanceOf(EmailDeliveryError);
  });

  it("throws EmailDeliveryError when the request fails or times out", async () => {
    const timeout = new DOMException("Timed out", "TimeoutError");
    fetchMock.mockRejectedValueOnce(timeout);

    await expect(sendContactNotification(submission)).rejects.toMatchObject({
      name: "EmailDeliveryError",
      cause: timeout,
    });
  });
});
