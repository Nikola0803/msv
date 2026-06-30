import PageLayout from '@/components/feature/PageLayout';
import { useSections } from '@/context/SectionsContext';

export default function About() {
  const { sections } = useSections();
  const s = sections.about;

  return (
    <PageLayout>
      <div className="py-16 md:py-24 bg-background-50 grain-overlay">
        <div className="relative z-10 max-w-4xl mx-auto px-4 md:px-8">
          <div className="text-center mb-12">
            <span className="text-accent-500 text-lg font-heading italic">✦</span>
            <h1 className="font-heading text-2xl md:text-3xl tracking-[0.15em] uppercase text-foreground-950 mt-3 font-light">
              About My Secret Vitality
            </h1>
          </div>

          <div className="space-y-6 mb-12">
            <p className="font-body text-sm text-foreground-600 leading-relaxed font-light">
              {s.paragraph1}
            </p>
            <p className="font-body text-sm text-foreground-600 leading-relaxed font-light">
              {s.paragraph2}
            </p>
            <p className="font-body text-sm text-foreground-600 leading-relaxed font-light">
              {s.paragraph3}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            {s.stats.map((stat, i) => (
              <div key={i} className="text-center p-6 border border-secondary-500/30 bg-background-100/40 rounded-[2px]">
                <p className="font-mono text-2xl text-accent-500 font-bold mb-2">{stat.value}</p>
                <p className="font-heading text-[10px] tracking-[0.15em] uppercase text-foreground-600">{stat.label}</p>
              </div>
            ))}
          </div>

          <div className="accent-rule max-w-md mx-auto mb-8" />

          <blockquote className="font-heading text-lg md:text-xl italic text-foreground-950 text-center leading-relaxed font-light">
            {s.quote}
          </blockquote>
        </div>
      </div>
    </PageLayout>
  );
}