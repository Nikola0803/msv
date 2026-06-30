import { useState, useRef, useEffect, useCallback } from 'react';
import { useSections } from '@/context/SectionsContext';

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-[2px]">
      {Array.from({ length: 5 }).map((_, i) => (
        <span key={i} className="w-3 h-3 flex items-center justify-center">
          <i
            className={`text-[11px] ${
              i < rating ? 'ri-star-fill text-[#B08D57]' : 'ri-star-fill text-[#DBD0C2]'
            }`}
          />
        </span>
      ))}
    </div>
  );
}

export default function Testimonials() {
  const { sections } = useSections();
  const s = sections.testimonials;
  const testimonials = s.items.map((t, i) => ({ ...t, id: i + 1, rating: Number(t.rating) }));
  const [expanded, setExpanded] = useState<number | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [visibleCount, setVisibleCount] = useState(3);
  const trackRef = useRef<HTMLDivElement>(null);
  const autoplayRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // All testimonials after the first one (used for featured card)
  const carouselItems = testimonials.slice(1);
  const maxIndex = Math.max(0, carouselItems.length - visibleCount);

  // Detect visible count based on screen size
  useEffect(() => {
    const update = () => {
      if (window.innerWidth >= 1024) setVisibleCount(3);
      else if (window.innerWidth >= 640) setVisibleCount(2);
      else setVisibleCount(1);
    };
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);

  // Clamp index when visibleCount changes
  useEffect(() => {
    const newMax = Math.max(0, carouselItems.length - visibleCount);
    if (currentIndex > newMax) setCurrentIndex(newMax);
  }, [visibleCount, currentIndex, carouselItems.length]);

  const goTo = useCallback(
    (index: number) => {
      const clamped = Math.max(0, Math.min(index, maxIndex));
      setCurrentIndex(clamped);
    },
    [maxIndex],
  );

  const goNext = useCallback(() => {
    goTo(currentIndex + 1);
  }, [currentIndex, goTo]);

  const goPrev = useCallback(() => {
    goTo(currentIndex - 1);
  }, [currentIndex, goTo]);

  // Autoplay
  useEffect(() => {
    autoplayRef.current = setInterval(() => {
      setCurrentIndex((prev) => {
        const newMax = Math.max(0, carouselItems.length - (window.innerWidth >= 1024 ? 3 : window.innerWidth >= 640 ? 2 : 1));
        if (prev >= newMax) return 0;
        return prev + 1;
      });
    }, 5000);
    return () => {
      if (autoplayRef.current) clearInterval(autoplayRef.current);
    };
  }, [carouselItems.length]);

  // Pause autoplay on hover
  const pauseAutoplay = () => {
    if (autoplayRef.current) clearInterval(autoplayRef.current);
  };
  const resumeAutoplay = () => {
    autoplayRef.current = setInterval(() => {
      setCurrentIndex((prev) => {
        const newMax = Math.max(0, carouselItems.length - (window.innerWidth >= 1024 ? 3 : window.innerWidth >= 640 ? 2 : 1));
        if (prev >= newMax) return 0;
        return prev + 1;
      });
    }, 5000);
  };

  const isAtStart = currentIndex === 0;
  const isAtEnd = currentIndex >= maxIndex;

  return (
    <section className="py-20 md:py-28 bg-[#E1E4D9]" id="testimonials">
      <div className="max-w-7xl mx-auto px-4 md:px-6">
        {/* Section Header */}
        <div className="text-center mb-14">
          <p className="font-sans text-[10px] uppercase tracking-[0.18em] text-[#8E9A8A] mb-3 font-normal">
            ✦ {s.label}
          </p>
          <h2 className="font-heading text-[32px] md:text-[38px] leading-[1.15] text-[#2F3430] mb-3 font-light">
            {s.headline.split('\n').map((line, i, arr) => (
              <span key={i}>{line}{i < arr.length - 1 && <br />}</span>
            ))}
          </h2>
          <p className="font-heading italic text-lg text-[#B08D57] font-light">
            {s.tagline}
          </p>
        </div>

        {/* Featured Large Card */}
        {testimonials[0] && (
        <div className="max-w-3xl mx-auto mb-12">
          <div className="bg-white border-[0.5px] border-[#DBD0C2] rounded-[4px] p-6 md:p-8 relative">
            <span className="absolute top-4 right-6 text-[80px] leading-none text-[#8E9A8A]/15 font-heading italic select-none pointer-events-none">
              &ldquo;
            </span>

            <div className="relative z-[1]">
              <StarRating rating={testimonials[0].rating} />

              <blockquote className="mt-4">
                <p className="font-heading text-[18px] md:text-[20px] text-[#2F3430] leading-[1.6] font-light">
                  &ldquo;{testimonials[0].quote}&rdquo;
                </p>
              </blockquote>

              <div className="mt-6 flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-[#8E9A8A]/15 flex items-center justify-center flex-shrink-0">
                  <span className="font-heading text-sm text-[#8E9A8A] font-semibold">{testimonials[0].initials}</span>
                </div>
                <div>
                  <p className="font-heading text-sm text-[#2F3430] font-semibold">{testimonials[0].name}</p>
                  <p className="font-sans text-[11px] text-[#7A8A76] font-light">{testimonials[0].role}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
        )}

        {/* Carousel section */}
        <div
          className="relative"
          onMouseEnter={pauseAutoplay}
          onMouseLeave={resumeAutoplay}
        >
          {/* Left arrow */}
          <button
            onClick={goPrev}
            disabled={isAtStart}
            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-3 z-10 w-9 h-9 flex items-center justify-center bg-white border-[0.5px] border-[#DBD0C2] rounded-full text-[#2F3430] hover:text-[#B08D57] hover:border-[#B08D57] transition-all disabled:opacity-25 disabled:cursor-not-allowed shadow-sm cursor-pointer"
            aria-label="Previous testimonials"
          >
            <i className="ri-arrow-left-s-line text-lg" />
          </button>

          {/* Track with overflow hidden */}
          <div className="overflow-hidden mx-6">
            <div
              ref={trackRef}
              className="flex transition-transform duration-500 ease-out"
              style={{
                transform: `translateX(-${currentIndex * (100 / visibleCount)}%)`,
              }}
            >
              {carouselItems.map((t) => {
                const isExpanded = expanded === t.id;
                return (
                  <div
                    key={t.id}
                    className="flex-shrink-0 px-2"
                    style={{ width: `${100 / visibleCount}%` }}
                  >
                    <div className="bg-white border-[0.5px] border-[#DBD0C2] rounded-[4px] p-5 flex flex-col h-full">
                      <StarRating rating={t.rating} />

                      <blockquote className="mt-3 flex-1">
                        <p className="font-sans text-[13px] text-[#2F3430] leading-[1.7] font-light">
                          {isExpanded || t.quote.length <= 140
                            ? `"${t.quote}"`
                            : `"${t.quote.slice(0, 140)}..."`}
                        </p>
                        {t.quote.length > 140 && (
                          <button
                            onClick={() => setExpanded(isExpanded ? null : t.id)}
                            className="font-sans text-[11px] text-[#8E9A8A] font-medium mt-1 hover:text-[#B08D57] transition-colors cursor-pointer"
                          >
                            {isExpanded ? 'Show less' : 'Read more'}
                          </button>
                        )}
                      </blockquote>

                      <div className="mt-4 flex items-center gap-3 pt-4 border-t border-[#DBD0C2]/70">
                        <div className="w-8 h-8 rounded-full bg-[#8E9A8A]/10 flex items-center justify-center flex-shrink-0">
                          <span className="font-heading text-xs text-[#8E9A8A] font-semibold">
                            {t.initials}
                          </span>
                        </div>
                        <div>
                          <p className="font-heading text-[13px] text-[#2F3430] font-semibold">
                            {t.name}
                          </p>
                          <p className="font-sans text-[10px] text-[#7A8A76] font-light">{t.role}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right arrow */}
          <button
            onClick={goNext}
            disabled={isAtEnd}
            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-3 z-10 w-9 h-9 flex items-center justify-center bg-white border-[0.5px] border-[#DBD0C2] rounded-full text-[#2F3430] hover:text-[#B08D57] hover:border-[#B08D57] transition-all disabled:opacity-25 disabled:cursor-not-allowed shadow-sm cursor-pointer"
            aria-label="Next testimonials"
          >
            <i className="ri-arrow-right-s-line text-lg" />
          </button>
        </div>

        {/* Dots indicator */}
        <div className="flex items-center justify-center gap-2 mt-6">
          {Array.from({ length: maxIndex + 1 }).map((_, i) => (
            <button
              key={i}
              onClick={() => goTo(i)}
              className={`w-1.5 h-1.5 rounded-full transition-all cursor-pointer ${
                i === currentIndex
                  ? 'bg-[#B08D57] w-5'
                  : 'bg-[#DBD0C2] hover:bg-[#B08D57]/50'
              }`}
              aria-label={`Go to testimonial page ${i + 1}`}
            />
          ))}
        </div>

        {/* Aggregate rating badge */}
        <div className="mt-12 text-center">
          <div className="inline-flex items-center gap-6 bg-white border-[0.5px] border-[#DBD0C2] rounded-[4px] px-6 py-4">
            <div className="text-center">
              <p className="font-heading text-[28px] text-[#2F3430] font-light leading-none">{s.agg_rating}</p>
              <div className="flex items-center gap-[1px] mt-1 justify-center">
                {Array.from({ length: 5 }).map((_, i) => (
                  <span key={i} className="w-3 h-3 flex items-center justify-center">
                    <i className="ri-star-fill text-[11px] text-[#B08D57]" />
                  </span>
                ))}
              </div>
              <p className="font-sans text-[10px] text-[#7A8A76] mt-1 font-light">{s.agg_reviews} reviews</p>
            </div>
            <div className="w-[0.5px] h-12 bg-[#DBD0C2]" />
            <div className="text-center">
              <p className="font-heading text-[28px] text-[#2F3430] font-light leading-none">{s.agg_purity}</p>
              <p className="font-sans text-[10px] text-[#7A8A76] mt-1 font-light">Avg. Purity</p>
            </div>
            <div className="w-[0.5px] h-12 bg-[#DBD0C2]" />
            <div className="text-center">
              <p className="font-heading text-[28px] text-[#2F3430] font-light leading-none">{s.agg_coa}</p>
              <p className="font-sans text-[10px] text-[#7A8A76] mt-1 font-light">COA Provided</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}