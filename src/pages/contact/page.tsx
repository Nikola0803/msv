import { useState } from 'react';
import PageLayout from '@/components/feature/PageLayout';
import { useSections } from '@/context/SectionsContext';

export default function Contact() {
  const { sections } = useSections();
  const s = sections.contact_page;
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <PageLayout>
      <div className="py-16 md:py-24 bg-[#E1E4D9] grain-overlay">
        <div className="relative z-10 max-w-6xl mx-auto px-4 md:px-8">
          <div className="text-center mb-12">
            <span className="text-accent-500 text-lg font-heading italic">✦</span>
            <h1 className="font-heading text-2xl md:text-3xl tracking-[0.15em] uppercase text-foreground-950 mt-3 font-light">
              {s.heading}
            </h1>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16">
            <div>
              <h2 className="font-heading text-sm tracking-[0.15em] uppercase text-foreground-950 mb-6 font-semibold">
                Direct Contact
              </h2>
              <div className="space-y-5 font-body text-sm text-foreground-600 font-light">
                <div className="flex items-start gap-3">
                  <span className="w-5 h-5 flex items-center justify-center text-accent-500 flex-shrink-0 mt-0.5">
                    <i className="ri-mail-line" />
                  </span>
                  <div>
                    <p className="text-foreground-950 font-medium">{s.email_label}</p>
                    <a href={`mailto:${s.email}`} className="hover:text-accent-500 transition-colors">{s.email}</a>
                  </div>
                </div>
              </div>

              <div className="accent-rule max-w-xs my-8" />

              <h2 className="font-heading text-sm tracking-[0.15em] uppercase text-foreground-950 mb-4 font-semibold">
                Laboratory Hours
              </h2>
              <div className="font-body text-sm text-foreground-600 space-y-2 font-light">
                <div className="flex justify-between max-w-xs">
                  <span>Monday – Friday</span>
                  <span>{s.hours_weekday}</span>
                </div>
                <div className="flex justify-between max-w-xs">
                  <span>Saturday</span>
                  <span>{s.hours_saturday}</span>
                </div>
                <div className="flex justify-between max-w-xs">
                  <span>Sunday</span>
                  <span>{s.hours_sunday}</span>
                </div>
              </div>
            </div>

            <div className="p-6 md:p-8 border border-secondary-500/30 bg-white/40 rounded-[2px]">
              {submitted ? (
                <div className="text-center py-8">
                  <span className="w-12 h-12 flex items-center justify-center text-accent-500 mx-auto mb-4">
                    <i className="ri-check-line text-2xl" />
                  </span>
                  <h3 className="font-heading text-sm tracking-[0.15em] uppercase text-foreground-950 mb-2 font-semibold">
                    {s.success_heading}
                  </h3>
                  <p className="font-body text-sm text-foreground-600 font-light">
                    {s.success_body}
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="font-heading text-[10px] tracking-[0.15em] uppercase text-foreground-950 block mb-1.5">
                      Full Name
                    </label>
                    <input
                      type="text"
                      required
                      className="w-full bg-background-50 border border-secondary-500/40 py-2.5 px-3 font-body text-sm text-foreground-950 placeholder:text-secondary-700 focus:outline-none focus:border-accent-500 rounded-[2px] transition-colors font-light"
                      placeholder="Dr. Jane Researcher"
                    />
                  </div>
                  <div>
                    <label className="font-heading text-[10px] tracking-[0.15em] uppercase text-foreground-950 block mb-1.5">
                      Institution
                    </label>
                    <input
                      type="text"
                      className="w-full bg-background-50 border border-secondary-500/40 py-2.5 px-3 font-body text-sm text-foreground-950 placeholder:text-secondary-700 focus:outline-none focus:border-accent-500 rounded-[2px] transition-colors font-light"
                      placeholder="University / Laboratory"
                    />
                  </div>
                  <div>
                    <label className="font-heading text-[10px] tracking-[0.15em] uppercase text-foreground-950 block mb-1.5">
                      Email
                    </label>
                    <input
                      type="email"
                      required
                      className="w-full bg-background-50 border border-secondary-500/40 py-2.5 px-3 font-body text-sm text-foreground-950 placeholder:text-secondary-700 focus:outline-none focus:border-accent-500 rounded-[2px] transition-colors font-light"
                      placeholder="research@institution.edu"
                    />
                  </div>
                  <div>
                    <label className="font-heading text-[10px] tracking-[0.15em] uppercase text-foreground-950 block mb-1.5">
                      Message
                    </label>
                    <textarea
                      rows={4}
                      required
                      maxLength={500}
                      className="w-full bg-background-50 border border-secondary-500/40 py-2.5 px-3 font-body text-sm text-foreground-950 placeholder:text-secondary-700 focus:outline-none focus:border-accent-500 rounded-[2px] transition-colors resize-none font-light"
                      placeholder="How can our research team assist you?"
                    />
                    <p className="font-mono text-[10px] text-foreground-600/50 mt-1 text-right">Max 500 characters</p>
                  </div>
                  <button
                    type="submit"
                    className="w-full bg-accent-500 hover:bg-accent-400 text-foreground-950 font-heading text-xs tracking-[0.15em] uppercase py-3 border border-accent-500 rounded-[2px] transition-all duration-300 hover:shadow-[0_0_15px_rgba(176,141,87,0.3)]"
                  >
                    Send Message
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </PageLayout>
  );
}