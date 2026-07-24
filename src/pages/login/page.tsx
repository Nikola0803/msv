import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import PageLayout from '@/components/feature/PageLayout';

// "Remember my username" — stores just the email (never the password) in
// localStorage, which persists across browser restarts unlike sessionStorage
// (used for the actual logged-in session, see msv_user elsewhere). Purely a
// convenience so a returning customer doesn't have to retype their email.
const REMEMBERED_EMAIL_KEY = 'msv_remembered_email';

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberUsername, setRememberUsername] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Prefill the email field from a previous "remember my username" login.
  useEffect(() => {
    try {
      const saved = localStorage.getItem(REMEMBERED_EMAIL_KEY);
      if (saved) {
        setEmail(saved);
        setRememberUsername(true);
      }
    } catch { /* ignore — localStorage unavailable */ }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Invalid email or password.');
        return;
      }

      // The live login response has been observed missing 'userId' and
      // 'displayName' entirely (not null/0 — the keys never arrive), while
      // 'email'/'firstName'/'lastName' from that same WP response come
      // through fine. That points at something between WordPress and the
      // browser stripping those two specific field names (a security/
      // hardening plugin or caching layer — nothing in this codebase does
      // it). The WP endpoint now also sends the same two values under
      // 'acct_ref' / 'acct_name' as a fallback — prefer the normal names,
      // fall back to the alternates if they're missing.
      const rawUserId = data.userId ?? data.acct_ref;
      const rawDisplayName = data.displayName ?? data.acct_name;

      // Normalize userId to a real number at the source — some backend
      // responses serialize WP's user ID as a numeric string ("123") rather
      // than a JSON number, which would break the Account page's strict
      // `typeof userId === 'number'` guard (same fix applied on vintage
      // peps, where this exact mismatch was bouncing logged-in customers
      // straight back to /login).
      const normalizedUserId =
        typeof rawUserId === 'number' && Number.isFinite(rawUserId)
          ? rawUserId
          : typeof rawUserId === 'string' && rawUserId.trim() !== '' && !Number.isNaN(Number(rawUserId))
          ? Number(rawUserId)
          : null;

      // Store basic user info in sessionStorage for display purposes, plus
      // the customer's assigned pricing tier (Retail/Wholesale/Affiliate/
      // Friends & Family) so useProducts() can show the right price —
      // see src/utils/pricing.ts.
      sessionStorage.setItem('msv_user', JSON.stringify({
        userId: normalizedUserId,
        email: data.email,
        displayName: rawDisplayName,
        firstName: data.firstName,
        lastName: data.lastName,
        tier: data.tier || 'retail',
        customPct: typeof data.customPct === 'number' ? data.customPct : null,
        noShipping: data.noShipping === true,
        billing: data.billing || null,
        // Self-check only — proves which vp-cms plugin build the server
        // actually ran for this login. Missing entirely = the server is
        // still running an older copy that hasn't been reinstalled yet.
        _pluginBuild: data._pluginBuild || null,
      }));

      try {
        if (rememberUsername) {
          localStorage.setItem(REMEMBERED_EMAIL_KEY, email);
        } else {
          localStorage.removeItem(REMEMBERED_EMAIL_KEY);
        }
      } catch { /* ignore — localStorage unavailable */ }

      navigate('/account');
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <PageLayout>
      <div className="py-16 md:py-24 grain-overlay">
        <div className="relative z-10 max-w-md mx-auto px-4 md:px-8">
          <div className="text-center mb-10">
            <div className="w-16 h-16 rounded-full border-2 border-accent-500 flex items-center justify-center mx-auto mb-4 bg-foreground-950">
              <span className="font-heading text-lg text-accent-500 tracking-widest">MSV</span>
            </div>
            <h1 className="font-heading text-xl tracking-[0.2em] uppercase text-foreground-950">
              Research Access
            </h1>
            <p className="font-body text-sm italic text-foreground-600 mt-2">
              Login to access the catalog and your research order history.
            </p>
          </div>

          <div className="p-6 md:p-8 border border-secondary-500/30 bg-background-100/40">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="font-heading text-[10px] tracking-[0.2em] uppercase text-foreground-950 block mb-1.5">
                  Research Email
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-background-50 border border-secondary-500/40 py-2.5 px-3 font-body text-sm text-foreground-950 placeholder:text-foreground-600/50 focus:outline-none focus:border-accent-500 transition-colors"
                  placeholder="research@institution.edu"
                />
              </div>
              <div>
                <label className="font-heading text-[10px] tracking-[0.2em] uppercase text-foreground-950 block mb-1.5">
                  Password
                </label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-background-50 border border-secondary-500/40 py-2.5 px-3 font-body text-sm text-foreground-950 placeholder:text-foreground-600/50 focus:outline-none focus:border-accent-500 transition-colors"
                  placeholder="••••••••"
                />
              </div>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={rememberUsername}
                  onChange={(e) => setRememberUsername(e.target.checked)}
                  className="w-3.5 h-3.5 accent-[#B08D57]"
                />
                <span className="font-body text-xs text-foreground-600">Remember my username</span>
              </label>

              {error && (
                <div role="alert" className="p-3 border border-red-900/30 bg-red-900/5">
                  <p className="font-mono text-xs text-red-800">{error}</p>
                </div>
              )}

              <button
                type="submit"
                disabled={submitting}
                className={`w-full font-heading text-xs tracking-[0.2em] uppercase py-3 border transition-all duration-300 ${
                  submitting
                    ? 'bg-secondary-500/10 text-foreground-600/40 border-secondary-500/20 cursor-not-allowed'
                    : 'bg-accent-500 hover:bg-accent-400 text-foreground-950 border-accent-500 hover:shadow-[0_0_15px_rgba(184,148,42,0.3)]'
                }`}
              >
                {submitting ? (
                  <span className="inline-flex items-center justify-center gap-2">
                    <span className="w-3 h-3 border border-foreground-600/40 border-t-transparent rounded-full animate-spin" />
                    Logging in…
                  </span>
                ) : (
                  'Login'
                )}
              </button>

              <div className="text-center">
                <Link
                  to="/forgot-password"
                  className="font-body text-xs text-foreground-600 hover:text-accent-500 underline underline-offset-2 transition-colors"
                >
                  Forgot your password?
                </Link>
              </div>
            </form>

            <div className="mt-6 pt-6 border-t border-secondary-500/20 text-center">
              <p className="font-body text-xs text-foreground-600">
                Need research access?{' '}
                <Link to="/register" className="text-accent-500 hover:text-accent-500-dark underline underline-offset-2 transition-colors">
                  Request an account
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </PageLayout>
  );
}
