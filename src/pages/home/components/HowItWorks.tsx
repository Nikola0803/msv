import { useSections } from '@/context/SectionsContext';

export default function HowItWorks() {
  const { sections } = useSections();
  const s = sections.howitworks;
  const steps = s.steps;

  return (
    <section className="py-20 md:py-28 bg-[#E1E4D9]" id="how-it-works">
      <div className="max-w-7xl mx-auto px-4 md:px-6">
        <div className="text-center mb-14">
          <p className="font-sans text-[10px] uppercase tracking-[0.18em] text-[#4A5C4A] mb-3 font-normal">
            ✦ {s.label}
          </p>
          <h2 className="font-heading text-[32px] md:text-[38px] leading-[1.15] text-[#2F3430] mb-3 font-light">
            {s.headline}
          </h2>
          <p className="font-heading italic text-lg text-[#B08D57] font-light">
            {s.subheadline}
          </p>
        </div>

        {/* Steps */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
          {steps.map((item, index) => (
            <div key={index} className="relative text-center group">
              {/* Step number */}
              <div className="mb-5 relative">
                <div className="w-16 h-16 mx-auto rounded-full bg-[#8E9A8A]/10 flex items-center justify-center">
                  <span className="w-8 h-8 flex items-center justify-center text-[#4A5C4A]">
                    <i className={`${item.icon} text-[26px]`} />
                  </span>
                </div>
                <span className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-[#B08D57] flex items-center justify-center font-heading text-[11px] text-[#E1E4D9] font-semibold">
                  {String(index + 1).padStart(2, '0')}
                </span>
              </div>

              <h3 className="font-heading text-sm text-[#2F3430] mb-2 font-semibold">{item.title}</h3>
              <p className="font-sans text-[12px] text-[#3D4E3D] leading-[1.7] font-light">
                {item.description}
              </p>

              {/* Connector line between steps (desktop only) */}
              {index < steps.length - 1 && (
                <div className="hidden lg:block absolute top-8 left-[calc(50%+32px)] w-[calc(100%-64px)]">
                  <div className="border-t border-dashed border-[#DBD0C2] w-full" />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}