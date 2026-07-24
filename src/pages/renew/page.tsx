import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import PageLayout from '@/components/feature/PageLayout';
import { useCart } from '@/context/CartContext';

interface RenewalItem {
  sku: string;
  name: string;
  quantity: number;
  unit_price: number;
  discounted_price: number;
}

interface RenewalDetails {
  subscription_id: number;
  status: string;
  customer_name: string;
  customer_email: string;
  items: RenewalItem[];
  interval_days: number;
  discount_pct: number;
  subtotal: number;
  next_renewal: string;
  wc_order_id: number | null;
}

const WP_URL = import.meta.env.VITE_WC_URL || 'https://db.vintagepeptides.com';

export default function RenewPage() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const { addItem, clearCart } = useCart();

  const [details, setDetails] = useState<RenewalDetails | null>(null);
  const [error, setError]     = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding]   = useState(false);

  const sub   = params.get('sub');
  const token = params.get('token');
  const exp   = params.get('exp');

  useEffect(() => {
    if (!sub || !token || !exp) {
      setError('Invalid renewal link — missing parameters.');
      setLoading(false);
      return;
    }
    const url = `${WP_URL}/wp-json/msv-subs/v1/renewal?sub=${sub}&token=${encodeURIComponent(token)}&exp=${exp}`;
    fetch(url)
      .then((r) => {
        if (!r.ok) return r.json().then((e) => Promise.reject(e.message || 'Invalid or expired link.'));
        return r.json();
      })
      .then((data: RenewalDetails) => {
        if (data.status === 'cancelled') {
          setError('This subscription has been cancelled.');
        } else {
          setDetails(data);
        }
      })
      .catch((msg) => setError(typeof msg === 'string' ? msg : 'Could not load renewal details.'))
      .finally(() => setLoading(false));
  }, [sub, token, exp]);

  function handleProceed() {
    if (!details) return;
    setAdding(true);
    clearCart();
    details.items.forEach((item) => {
      addItem({
        id: `sub-${details.subscription_id}-${item.sku}`,
        name: item.name,
        peptideCode: item.sku,
        price: item.discounted_price,
        dosage: '',
        subscribeInterval: details.interval_days as 30 | 60 | 90 | 180,
        subscriptionDiscountPct: details.discount_pct,
      });
      // Set quantity > 1 if needed — addItem adds 1 per call
      for (let q = 1; q < item.quantity; q++) {
        addItem({
          id: `sub-${details.subscription_id}-${item.sku}`,
          name: item.name,
          peptideCode: item.sku,
          price: item.discounted_price,
          dosage: '',
        });
      }
    });
    navigate('/checkout');
  }

  return (
    <PageLayout>
      <div className="py-16 md:py-24 min-h-screen bg-[#F7F2EE]">
        <div className="relative z-10 max-w-2xl mx-auto px-4 md:px-8">
          <div className="text-center mb-10">
            <span className="text-[#B08D57] text-lg">↻</span>
            <h1 className="font-heading text-2xl md:text-3xl tracking-[0.1em] uppercase text-[#2F3430] mt-3">
              Renewal Ready
            </h1>
          </div>

          {loading && (
            <div className="text-center py-20">
              <p className="font-sans text-sm text-[#3D4E3D] animate-pulse tracking-widest uppercase">Loading your renewal…</p>
            </div>
          )}

          {error && (
            <div className="border border-red-900/20 bg-red-900/[0.03] p-6 text-center rounded-[2px]">
              <p className="font-sans text-sm text-red-900/80">{error}</p>
              <button
                onClick={() => navigate('/')}
                className="mt-4 font-sans text-[11px] tracking-[0.15em] uppercase text-[#B08D57] hover:text-[#2F3430] transition-colors"
              >
                Return to Shop →
              </button>
            </div>
          )}

          {details && (
            <div className="space-y-6">
              {/* Header info */}
              <div className="border border-[#DBD0C2] bg-white rounded-[4px] p-5">
                <p className="font-heading text-xs tracking-[0.15em] uppercase text-[#2F3430] mb-3">Subscription #{details.subscription_id}</p>
                <div className="grid grid-cols-3 gap-4 font-sans text-xs text-[#3D4E3D]">
                  <div>
                    <p className="text-[10px] uppercase tracking-wider text-[#4A5C4A] mb-1">Interval</p>
                    <p>Every {details.interval_days} days</p>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-wider text-[#4A5C4A] mb-1">Discount</p>
                    <p className="text-[#B08D57]">{details.discount_pct}% off</p>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-wider text-[#4A5C4A] mb-1">Order</p>
                    <p>#{details.wc_order_id ?? '—'}</p>
                  </div>
                </div>
              </div>

              {/* Items */}
              <div className="border border-[#DBD0C2] bg-white rounded-[4px]">
                <div className="border-b border-[#DBD0C2] px-5 py-3 bg-[#FFF8EE]/60">
                  <p className="font-heading text-[10px] tracking-[0.15em] uppercase text-[#2F3430]">Renewal Items</p>
                </div>
                {details.items.map((item, i) => (
                  <div key={i} className="flex items-center justify-between px-5 py-4 border-b border-[#DBD0C2]/60 last:border-0">
                    <div>
                      <p className="font-sans text-xs font-medium text-[#2F3430]">{item.name}</p>
                      <p className="font-sans text-[10px] text-[#4A5C4A] mt-0.5">Qty: {item.quantity}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-sans text-sm text-[#2F3430] font-bold">
                        ${(item.discounted_price * item.quantity).toFixed(2)}
                      </p>
                      <p className="font-sans text-[10px] text-[#4A5C4A]/70 line-through">
                        ${(item.unit_price * item.quantity).toFixed(2)}
                      </p>
                    </div>
                  </div>
                ))}
                <div className="flex items-center justify-between px-5 py-4 bg-[#FFF8EE]/40">
                  <p className="font-heading text-xs tracking-[0.1em] uppercase text-[#2F3430]">Total</p>
                  <p className="font-sans text-base text-[#B08D57] font-bold">
                    ${details.items.reduce((s, i) => s + i.discounted_price * i.quantity, 0).toFixed(2)}
                  </p>
                </div>
              </div>

              {/* CTA */}
              <button
                onClick={handleProceed}
                disabled={adding || details.status === 'cancelled'}
                className="w-full bg-[#2F3430] text-[#E1E4D9] font-heading text-[11px] tracking-[0.15em] uppercase py-4 rounded-[2px] hover:bg-[#B08D57] hover:text-[#2F3430] transition-all duration-300 disabled:opacity-50"
              >
                {adding ? 'Preparing Checkout…' : 'Complete Renewal →'}
              </button>

              <p className="font-sans text-[10px] text-center text-[#4A5C4A] tracking-wider">
                Your cart will be pre-filled with the items above at the subscriber rate.
              </p>
            </div>
          )}
        </div>
      </div>
    </PageLayout>
  );
}
