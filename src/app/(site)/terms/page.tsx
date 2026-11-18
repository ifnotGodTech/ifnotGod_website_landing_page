import { buildPageMetadata } from "@/shared/metadata";
import Link from "next/link";
import { LegalPage, LegalSection } from "@/components/legal/LegalPage";
import { CONTACT_INFO, LEGAL_INFO } from "@/shared/constants";

export const metadata = buildPageMetadata({
  title: "Terms of Use | IFNOTGOD TECH LTD",
  description:
    "The terms that apply when you use the IFNOTGOD TECH LTD website, open an account or subscribe to a plan.",
  path: "/terms",
});

export default function TermsPage() {
  return (
    <LegalPage
      title="Terms of Use"
      intro={
        <p>
          These terms apply when you use this website, which is operated by {LEGAL_INFO.companyName}, and when you open
          an account or subscribe to a plan on it. By using the website, you agree to them. If you don&apos;t agree,
          please don&apos;t use the website.
        </p>
      }
    >
      <LegalSection title="About us">
        <p>
          {LEGAL_INFO.companyName}, company registration number {LEGAL_INFO.registrationNumber}, has its place of
          business at{" "}
          {LEGAL_INFO.registeredAddress}. You can reach us at{" "}
          <a href={`mailto:${CONTACT_INFO.email}`}>{CONTACT_INFO.email}</a>.
        </p>
      </LegalSection>

      <LegalSection title="Information on this website">
        <p>
          This website gives general information about our services. It isn&apos;t professional advice, and it
          isn&apos;t an offer to provide any service. We work to keep it accurate and up to date, but we can&apos;t
          promise that it always will be.
        </p>
      </LegalSection>

      <LegalSection title="Enquiries and services">
        <p>
          Sending us an enquiry or booking a free audit doesn&apos;t create a contract or commit you to a plan, and we
          aren&apos;t obliged to take on any project. A plan you subscribe to on this website is covered by these
          terms. Custom work, including Custom plans, is covered by a separate written agreement, which takes priority
          over these terms for that work.
        </p>
        <p>
          Please make sure what you send us is accurate, and that you are entitled to share it. Please don&apos;t send
          confidential information until we have agreed how it will be handled.
        </p>
      </LegalSection>

      <LegalSection title="Your account">
        <p>
          Keep your password safe, and tell us straight away if you think someone else has used your account. You are
          responsible for what is done through your account, unless it happened because of our failure.
        </p>
      </LegalSection>

      <LegalSection title="Plans and prices">
        <p>
          When you subscribe on this website, you agree to these terms for your plan, at the price shown when you pay.
          Prices are in Nigerian naira. We may change our plans, prices and offers, and offers such as promotions may be
          limited.
        </p>
        <p>
          A new price applies to new subscribers straight away. If you already subscribe, it applies from your next
          renewal, and your renewal reminder shows the new price.
        </p>
        <p>
          If we stop offering a service, clients who already have it keep it until we contact them and agree how to
          move them on.
        </p>
      </LegalSection>

      <LegalSection title="Paying">
        <ul>
          <li>
            You can pay monthly, for 6 months upfront, or for 12 months upfront. Paying 12 months upfront gives you 2
            months free.
          </li>
          <li>
            A one-off setup fee is charged on your first monthly subscription. It is waived if you pay 6 or more months
            upfront, and never charged twice.
          </li>
          <li>
            Payments are taken by Flutterwave. Your plan starts once Flutterwave confirms your payment to us.
          </li>
        </ul>
      </LegalSection>

      <LegalSection title="Renewals">
        <p>
          Plans have no minimum term. They renew automatically at the end of each paid period until you cancel.
        </p>
        <ul>
          <li>We email you a reminder 3 days before each renewal, with the amount.</li>
          <li>
            If you paid by card, we charge the same card at renewal. Your bank may ask you to confirm the payment, and if
            so, we email you a link to do it. If you paid another way, we email you a payment link.
          </li>
          <li>
            If a renewal payment doesn&apos;t go through, we try again up to 3 times, and your plan keeps working for 3
            days meanwhile. If it still hasn&apos;t been paid after that, your plan ends.
          </li>
        </ul>
      </LegalSection>

      <LegalSection title="Changing your plan and services">
        <ul>
          <li>
            A change of plan starts at your next renewal, at the new plan&apos;s price. Nothing is charged on the day.
          </li>
          <li>
            Your plan includes a set number of services from each group. Choosing them the first time is free. After
            that, each service you swap uses one of your plan&apos;s changes for the month, which reset each calendar
            month.
          </li>
          <li>
            Our team can make these changes for you when you ask. The same rules apply, and we email you to confirm.
          </li>
        </ul>
      </LegalSection>

      <LegalSection title="Cancelling and refunds">
        <p>
          If you cancel, everything in your plan, including your automations and website, keeps working until the end
          of the period you&apos;ve paid for, and it won&apos;t renew after that. You can undo the cancellation at any
          time until then. After that, your automations stop, because they run on our systems. The website we build for
          you is yours to keep.
        </p>
        <p>
          Plans are subscriptions, so payments aren&apos;t refundable, including for the rest of a paid period after
          you cancel. This doesn&apos;t affect any right you have under Nigerian consumer law.
        </p>
      </LegalSection>

      <LegalSection title="Acceptable use">
        <p>You agree not to:</p>
        <ul>
          <li>use the website in a way that breaks any law, or for anything fraudulent or harmful;</li>
          <li>try to gain unauthorised access to the website or the systems behind it, or disrupt them;</li>
          <li>send spam, malicious code or false information through our forms; or</li>
          <li>copy content from the website in bulk using automated tools, without our written permission.</li>
        </ul>
      </LegalSection>

      <LegalSection title="Intellectual property">
        <p>
          The content, branding, logo and design of this website belong to {LEGAL_INFO.companyName} or its licensors. You
          may view the website and share links to it. You may not otherwise copy, reuse or adapt its content without our
          written permission.
        </p>
      </LegalSection>

      <LegalSection title="Links to other websites">
        <p>
          This website links to other services, such as WhatsApp, LinkedIn, X and Instagram. We don&apos;t control them
          and aren&apos;t responsible for their content or privacy practices.
        </p>
      </LegalSection>

      <LegalSection title="Availability and liability">
        <p>
          We provide this website &quot;as is&quot; and can&apos;t guarantee that it will always be available or free
          from errors. To the extent the law allows, we aren&apos;t liable for loss or damage arising from your use of
          the website or your reliance on its content.
        </p>
        <p>
          Nothing in these terms limits or excludes any liability or any right that can&apos;t be limited or excluded
          under Nigerian law, including your rights under the Federal Competition and Consumer Protection Act 2018.
        </p>
      </LegalSection>

      <LegalSection title="Your personal data">
        <p>
          Our <Link href="/privacy-policy">Privacy Policy</Link> explains how we handle personal data and the rights you
          have.
        </p>
      </LegalSection>

      <LegalSection title="Changes to these terms">
        <p>
          We may update these terms from time to time. We will post the new version here and change the date at the top
          of the page. Your continued use of the website after that means the new terms apply.
        </p>
      </LegalSection>

      <LegalSection title="Governing law">
        <p>
          These terms are governed by the laws of the Federal Republic of Nigeria, and the courts of Nigeria have
          jurisdiction over any dispute relating to them.
        </p>
      </LegalSection>
    </LegalPage>
  );
}
