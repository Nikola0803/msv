import { useState } from 'react';

const PASSWORD = import.meta.env.VITE_LAUNCH_PASSWORD || 'msv2026';

export default function SplashScreen() {
  const [visible, setVisible] = useState(() => !sessionStorage.getItem('msv_splash_done'));
  const [stage, setStage] = useState<'password' | 'signup'>('password');
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [shake, setShake] = useState(false);
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');

  if (!visible) return null;

  const handlePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (code === PASSWORD) {
      setError('');
      setStage('signup');
    } else {
      setError('Invalid access code. Please try again.');
      setShake(true);
      setTimeout(() => setShake(false), 600);
    }
  };

  const complete = () => {
    sessionStorage.setItem('msv_splash_done', '1');
    if (email) localStorage.setItem('msv_lead_email', email);
    if (phone) localStorage.setItem('msv_lead_phone', phone);
    window.dispatchEvent(new Event('msv_splash_complete'));
    setVisible(false);
  };

  const handleSignup = (e: React.FormEvent) => {
    e.preventDefault();
    complete();
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-[#2F3430] overflow-hidden">
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
      <div
        className="relative w-full max-w-md mx-4 transition-all duration-300"
        style={shake ? { animation: 'shake 0.4s ease-in-out' } : {}}
      >
        <style>{`
          @keyframes shake {
            0%, 100% { transform: translateX(0); }
            20% { transform: translateX(-8px); }
            40% { transform: translateX(8px); }
            60% { transform: translateX(-6px); }
            80% { transform: translateX(6px); }
          }
        `}</style>

        {/* Logo mark */}
        <div className="flex justify-center mb-8">
          <div className="w-20 h-20 rounded-full border-2 border-[#B08D57] flex items-center justify-center bg-[#1a1f1c]">
            <span className="font-heading text-xl text-[#B08D57] tracking-[0.15em] font-semibold">MSV</span>
          </div>
        </div>

        {stage === 'password' ? (
          <form onSubmit={handlePassword} className="text-center">
            <p className="font-sans text-[10px] uppercase tracking-[0.25em] text-[#B08D57] mb-3">Private Access</p>
            <span className="text-[#B08D57] text-base block mb-5">✦</span>
            <p className="font-sans text-sm text-[#DBD0C2] leading-relaxed mb-8 font-light px-4">
              My Secret Vitality is an exclusive research compound supplier. Enter your access code to continue.
            </p>
            <input
              type="password"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="Enter access code"
              autoFocus
              className="w-full bg-[#1a1f1c] border border-[#B08D57]/30 text-[#E1E4D9] font-sans text-sm px-4 py-3.5 mb-3 focus:outline-none focus:border-[#B08D57] placeholder:text-[#DBD0C2]/30 tracking-[0.1em] rounded-[2px]"
            />
            {error && (
              <p className="font-sans text-xs text-red-400 mb-3">{error}</p>
            )}
            <button
              type="submit"
              className="w-full bg-[#B08D57] hover:bg-[#c49a5e] text-[#2F3430] font-sans text-xs tracking-[0.2em] uppercase py-3.5 rounded-[2px] transition-colors font-semibold mb-6"
            >
              Enter →
            </button>
            <p className="font-sans text-[10px] text-[#DBD0C2]/40 font-light">
              Don't have a code?{' '}
              <a href="mailto:help@mysecretvitality.com" className="text-[#B08D57]/70 hover:text-[#B08D57] transition-colors underline underline-offset-2">
                Contact us
              </a>
            </p>
          </form>
        ) : (
          <form onSubmit={handleSignup} className="text-center">
            <p className="font-sans text-[10px] uppercase tracking-[0.25em] text-[#B08D57] mb-3">Welcome</p>
            <span className="text-[#B08D57] text-base block mb-5">✦</span>
            <p className="font-sans text-sm text-[#DBD0C2] leading-relaxed mb-8 font-light px-4">
              Stay ahead of new arrivals and exclusive research insights.
            </p>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Your email address"
              autoFocus
              className="w-full bg-[#1a1f1c] border border-[#B08D57]/30 text-[#E1E4D9] font-sans text-sm px-4 py-3.5 mb-3 focus:outline-none focus:border-[#B08D57] placeholder:text-[#DBD0C2]/30 rounded-[2px]"
            />
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="Phone (optional)"
              className="w-full bg-[#1a1f1c] border border-[#B08D57]/30 text-[#E1E4D9] font-sans text-sm px-4 py-3.5 mb-3 focus:outline-none focus:border-[#B08D57] placeholder:text-[#DBD0C2]/30 rounded-[2px]"
            />
            <button
              type="submit"
              className="w-full bg-[#B08D57] hover:bg-[#c49a5e] text-[#2F3430] font-sans text-xs tracking-[0.2em] uppercase py-3.5 rounded-[2px] transition-colors font-semibold mb-4"
            >
              Continue →
            </button>
            <button
              type="button"
              onClick={complete}
              className="font-sans text-[10px] text-[#DBD0C2]/40 hover:text-[#DBD0C2]/70 transition-colors tracking-wider"
            >
              Skip for now →
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
