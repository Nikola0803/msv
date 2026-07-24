import { useSections } from '@/context/SectionsContext';

export default function PressAuthority() {
  const { sections } = useSections();
  const s = sections.press;

  return (
    <section className="py-20 md:py-24 bg-[#E1E4D9]" id="press">
      <div className="max-w-7xl mx-auto px-4 md:px-6">
        <div className="text-center mb-14">
          <p className="font-sans text-[10px] uppercase tracking-[0.18em] text-[#4A5C4A] mb-3 font-normal">
            ✦ {s.label}
          </p>
          <h2 className="font-heading text-[32px] md:text-[38px] leading-[1.15] text-[#2F3430] mb-3 font-light">
            {s.headline.split('\n').map((line, i, arr) => (
              <span key={i}>{line}{i < arr.length - 1 && <br />}</span>
            ))}
          </h2>
          <p className="font-heading italic text-lg text-[#B08D57] font-light">
            {s.subheadline}
          </p>
        </div>

        {/* Certification badges */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 mb-14">
          {s.certs.map((cert, index) => (
            <div
              key={index}
              className="bg-white border-[0.5px] border-[#DBD0C2] rounded-[4px] p-5 text-center group hover:border-[#B08D57] transition-colors"
            >
              <span className="w-10 h-10 flex items-center justify-center text-[#4A5C4A] mx-auto mb-3">
                <i className={`${cert.icon} text-[22px]`} />
              </span>
              <p className="font-heading text-[14px] text-[#2F3430] font-semibold mb-1">{cert.label}</p>
              <p className="font-sans text-[10px] text-[#3D4E3D] leading-[1.4] font-light">
                {cert.description}
                <br />
                {cert.detail}
              </p>
            </div>
          ))}
        </div>


      </div>
    </section>
  );
}