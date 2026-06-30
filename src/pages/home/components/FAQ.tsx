import { useState } from 'react';
import { useSections } from '@/context/SectionsContext';

export default function FAQ() {
  const { sections } = useSections();
  const s = sections.faq_home;
  const faqs = s.items;
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggle = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section className="py-20 md:py-28 bg-[#4A5C4A]" id="faq">
      <div className="max-w-3xl mx-auto px-4 md:px-6">
        <div className="text-center mb-14">
          <p className="font-sans text-[10px] uppercase tracking-[0.18em] text-[#DBD0C2] mb-3 font-normal">
            ✦ {s.label}
          </p>
          <h2 className="font-heading text-[32px] md:text-[38px] leading-[1.15] text-[#E1E4D9] mb-3 font-light">
            {s.headline.split('\n').map((line, i, arr) => (
              <span key={i}>{line}{i < arr.length - 1 && <br />}</span>
            ))}
          </h2>
          <p className="font-heading italic text-lg text-[#B08D57] font-light">
            {s.tagline}
          </p>
        </div>

        {/* FAQ Accordion */}
        <div className="space-y-2">
          {faqs.map((faq, index) => {
            const isOpen = openIndex === index;
            return (
              <div
                key={index}
                className="bg-[#3D4E3D] border-[0.5px] border-[#E1E4D9]/10 rounded-[4px] overflow-hidden"
              >
                <button
                  onClick={() => toggle(index)}
                  className="w-full flex items-center justify-between gap-4 px-5 py-4 text-left cursor-pointer group"
                >
                  <h4 className="font-heading text-sm text-[#E1E4D9] font-semibold pr-2">
                    {faq.q}
                  </h4>
                  <span
                    className={`w-5 h-5 flex items-center justify-center flex-shrink-0 text-[#DBD0C2] transition-transform duration-300 ${
                      isOpen ? 'rotate-180' : 'rotate-0'
                    }`}
                  >
                    <i className="ri-arrow-down-s-line text-lg" />
                  </span>
                </button>

                <div
                  className={`overflow-hidden transition-all duration-300 ${
                    isOpen ? 'max-h-[400px] opacity-100' : 'max-h-0 opacity-0'
                  }`}
                >
                  <div className="px-5 pb-4">
                    <div className="border-t border-[#E1E4D9]/8 pt-4">
                      <p className="font-sans text-[13px] text-[#DBD0C2] leading-[1.8] font-light">
                        {faq.a}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Bottom link */}
        <div className="mt-10 text-center">
          <p className="font-sans text-[12px] text-[#DBD0C2] font-light">
            {s.contact_text}{' '}
            <a
              href={s.contact_url}
              className="text-[#B08D57] hover:text-[#DBD0C2] underline underline-offset-4 transition-colors cursor-pointer font-medium"
            >
              Contact our team
            </a>
          </p>
        </div>
      </div>
    </section>
  );
}