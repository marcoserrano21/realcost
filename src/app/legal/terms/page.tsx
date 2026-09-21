import type { Metadata } from "next";
import LegalShell from "@/components/LegalShell";

export const metadata: Metadata = {
  title: "Terms of Use | RealCost",
  description: "Terms of Use governing your use of the RealCost web application.",
};

export default function TermsPage() {
  return (
    <LegalShell title="Terms of Use">
      <p className="legal-meta">Effective date: September 18, 2026 · Last updated: September 18, 2026</p>

      <h2>1. Agreement to these Terms</h2>
      <p>
        These Terms of Use (&quot;Terms&quot;) form a binding agreement between you and the operators of RealCost
        (&quot;RealCost,&quot; &quot;we,&quot; &quot;us,&quot; or &quot;our&quot;) regarding your access to and use of the RealCost website and
        related features (collectively, the &quot;App&quot;). By accessing or using the App, you confirm that you have
        read, understood, and agree to these Terms and to our Privacy Notice. If you do not agree, do not use the App.
      </p>
      <p>
        If you use the App on behalf of an organization, you represent that you have authority to bind that
        organization to these Terms.
      </p>

      <h2>2. Eligibility</h2>
      <p>
        You must be at least 16 years old (or the age of digital consent in your jurisdiction, if higher) to use the
        App. The App is intended for personal, non-commercial reflection and conversation about spending. You are
        responsible for complying with laws that apply to you.
      </p>

      <h2>3. What RealCost provides</h2>
      <p>
        RealCost is a privacy-first calculator that estimates how long you would need to work to afford a price, based
        on a take-home hourly rate and reference units you enter on your device. Features may include decision logging,
        sharing comparison links, theme and motion preferences, and local history. Features may change as we improve
        the product.
      </p>

      <h2>4. Not professional advice</h2>
      <p>
        RealCost is for education, reflection, and conversation only. It is not financial, tax, legal, investment,
        accounting, employment, wage, or benefits advice. Outputs are estimates based on inputs you control and may be
        incomplete or inaccurate. Do not rely on RealCost as the sole basis for purchase, budget, employment, or legal
        decisions. Consult qualified professionals when needed.
      </p>

      <h2>5. Your account and local data</h2>
      <p>
        The current App does not require creating an account and does not process payments or store your wage on our
        servers as part of the core local-first design. Information you enter is primarily stored in your browser on
        your device. You are responsible for securing that device and for any consequences of sharing screenshots or
        links that reveal information you prefer to keep private.
      </p>

      <h2>6. Your responsibilities</h2>
      <ul>
        <li>Provide inputs you are comfortable storing on this device.</li>
        <li>Do not use RealCost to harass, shame, coerce, discriminate against, or exploit others.</li>
        <li>Do not attempt to reverse-engineer another person&apos;s income from shared links or screenshots.</li>
        <li>Do not misrepresent RealCost as a bank, payroll, credit, or government service.</li>
        <li>Do not interfere with the App&apos;s security, availability, or integrity (including abusive scraping or attacks).</li>
        <li>Comply with export, sanctions, and other applicable laws.</li>
      </ul>

      <h2>7. Acceptable use</h2>
      <p>
        We may suspend or limit access if we reasonably believe you are misusing the App, violating these Terms, or
        creating risk for others. You may not reverse engineer the App except where mandatory law allows, or use the
        App to build a competing service by systematically copying its content or non-public interfaces.
      </p>

      <h2>8. Intellectual property</h2>
      <p>
        The App, including its branding, design, copy, and software, is owned by RealCost or its licensors and is
        protected by intellectual property laws. You receive a limited, revocable, non-exclusive, non-transferable
        license to use the App for personal purposes under these Terms. You retain rights to content you enter; you
        grant us a limited license only as needed to operate features you choose to use (for example, delivering a
        share link you generate).
      </p>

      <h2>9. Third-party services and links</h2>
      <p>
        The App may rely on hosting, analytics sinks, or other infrastructure providers. Those parties have their own
        terms. We are not responsible for third-party sites or services you reach through links outside RealCost.
      </p>

      <h2>10. Disclaimers</h2>
      <p>
        TO THE MAXIMUM EXTENT PERMITTED BY LAW, THE APP IS PROVIDED &quot;AS IS&quot; AND &quot;AS AVAILABLE,&quot; WITHOUT WARRANTIES OF
        ANY KIND, WHETHER EXPRESS, IMPLIED, OR STATUTORY, INCLUDING IMPLIED WARRANTIES OF MERCHANTABILITY, FITNESS FOR A
        PARTICULAR PURPOSE, TITLE, AND NON-INFRINGEMENT. We do not warrant that the App will be uninterrupted, secure,
        or error-free, or that calculations will meet your expectations.
      </p>

      <h2>11. Limitation of liability</h2>
      <p>
        TO THE MAXIMUM EXTENT PERMITTED BY LAW, REALCOST AND ITS OPERATORS WILL NOT BE LIABLE FOR INDIRECT, INCIDENTAL,
        SPECIAL, CONSEQUENTIAL, EXEMPLARY, OR PUNITIVE DAMAGES, OR FOR LOST PROFITS, DATA, OR GOODWILL, ARISING FROM YOUR
        USE OF THE APP, EVEN IF ADVISED OF THE POSSIBILITY. OUR TOTAL LIABILITY FOR ANY CLAIM RELATED TO THE APP WILL NOT
        EXCEED THE GREATER OF (A) THE AMOUNT YOU PAID US FOR THE APP IN THE TWELVE MONTHS BEFORE THE CLAIM OR (B) USD
        $50. Some jurisdictions do not allow certain limitations; in those cases, our liability is limited to the
        fullest extent allowed.
      </p>

      <h2>12. Indemnity</h2>
      <p>
        You agree to defend and indemnify RealCost and its operators against claims, damages, and expenses (including
        reasonable attorneys&apos; fees) arising from your misuse of the App, your violation of these Terms, or your
        sharing of content that harms others.
      </p>

      <h2>13. Privacy</h2>
      <p>
        Our collection and use of information is described in the Privacy Notice. By using the App, you acknowledge that
        notice.
      </p>

      <h2>14. Changes to the App or Terms</h2>
      <p>
        We may update the App and these Terms. We will update the &quot;Last updated&quot; date above. Material changes may be
        highlighted in the App when practical. Continued use after changes become effective constitutes acceptance. If
        you disagree, stop using the App and clear local data.
      </p>

      <h2>15. Termination</h2>
      <p>
        You may stop using the App at any time and delete local data via Settings or your browser. We may discontinue
        the App or restrict access where required by law or for safety, abuse, or operational reasons.
      </p>

      <h2>16. Governing law and disputes</h2>
      <p>
        These Terms are governed by the laws applicable in the jurisdiction where the RealCost operators primarily
        control the service, without regard to conflict-of-law rules, except where mandatory consumer protections in
        your country require otherwise. Courts in that jurisdiction will have exclusive venue for disputes, subject to
        those mandatory rights. You and RealCost waive class actions to the extent permitted by law.
      </p>

      <h2>17. Severability and entire agreement</h2>
      <p>
        If a provision is unenforceable, the rest remains in effect. These Terms and the Privacy Notice are the entire
        agreement regarding the App and supersede prior discussions on that subject.
      </p>

      <h2>18. Contact</h2>
      <p>
        Questions about these Terms: use the contact method published with the App deployment or the project
        repository maintainers for this RealCost instance. Do not send sensitive wage data by email unless you
        intentionally choose to.
      </p>
    </LegalShell>
  );
}
