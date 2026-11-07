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
  it.each(["Enquiries and services", "Plans and prices", "Acceptable use", "Availability and liability", "Governing law"])(
    "covers %s",
    (heading) => {
      render(<TermsPage />);

      expect(screen.getByRole("heading", { level: 2, name: heading })).toBeInTheDocument();
    }
  );

  it("says booking an audit doesn't commit anyone to a plan, and the written agreement comes first", () => {
    render(<TermsPage />);

    expect(screen.getByText(/booking a free audit doesn't create a contract or commit you to a plan/)).toBeInTheDocument();
    expect(screen.getByText(/that written agreement takes priority over anything on this website/)).toBeInTheDocument();
    expect(screen.getByText(/renew each month until you cancel/)).toBeInTheDocument();
    expect(screen.getByText(/you keep everything in your plan until the end of the month you've paid for, and it won't renew after that/)).toBeInTheDocument();
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
