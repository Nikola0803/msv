import { useSections } from '@/context/SectionsContext';

export default function EditorialStrip() {
  const { sections } = useSections();
  const s = sections.editorial;

  return (
    <section className="py-16 md:py-24 bg-background-50 grain-overlay">
      <div className="relative z-10 max-w-7xl mx-auto px-4 md:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 items-center">
          <div className="relative aspect-[4/3] lg:aspect-[4/3] overflow-hidden rounded-[2px]">
            {s.image_url && (
              <img
                src={s.image_url}
                alt="Vintage laboratory testing equipment"
                className="w-full h-full object-cover object-top"
              />
            )}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-transparent to-background-50/40" />
            <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-background-50/30 to-transparent" />
          </div>

          <div>
            <span className="text-accent-500 text-lg font-heading italic">✦</span>
            <h2 className="font-heading text-lg md:text-xl tracking-[0.12em] uppercase text-foreground-950 mt-3 mb-5 leading-tight font-light">
              {s.headline.split('\n').map((line, i, arr) => (
                <span key={i}>{line}{i < arr.length - 1 && <br />}</span>
              ))}
            </h2>

            <p className="font-body text-sm text-foreground-600 leading-relaxed mb-5 font-light">
              {s.body}
            </p>

            <ul className="space-y-2.5 mb-6">
              {s.checklist.map((item, i) => (
                <li key={i} className="flex items-start gap-2.5">
                  <span className="w-4 h-4 flex items-center justify-center text-accent-500 flex-shrink-0 mt-0.5">
                    <i className="ri-check-line text-xs" />
                  </span>
                  <span className="font-body text-sm text-foreground-600 font-light">{item}</span>
                </li>
              ))}
            </ul>

            <div className="accent-rule max-w-xs mb-5" />

            <p className="font-body text-sm italic text-foreground-600/80 leading-relaxed font-light">
              {s.closing}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}