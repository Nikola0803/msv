import { useState } from 'react';
import { useSections } from '@/context/SectionsContext';

export default function Newsletter() {
  const { sections } = useSections();
  const s = sections.newsletter;
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setLoading(true);
    try {
      const formData = new URLSearchParams();
      formData.append('email', email.trim());

      await fetch('https://readdy.ai/api/form/d8lhiqrakrl89656lncg', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: formData.toString(),
      });

      setSubmitted(true);
      setEmail('');
    } catch {
      // Still show success for demo
      setSubmitted(true);
      setEmail('');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="py-16 md:py-20 bg-[#E1E4D9]" id="newsletter">
      <div className="max-w-2xl mx-auto px-4 md:px-6 text-center">
        <h2 className="font-heading italic text-[30px] md:text-[34px] text-[#2F3430] mb-3 font-light">
          {s.headline}
        </h2>

        <p className="font-sans text-[13px] text-[#3D4E3D] mb-8 font-light">
          {s.tagline}
        </p>

        {submitted ? (
          <div className="p-6 border border-[#B08D57] bg-white rounded-[4px]">
            <span className="w-10 h-10 flex items-center justify-center text-[#B08D57] mx-auto mb-3">
              <i className="ri-check-line text-2xl" />
            </span>
            <p className="font-heading text-sm tracking-[0.1em] uppercase text-[#2F3430] font-semibold">
              {s.success_heading}
            </p>
            <p className="font-sans text-xs text-[#3D4E3D] mt-2 font-light">
              {s.success_body}
            </p>
          </div>
        ) : (
          <form
            onSubmit={handleSubmit}
            data-readdy-form
            className="flex flex-col sm:flex-row gap-3 max-w-lg mx-auto"
          >
            <input
              type="email"
              name="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={s.placeholder}
              required
              className="flex-1 bg-white border border-[#DBD0C2] py-3 px-4 font-sans text-[13px] text-[#2F3430] placeholder:text-[#3D4E3D] focus:outline-none focus:border-[#B08D57] rounded-[2px] transition-colors font-light"
            />
            <button
              type="submit"
              disabled={loading}
              className="bg-[#8E9A8A] text-[#E1E4D9] font-sans text-[10px] uppercase tracking-[0.14em] px-8 py-3 rounded-[2px] hover:bg-[#7a8677] transition-colors whitespace-nowrap disabled:opacity-60 font-medium"
            >
              {loading ? 'Subscribing...' : s.submit_label}
            </button>
          </form>
        )}

        <p className="font-sans text-[10px] text-[#3D4E3D]/60 mt-4 font-light">
          {s.disclaimer}
        </p>
      </div>
    </section>
  );
}