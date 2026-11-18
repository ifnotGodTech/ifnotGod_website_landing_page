import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { CONTACT_INFO, LEGAL_INFO } from "@/shared/constants";
import PrivacyPolicyPage, { metadata as privacyMetadata } from "./privacy-policy/page";
import TermsPage, { metadata as termsMetadata } from "./terms/page";

describe("Privacy Policy", () => {
  // Each entry is something section 27(1) of the Nigeria Data Protection Act,
  // or Article 27(3) of the GAID, requires the policy to tell people.
  it.each([
    ["the controller's identity", "Who we are"],
    ["the personal data collected", "The personal data we collect"],
    ["the lawful basis and purposes", "Why we use it, and our lawful basis"],
    ["the means of processing and automated decisions", "How we process your data"],
    ["the recipients", "Who receives your data"],
    ["cross-border transfers", "Transfers outside Nigeria"],
    ["the retention period", "How long we keep your data"],
    ["the data subject's rights", "Your rights"],
    ["the right to complain", "Complaints"],
    ["cookies", "Cookies and tracking"],
  ])("covers %s", (_, heading) => {
    render(<PrivacyPolicyPage />);

    expect(screen.getByRole("heading", { level: 2, name: heading })).toBeInTheDocument();
  });

  it("lists each cookie the sign-in sets", () => {
    render(<PrivacyPolicyPage />);

    for (const cookie of ["ifng_session", "ifng_signed_in", "ifng_google"]) {
      expect(screen.getByText(cookie)).toBeInTheDocument();
    }
    expect(screen.getByText(/We don't use analytics, advertising trackers/)).toBeInTheDocument();
  });

  it("names the payment provider and says card numbers are never stored", () => {
    render(<PrivacyPolicyPage />);

    expect(screen.getByText(/We never receive or store your full card number or security code/)).toBeInTheDocument();
    expect(screen.getByText("Flutterwave")).toBeInTheDocument();
  });

  it("names the regulator and links to it", () => {
    render(<PrivacyPolicyPage />);

    expect(screen.getByText(/lodge a complaint with the Nigeria Data Protection Commission/i)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "ndpc.gov.ng" })).toHaveAttribute("href", "https://ndpc.gov.ng");
  });

  it("gives ways to contact the company", () => {
    render(<PrivacyPolicyPage />);

    expect(screen.getAllByRole("link", { name: CONTACT_INFO.email })[0]).toHaveAttribute(
      "href",
      `mailto:${CONTACT_INFO.email}`
    );
    expect(screen.getByRole("link", { name: CONTACT_INFO.phoneDisplay })).toHaveAttribute(
      "href",
      CONTACT_INFO.phoneHref
    );
  });

  it("has its own canonical URL", () => {
    expect(privacyMetadata.alternates?.canonical).toBe("/privacy-policy");
  });
});

describe("company details", () => {
  it.each([
    ["Privacy Policy", <PrivacyPolicyPage key="privacy" />],
    ["Terms of Use", <TermsPage key="terms" />],
  ])("%s shows the address and registration number, with no placeholders", (_, page) => {
    const { container } = render(page);

    expect(container).toHaveTextContent(LEGAL_INFO.registeredAddress);
    expect(container).toHaveTextContent(LEGAL_INFO.registrationNumber);
    expect(container).not.toHaveTextContent("[TO CONFIRM");
  });
});

describe("Terms of Use", () => {
  it.each([
    "Enquiries and services",
    "Your account",
    "Plans and prices",
    "Paying",
    "Renewals",
    "Changing your plan and services",
    "Cancelling and refunds",
    "Acceptable use",
    "Availability and liability",
    "Governing law",
  ])("covers %s", (heading) => {
    render(<TermsPage />);

    expect(screen.getByRole("heading", { level: 2, name: heading })).toBeInTheDocument();
  });

  it("says an audit commits no one, plans bought on the site follow these terms, and custom work has its own agreement", () => {
    render(<TermsPage />);

    expect(screen.getByText(/booking a free audit doesn't create a contract or commit you to a plan/)).toHaveTextContent(
      "A plan you subscribe to on this website is covered by these terms."
    );
    expect(screen.getByText(/Custom work, including Custom plans, is covered by a separate written agreement/)).toBeInTheDocument();
  });

  it("states the subscription rules the backend enforces", () => {
    render(<TermsPage />);

    expect(screen.getByText(/renew automatically at the end of each paid period until you cancel/)).toBeInTheDocument();
    expect(screen.getByText("We email you a reminder 3 days before each renewal, with the amount.")).toBeInTheDocument();
    expect(screen.getByText(/we try again up to 3 times, and your plan keeps working for 3 days meanwhile/)).toBeInTheDocument();
    expect(screen.getByText(/waived if you pay 6 or more months upfront, and never charged twice/)).toBeInTheDocument();
    expect(screen.getByText(/A change of plan starts at your next renewal/)).toBeInTheDocument();
    expect(screen.getByText(/payments aren't refundable/)).toHaveTextContent("Nigerian consumer law");
    expect(screen.getByText(/keeps working until the end of the period you've paid for, and it won't renew after that/)).toHaveTextContent(
      "You can undo the cancellation at any time until then."
    );
  });

  it("links to the Privacy Policy", () => {
    render(<TermsPage />);

    const links = screen.getAllByRole("link", { name: "Privacy Policy" });

    expect(links.length).toBeGreaterThan(0);
    links.forEach((link) => expect(link).toHaveAttribute("href", "/privacy-policy"));
  });

  it("has its own canonical URL", () => {
    expect(termsMetadata.alternates?.canonical).toBe("/terms");
  });
});
