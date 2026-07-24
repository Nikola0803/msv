import { Link } from 'react-router-dom';
import PageLayout from '@/components/feature/PageLayout';
import { useSections } from '@/context/SectionsContext';

const TOC = [
  { id: 'overview', label: 'Overview', num: '01' },
  { id: 'age-eligibility', label: 'Age & Eligibility', num: '02' },
  { id: 'intended-use', label: 'Intended Use & Restrictions', num: '03' },
  { id: 'regulatory-compliance', label: 'Regulatory Compliance', num: '04' },
  { id: 'user-responsibility', label: 'User Responsibility', num: '05' },
  { id: 'purchase-agreement', label: 'Purchase Agreement', num: '06' },
  { id: 'policy-updates', label: 'Updates & Contact', num: '07' },
];

const SUMMARY_CARDS = [
  { icon: 'ri-flask-line', tag: 'RUO', title: 'Research Use Only', copy: 'Products are supplied exclusively for laboratory research and analytical purposes.' },
  { icon: 'ri-forbid-line', tag: '!', title: 'No Human Use', copy: 'Products are not intended for human or animal consumption, treatment, diagnosis, or prevention.' },
  { icon: 'ri-shield-user-line', tag: '21+', title: 'Qualified Buyers', copy: 'Customers represent that they are at least 21 and capable of lawful laboratory handling.' },
  { icon: 'ri-hand-heart-line', tag: 'COA', title: 'Responsible Handling', copy: 'Safe storage, handling, and disposal are the responsibility of the purchaser.' },
];

export default function ResearchUsePolicy() {
  const { sections } = useSections();
  const s = sections.research_use_policy;

  return (
    <PageLayout>
      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <section className="relative py-16 md:py-20 grain-overlay overflow-hidden">
        <div className="relative z-10 max-w-6xl mx-auto px-4 md:px-8">
          <p className="font-mono text-[11px] tracking-widest uppercase text-foreground-600/60 mb-6">
            <Link to="/" className="hover:text-accent-500 transition-colors">Home</Link>
            <span className="mx-2">/</span>
            Research Use Policy
          </p>

          <div className="grid lg:grid-cols-[1.4fr,1fr] gap-10 lg:gap-16 items-start">
            <div>
              <span className="inline-block font-mono text-[10px] tracking-[0.25em] uppercase text-accent-500 border border-accent-500/30 px-3 py-1 mb-6 rounded-[2px]">
                Compliance Policy
              </span>
              <h1 className="font-heading text-3xl md:text-5xl tracking-[0.08em] uppercase text-foreground-950 leading-[1.15] mb-5 font-light">
                Research Use Only
                <br />
                <span className="text-accent-500">(RUO)</span> Policy
              </h1>
              <p className="font-body text-sm md:text-base italic text-foreground-600 leading-relaxed max-w-xl mb-8 font-light">
                My Secret Vitality products are supplied strictly for scientific research, laboratory
                experimentation, and analytical purposes. This policy explains permitted use, customer
                responsibilities, handling expectations, and important limitations.
              </p>
              <div className="flex flex-wrap gap-3">
                <a
                  href="#overview"
                  className="inline-flex items-center justify-center bg-accent-500 hover:bg-accent-400 text-foreground-950 font-heading text-xs tracking-[0.2em] uppercase px-8 py-3.5 transition-colors rounded-[2px] font-semibold"
                >
                  Read Policy
                </a>
                <Link
                  to="/coa"
                  className="inline-flex items-center justify-center border border-accent-500/40 hover:border-accent-500 text-foreground-950 font-heading text-xs tracking-[0.2em] uppercase px-8 py-3.5 transition-colors rounded-[2px] font-semibold"
                >
                  View COAs
                </Link>
              </div>
            </div>

            <aside className="p-6 md:p-8 border border-accent-500/20 bg-background-100/40 rounded-[2px]">
              <p className="font-heading text-[11px] tracking-[0.2em] uppercase text-foreground-950 mb-3 font-semibold">
                Strict Laboratory Use Only
              </p>
              <p className="font-body text-sm text-foreground-600 leading-relaxed mb-5 font-light">
                These materials are not supplied for medical, clinical, diagnostic, human, or veterinary use.
              </p>
              <ul className="space-y-3">
                {[
                  'For qualified research environments',
                  'For analytical and laboratory purposes',
                  'Subject to lawful handling and storage',
                ].map((item) => (
                  <li key={item} className="flex items-start gap-2.5">
                    <span className="w-4 h-4 flex items-center justify-center text-accent-500 mt-0.5 flex-shrink-0">
                      <i className="ri-checkbox-circle-line text-xs" />
                    </span>
                    <span className="font-body text-sm text-foreground-600 font-light">{item}</span>
                  </li>
                ))}
              </ul>
            </aside>
          </div>
        </div>
      </section>

      {/* ── Summary cards ────────────────────────────────────────────────── */}
      <section className="py-10 md:py-14 border-y border-accent-500/15">
        <div className="max-w-6xl mx-auto px-4 md:px-8">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {SUMMARY_CARDS.map((card) => (
              <article key={card.title} className="p-6 border border-accent-500/15 bg-background-50 rounded-[2px]">
                <div className="flex items-center gap-2 mb-4">
                  <span className="w-9 h-9 flex items-center justify-center border border-accent-500/30 text-accent-500 font-mono text-[10px] tracking-wider">
                    {card.tag}
                  </span>
                  <i className={`${card.icon} text-accent-500 text-lg`} />
                </div>
                <h3 className="font-heading text-xs tracking-[0.15em] uppercase text-foreground-950 mb-2 font-semibold">
                  {card.title}
                </h3>
                <p className="font-body text-xs text-foreground-600 leading-relaxed font-light">{card.copy}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ── Doc + sidebar ────────────────────────────────────────────────── */}
      <section className="py-16 md:py-24 grain-overlay">
        <div className="max-w-6xl mx-auto px-4 md:px-8">
          <div className="grid lg:grid-cols-[1fr,320px] gap-12 items-start">
            {/* Doc */}
            <div>
              {s.content ? (
                <div className="prose prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: s.content }} />
              ) : (
                <div className="space-y-12">
                  <div id="overview" className="scroll-mt-28">
                    <SectionNumber num="01" title="Overview" />
                    <div className="p-6 border border-red-900/15 bg-red-900/[0.02] mb-6">
                      <div className="flex items-start gap-3">
                        <span className="w-5 h-5 flex items-center justify-center text-red-900/60 mt-0.5">
                          <i className="ri-error-warning-line" />
                        </span>
                        <div>
                          <p className="font-heading text-[11px] tracking-[0.2em] uppercase text-red-900/90 mb-2 font-semibold">
                            Important Notice
                          </p>
                          <p className="font-body text-sm text-foreground-600 leading-relaxed font-light">
                            All products and information provided by My Secret Vitality are intended for{' '}
                            <strong className="text-foreground-950">laboratory research use only</strong>. These
                            products are not for human consumption, injection, or medical use. They are not intended
                            to diagnose, treat, cure, or prevent any disease or condition.
                          </p>
                        </div>
                      </div>
                    </div>
                    <p className="font-body text-sm text-foreground-600 leading-relaxed font-light">
                      By purchasing or using any products from this website, you acknowledge and agree that all
                      materials are supplied solely for scientific research, laboratory experimentation, or
                      analytical purposes.
                    </p>
                  </div>

                  <div id="age-eligibility" className="scroll-mt-28">
                    <SectionNumber num="02" title="Age &amp; Eligibility Requirements" />
                    <p className="font-body text-sm text-foreground-600 leading-relaxed mb-4 font-light">
                      You must be <strong className="text-foreground-950">21 years of age or older</strong> to
                      access, browse, or purchase from this website. By using this site, you confirm that you are a
                      qualified researcher, aged 21 or older, and that you have the knowledge, training, and
                      facilities necessary to handle research chemicals safely and in accordance with applicable
                      laboratory protocols.
                    </p>
                    <p className="font-body text-sm text-foreground-600 leading-relaxed font-light">
                      My Secret Vitality reserves the right to refuse service, terminate accounts, or cancel orders
                      at its sole discretion if we suspect that a user does not meet these eligibility requirements
                      or intends to use our products for purposes other than lawful research.
                    </p>
                  </div>

                  <div id="intended-use" className="scroll-mt-28">
                    <SectionNumber num="03" title="Intended Use &amp; Restrictions" />
                    <p className="font-body text-sm text-foreground-600 leading-relaxed mb-4 font-light">
                      All products sold by My Secret Vitality are strictly for{' '}
                      <strong className="text-foreground-950">in vitro research and laboratory experimentation</strong>{' '}
                      in controlled settings. This includes, but is not limited to:
                    </p>
                    <ul className="space-y-2.5 ml-4 mb-4">
                      {[
                        'Academic and institutional research',
                        'Pharmaceutical and biotech development',
                        'Analytical and reference standard studies',
                        'Cell culture and biochemical assay work',
                      ].map((item) => (
                        <li key={item} className="flex items-start gap-2.5">
                          <span className="w-4 h-4 flex items-center justify-center text-accent-500 mt-0.5 flex-shrink-0">
                            <i className="ri-checkbox-circle-line text-xs" />
                          </span>
                          <span className="font-body text-sm text-foreground-600 font-light">{item}</span>
                        </li>
                      ))}
                    </ul>
                    <p className="font-body text-sm text-foreground-600 leading-relaxed font-light">
                      <strong className="text-foreground-950">Prohibited uses include:</strong> human or animal
                      consumption, administration, injection, implantation, or any therapeutic, cosmetic, or
                      recreational application. Misrepresentation of intended use during the purchasing process is a
                      violation of this policy and may result in permanent account suspension.
                    </p>
                  </div>

                  <div id="regulatory-compliance" className="scroll-mt-28">
                    <SectionNumber num="04" title="Regulatory Compliance &amp; FDA Disclaimer" />
                    <p className="font-body text-sm text-foreground-600 leading-relaxed mb-4 font-light">
                      All statements and products on this website have{' '}
                      <strong className="text-foreground-950">not been evaluated by the Food and Drug
                      Administration (FDA)</strong>. No product sold by My Secret Vitality is approved for human
                      use, nor are any claims made regarding safety, efficacy, or therapeutic benefit.
                    </p>
                    <p className="font-body text-sm text-foreground-600 leading-relaxed font-light">
                      Researchers are responsible for ensuring that their use of our products complies with all
                      applicable local, state, and federal regulations. This includes, but is not limited to,
                      proper storage, handling, documentation, and disposal of research chemicals in accordance
                      with institutional and environmental guidelines.
                    </p>
                  </div>

                  <div id="user-responsibility" className="scroll-mt-28">
                    <SectionNumber num="05" title="User Responsibility &amp; Liability" />
                    <p className="font-body text-sm text-foreground-600 leading-relaxed mb-4 font-light">
                      By purchasing from My Secret Vitality, you assume full responsibility for the lawful and
                      appropriate use of all products. You agree to indemnify and hold harmless My Secret Vitality,
                      its affiliates, suppliers, and partners from any claims, damages, or liabilities arising from
                      misuse, mishandling, or unlawful application of any product purchased from this site.
                    </p>
                    <p className="font-body text-sm text-foreground-600 leading-relaxed font-light">
                      My Secret Vitality is not liable for any injury, loss, or damage resulting from improper use,
                      storage, or handling of research chemicals. All product descriptions, protocols, and
                      technical data are provided for informational purposes only and do not constitute usage
                      instructions or medical advice.
                    </p>
                  </div>

                  <div id="purchase-agreement" className="scroll-mt-28">
                    <SectionNumber num="06" title="Purchase Agreement &amp; Account Verification" />
                    <p className="font-body text-sm text-foreground-600 leading-relaxed mb-4 font-light">
                      By creating an account, logging in, or completing a purchase, you explicitly agree to the
                      terms of this Research Use Policy. You confirm that:
                    </p>
                    <ul className="space-y-2.5 ml-4 mb-4">
                      {[
                        'You are 21 years of age or older',
                        'You are a qualified researcher with appropriate training and facilities',
                        'You will use all products solely for lawful laboratory research',
                        'You understand the risks associated with handling research chemicals',
                        'You will not use any product for human or animal consumption',
                      ].map((item) => (
                        <li key={item} className="flex items-start gap-2.5">
                          <span className="w-4 h-4 flex items-center justify-center text-accent-500 mt-0.5 flex-shrink-0">
                            <i className="ri-checkbox-circle-line text-xs" />
                          </span>
                          <span className="font-body text-sm text-foreground-600 font-light">{item}</span>
                        </li>
                      ))}
                    </ul>
                    <p className="font-body text-sm text-foreground-600 leading-relaxed font-light">
                      My Secret Vitality may require additional verification, including institutional affiliation or
                      research credentials, before processing certain orders. We reserve the right to request
                      documentation at any time to verify compliance with this policy.
                    </p>
                  </div>

                  <div id="policy-updates" className="scroll-mt-28">
                    <SectionNumber num="07" title="Policy Updates &amp; Contact" />
                    <p className="font-body text-sm text-foreground-600 leading-relaxed mb-4 font-light">
                      This Research Use Policy may be updated periodically to reflect changes in regulations,
                      industry standards, or company practices. The effective date of the current policy is{' '}
                      {s.effective_date}. Continued use of the site following any updates constitutes acceptance of
                      the revised terms.
                    </p>
                    <p className="font-body text-sm text-foreground-600 leading-relaxed font-light">
                      If you have questions about this policy or require clarification on any aspect of our
                      research-use terms, please contact our research support team at{' '}
                      <a
                        href="mailto:help@mysecretvitality.com"
                        className="text-accent-500 hover:text-foreground-950 transition-colors underline underline-offset-2"
                      >
                        help@mysecretvitality.com
                      </a>
                      .
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Sidebar */}
            <aside className="lg:sticky lg:top-28 space-y-6">
              <div className="border border-accent-500/20 bg-background-50 p-6 rounded-[2px]">
                <p className="font-heading text-[10px] tracking-[0.2em] uppercase text-foreground-950/70 mb-4 font-semibold">
                  Policy Overview
                </p>
                <nav className="space-y-1">
                  {TOC.map((item) => (
                    <a
                      key={item.id}
                      href={`#${item.id}`}
                      className="flex items-center gap-3 py-2 font-body text-xs text-foreground-600 hover:text-accent-500 transition-colors border-b border-accent-500/10 last:border-b-0 font-light"
                    >
                      <span className="font-mono text-[10px] text-accent-500/70">{item.num}</span>
                      {item.label}
                    </a>
                  ))}
                </nav>
              </div>

              <div className="border border-dashed border-secondary-500/20 bg-background-100/30 p-6 text-center rounded-[2px]">
                <p className="font-heading text-[10px] tracking-[0.2em] uppercase text-foreground-950/80 mb-2 font-semibold">
                  Policy Details
                </p>
                <p className="font-body text-xs text-foreground-600 mb-4 font-light">
                  This page clarifies My Secret Vitality's Research Use Only requirements, customer
                  responsibilities, and permitted laboratory-use limitations.
                </p>
                <div className="space-y-2">
                  <p className="font-mono text-[10px] tracking-widest uppercase text-foreground-950/60">Last Updated</p>
                  <p className="font-mono text-xs text-foreground-600">{s.effective_date}</p>
                </div>
                <div className="space-y-2 mt-4">
                  <p className="font-mono text-[10px] tracking-widest uppercase text-foreground-950/60">Support Email</p>
                  <a
                    href="mailto:help@mysecretvitality.com"
                    className="font-mono text-xs text-accent-500 hover:text-foreground-950 transition-colors"
                  >
                    help@mysecretvitality.com
                  </a>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </section>

      {/* ── Final CTA ────────────────────────────────────────────────────── */}
      <section className="py-16 md:py-20 border-t border-accent-500/15">
        <div className="max-w-6xl mx-auto px-4 md:px-8">
          <div className="p-8 md:p-12 border border-accent-500/20 bg-background-100/30 text-center rounded-[2px]">
            <h2 className="font-heading text-xl md:text-2xl tracking-[0.1em] uppercase text-foreground-950 mb-3 font-light">
              Need clarification before placing an order?
            </h2>
            <p className="font-body text-sm text-foreground-600 max-w-xl mx-auto mb-8 font-light">
              Contact My Secret Vitality support for questions related to Research Use Only policy, COA access,
              product documentation, or compliant laboratory-use expectations.
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              <Link
                to="/contact"
                className="inline-flex items-center justify-center bg-accent-500 hover:bg-accent-400 text-foreground-950 font-heading text-xs tracking-[0.2em] uppercase px-8 py-3.5 transition-colors rounded-[2px] font-semibold"
              >
                Contact Support
              </Link>
              <Link
                to="/coa"
                className="inline-flex items-center justify-center border border-accent-500/40 hover:border-accent-500 text-foreground-950 font-heading text-xs tracking-[0.2em] uppercase px-8 py-3.5 transition-colors rounded-[2px] font-semibold"
              >
                View COAs
              </Link>
            </div>
          </div>
        </div>
      </section>
    </PageLayout>
  );
}

function SectionNumber({ num, title }: { num: string; title: string }) {
  return (
    <div className="flex items-baseline gap-3 mb-4">
      <span className="font-mono text-xs text-accent-500/70">{num}</span>
      <h2
        className="font-heading text-sm tracking-[0.2em] uppercase text-foreground-950 font-semibold"
        dangerouslySetInnerHTML={{ __html: title }}
      />
    </div>
  );
}
