import { useState } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import PageLayout from '@/components/feature/PageLayout';

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const key = searchParams.get('key') || '';
  const login = searchParams.get('login') || '';

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  if (!key || !login) {
    return (
      <PageLayout>
        <div className="py-16 md:py-24 grain-overlay">
          <div className="relative z-10 max-w-md mx-auto px-4 md:px-8 text-center">
            <span className="w-12 h-12 flex items-center justify-center text-red-700/60 mx-auto mb-4">
              <i className="ri-error-warning-line text-2xl" />
            </span>
            <h1 className="font-heading text-xl tracking-[0.2em] uppercase text-foreground-950 mb-2">
              Invalid Link
            </h1>
            <p className="font-body text-sm text-foreground-600 mb-6">
              This password reset link is missing or malformed.
            </p>
            <Link
              to="/forgot-password"
              className="font-heading text-[10px] tracking-[0.2em] uppercase text-accent-500 border border-accent-500/40 px-6 py-2.5 hover:bg-accent-500 hover:text-foreground-950 transition-all duration-300"
            >
              Request a New Link
            </Link>
          </div>
        </div>
      </PageLayout>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch('/api/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key, login, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Reset failed. Your link may have expired.');
        return;
      }

      setSuccess(true);
      setTimeout(() => navigate('/login'), 3000);
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
              Set New Password
            </h1>
            <p className="font-body text-sm italic text-foreground-600 mt-2">
              Choose a strong password for your account.
            </p>
          </div>

          <div className="p-6 md:p-8 border border-secondary-500/30 bg-background-100/40">
            {success ? (
              <div className="text-center py-6">
                <span className="w-12 h-12 flex items-center justify-center text-accent-500 mx-auto mb-4">
                  <i className="ri-check-line text-2xl" />
                </span>
                <p className="font-heading text-xs tracking-wider uppercase text-foreground-950 mb-2">
                  Password Updated
                </p>
                <p className="font-body text-xs text-foreground-600">
                  Your password has been reset. Redirecting to login…
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="font-heading text-[10px] tracking-[0.2em] uppercase text-foreground-950 block mb-1.5">
                    New Password
                  </label>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-background-50 border border-secondary-500/40 py-2.5 px-3 font-body text-sm text-foreground-950 placeholder:text-foreground-600/50 focus:outline-none focus:border-accent-500 transition-colors"
                    placeholder="Min. 8 characters"
                  />
                </div>

                <div>
                  <label className="font-heading text-[10px] tracking-[0.2em] uppercase text-foreground-950 block mb-1.5">
                    Confirm Password
                  </label>
                  <input
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full bg-background-50 border border-secondary-500/40 py-2.5 px-3 font-body text-sm text-foreground-950 placeholder:text-foreground-600/50 focus:outline-none focus:border-accent-500 transition-colors"
                    placeholder="••••••••"
                  />
                </div>

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
                      Updating…
                    </span>
                  ) : (
                    'Reset Password'
                  )}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </PageLayout>
  );
}
