import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import PageLayout from '@/components/feature/PageLayout';

interface AccountOrder {
  found: boolean;
  invoiceId: string;
  wcOrderId: number;
  status: string;
  statusLabel: string;
  dateCreated: string;
  items: { name: string; quantity: number; total: string }[];
  total: string;
  tracking: string | null;
  carrier: string | null;
  shipDate: string | null;
  trackingUrl: string | null;
  memo: string | null;
}

interface AccountData {
  profile: {
    firstName: string;
    lastName: string;
    email: string;
    billing: {
      phone: string;
      address_1: string;
      city: string;
      state: string;
      postcode: string;
    };
  };
  orders: AccountOrder[];
}

const STATUS_ICON: Record<string, string> = {
  pending: 'ri-time-line',
  processing: 'ri-settings-3-line',
  completed: 'ri-checkbox-circle-line',
  cancelled: 'ri-close-circle-line',
  'on-hold': 'ri-pause-circle-line',
};

const STATUS_COLOR: Record<string, string> = {
  pending: 'text-amber-600',
  processing: 'text-blue-600',
  completed: 'text-green-700',
  cancelled: 'text-red-700',
  'on-hold': 'text-foreground-600',
};

export default function Account() {
  const navigate = useNavigate();
  const [displayName, setDisplayName] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [data, setData] = useState<AccountData | null>(null);
  // Set only when we have SOME session data but can't extract a usable
  // account ID from it — surfaced on-screen (instead of a silent redirect
  // to /login) so this is diagnosable from a screenshot. A guest with no
  // session at all still redirects normally below.
  const [debugInfo, setDebugInfo] = useState<string | null>(null);

  useEffect(() => {
    let raw: string | null = null;
    try {
      raw = sessionStorage.getItem('msv_user');
    } catch {
      raw = null;
    }
    if (!raw) {
      navigate('/login');
      return;
    }
    let userId: number | null = null;
    let parseError = '';
    try {
      const user = JSON.parse(raw);
      // Accept userId as either a real number or a numeric string — some
      // backend responses serialize WP's user ID as a string ("123") rather
      // than a JSON number (123); see the same fix applied on vintage peps'
      // Account page, which was silently bouncing logged-in customers back
      // to /login over this exact mismatch.
      const rawId = user?.userId;
      if (typeof rawId === 'number' && Number.isFinite(rawId)) {
        userId = rawId;
      } else if (typeof rawId === 'string' && rawId.trim() !== '' && !Number.isNaN(Number(rawId))) {
        userId = Number(rawId);
      }
      setDisplayName(user?.displayName || [user?.firstName, user?.lastName].filter(Boolean).join(' ') || '');
    } catch (e) {
      parseError = e instanceof Error ? e.message : String(e);
      userId = null;
    }
    if (!userId) {
      setDebugInfo(
        `Session data was found, but no usable account ID could be read from it.\n\n` +
        `Raw stored session (sessionStorage['msv_user']):\n${raw}\n\n` +
        (parseError ? `JSON parse error: ${parseError}\n\n` : '') +
        `If "userId" above is missing entirely, blank, or 0, the login response from the server never included it — the fix needs to happen in the login API response, not this page.`
      );
      setLoading(false);
      return;
    }

    fetch(`/api/track-order?userId=${encodeURIComponent(userId)}`)
      .then(async (res) => {
        if (!res.ok) {
          const j = await res.json().catch(() => ({}));
          throw new Error(`[HTTP ${res.status}] ${j.error || 'Could not load your account.'}`);
        }
        return res.json();
      })
      .then((json: AccountData) => setData(json))
      .catch((e) => setError(e instanceof Error ? e.message : 'Could not load your account.'))
      .finally(() => setLoading(false));
  }, [navigate]);

  const handleLogout = () => {
    try {
      sessionStorage.removeItem('msv_user');
    } catch {
      /* ignore */
    }
    navigate('/');
  };

  return (
    <PageLayout>
      <div className="py-12 md:py-16 grain-overlay">
        <div className="relative z-10 max-w-4xl mx-auto px-4 md:px-8">

          {/* Header */}
          <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
            <div>
              <h1 className="font-heading text-2xl md:text-3xl tracking-[0.15em] uppercase text-foreground-950">
                My Account
              </h1>
              {displayName && (
                <p className="font-body text-sm italic text-foreground-600 mt-1">Welcome back, {displayName}.</p>
              )}
            </div>
            <button
              onClick={handleLogout}
              className="font-heading text-xs tracking-[0.2em] uppercase text-foreground-600 hover:text-accent-500 border border-secondary-500/30 px-4 py-2 transition-colors"
            >
              <i className="ri-logout-box-line mr-1.5" />Log Out
            </button>
          </div>

          {loading && (
            <div className="p-10 text-center border border-secondary-500/20 bg-background-100/40">
              <span className="w-6 h-6 border-2 border-accent-500/40 border-t-accent-500 rounded-full animate-spin inline-block" />
            </div>
          )}

          {!loading && debugInfo && (
            <div className="p-6 border border-amber-600/40 bg-amber-50 text-left">
              <p className="font-heading text-xs tracking-[0.2em] uppercase text-amber-800 mb-3">
                Account Diagnostic — Please Screenshot This
              </p>
              <pre className="font-mono text-[10px] text-amber-900 whitespace-pre-wrap break-all leading-relaxed">
                {debugInfo}
              </pre>
              <div className="mt-4">
                <Link
                  to="/login"
                  className="inline-block bg-accent-500 hover:bg-accent-400 text-foreground-950 font-heading text-xs tracking-[0.2em] uppercase py-2.5 px-6 border border-accent-500 transition-colors"
                >
                  Log In Again
                </Link>
              </div>
            </div>
          )}

          {!loading && error && (
            <div className="p-6 border border-red-900/30 bg-red-900/5 text-center">
              <p className="font-mono text-xs text-red-700">{error}</p>
            </div>
          )}

          {!loading && !debugInfo && !error && data && (
            <div className="space-y-8">

              {/* Profile / address */}
              <div className="p-6 border border-secondary-500/20 bg-background-100/40">
                <h2 className="font-heading text-sm tracking-[0.2em] uppercase text-foreground-950 mb-4 flex items-center gap-3">
                  <i className="ri-user-line text-accent-500" />
                  Profile
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-3 font-body text-sm text-foreground-950">
                  <div>
                    <p className="font-heading text-[10px] tracking-[0.2em] uppercase text-foreground-600/70 mb-0.5">Name</p>
                    <p>{[data.profile.firstName, data.profile.lastName].filter(Boolean).join(' ') || '—'}</p>
                  </div>
                  <div>
                    <p className="font-heading text-[10px] tracking-[0.2em] uppercase text-foreground-600/70 mb-0.5">Email</p>
                    <p>{data.profile.email || '—'}</p>
                  </div>
                  <div>
                    <p className="font-heading text-[10px] tracking-[0.2em] uppercase text-foreground-600/70 mb-0.5">Phone</p>
                    <p>{data.profile.billing.phone || '—'}</p>
                  </div>
                  <div>
                    <p className="font-heading text-[10px] tracking-[0.2em] uppercase text-foreground-600/70 mb-0.5">Shipping Address</p>
                    <p>
                      {data.profile.billing.address_1
                        ? `${data.profile.billing.address_1}, ${data.profile.billing.city} ${data.profile.billing.state} ${data.profile.billing.postcode}`
                        : '—'}
                    </p>
                  </div>
                </div>
                <p className="font-mono text-[10px] text-foreground-600/50 mt-4">
                  Your address updates automatically the next time you check out — no need to edit it separately.
                </p>
              </div>

              {/* Orders */}
              <div>
                <h2 className="font-heading text-sm tracking-[0.2em] uppercase text-foreground-950 mb-4 flex items-center gap-3">
                  <i className="ri-file-list-3-line text-accent-500" />
                  Order History
                </h2>

                {data.orders.length === 0 ? (
                  <div className="p-8 border border-secondary-500/20 bg-background-100/40 text-center">
                    <i className="ri-shopping-bag-line text-accent-500/40 text-2xl block mb-3" />
                    <p className="font-body text-sm italic text-foreground-600 mb-4">You haven't placed an order yet.</p>
                    <Link
                      to="/shop"
                      className="inline-block bg-accent-500 hover:bg-accent-400 text-foreground-950 font-heading text-xs tracking-[0.2em] uppercase py-2.5 px-6 border border-accent-500 transition-colors"
                    >
                      Browse Products
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {data.orders.map((order) => (
                      <div key={order.wcOrderId} className="border border-secondary-500/20 bg-background-100/40 p-5">
                        <div className="flex items-start justify-between gap-4 flex-wrap mb-3">
                          <div className="flex items-center gap-3">
                            <span className={`text-xl ${STATUS_COLOR[order.status] || 'text-foreground-600'}`}>
                              <i className={STATUS_ICON[order.status] || 'ri-file-list-3-line'} />
                            </span>
                            <div>
                              <p className="font-heading text-xs tracking-[0.15em] uppercase text-foreground-950">
                                {order.statusLabel}
                              </p>
                              <p className="font-mono text-[10px] text-foreground-600/60 mt-0.5">
                                {order.invoiceId} · {new Date(order.dateCreated).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                          <span className="font-mono text-base text-accent-500 font-bold">
                            ${parseFloat(order.total).toFixed(2)}
                          </span>
                        </div>

                        <div className="space-y-1 mb-3">
                          {order.items.map((item, i) => (
                            <div key={i} className="flex justify-between text-xs font-body text-foreground-600">
                              <span>{item.name} <span className="text-foreground-600/50">×{item.quantity}</span></span>
                              <span className="font-mono">${parseFloat(item.total).toFixed(2)}</span>
                            </div>
                          ))}
                        </div>

                        {order.tracking && (
                          <div className="flex items-center gap-2 pt-3 border-t border-secondary-500/10">
                            <i className="ri-truck-line text-accent-500 text-sm" />
                            <span className="font-mono text-xs text-foreground-600">
                              {order.carrier ? `${order.carrier}: ` : ''}{order.tracking}
                            </span>
                            {order.trackingUrl && (
                              <a
                                href={order.trackingUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="ml-auto font-heading text-[10px] tracking-[0.15em] uppercase text-accent-500 hover:text-accent-400 underline underline-offset-2"
                              >
                                Track Package
                              </a>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <p className="font-mono text-[10px] text-foreground-600/40 text-center">
                Looking for an order placed as a guest?{' '}
                <Link to="/track-order" className="underline text-accent-500 hover:text-accent-400">
                  Track it by invoice number
                </Link>.
              </p>
            </div>
          )}
        </div>
      </div>
    </PageLayout>
  );
}
