import PageLayout from '@/components/feature/PageLayout';
import { useSections } from '@/context/SectionsContext';

export default function ReturnPolicy() {
  const { sections } = useSections();
  const s = sections.return_policy;

  return (
    <PageLayout>
      <div className="py-16 md:py-24 grain-overlay">
        <div className="relative z-10 max-w-4xl mx-auto px-4 md:px-8">
          <div className="text-center mb-12">
            <span className="text-accent-500 text-lg">✦</span>
            <h1 className="font-heading text-2xl md:text-3xl tracking-[0.2em] uppercase text-foreground-950 mt-3">
              Return Policy
            </h1>
          </div>

          {s.content ? (
            <div className="prose prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: s.content }} />
          ) : (
          <div className="space-y-8">
            <div className="p-6 border border-red-900/15 bg-red-900/[0.02]">
              <div className="flex items-start gap-3">
                <span className="w-5 h-5 flex items-center justify-center text-red-900/60 mt-0.5">
                  <i className="ri-error-warning-line" />
                </span>
                <div>
                  <p className="font-heading text-[11px] tracking-[0.2em] uppercase text-red-900/90 mb-2">
                    All Sales Are Final
                  </p>
                  <p className="font-body text-sm text-foreground-600 leading-relaxed">
                    Due to the nature of research chemicals and peptides, we do not accept returns or offer refunds. Please review this policy carefully before placing an order.
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <h2 className="font-heading text-sm tracking-[0.2em] uppercase text-foreground-950">
                No Returns or Refunds
              </h2>
              <p className="font-body text-sm text-foreground-600 leading-relaxed">
                All sales are final. We do not accept returns, exchanges, or issue refunds for any reason other than the specific circumstances described below. By placing an order, you acknowledge and accept this policy.
              </p>
              <p className="font-body text-sm text-foreground-600 leading-relaxed">
                This policy applies to all products, including but not limited to opened, unopened, reconstituted, or partially used items.
              </p>
            </div>

            <div className="accent-rule max-w-xs" />

            <div className="space-y-6">
              <h2 className="font-heading text-sm tracking-[0.2em] uppercase text-foreground-950">
                Damaged or Incorrect Items
              </h2>
              <p className="font-body text-sm text-foreground-600 leading-relaxed">
                We will issue a replacement or store credit only under the following conditions:
              </p>
              <ul className="space-y-2.5 ml-4">
                {[
                  'Product was received with visibly damaged or compromised packaging',
                  'Incorrect product was shipped (wrong item or quantity)',
                  'Product quality does not match its Certificate of Analysis',
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-2.5">
                    <span className="w-4 h-4 flex items-center justify-center text-accent-500 mt-0.5 flex-shrink-0">
                      <i className="ri-checkbox-circle-line text-xs" />
                    </span>
                    <span className="font-body text-sm text-foreground-600">{item}</span>
                  </li>
                ))}
              </ul>
              <p className="font-body text-sm text-foreground-600 leading-relaxed">
                Claims must be submitted within <strong className="text-foreground-950">15 days of delivery</strong> with clear photographs of the damage, the packaging, and the shipping label. Claims submitted after this window will not be honored.
              </p>
            </div>

            <div className="accent-rule max-w-xs" />

            <div className="space-y-6">
              <h2 className="font-heading text-sm tracking-[0.2em] uppercase text-foreground-950">
                How to Submit a Claim
              </h2>
              <div className="space-y-3">
                {[
                  { step: '1', title: 'Email Support', desc: 'Send an email to help@mysecretvitality.com with your order number, a description of the issue, and photos of the damaged or incorrect item.' },
                  { step: '2', title: 'Await Review', desc: 'Our team will review your claim within 2–3 business days and respond with next steps.' },
                  { step: '3', title: 'Resolution', desc: 'Approved claims will be resolved with a replacement shipment or store credit at our discretion.' },
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-3 p-3 border border-secondary-500/20 bg-background-100/30">
                    <span className="w-6 h-6 flex items-center justify-center bg-accent-500 text-foreground-950 font-mono text-xs font-bold flex-shrink-0">
                      {item.step}
                    </span>
                    <div>
                      <p className="font-heading text-xs tracking-wider uppercase text-foreground-950">{item.title}</p>
                      <p className="font-body text-xs text-foreground-600/70 mt-0.5 leading-relaxed">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="accent-rule max-w-xs" />

            <div className="space-y-6">
              <h2 className="font-heading text-sm tracking-[0.2em] uppercase text-foreground-950">
                Not Eligible for Claims
              </h2>
              <ul className="space-y-2.5 ml-4">
                {[
                  'Change of mind or buyer\'s remorse',
                  'Opened, reconstituted, or partially used products',
                  'Products returned without prior authorization',
                  'Claims submitted after 15 days of delivery',
                  'Products damaged due to improper storage by the customer',
                  'International orders (we do not ship internationally)',
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-2.5">
                    <span className="w-4 h-4 flex items-center justify-center text-red-900/40 mt-0.5 flex-shrink-0">
                      <i className="ri-close-circle-line text-xs" />
                    </span>
                    <span className="font-body text-sm text-foreground-600">{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="accent-rule max-w-xs" />

            <div className="space-y-6">
              <h2 className="font-heading text-sm tracking-[0.2em] uppercase text-foreground-950">
                Contact
              </h2>
              <p className="font-body text-sm text-foreground-600 leading-relaxed">
                For claim inquiries, contact our support team:
              </p>
              <div className="font-mono text-sm text-foreground-600 space-y-1">
                <p>
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
