import { useState } from 'react';
import { Link } from 'react-router-dom';
import { MsvLogo } from '@/components/MsvLogo';
import { useSections } from '@/context/SectionsContext';

function FooterLogo() {
  const [useSvg, setUseSvg] = useState(false);
  if (useSvg) return <MsvLogo width={140} theme="dark" />;
  return (
    <img
      src="/logo-transparent.png"
      alt="My Secret Vitality"
      className="w-36 object-contain"
      onError={() => setUseSvg(true)}
    />
  );
}

const shopLinks = [
  { label: 'All Products', href: '/shop' },
  { label: 'Peptides', href: '/shop' },
  { label: 'New Arrivals', href: '/shop' },
  { label: 'Best Sellers', href: '/shop' },
];

const companyLinks = [
  { label: 'Quality Promise', href: '/about' },
  { label: 'Veterans & First Responders', href: '/veterans' },
  { label: 'Return Policy', href: '/return-policy' },
  { label: 'Privacy', href: '/privacy-policy' },
  { label: 'Contact', href: '/contact' },
];

const learnLinks = [
  { label: 'Peptide Guide', href: '/faqs' },
  { label: 'Research', href: '/blog' },
  { label: 'Wellness Journal', href: '/blog' },
  { label: 'FAQ', href: '/faqs' },
];

export default function Footer() {
  const { sections } = useSections();
  const s = sections.footer;

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="bg-[#2F3430] text-[#E1E4D9]">
      <div className="max-w-7xl mx-auto px-4 md:px-6 pt-16 pb-8">
        {/* Top row: logo + tagline */}
        <div className="flex flex-col items-center mb-12">
          <FooterLogo />
        </div>

        {/* Link columns */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 mb-12">
          <div>
            <h4 className="font-sans text-[10px] uppercase tracking-[0.1em] text-[#DBD0C2] mb-4 font-normal">
              SHOP
            </h4>
            <ul className="space-y-2.5">
              {shopLinks.map((link) => (
                <li key={link.label}>
                  <Link
                    to={link.href}
                    className="font-sans text-[10px] uppercase tracking-[0.1em] text-[#DBD0C2]/70 hover:text-[#B08D57] transition-colors font-light"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-sans text-[10px] uppercase tracking-[0.1em] text-[#DBD0C2] mb-4 font-normal">
              COMPANY
            </h4>
            <ul className="space-y-2.5">
              {companyLinks.map((link) => (
                <li key={link.label}>
                  <Link
                    to={link.href}
                    className="font-sans text-[10px] uppercase tracking-[0.1em] text-[#DBD0C2]/70 hover:text-[#B08D57] transition-colors font-light"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-sans text-[10px] uppercase tracking-[0.1em] text-[#DBD0C2] mb-4 font-normal">
              LEARN
            </h4>
            <ul className="space-y-2.5">
              {learnLinks.map((link) => (
                <li key={link.label}>
                  <Link
                    to={link.href}
                    className="font-sans text-[10px] uppercase tracking-[0.1em] text-[#DBD0C2]/70 hover:text-[#B08D57] transition-colors font-light"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Social icons */}
        <div className="flex items-center justify-center gap-6 mb-10">
          <a href={s.instagram_url} target="_blank" rel="nofollow" className="w-8 h-8 flex items-center justify-center text-[#DBD0C2]/60 hover:text-[#B08D57] transition-colors" aria-label="Instagram">
            <i className="ri-instagram-line" />
          </a>
          <a href={s.facebook_url} target="_blank" rel="nofollow" className="w-8 h-8 flex items-center justify-center text-[#DBD0C2]/60 hover:text-[#B08D57] transition-colors" aria-label="Facebook">
            <i className="ri-facebook-line" />
          </a>
          <a href={`mailto:${s.email}`} className="w-8 h-8 flex items-center justify-center text-[#DBD0C2]/60 hover:text-[#B08D57] transition-colors" aria-label="Email">
            <i className="ri-mail-line" />
          </a>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-[#DBD0C2]/10 pt-6">
          <p className="font-sans text-[10px] text-[#8E9A8A] text-center mb-3 font-normal tracking-[0.05em]">
            RESEARCH USE ONLY | NOT FOR HUMAN USE
          </p>

          <p className="font-sans text-[10px] text-[#7A8A76] text-center font-light">
            {s.copyright}
          </p>

          {/* Back to top */}
          <div className="flex justify-center mt-6">
            <button
              onClick={scrollToTop}
              className="font-heading italic text-xs text-[#B08D57] hover:text-[#DBD0C2] transition-colors cursor-pointer"
            >
              Back to top ↑
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}