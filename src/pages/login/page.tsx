import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import PageLayout from '@/components/feature/PageLayout';

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

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

      sessionStorage.setItem('msv_user', JSON.stringify({
        userId: data.userId,
        email: data.email,
        displayName: data.displayName,
      }));

      navigate('/shop');
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

              {error && (
                <div className="p-3 border border-red-900/30 bg-red-900/5">
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
