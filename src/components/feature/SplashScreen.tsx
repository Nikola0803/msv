import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '@/context/CartContext';

export default function SplashScreen() {
  const navigate = useNavigate();
  const { setCouponCode } = useCart();
  const [visible, setVisible] = useState(() => !sessionStorage.getItem('msv_splash_done'));
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [mmsConsent, setMmsConsent] = useState(false);
  // "Save 15% off your first order" — a real WooCommerce coupon is issued
  // for this email on submit (see /api/first-order-coupon) and shown here
  // before the gate dismisses. The code is also stashed in CartContext so
  // it's already sitting in the checkout coupon field whenever they buy.
  const [issuedCode, setIssuedCode] = useState<string | null>(null);
  const [issuing, setIssuing] = useState(false);
  const [couponError, setCouponError] = useState('');

  if (!visible) return null;

  const complete = () => {
    sessionStorage.setItem('msv_splash_done', '1');
    window.dispatchEvent(new Event('msv_splash_complete'));
    setVisible(false);
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    sessionStorage.setItem('msv_splash_done', '1');
    if (name) localStorage.setItem('msv_lead_name', name);
    if (email) localStorage.setItem('msv_lead_email', email);
    if (phone) localStorage.setItem('msv_lead_phone', phone);
    localStorage.setItem('msv_mms_consent', mmsConsent ? '1' : '0');
    window.dispatchEvent(new Event('msv_splash_complete'));

    setIssuing(true);
    setCouponError('');
    try {
      // Merged into validate-coupon.ts (dispatches on body shape) to stay
      // under Vercel's 12-function cap — see .vercelignore.
      const res = await fetch('/api/validate-coupon', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, name }),
      });
      const data = await res.json();
      if (res.ok && data.code) {
        setIssuedCode(data.code);
        setCouponCode(data.code);
      } else {
        setCouponError(data.error ?? 'Could not issue your discount code — you can still shop, just contact us for the 15% off.');
      }
    } catch {
      setCouponError('Could not issue your discount code — you can still shop, just contact us for the 15% off.');
    } finally {
      setIssuing(false);
    }
  };

  // Returning customers landing on this full-screen splash had no way to
  // reach /login without first dismissing it via "Skip for now" — this
  // screen doesn't exist on VP at all, so there was nothing to have parity
  // with there, but a direct "Log In" path is the obvious fix here.
  const goToLogin = () => {
    complete();
    navigate('/login');
  };

  return (
    // BUG FIX 2026-07-24: `overflow-hidden` here plus no scroll/height cap on
    // the card meant that on short mobile viewports, the card's natural
    // height (logo + copy + 3 inputs + consent text + button + skip/login
    // links) exceeded the screen with NO way to scroll to the rest of it —
    // too big, couldn't resize, no way to reach "Skip for now". Switching to
    // `overflow-y-auto` here and capping+scrolling the card itself fixes it.
    <div className="fixed inset-0 z-[200] flex items-center justify-center overflow-y-auto bg-[#2F3430] py-8">
      {/* Background glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#B08D57]/6 rounded-full blur-[120px]" />
      </div>

      {/* Corner accents */}
      <div className="absolute top-6 left-6 w-12 h-12 border-t border-l border-[#B08D57]/30" />
      <div className="absolute top-6 right-6 w-12 h-12 border-t border-r border-[#B08D57]/30" />
      <div className="absolute bottom-6 left-6 w-12 h-12 border-b border-l border-[#B08D57]/30" />
      <div className="absolute bottom-6 right-6 w-12 h-12 border-b border-r border-[#B08D57]/30" />

      {/* Card */}
      <div className="relative w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto my-auto transition-all duration-300">
        {/* Logo mark */}
        <div className="flex justify-center mb-8">
          <div className="w-20 h-20 rounded-full border-2 border-[#B08D57] flex items-center justify-center bg-[#1a1f1c]">
            <span className="font-heading text-xl text-[#B08D57] tracking-[0.15em] font-semibold">MSV</span>
          </div>
        </div>

        {issuedCode ? (
          <div className="text-center">
            <p className="font-sans text-[10px] uppercase tracking-[0.25em] text-[#B08D57] mb-3">You're in!</p>
            <span className="text-[#B08D57] text-base block mb-5">✦</span>
            <p className="font-sans text-sm text-[#DBD0C2] leading-relaxed mb-5 font-light px-4">
              Here's your 15% off code — it's already filled in at checkout, but save it just in case.
            </p>
            <code className="block w-full bg-[#1a1f1c] border border-[#B08D57]/40 text-[#B08D57] font-sans text-base tracking-[0.15em] px-4 py-3.5 mb-6 rounded-[2px]">
              {issuedCode}
            </code>
            <button
              type="button"
              onClick={complete}
              className="w-full bg-[#B08D57] hover:bg-[#c49a5e] text-[#2F3430] font-sans text-xs tracking-[0.2em] uppercase py-3.5 rounded-[2px] transition-colors font-semibold"
            >
              Start Shopping →
            </button>
          </div>
        ) : (
        <form onSubmit={handleSignup} className="text-center">
            <p className="font-sans text-[10px] uppercase tracking-[0.25em] text-[#B08D57] mb-3">Welcome</p>
            <span className="text-[#B08D57] text-base block mb-5">✦</span>
            <p className="font-sans text-sm text-[#DBD0C2] leading-relaxed mb-8 font-light px-4">
              Save 15% off your first order — plus stay ahead of new arrivals and exclusive research insights.
            </p>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name"
              autoFocus
              className="w-full bg-[#1a1f1c] border border-[#B08D57]/30 text-[#E1E4D9] font-sans text-sm px-4 py-3.5 mb-3 focus:outline-none focus:border-[#B08D57] placeholder:text-[#DBD0C2]/30 rounded-[2px]"
            />
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Your email address"
              className="w-full bg-[#1a1f1c] border border-[#B08D57]/30 text-[#E1E4D9] font-sans text-sm px-4 py-3.5 mb-3 focus:outline-none focus:border-[#B08D57] placeholder:text-[#DBD0C2]/30 rounded-[2px]"
            />
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="Phone (optional)"
              className="w-full bg-[#1a1f1c] border border-[#B08D57]/30 text-[#E1E4D9] font-sans text-sm px-4 py-3.5 mb-3 focus:outline-none focus:border-[#B08D57] placeholder:text-[#DBD0C2]/30 rounded-[2px]"
            />
            {phone && (
              <label className="flex items-start gap-2.5 mb-4 text-left cursor-pointer">
                <input
                  type="checkbox"
                  checked={mmsConsent}
                  onChange={(e) => setMmsConsent(e.target.checked)}
                  className="mt-0.5 w-3.5 h-3.5 accent-[#B08D57] flex-shrink-0"
                />
                <span className="font-sans text-[11px] text-[#DBD0C2]/60 leading-relaxed">
                  By checking this box, you agree to receive text messages from My Secret Vitality at the number provided. Consent is not a condition to purchase. Message frequency varies. Message and data rates may apply. Reply STOP to cancel or HELP for help. View our{' '}
                  <a href="/privacy-policy" className="underline">Privacy Policy</a> and{' '}
                  <a href="/terms-of-service" className="underline">Terms of Service</a>.
                </span>
              </label>
            )}
            {couponError && (
              <p className="font-sans text-[11px] text-red-400 mb-3">{couponError}</p>
            )}
            <button
              type="submit"
              disabled={issuing}
              className="w-full bg-[#B08D57] hover:bg-[#c49a5e] text-[#2F3430] font-sans text-xs tracking-[0.2em] uppercase py-3.5 rounded-[2px] transition-colors font-semibold mb-4 disabled:opacity-60"
            >
              {issuing ? 'Getting your code…' : 'Save 15% →'}
            </button>
            <button
              type="button"
              onClick={complete}
              className="font-sans text-[10px] text-[#DBD0C2]/40 hover:text-[#DBD0C2]/70 transition-colors tracking-wider"
            >
              Skip for now →
            </button>
            <p className="font-sans text-[11px] text-[#DBD0C2]/50 mt-4">
              Already have an account?{' '}
              <button
                type="button"
                onClick={goToLogin}
                className="text-[#B08D57] hover:text-[#c49a5e] underline underline-offset-2 transition-colors"
              >
                Log in
              </button>
            </p>
          </form>
        )}
      </div>
    </div>
  );
}
