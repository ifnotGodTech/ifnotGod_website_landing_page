import type { Metadata } from "next";
import Link from "next/link";
import { LegalPage, LegalSection } from "@/components/legal/LegalPage";
import { CONTACT_INFO, LEGAL_INFO } from "@/shared/constants";

export const metadata: Metadata = {
  title: "Privacy Policy | IFNOTGOD TECH LTD",
  description:
    "How IFNOTGOD TECH LTD collects, uses and protects personal data, and your rights under the Nigeria Data Protection Act 2023.",
  alternates: { canonical: "/privacy-policy" },
};

export default function PrivacyPolicyPage() {
  const email = <a href={`mailto:${CONTACT_INFO.email}`}>{CONTACT_INFO.email}</a>;

  return (
    <LegalPage
      title="Privacy Policy"
      intro={
        <p>
          This policy explains what personal data {LEGAL_INFO.companyName} collects through this website, why we
          collect it, who receives it and the rights you have under the Nigeria Data Protection Act 2023.
        </p>
      }
    >
      <LegalSection title="Who we are">
        <p>
          {LEGAL_INFO.companyName} (&quot;we&quot;, &quot;us&quot;) is the data controller for the personal data
          described in this policy. Company registration number: {LEGAL_INFO.registrationNumber}.
        </p>
        <ul>
          <li>
            <strong>Place of business:</strong> {LEGAL_INFO.registeredAddress}
          </li>
          <li>
            <strong>Email:</strong> {email}
          </li>
          <li>
            <strong>Phone and WhatsApp:</strong> <a href={CONTACT_INFO.phoneHref}>{CONTACT_INFO.phoneDisplay}</a>
          </li>
        </ul>
      </LegalSection>

      <LegalSection title="The personal data we collect">
        <ul>
          <li>
            <strong>What you send through our contact form:</strong> your full name, email address, your challenge and
            what you would like technology to help you achieve. Your organisation and phone or WhatsApp number are
            optional.
          </li>
          <li>
            <strong>What you send us directly:</strong> anything you include when you email, call or message us on
            WhatsApp.
          </li>
          <li>
            <strong>Technical data:</strong> your IP address, browser details and the time of your visit, which are
            recorded by our hosting provider when you use the website. We also use your IP address to limit repeated
            form submissions.
          </li>
        </ul>
        <p>
          Please do not include sensitive information in your message, such as health details, financial account
          details or information about children. We don&apos;t need it to respond to you.
        </p>
      </LegalSection>

      <LegalSection title="Why we use it, and our lawful basis">
        <ul>
          <li>
            <strong>To respond to your enquiry and discuss how we might help.</strong> This is necessary to take steps
            you have asked for before a possible contract (section 25(1)(b)(i) of the Act). Where it isn&apos;t, we rely
            on our legitimate interest in responding to people who contact us (section 25(1)(b)(v)).
          </li>
          <li>
            <strong>To keep the website secure and protect the form from spam and abuse.</strong> We rely on our
            legitimate interest in operating a safe website (section 25(1)(b)(v)).
          </li>
          <li>
            <strong>To meet our legal obligations and keep required records.</strong> This is necessary to comply with
            the law (section 25(1)(b)(ii)).
          </li>
        </ul>
        <p>
          We don&apos;t use your enquiry for marketing. We would ask for your consent first, and you could withdraw it
          at any time.
        </p>
      </LegalSection>

      <LegalSection title="How we process your data">
        <p>
          Your form details are checked by our website, sent to us as an email and read by our team. We don&apos;t make
          decisions about you based solely on automated processing, and we don&apos;t use profiling.
        </p>
      </LegalSection>

      <LegalSection title="Who receives your data">
        <p>We don&apos;t sell your personal data. These recipients have access only for the purposes described:</p>
        <ul>
          <li>
            <strong>Vercel</strong> hosts this website and processes technical data and form submissions.
          </li>
          <li>
            <strong>Brevo</strong> delivers form submissions to us by email.
          </li>
          <li>
            <strong>Google</strong> provides the email inbox where we receive and answer enquiries.
          </li>
          <li>
            <strong>WhatsApp (Meta)</strong> processes your messages if you choose to contact us on WhatsApp, under
            its own privacy policy.
          </li>
          <li>
            <strong>Professional advisers and authorities</strong>, such as lawyers and accountants, or regulators and
            courts, where necessary or required by law.
          </li>
        </ul>
      </LegalSection>

      <LegalSection title="Transfers outside Nigeria">
        <p>
          Our service providers may process your data outside Nigeria, including in the United States and the European
          Union. Where a transfer takes place, we rely on protections that give an adequate level of protection under
          section 41 of the Act, such as contractual clauses. Where those don&apos;t apply, we rely on a condition in
          section 43, such as the transfer being necessary to take steps you have requested before a contract.
        </p>
      </LegalSection>

      <LegalSection title="How long we keep your data">
        <ul>
          <li>
            <strong>Enquiries:</strong> up to 24 months after our last contact with you, unless we enter into a
            contract.
          </li>
          <li>
            <strong>Client records:</strong> for the length of our contract and any further period the law requires.
          </li>
          <li>
            <strong>Technical data:</strong> for the limited period set by our hosting and email providers. IP addresses
            used to limit form submissions are held temporarily in memory and are not stored permanently.
          </li>
        </ul>
        <p>We delete data earlier when we no longer need it and have no other lawful basis to keep it.</p>
      </LegalSection>

      <LegalSection title="Your rights">
        <p>Under the Act, you have the right to:</p>
        <ul>
          <li>ask whether we hold your personal data, and receive details of how we use it;</li>
          <li>receive a copy of your data in a commonly used electronic format;</li>
          <li>have inaccurate, out-of-date, incomplete or misleading data corrected or deleted;</li>
          <li>have your data erased;</li>
          <li>have processing restricted in certain circumstances;</li>
          <li>object to processing, including processing for direct marketing;</li>
          <li>withdraw consent at any time, where we rely on it, without affecting earlier processing;</li>
          <li>not be subject to decisions based solely on automated processing that significantly affect you; and</li>
          <li>receive or transfer your data to another organisation, as data portability rules provide.</li>
        </ul>
        <p>
          To use any of these rights, email {email}. We will respond without unreasonable delay, and we may need to
          confirm your identity first.
        </p>
      </LegalSection>

      <LegalSection title="Complaints">
        <p>
          If you are concerned about how we have handled your data, please contact us first at {email} so we can try to
          put it right.
        </p>
        <p>
          You also have the right to lodge a complaint with the Nigeria Data Protection Commission at any time. You
          don&apos;t have to contact us first. Visit{" "}
          <a href="https://ndpc.gov.ng" target="_blank" rel="noopener noreferrer">
            ndpc.gov.ng
          </a>{" "}
          for details.
        </p>
      </LegalSection>

      <LegalSection title="Cookies and tracking">
        <p>
          This website doesn&apos;t use cookies, analytics, advertising trackers or similar tools. If that changes, we
          will update this policy and ask for your consent where the law requires it.
        </p>
      </LegalSection>

      <LegalSection title="Security">
        <p>
          We use appropriate technical and organisational measures to protect personal data, including encrypted
          connections and access limited to those who need it. No system is completely secure. If a breach is likely to
          put your rights at high risk, we will tell you promptly, and we will notify the Commission as the law requires.
        </p>
      </LegalSection>

      <LegalSection title="Children">
        <p>
          This website is for businesses and organisations and is not directed at children. If you believe a child has
          sent us personal data, please contact us so we can delete it.
        </p>
      </LegalSection>

      <LegalSection title="Changes to this policy">
        <p>
          We may update this policy from time to time. We will post the new version here and change the date at the top
          of the page. Our <Link href="/terms">Terms of Use</Link> also apply when you use this website.
        </p>
      </LegalSection>
    </LegalPage>
  );
}
