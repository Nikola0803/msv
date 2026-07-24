import { useEffect, useState } from 'react';
import { MsvLogo } from '@/components/MsvLogo';
import { useSections } from '@/context/SectionsContext';

/** Shows the real logo PNG if present, falls back to SVG recreation */
function LogoImage() {
  const [useSvg, setUseSvg] = useState(false);
  if (useSvg) return <MsvLogo width={260} theme="dark" />;
  return (
    <img
      src="/logo-transparent.png"
      alt="My Secret Vitality"
      className="w-full h-full object-contain p-6"
      onError={() => setUseSvg(true)}
    />
  );
}

export default function HeroSection() {
  const { sections } = useSections();
  const s = sections.hero;
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);

  return (
    <section className="relative min-h-[580px] md:min-h-[680px] lg:min-h-[760px] flex items-center overflow-hidden">
      {/* Full-bleed atmospheric background image */}
      <div className="absolute inset-0">
        <img
          src={s.bg_image_url || 'https://db.vintagepeptides.com/wp-content/uploads/2026/07/hero-msv.jpg'}
          alt=""
          className="w-full h-full object-cover object-center"
        />
      </div>

      {/* Dark gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#2F3430]/70 via-[#2F3430]/55 to-[#1a1f1c]/80" />

      {/* Subtle radial glow behind text area */}
      <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#B08D57]/8 rounded-full blur-[120px] pointer-events-none" />

      {/* Decorative vertical line */}
      <div className="absolute left-[52%] top-[10%] bottom-[10%] w-[0.5px] bg-gradient-to-b from-transparent via-[#B08D57]/30 to-transparent hidden lg:block" />

      <div className="relative z-10 w-full max-w-7xl mx-auto px-4 md:px-6 py-16 md:py-0">
        <div className="flex flex-col lg:flex-row items-center gap-8 lg:gap-12">
          {/* Left content */}
          <div className="flex-1 text-center lg:text-left lg:pr-8">
            {/* Small label */}
            <div
              className={`inline-flex items-center gap-3 mb-6 transition-all duration-700 ${
                visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
              }`}
            >
              <div className="w-6 h-[0.5px] bg-[#B08D57]" />
              <p className="font-sans text-[10px] uppercase tracking-[0.2em] text-[#DBD0C2] font-normal">
                {s.label1}
              </p>
              <span className="text-[#B08D57] text-[8px]">✦</span>
              <p className="font-sans text-[10px] uppercase tracking-[0.2em] text-[#DBD0C2] font-normal">
                {s.label2}
              </p>
              <div className="w-6 h-[0.5px] bg-[#B08D57]" />
            </div>

            {/* DOMINANT tagline — "Beauty Kept Quiet." */}
            <h1
              className={`font-heading italic text-[52px] sm:text-[64px] md:text-[72px] lg:text-[80px] leading-[1.02] text-[#E1E4D9] mb-4 font-light tracking-[0.01em] transition-all duration-700 delay-150 ${
                visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
              }`}
            >
              {s.tagline}
            </h1>

            {/* CTAs */}
            <div
              className={`flex flex-col sm:flex-row items-center gap-4 justify-center lg:justify-start transition-all duration-700 delay-450 ${
                visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
              }`}
            >
              <a
                href={s.cta1_url}
                className="inline-flex items-center gap-2 bg-[#B08D57] text-[#E1E4D9] font-sans text-[11px] uppercase tracking-[0.16em] px-9 py-4 rounded-[2px] hover:bg-[#c49a5e] transition-all duration-300 whitespace-nowrap font-medium group"
              >
                {s.cta1_label}
                <span className="w-4 h-4 flex items-center justify-center transition-transform duration-300 group-hover:translate-x-0.5">
                  <i className="ri-arrow-right-line text-sm" />
                </span>
              </a>
              <a
                href={s.cta2_url}
                className="inline-flex items-center gap-2 font-sans text-[10px] uppercase tracking-[0.14em] text-[#E1E4D9]/80 underline underline-offset-[6px] decoration-[#B08D57]/40 hover:text-[#DBD0C2] hover:decoration-[#B08D57] transition-all duration-300 whitespace-nowrap font-normal"
              >
                {s.cta2_label}
              </a>
            </div>

            {/* Subtle stat line */}
            <div
              className={`mt-12 hidden sm:flex items-center gap-6 justify-center lg:justify-start text-[#DBD0C2]/50 transition-all duration-700 delay-600 ${
                visible ? 'opacity-100' : 'opacity-0'
              }`}
            >
              {s.stat_items.map((stat, i) => (
                <>
                  {i > 0 && <span key={`sep-${i}`} className="text-[#B08D57]/40">|</span>}
                  <div key={i} className="flex items-center gap-2">
                    <span className="w-4 h-4 flex items-center justify-center text-[#B08D57]">
                      <i className={`${stat.icon} text-sm`} />
                    </span>
                    <span className="font-sans text-[10px] uppercase tracking-[0.1em] font-normal">{stat.text}</span>
                  </div>
                </>
              ))}
            </div>
          </div>

          {/* Right — lifestyle image (flowers/bottles) or logo fallback */}
          <div
            className={`flex-shrink-0 hidden lg:block transition-all duration-700 delay-300 ${
              visible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-8'
            }`}
          >
            <div className="w-[320px] h-[420px] xl:w-[380px] xl:h-[500px] flex items-center justify-center">
              {s.image_url ? (
                <img
                  src={s.image_url}
                  alt=""
                  className="w-full h-full object-cover rounded-[2px]"
                />
              ) : (
                <LogoImage />
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <div
        className={`absolute bottom-6 left-1/2 -translate-x-1/2 transition-all duration-700 delay-1000 ${
          visible ? 'opacity-100' : 'opacity-0'
        }`}
      >
        <div className="flex flex-col items-center gap-2 text-[#DBD0C2]/50">
          <span className="font-sans text-[8px] uppercase tracking-[0.2em] font-normal">Scroll</span>
          <span className="w-4 h-4 flex items-center justify-center animate-bounce">
            <i className="ri-arrow-down-s-line text-sm" />
          </span>
        </div>
      </div>
    </section>
  );
}
