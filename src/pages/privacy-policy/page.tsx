import PageLayout from '@/components/feature/PageLayout';
import { useSections } from '@/context/SectionsContext';

export default function PrivacyPolicy() {
  const { sections } = useSections();
  const s = sections.privacy_policy;

  return (
    <PageLayout>
      <div className="py-16 md:py-24 grain-overlay">
        <div className="relative z-10 max-w-4xl mx-auto px-4 md:px-8">
          <div className="text-center mb-12">
            <span className="text-accent-500 text-lg">✦</span>
            <h1 className="font-heading text-2xl md:text-3xl tracking-[0.2em] uppercase text-foreground-950 mt-3">
              Privacy Policy
            </h1>
          </div>

          {s.content ? (
            <div className="prose prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: s.content }} />
          ) : (
          <div className="space-y-8">
            <div className="space-y-6">
              <h2 className="font-heading text-sm tracking-[0.2em] uppercase text-foreground-950">
                Introduction
              </h2>
              <p className="font-body text-sm text-foreground-600 leading-relaxed">
                My Secret Vitality, LLC ("My Secret Vitality," "we," "us," or "our") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, store, and safeguard your personal information when you visit our website, create an account, or make purchases.
              </p>
              <p className="font-body text-sm text-foreground-600 leading-relaxed">
                By using the My Secret Vitality website, you consent to the practices described in this Privacy Policy. If you do not agree, please do not use the Site.
              </p>
            </div>

            <div className="accent-rule max-w-xs" />

            <div className="space-y-6">
              <h2 className="font-heading text-sm tracking-[0.2em] uppercase text-foreground-950">
                Information We Collect
              </h2>
              <p className="font-body text-sm text-foreground-600 leading-relaxed">
                We collect information that you provide directly to us, as well as data collected automatically through your use of the Site.
              </p>
              <p className="font-body text-sm text-foreground-600 leading-relaxed">
                <strong className="text-foreground-950">Information you provide:</strong> Name, email address, phone number, shipping address, billing address, institutional affiliation, payment information, and any communications you send us.
              </p>
              <p className="font-body text-sm text-foreground-600 leading-relaxed">
                <strong className="text-foreground-950">Automatically collected:</strong> IP address, browser type, device information, operating system, pages visited, time spent on pages, referral sources, and cookies. We use this data to improve Site functionality and user experience.
              </p>
            </div>

            <div className="accent-rule max-w-xs" />

            <div className="space-y-6">
              <h2 className="font-heading text-sm tracking-[0.2em] uppercase text-foreground-950">
                How We Use Your Information
              </h2>
              <p className="font-body text-sm text-foreground-600 leading-relaxed">
                We use the information we collect for the following purposes:
              </p>
              <ul className="space-y-2.5 ml-4">
                {[
                  'Processing and fulfilling orders, including shipping and delivery',
                  'Verifying age and research eligibility requirements',
                  'Communicating order status, shipping updates, and support inquiries',
                  'Providing customer support and responding to questions',
                  'Improving our products, services, and website experience',
                  'Sending promotional emails and newsletters (with your consent)',
                  'Detecting fraud, abuse, and unauthorized activity',
                  'Complying with legal obligations and regulatory requirements',
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-2.5">
                    <span className="w-4 h-4 flex items-center justify-center text-accent-500 mt-0.5 flex-shrink-0">
                      <i className="ri-checkbox-circle-line text-xs" />
                    </span>
                    <span className="font-body text-sm text-foreground-600">{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="accent-rule max-w-xs" />

            <div className="space-y-6">
              <h2 className="font-heading text-sm tracking-[0.2em] uppercase text-foreground-950">
                Data Sharing & Third Parties
              </h2>
              <p className="font-body text-sm text-foreground-600 leading-relaxed">
                We do not sell, trade, or rent your personal information to third parties. We may share information with trusted service providers who assist us in operating the Site, processing payments, fulfilling orders, or conducting business operations.
              </p>
              <p className="font-body text-sm text-foreground-600 leading-relaxed">
                These third parties are contractually obligated to maintain the confidentiality and security of your data and are prohibited from using it for any purpose other than providing services to My Secret Vitality.
              </p>
              <p className="font-body text-sm text-foreground-600 leading-relaxed">
                We may also disclose information when required by law, subpoena, or governmental request, or to protect our rights, property, or safety, or that of our users or the public.
              </p>
            </div>

            <div className="accent-rule max-w-xs" />

            <div className="space-y-6">
              <h2 className="font-heading text-sm tracking-[0.2em] uppercase text-foreground-950">
                Data Security
              </h2>
              <p className="font-body text-sm text-foreground-600 leading-relaxed">
                We implement reasonable administrative, technical, and physical safeguards to protect your personal information from unauthorized access, disclosure, alteration, or destruction. These measures include SSL encryption, secure server infrastructure, and restricted access protocols.
              </p>
              <p className="font-body text-sm text-foreground-600 leading-relaxed">
                However, no method of transmission over the internet or electronic storage is 100% secure. While we strive to use commercially acceptable means to protect your data, we cannot guarantee absolute security.
              </p>
            </div>

            <div className="accent-rule max-w-xs" />

            <div className="space-y-6">
              <h2 className="font-heading text-sm tracking-[0.2em] uppercase text-foreground-950">
                Cookies & Tracking Technologies
              </h2>
              <p className="font-body text-sm text-foreground-600 leading-relaxed">
                The Site uses cookies and similar tracking technologies to enhance your browsing experience, analyze Site traffic, and understand user behavior. Cookies are small text files stored on your device that help us recognize you and remember your preferences.
              </p>
              <p className="font-body text-sm text-foreground-600 leading-relaxed">
                You can configure your browser to refuse all cookies or to alert you when cookies are being sent. However, some features of the Site may not function properly without cookies.
              </p>
            </div>

            <div className="accent-rule max-w-xs" />

            <div className="space-y-6">
              <h2 className="font-heading text-sm tracking-[0.2em] uppercase text-foreground-950">
                Your Rights & Choices
              </h2>
              <p className="font-body text-sm text-foreground-600 leading-relaxed">
                You have the right to access, update, correct, or delete your personal information. You may also opt out of receiving promotional emails by clicking the unsubscribe link in any email or contacting us directly.
              </p>
              <p className="font-body text-sm text-foreground-600 leading-relaxed">
                To exercise these rights, please contact us at <a href="mailto:help@mysecretvitality.com" className="text-accent-500 hover:text-foreground-950 transition-colors underline underline-offset-2">help@mysecretvitality.com</a>. We will respond to reasonable requests within the timeframe required by applicable law.
              </p>
            </div>

            <div className="accent-rule max-w-xs" />

            <div className="space-y-6">
              <h2 className="font-heading text-sm tracking-[0.2em] uppercase text-foreground-950">
                Data Retention
              </h2>
              <p className="font-body text-sm text-foreground-600 leading-relaxed">
                We retain your personal information for as long as necessary to fulfill the purposes outlined in this Privacy Policy, comply with legal obligations, resolve disputes, and enforce our agreements. Order and transaction records are retained for a minimum of seven years for regulatory and tax compliance.
              </p>
            </div>

            <div className="accent-rule max-w-xs" />

            <div className="space-y-6">
              <h2 className="font-heading text-sm tracking-[0.2em] uppercase text-foreground-950">
                Children's Privacy
              </h2>
              <p className="font-body text-sm text-foreground-600 leading-relaxed">
                The Site is not intended for individuals under 21 years of age. We do not knowingly collect personal information from anyone under 21. If we become aware that we have collected information from a person under 21, we will delete it promptly.
              </p>
            </div>

            <div className="accent-rule max-w-xs" />

            <div className="space-y-6">
              <h2 className="font-heading text-sm tracking-[0.2em] uppercase text-foreground-950">
                Changes to This Policy
              </h2>
              <p className="font-body text-sm text-foreground-600 leading-relaxed">
                We may update this Privacy Policy from time to time. Changes will be posted on this page with a revised effective date. We encourage you to review this policy periodically.
              </p>
            </div>

            <div className="accent-rule max-w-xs" />

            <div className="space-y-6">
              <h2 className="font-heading text-sm tracking-[0.2em] uppercase text-foreground-950">
                Contact Us
              </h2>
              <p className="font-body text-sm text-foreground-600 leading-relaxed">
                If you have any questions about this Privacy Policy or our data practices, please contact us:
              </p>
              <div className="font-mono text-sm text-foreground-600 space-y-1">
                <p className="mt-2">
                  <a href="mailto:help@mysecretvitality.com" className="text-accent-500 hover:text-foreground-950 transition-colors underline underline-offset-2">
                    help@mysecretvitality.com
                  </a>
                </p>
              </div>
            </div>

            <div className="p-6 border border-dashed border-secondary-500/20 bg-background-100/30 text-center">
              <p className="font-heading text-[10px] tracking-[0.2em] uppercase text-foreground-950/80 mb-2">
                Effective Date
              </p>
              <p className="font-mono text-xs text-foreground-600">
                {s.effective_date}
              </p>
            </div>
          </div>
          )}
        </div>
      </div>
    </PageLayout>
  );
}