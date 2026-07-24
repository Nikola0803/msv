import { useSections } from '@/context/SectionsContext';

export default function BrandStory() {
  const { sections } = useSections();
  const s = sections.brand_story;

  return (
    <section className="py-20 md:py-28 bg-[#4A5C4A]" id="story">
      <div className="max-w-7xl mx-auto px-4 md:px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left text */}
          <div>
            <p className="font-sans text-[10px] uppercase tracking-[0.18em] text-[#DBD0C2] mb-4 font-normal">
              ✦ {s.label}
            </p>

            <h2 className="font-heading text-[36px] md:text-[40px] leading-[1.15] text-[#E1E4D9] mb-6 font-light">
              {s.headline}
            </h2>

            <p className="font-sans text-sm text-[#DBD0C2] leading-[1.8] mb-8 font-light">
              {s.body}
            </p>

            <a
              href={s.cta_url}
              className="inline-flex items-center gap-2 font-sans text-[10px] uppercase tracking-[0.14em] text-[#B08D57] hover:text-[#DBD0C2] transition-colors whitespace-nowrap font-normal"
            >
              {s.cta_label}
            </a>
          </div>

          {/* Right image */}
          <div className="relative">
            <div className="aspect-[4/5] w-full max-w-md mx-auto lg:max-w-none relative">
              <div className="absolute -inset-2 border border-[#E1E4D9]/10" />
              {s.image_url && (
                <img
                  src={s.image_url}
                  alt="Vintage apothecary laboratory with research peptides"
                  className="w-full h-full object-cover object-center"
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}