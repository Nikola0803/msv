import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { MsvLogoMark } from '@/components/MsvLogo';
import { useCart } from '@/context/CartContext';
import { coaEntries } from '@/mocks/coa';

function NavLogo() {
  const [useSvg, setUseSvg] = useState(false);
  if (useSvg) return <MsvLogoMark size={36} />;
  return (
    <img
      src="/logo-transparent.png"
      alt="My Secret Vitality"
      className="w-9 h-9 object-contain"
      onError={() => setUseSvg(true)}
    />
  );
}

// Modal to view a COA PDF inline
function CoaModal({ url, name, onClose }: { url: string; name: string; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/70" onClick={onClose}>
      <div
        className="w-full max-w-4xl h-[90vh] bg-[#E1E4D9] border border-[#DBD0C2] shadow-2xl flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-[#DBD0C2] flex-shrink-0">
          <div>
            <p className="font-sans text-[10px] tracking-widest uppercase text-[#B08D57]">Certificate of Analysis</p>
            <p className="font-heading text-sm text-[#2F3430] mt-0.5">{name}</p>
          </div>
          <div className="flex items-center gap-2">
            <a
              href={url}
              download
              className="flex items-center gap-1.5 px-3 py-1.5 border border-[#DBD0C2] font-sans text-[10px] tracking-wider uppercase text-[#2F3430] hover:bg-[#B08D57] hover:text-[#E1E4D9] hover:border-[#B08D57] transition-colors"
            >
              <i className="ri-download-line text-xs" />
              Download
            </a>
            <button
              onClick={onClose}
              className="w-8 h-8 flex items-center justify-center text-[#7A8A76] hover:text-[#2F3430] transition-colors"
            >
              <i className="ri-close-line text-lg" />
            </button>
          </div>
        </div>
        {/* PDF viewer */}
        <iframe
          src={url}
          className="flex-1 w-full"
          title={name}
        />
      </div>
    </div>
  );
}

const navLinks = [
  { label: 'SHOP', href: '/shop' },
  { label: 'STACKS', href: '/bundles' },
  { label: 'RESEARCH', href: '/blog' },
  { label: 'LEARN', href: '/faqs' },
  { label: 'CONTACT', href: '/contact' },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [coaOpen, setCoaOpen] = useState(false);
  const [activePdf, setActivePdf] = useState<{ url: string; name: string } | null>(null);
  const coaRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const { totalItems, setIsOpen } = useCart();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close COA dropdown on outside click
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (coaRef.current && !coaRef.current.contains(e.target as Node)) {
        setCoaOpen(false);
      }
    };
    if (coaOpen) document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [coaOpen]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/shop?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchOpen(false);
      setSearchQuery('');
    }
  };

  // Group COA entries by product name for a clean list
  const uniqueProducts = Array.from(
    new Map(coaEntries.map((e) => [e.productName, e])).values()
  );

  return (
    <>
      <nav
        className={`w-full z-40 transition-all duration-300 ${
          scrolled
            ? 'fixed top-0 left-0 right-0 bg-[#2F3430] shadow-lg'
            : 'bg-[#2F3430]'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-3 flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group flex-shrink-0">
            <NavLogo />
            <span className="font-heading text-xs tracking-[0.2em] text-[#E1E4D9] uppercase hidden sm:block font-light">
              MY SECRET VITALITY
            </span>
          </Link>

          {/* Center nav links */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.label}
                to={link.href}
                className="font-sans text-[10px] tracking-[0.14em] uppercase text-[#DBD0C2] hover:text-[#B08D57] transition-colors whitespace-nowrap font-normal relative group"
              >
                {link.label}
                <span className="absolute -bottom-0.5 left-0 w-0 h-px bg-[#B08D57] transition-all duration-300 group-hover:w-full" />
              </Link>
            ))}

            {/* COA dropdown */}
            <div className="relative" ref={coaRef}>
              <button
                onClick={() => setCoaOpen(!coaOpen)}
                className="flex items-center gap-1 font-sans text-[10px] tracking-[0.14em] uppercase text-[#DBD0C2] hover:text-[#B08D57] transition-colors whitespace-nowrap font-normal relative group"
              >
                COA
                <i className={`ri-arrow-down-s-line text-xs transition-transform duration-200 ${coaOpen ? 'rotate-180' : ''}`} />
                <span className="absolute -bottom-0.5 left-0 w-0 h-px bg-[#B08D57] transition-all duration-300 group-hover:w-full" />
              </button>

              {coaOpen && (
                <div className="absolute top-full left-1/2 -translate-x-1/2 mt-3 w-72 bg-[#2F3430] border border-[#B08D57]/20 shadow-xl z-50">
                  <div className="px-4 py-3 border-b border-[#DBD0C2]/10">
                    <p className="font-sans text-[9px] tracking-widest uppercase text-[#B08D57]">Certificates of Analysis</p>
                    <p className="font-sans text-[10px] text-[#DBD0C2]/60 mt-0.5 font-light">Click any batch to view PDF</p>
                  </div>
                  <div className="max-h-72 overflow-y-auto">
                    {coaEntries.map((entry) => (
                      <button
                        key={entry.id}
                        onClick={() => {
                          setActivePdf({ url: entry.coaUrl, name: `${entry.productName} — ${entry.batchNumber}` });
                          setCoaOpen(false);
                        }}
                        className="w-full text-left px-4 py-2.5 hover:bg-[#B08D57]/10 border-b border-[#DBD0C2]/5 transition-colors group"
                      >
                        <p className="font-sans text-xs text-[#E1E4D9] group-hover:text-[#B08D57] transition-colors font-normal">{entry.productName}</p>
                        <p className="font-mono text-[9px] text-[#DBD0C2]/50 mt-0.5">{entry.batchNumber} · {entry.testDate}</p>
                      </button>
                    ))}
                  </div>
                  <div className="px-4 py-2.5 border-t border-[#DBD0C2]/10">
                    <Link
                      to="/coa"
                      onClick={() => setCoaOpen(false)}
                      className="font-sans text-[10px] tracking-wider uppercase text-[#B08D57] hover:text-[#E1E4D9] transition-colors"
                    >
                      View Full COA Archive →
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right icons */}
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSearchOpen(!searchOpen)}
              className="w-8 h-8 flex items-center justify-center text-[#DBD0C2] hover:text-[#B08D57] transition-colors cursor-pointer"
              aria-label="Search"
            >
              <i className="ri-search-line text-sm" />
            </button>

            <Link
              to="/login"
              className="w-8 h-8 md:flex items-center justify-center text-[#DBD0C2] hover:text-[#B08D57] transition-colors hidden"
              aria-label="Account"
            >
              <i className="ri-user-line text-sm" />
            </Link>

            <button
              onClick={() => totalItems > 0 ? setIsOpen(true) : navigate('/shop')}
              className="relative w-8 h-8 flex items-center justify-center text-[#DBD0C2] hover:text-[#B08D57] transition-colors cursor-pointer"
              aria-label="Cart"
            >
              <i className="ri-shopping-bag-line text-sm" />
              {totalItems > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-[#B08D57] text-[#E1E4D9] text-[9px] font-bold flex items-center justify-center rounded-[2px] font-sans">
                  {totalItems}
                </span>
              )}
            </button>

            {/* Mobile hamburger */}
            <button
              className="w-8 h-8 flex md:hidden items-center justify-center text-[#DBD0C2] hover:text-[#B08D57] transition-colors cursor-pointer"
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label="Toggle menu"
            >
              <i className={mobileOpen ? 'ri-close-line' : 'ri-menu-line'} />
            </button>
          </div>
        </div>

        {/* Search dropdown */}
        {searchOpen && (
          <div className="border-t border-[#DBD0C2]/20 bg-[#2F3430]">
            <form onSubmit={handleSearchSubmit} className="max-w-7xl mx-auto px-4 md:px-6 py-3 flex items-center gap-3">
              <span className="w-5 h-5 flex items-center justify-center text-[#B08D57] flex-shrink-0">
                <i className="ri-search-line text-sm" />
              </span>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search peptides by name, code, or CAS number..."
                autoFocus
                className="flex-1 bg-transparent font-sans text-sm text-[#E1E4D9] placeholder:text-[#DBD0C2]/50 focus:outline-none font-light"
              />
              <button
                type="submit"
                className="font-heading text-[10px] tracking-[0.14em] uppercase text-[#E1E4D9] bg-[#B08D57] px-4 py-1.5 rounded-[2px] hover:bg-[#9a7849] transition-colors whitespace-nowrap font-semibold"
              >
                Search
              </button>
              <button
                type="button"
                onClick={() => { setSearchOpen(false); setSearchQuery(''); }}
                className="w-6 h-6 flex items-center justify-center text-[#DBD0C2] hover:text-[#E1E4D9] cursor-pointer"
              >
                <i className="ri-close-line" />
              </button>
            </form>
          </div>
        )}

        {/* Mobile menu */}
        {mobileOpen && (
          <div className="md:hidden bg-[#2F3430] border-t border-[#DBD0C2]/20">
            <div className="px-4 py-4 flex flex-col gap-3">
              {navLinks.map((link) => (
                <Link
                  key={link.label}
                  to={link.href}
                  onClick={() => setMobileOpen(false)}
                  className="font-sans text-xs tracking-[0.14em] uppercase text-[#DBD0C2] hover:text-[#B08D57] transition-colors font-normal"
                >
                  {link.label}
                </Link>
              ))}
              <Link
                to="/coa"
                onClick={() => setMobileOpen(false)}
                className="font-sans text-xs tracking-[0.14em] uppercase text-[#DBD0C2] hover:text-[#B08D57] transition-colors font-normal"
              >
                COA
              </Link>
              <Link
                to="/login"
                onClick={() => setMobileOpen(false)}
                className="font-sans text-xs tracking-[0.14em] uppercase text-[#DBD0C2] hover:text-[#B08D57] transition-colors font-normal md:hidden"
              >
                ACCOUNT
              </Link>
              <button
                onClick={() => { setMobileOpen(false); setIsOpen(true); }}
                className="font-sans text-xs tracking-[0.14em] uppercase text-[#DBD0C2] hover:text-[#B08D57] transition-colors font-normal text-left flex items-center gap-2"
              >
                CART
                {totalItems > 0 && (
                  <span className="w-4 h-4 bg-[#B08D57] text-[#E1E4D9] text-[9px] font-bold flex items-center justify-center rounded-[2px]">
                    {totalItems}
                  </span>
                )}
              </button>
            </div>
          </div>
        )}
      </nav>

      {/* COA PDF modal — rendered outside nav so it's fullscreen */}
      {activePdf && (
        <CoaModal
          url={activePdf.url}
          name={activePdf.name}
          onClose={() => setActivePdf(null)}
        />
      )}
    </>
  );
}
