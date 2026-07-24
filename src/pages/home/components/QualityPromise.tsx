import { useSections } from '@/context/SectionsContext';

export default function QualityPromise() {
  const { sections } = useSections();
  const s = sections.quality;

  return (
    <section className="py-20 md:py-28 bg-[#4A5C4A]" id="quality">
      <div className="max-w-7xl mx-auto px-4 md:px-6">
        <div className="text-center mb-14">
          <p className="font-sans text-[10px] uppercase tracking-[0.18em] text-[#DBD0C2] mb-3 font-normal">
            ✦ {s.label}
          </p>
          <h2 className="font-heading text-[32px] md:text-[38px] leading-[1.15] text-[#E1E4D9] mb-4 font-light">
            {s.headline.split('\n').map((line, i, arr) => (
              <span key={i}>{line}{i < arr.length - 1 && <br />}</span>
            ))}
          </h2>
          <p className="font-heading italic text-lg text-[#B08D57] max-w-xl mx-auto font-light">
            {s.subheadline}
          </p>
        </div>

        {/* Guarantee Seal */}
        <div className="max-w-lg mx-auto mb-12 text-center">
          <div className="inline-flex flex-col items-center">
            <div className="w-20 h-20 rounded-full bg-[#B08D57]/15 border border-[#B08D57]/30 flex items-center justify-center mb-4">
              <span className="w-12 h-12 flex items-center justify-center">
                <i className="ri-verified-badge-line text-[32px] text-[#B08D57]" />
              </span>
            </div>
            <p className="font-heading text-[22px] text-[#E1E4D9] font-light mb-1">
              {s.seal_title}
            </p>
            <p className="font-sans text-[12px] text-[#DBD0C2] font-light leading-relaxed max-w-sm">
              {s.seal_desc}
            </p>
          </div>
        </div>

        {/* Guarantee Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5">
          {s.cards.map((item, index) => (
            <div
              key={index}
              className="bg-[#3D4E3D] border-[0.5px] border-[#E1E4D9]/10 rounded-[4px] p-5 md:p-6"
            >
              <span className="w-10 h-10 flex items-center justify-center text-[#B08D57] mb-4">
                <i className={`${item.icon} text-[22px]`} />
              </span>
              <h3 className="font-heading text-sm text-[#E1E4D9] mb-2 font-semibold">{item.title}</h3>
              <p className="font-sans text-[12px] text-[#DBD0C2] leading-[1.7] font-light">
                {item.description}
              </p>
            </div>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="mt-12 text-center">
          <a
            href={s.cta_url}
            className="inline-flex items-center gap-2 font-sans text-[10px] uppercase tracking-[0.14em] text-[#B08D57] hover:text-[#DBD0C2] transition-colors whitespace-nowrap font-medium"
          >
            {s.cta_label}
          </a>
        </div>
      </div>
    </section>
  );
}