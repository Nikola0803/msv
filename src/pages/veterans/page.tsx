import PageLayout from '@/components/feature/PageLayout';
import { useSections } from '@/context/SectionsContext';

export default function Veterans() {
  const { sections } = useSections();
  const s = sections.veterans;

  return (
    <PageLayout>
      <div className="py-16 md:py-24 grain-overlay">
        <div className="relative z-10 max-w-4xl mx-auto px-4 md:px-8">
          <div className="text-center mb-12">
            <span className="text-accent-500 text-lg">✦</span>
            <h1 className="font-heading text-2xl md:text-3xl tracking-[0.15em] uppercase text-foreground-950 mt-3 font-light">
              {s.headline}
            </h1>
            <p className="font-heading italic text-base text-accent-500 mt-4 font-light">
              {s.tagline}
            </p>
          </div>

          <div className="space-y-8">
            <div className="p-6 border border-secondary-500/30 bg-background-100/40 text-center">
              <p className="font-mono text-4xl text-accent-500 font-bold mb-2">{s.discount_pct}%</p>
              <p className="font-heading text-[10px] tracking-[0.2em] uppercase text-foreground-600">
                Discount for Veterans, Active Military &amp; First Responders
              </p>
            </div>

            <div className="space-y-4">
              <h2 className="font-heading text-sm tracking-[0.2em] uppercase text-foreground-950">
                Who Qualifies
              </h2>
              <ul className="space-y-2.5 ml-4">
                {s.qualifies.map((item, i) => (
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

            <div className="space-y-4">
              <h2 className="font-heading text-sm tracking-[0.2em] uppercase text-foreground-950">
                How to Claim Your Discount
              </h2>
              <div className="space-y-3">
                {s.steps.map((item, i) => (
                  <div key={i} className="flex items-start gap-3 p-3 border border-secondary-500/20 bg-background-100/30">
                    <span className="w-6 h-6 flex items-center justify-center bg-accent-500 text-foreground-950 font-mono text-xs font-bold flex-shrink-0">
                      {i + 1}
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

            <div className="space-y-3">
              <h2 className="font-heading text-sm tracking-[0.2em] uppercase text-foreground-950">
                Contact
              </h2>
              <p className="font-body text-sm text-foreground-600 leading-relaxed">
                Questions? Reach our support team at{' '}
                <a
                  href={`mailto:${s.contact_email}`}
                  className="text-accent-500 hover:text-foreground-950 transition-colors underline underline-offset-2"
                >
                  {s.contact_email}
                </a>
              </p>
            </div>

            <div className="p-6 border border-dashed border-secondary-500/20 bg-background-100/30">
              <p className="font-body text-xs text-foreground-600/60 leading-relaxed text-center">
                {s.disclaimer}
              </p>
            </div>
          </div>
        </div>
      </div>
    </PageLayout>
  );
}
