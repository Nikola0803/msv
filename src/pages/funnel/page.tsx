import { useState } from 'react';
import { Link } from 'react-router-dom';

export default function FunnelPage() {
  const [formStatus, setFormStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    interest: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    if (errors[e.target.name]) {
      setErrors((prev) => { const n = { ...prev }; delete n[e.target.name]; return n; });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};
    if (!formData.name.trim()) newErrors.name = 'Please enter your name';
    if (!formData.email.trim()) {
      newErrors.email = 'Please enter your email';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    setFormStatus('submitting');
    const form = e.target as HTMLFormElement;
    const data = new URLSearchParams();
    data.append('name', formData.name.trim());
    data.append('email', formData.email.trim());
    if (formData.phone.trim()) data.append('phone', formData.phone.trim());
    if (formData.interest) data.append('interest', formData.interest);

    fetch('https://readdy.ai/api/form/d8eupivejtnocflsnmv0', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: data.toString(),
    })
      .then((res) => {
        if (res.ok) {
          setFormStatus('success');
          setFormData({ name: '', email: '', phone: '', interest: '' });
        } else {
          setFormStatus('error');
        }
      })
      .catch(() => setFormStatus('error'));
  };

  return (
    <div className="min-h-screen">
      {/* ===== HERO: Dark dramatic with form as the center ===== */}
      <section className="relative min-h-screen bg-gradient-to-br from-foreground-900 via-foreground-950 to-foreground-950 overflow-hidden">
        <div className="absolute inset-0 distressed-overlay opacity-40" />
        <div className="absolute inset-0 vignette-overlay" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-accent-500/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 left-0 w-72 h-72 bg-accent-500/3 rounded-full blur-[100px]" />

        <div className="relative z-10 max-w-7xl mx-auto px-4 md:px-8 py-16 md:py-24">
          <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-16">
            {/* LEFT: Copy */}
            <div className="flex-1 text-center lg:text-left max-w-xl">
              {/* Urgency strip */}
              <div className="inline-flex items-center gap-2 bg-accent-500/10 border border-secondary-500/40 px-4 py-2 mb-8">
                <span className="w-2 h-2 bg-accent-500 rounded-full animate-pulse" />
                <span className="font-mono text-[11px] tracking-wider text-accent-500 uppercase">
                  Limited Access — New Batches Weekly
                </span>
              </div>

              <div className="mb-4">
                <span className="text-accent-500 text-xl">✦</span>
              </div>

              <p className="font-heading text-xs md:text-sm tracking-[0.35em] uppercase text-accent-500 mb-4 text-shadow-accent">
                My Secret Vitality Research Access
              </p>

              <h1 className="font-heading text-4xl md:text-5xl lg:text-6xl tracking-[0.1em] uppercase text-background-50 leading-[1.1] mb-5 text-shadow-dark">
                Unlock Our
                <br />
                <span className="text-accent-500 italic normal-case tracking-normal text-3xl md:text-4xl lg:text-5xl">
                  research catalog
                </span>
              </h1>

              <p className="font-body text-base md:text-lg italic text-background-50/80 max-w-lg leading-relaxed mb-8">
                Join our research community for first access to new peptide releases, exclusive batch pricing, and our private COA library.
              </p>

              {/* Trust badge row */}
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 md:gap-6 mb-8">
                <div className="flex items-center gap-2">
                  <span className="w-4 h-4 flex items-center justify-center text-accent-500 text-xs">
                    <i className="ri-shield-check-line" />
                  </span>
                  <span className="font-heading text-[10px] tracking-[0.2em] uppercase text-background-50/70">99%+ Purity</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-4 h-4 flex items-center justify-center text-accent-500 text-xs">
                    <i className="ri-flask-line" />
                  </span>
                  <span className="font-heading text-[10px] tracking-[0.2em] uppercase text-background-50/70">USA Lab</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-4 h-4 flex items-center justify-center text-accent-500 text-xs">
                    <i className="ri-file-list-3-line" />
                  </span>
                  <span className="font-heading text-[10px] tracking-[0.2em] uppercase text-background-50/70">Batch COA</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-4 h-4 flex items-center justify-center text-accent-500 text-xs">
                    <i className="ri-lock-line" />
                  </span>
                  <span className="font-heading text-[10px] tracking-[0.2em] uppercase text-background-50/70">Private Access</span>
                </div>
              </div>

              {/* Social proof numbers */}
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-6 md:gap-10 border-t border-cream/10 pt-6">
                <div className="text-center lg:text-left">
                  <p className="font-mono text-xl md:text-2xl text-accent-500 font-bold">12,847</p>
                  <p className="font-heading text-[10px] tracking-[0.2em] uppercase text-background-50/50 mt-1">Researchers</p>
                </div>
                <div className="text-center lg:text-left">
                  <p className="font-mono text-xl md:text-2xl text-accent-500 font-bold">4.8</p>
                  <p className="font-heading text-[10px] tracking-[0.2em] uppercase text-background-50/50 mt-1">Avg Rating</p>
                </div>
                <div className="text-center lg:text-left">
                  <p className="font-mono text-xl md:text-2xl text-accent-500 font-bold">99.2%</p>
                  <p className="font-heading text-[10px] tracking-[0.2em] uppercase text-background-50/50 mt-1">Avg Purity</p>
                </div>
              </div>
            </div>

            {/* RIGHT: Lead Capture Form */}
            <div className="w-full lg:w-[440px] xl:w-[480px] flex-shrink-0">
              <div className="relative bg-foreground-950 border border-secondary-500/40 p-6 md:p-8 shadow-2xl shadow-black/40">
                {/* Brass corner accents */}
                <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-accent-500" />
                <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-accent-500" />
                <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-accent-500" />
                <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-accent-500" />

                {formStatus === 'success' ? (
                  <div className="text-center py-8">
                    <div className="w-16 h-16 rounded-full bg-accent-500/20 border-2 border-accent-500 flex items-center justify-center mx-auto mb-6">
                      <i className="ri-check-line text-2xl text-accent-500" />
                    </div>
                    <h3 className="font-heading text-xl tracking-[0.15em] uppercase text-background-50 mb-3">
                      Access Granted
                    </h3>
                    <p className="font-body text-sm text-background-50/70 leading-relaxed mb-4">
                      Welcome to the inner circle. Check your inbox for your private catalog link and first-access pricing.
                    </p>
                    <p className="font-mono text-xs text-accent-500/70">
                      Please allow 5-10 minutes for delivery.
                    </p>
                  </div>
                ) : (
                  <>
                    <h3 className="font-heading text-lg tracking-[0.15em] uppercase text-background-50 mb-2 text-center">
                      Request Access
                    </h3>
                    <p className="font-body text-sm text-background-50/60 text-center mb-6">
                      Fill in your details below. We review each request within 24 hours.
                    </p>

                    <form
                      id="lead-capture"
                      data-readdy-form
                      onSubmit={handleSubmit}
                      className="space-y-4"
                    >
                      <div>
                        <label htmlFor="funnel-name" className="block font-heading text-[10px] tracking-[0.2em] uppercase text-accent-500 mb-1.5">
                          Full Name <span className="text-background-50/40">*</span>
                        </label>
                        <input
                          id="funnel-name"
                          name="name"
                          type="text"
                          value={formData.name}
                          onChange={handleChange}
                          placeholder="Dr. Jane Smith"
                          className="w-full bg-background-100/5 border border-background-50/20 text-background-50 font-body text-sm px-4 py-3 placeholder:text-background-50/30 focus:outline-none focus:border-accent-500/60 transition-colors"
                        />
                        {errors.name && <p className="font-body text-xs text-red-400 mt-1">{errors.name}</p>}
                      </div>

                      <div>
                        <label htmlFor="funnel-email" className="block font-heading text-[10px] tracking-[0.2em] uppercase text-accent-500 mb-1.5">
                          Email Address <span className="text-background-50/40">*</span>
                        </label>
                        <input
                          id="funnel-email"
                          name="email"
                          type="email"
                          value={formData.email}
                          onChange={handleChange}
                          placeholder="jane@institution.edu"
                          className="w-full bg-background-100/5 border border-background-50/20 text-background-50 font-body text-sm px-4 py-3 placeholder:text-background-50/30 focus:outline-none focus:border-accent-500/60 transition-colors"
                        />
                        {errors.email && <p className="font-body text-xs text-red-400 mt-1">{errors.email}</p>}
                      </div>

                      <div>
                        <label htmlFor="funnel-phone" className="block font-heading text-[10px] tracking-[0.2em] uppercase text-accent-500 mb-1.5">
                          Phone Number <span className="text-background-50/40">(optional)</span>
                        </label>
                        <input
                          id="funnel-phone"
                          name="phone"
                          type="tel"
                          value={formData.phone}
                          onChange={handleChange}
                          placeholder="+1 (555) 000-0000"
                          className="w-full bg-background-100/5 border border-background-50/20 text-background-50 font-body text-sm px-4 py-3 placeholder:text-background-50/30 focus:outline-none focus:border-accent-500/60 transition-colors"
                        />
                      </div>

                      <div>
                        <label htmlFor="funnel-interest" className="block font-heading text-[10px] tracking-[0.2em] uppercase text-accent-500 mb-1.5">
                          Primary Interest
                        </label>
                        <select
                          id="funnel-interest"
                          name="interest"
                          value={formData.interest}
                          onChange={handleChange}
                          className="w-full bg-background-100/5 border border-background-50/20 text-background-50 font-body text-sm px-4 py-3 focus:outline-none focus:border-accent-500/60 transition-colors appearance-none cursor-pointer"
                        >
                          <option value="" className="bg-foreground-950 text-background-50">Select your field</option>
                          <option value="biochemistry" className="bg-foreground-950 text-background-50">Biochemistry</option>
                          <option value="pharmacology" className="bg-foreground-950 text-background-50">Pharmacology</option>
                          <option value="neuroscience" className="bg-foreground-950 text-background-50">Neuroscience</option>
                          <option value="sports-science" className="bg-foreground-950 text-background-50">Sports Science</option>
                          <option value="longevity" className="bg-foreground-950 text-background-50">Longevity Research</option>
                          <option value="other" className="bg-foreground-950 text-background-50">Other</option>
                        </select>
                      </div>

                      <button
                        type="submit"
                        disabled={formStatus === 'submitting'}
                        className="w-full bg-accent-500 hover:bg-accent-400 text-foreground-950 font-heading text-xs tracking-[0.25em] uppercase px-6 py-4 border border-accent-500 transition-all duration-300 hover:shadow-[0_0_30px_rgba(184,148,42,0.4)] whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed mt-2"
                      >
                        {formStatus === 'submitting' ? 'Submitting...' : 'Get Access Now'}
                      </button>

                      {formStatus === 'error' && (
                        <p className="font-body text-xs text-red-400 text-center">
                          Something went wrong. Please try again.
                        </p>
                      )}

                      <p className="font-body text-[11px] text-background-50/40 text-center leading-relaxed">
                        By submitting, you agree to our{' '}
                        <Link to="/privacy-policy" className="text-accent-500/60 hover:text-accent-500 transition-colors underline">
                          Privacy Policy
                        </Link>
                        . We never share your information.
                      </p>
                    </form>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== WHAT YOU GET ===== */}
      <section className="relative py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <div className="text-center mb-12 md:mb-16">
            <div className="accent-rule max-w-xs mx-auto mb-8" />
            <p className="font-heading text-xs tracking-[0.35em] uppercase text-accent-500 mb-3">
              Member Benefits
            </p>
            <h2 className="font-heading text-2xl md:text-3xl tracking-[0.1em] uppercase text-foreground-950">
              What You Get With Access
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
            {[
              {
                icon: 'ri-flask-line',
                title: 'First Batch Access',
                desc: 'New peptide releases announced to members 48 hours before public availability.',
              },
              {
                icon: 'ri-price-tag-3-line',
                title: 'Member Pricing',
                desc: 'Exclusive 15-20% off introductory pricing on all new catalog additions.',
              },
              {
                icon: 'ri-file-list-3-line',
                title: 'COA Library',
                desc: 'Download batch-specific certificates of analysis with full HPLC and mass spec data.',
              },
              {
                icon: 'ri-customer-service-2-line',
                title: 'Direct Support',
                desc: 'Priority email and phone support from our research team for protocol questions.',
              },
            ].map((item, i) => (
              <div
                key={i}
                className="bg-background-100 border border-secondary-500/20 p-6 md:p-8 text-center group hover:border-secondary-500/40 transition-all duration-300"
              >
                <div className="w-12 h-12 flex items-center justify-center mx-auto mb-4 border border-secondary-500/30 text-accent-500 text-lg group-hover:border-accent-500 group-hover:bg-accent-500/10 transition-all duration-300">
                  <i className={item.icon} />
                </div>
                <h3 className="font-heading text-sm tracking-[0.15em] uppercase text-foreground-950 mb-3">
                  {item.title}
                </h3>
                <p className="font-body text-sm text-foreground-600 leading-relaxed">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== SOCIAL PROOF / TESTIMONIALS ===== */}
      <section className="relative py-16 md:py-24 bg-foreground-950">
        <div className="absolute inset-0 distressed-overlay opacity-30" />
        <div className="relative z-10 max-w-7xl mx-auto px-4 md:px-8">
          <div className="text-center mb-12 md:mb-16">
            <div className="accent-rule max-w-xs mx-auto mb-8 border-background-50/20" />
            <p className="font-heading text-xs tracking-[0.35em] uppercase text-accent-500 mb-3">
              From the Lab
            </p>
            <h2 className="font-heading text-2xl md:text-3xl tracking-[0.1em] uppercase text-background-50">
              What Researchers Say
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
            {[
              {
                quote: 'The COA data is unmatched. I have never received such detailed batch documentation from any peptide supplier.',
                name: 'Dr. Michael Chen',
                title: 'Biochemist, Stanford University',
                rating: 5,
              },
              {
                quote: 'Member pricing saved our lab over $3,000 last quarter. The quality and consistency is exactly what we need for reproducible results.',
                name: 'Dr. Sarah Williams',
                title: 'Research Director, NeuroLab Boston',
                rating: 5,
              },
              {
                quote: 'First batch access is a game changer. We got our hands on the new GHRP-2 variant before anyone else published on it.',
                name: 'Dr. James Okonkwo',
                title: 'Pharmacology Researcher, MIT',
                rating: 5,
              },
            ].map((t, i) => (
              <div
                key={i}
                className="bg-foreground-900/50 border border-secondary-500/20 p-6 md:p-8"
              >
                <div className="flex items-center gap-1 mb-4">
                  {Array.from({ length: t.rating }).map((_, j) => (
                    <i key={j} className="ri-star-fill text-accent-500 text-xs" />
                  ))}
                </div>
                <p className="font-body text-sm italic text-background-50/80 leading-relaxed mb-6">
                  "{t.quote}"
                </p>
                <div className="border-t border-cream/10 pt-4">
                  <p className="font-heading text-xs tracking-wider uppercase text-background-50">
                    {t.name}
                  </p>
                  <p className="font-body text-xs text-background-50/50 mt-1">
                    {t.title}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== FAQ ===== */}
      <section className="relative py-16 md:py-24">
        <div className="max-w-3xl mx-auto px-4 md:px-8">
          <div className="text-center mb-12 md:mb-16">
            <div className="accent-rule max-w-xs mx-auto mb-8" />
            <p className="font-heading text-xs tracking-[0.35em] uppercase text-accent-500 mb-3">
              Questions
            </p>
            <h2 className="font-heading text-2xl md:text-3xl tracking-[0.1em] uppercase text-foreground-950">
              Frequently Asked
            </h2>
          </div>

          <div className="space-y-4">
            {[
              {
                q: 'How long does approval take?',
                a: 'We review every application within 24 hours during business days. Most researchers are approved the same day. You will receive your private catalog link via email once approved.',
              },
              {
                q: 'Is this for human use?',
                a: 'Absolutely not. All products are strictly for laboratory research use only. We require all members to affirm they are qualified researchers aged 21 or older.',
              },
              {
                q: 'What purity do you guarantee?',
                a: 'Every batch is tested via HPLC and comes with a Certificate of Analysis. Our average batch purity is 99.2%, with a minimum guaranteed threshold of 99%.',
              },
              {
                q: 'Do you ship internationally?',
                a: 'We currently ship to the United States, Canada, and select EU countries. All shipments are discreet and temperature-controlled.',
              },
              {
                q: 'Can I cancel my membership?',
                a: 'There is no commitment or subscription. Membership is simply access to our private catalog and pricing. You can request removal at any time.',
              },
            ].map((faq, i) => (
              <div key={i} className="border border-secondary-500/20 p-5 md:p-6 bg-background-100/50">
                <h3 className="font-heading text-sm tracking-[0.15em] uppercase text-foreground-950 mb-3">
                  {faq.q}
                </h3>
                <p className="font-body text-sm text-foreground-600 leading-relaxed">
                  {faq.a}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== FINAL CTA ===== */}
      <section className="relative py-16 md:py-24 bg-foreground-950">
        <div className="absolute inset-0 distressed-overlay opacity-30" />
        <div className="relative z-10 max-w-2xl mx-auto px-4 md:px-8 text-center">
          <div className="mb-4">
            <span className="text-accent-500 text-xl">✦</span>
          </div>
          <p className="font-heading text-xs tracking-[0.35em] uppercase text-accent-500 mb-4">
            Join the Research Community
          </p>
          <h2 className="font-heading text-2xl md:text-3xl tracking-[0.1em] uppercase text-background-50 mb-6">
            Ready to Get Access?
          </h2>
          <p className="font-body text-base text-background-50/70 leading-relaxed mb-8">
            Join thousands of researchers who trust My Secret Vitality for their laboratory studies. No spam. No hassle. Just pure, tested compounds.
          </p>
          <a
            href="#lead-capture"
            className="inline-block bg-accent-500 hover:bg-accent-400 text-foreground-950 font-heading text-xs tracking-[0.25em] uppercase px-12 py-4 border border-accent-500 transition-all duration-300 hover:shadow-[0_0_30px_rgba(184,148,42,0.4)] whitespace-nowrap"
          >
            Get Access Now
          </a>
        </div>
      </section>
    </div>
  );
}