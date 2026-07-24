import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import PageLayout from '@/components/feature/PageLayout';
import { useCart } from '@/context/CartContext';
import { assignP2PHandle } from '@/utils/workerRotation';
import { generateMemo } from '@/utils/memo';
import { getAffiliateRef } from '@/utils/affiliate';

const ERC20_ADDRESS = '0xf751e21093e7aD4Da07039A6Cd1581132C5f03A1';
const SOLANA_ADDRESS = 'H3GvD8jnDMCWmQb5njWXfEG4rWWUnXHswcUfFo3oGEdM';

// ─── US States autocomplete — ported from VP's checkout (2026-07-21) so both
// storefronts collect state the same way, which matters here because state
// drives sales-tax calculation, not just a text label. ──────────────────────
const US_STATES = [
  { code: 'AL', name: 'Alabama' }, { code: 'AK', name: 'Alaska' },
  { code: 'AZ', name: 'Arizona' }, { code: 'AR', name: 'Arkansas' },
  { code: 'CA', name: 'California' }, { code: 'CO', name: 'Colorado' },
  { code: 'CT', name: 'Connecticut' }, { code: 'DE', name: 'Delaware' },
  { code: 'FL', name: 'Florida' }, { code: 'GA', name: 'Georgia' },
  { code: 'HI', name: 'Hawaii' }, { code: 'ID', name: 'Idaho' },
  { code: 'IL', name: 'Illinois' }, { code: 'IN', name: 'Indiana' },
  { code: 'IA', name: 'Iowa' }, { code: 'KS', name: 'Kansas' },
  { code: 'KY', name: 'Kentucky' }, { code: 'LA', name: 'Louisiana' },
  { code: 'ME', name: 'Maine' }, { code: 'MD', name: 'Maryland' },
  { code: 'MA', name: 'Massachusetts' }, { code: 'MI', name: 'Michigan' },
  { code: 'MN', name: 'Minnesota' }, { code: 'MS', name: 'Mississippi' },
  { code: 'MO', name: 'Missouri' }, { code: 'MT', name: 'Montana' },
  { code: 'NE', name: 'Nebraska' }, { code: 'NV', name: 'Nevada' },
  { code: 'NH', name: 'New Hampshire' }, { code: 'NJ', name: 'New Jersey' },
  { code: 'NM', name: 'New Mexico' }, { code: 'NY', name: 'New York' },
  { code: 'NC', name: 'North Carolina' }, { code: 'ND', name: 'North Dakota' },
  { code: 'OH', name: 'Ohio' }, { code: 'OK', name: 'Oklahoma' },
  { code: 'OR', name: 'Oregon' }, { code: 'PA', name: 'Pennsylvania' },
  { code: 'RI', name: 'Rhode Island' }, { code: 'SC', name: 'South Carolina' },
  { code: 'SD', name: 'South Dakota' }, { code: 'TN', name: 'Tennessee' },
  { code: 'TX', name: 'Texas' }, { code: 'UT', name: 'Utah' },
  { code: 'VT', name: 'Vermont' }, { code: 'VA', name: 'Virginia' },
  { code: 'WA', name: 'Washington' }, { code: 'WV', name: 'West Virginia' },
  { code: 'WI', name: 'Wisconsin' }, { code: 'WY', name: 'Wyoming' },
];

function StateAutocomplete({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState(value);
  const ref = useRef<HTMLDivElement>(null);

  const filtered = query.length === 0 ? US_STATES : US_STATES.filter(s =>
    s.name.toLowerCase().startsWith(query.toLowerCase()) ||
    s.code.toLowerCase().startsWith(query.toLowerCase())
  );

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Keep the visible text in sync when `value` changes from outside this
  // component (e.g. the logged-in customer's saved state loads a moment
  // after mount via the sessionStorage prefill effect below). Without this,
  // `query` stays stuck at whatever it was initialized to and the field
  // looks blank even though the real form state has the correct value.
  useEffect(() => {
    setQuery(value);
  }, [value]);

  function select(code: string) {
    setQuery(code);
    onChange(code);
    setOpen(false);
  }

  return (
    <div ref={ref} className="relative">
      <input
        type="text"
        required
        value={query}
        placeholder="State"
        autoComplete="off"
        onFocus={() => setOpen(true)}
        onChange={(e) => {
          const typed = e.target.value;
          setQuery(typed);
          // Resolve to a 2-letter code when user types a full name or exact code
          const match = US_STATES.find(
            s => s.code.toLowerCase() === typed.trim().toLowerCase() ||
                 s.name.toLowerCase() === typed.trim().toLowerCase()
          );
          onChange(match ? match.code : typed);
          setOpen(true);
        }}
        onBlur={() => {
          // On blur, snap query display to 2-letter code if matched
          const match = US_STATES.find(
            s => s.code.toLowerCase() === query.trim().toLowerCase() ||
                 s.name.toLowerCase() === query.trim().toLowerCase()
          );
          if (match) setQuery(match.code);
        }}
        className="w-full bg-background-50 border border-secondary-500/40 font-body text-base text-foreground-950 py-2.5 px-3 focus:outline-none focus:border-accent-500 placeholder:text-foreground-600/40"
      />
      {open && filtered.length > 0 && (
        <div className="absolute z-50 top-full left-0 right-0 max-h-48 overflow-y-auto bg-background-50 border border-secondary-500/40 border-t-0 shadow-lg">
          {filtered.map(s => (
            <button
              key={s.code}
              type="button"
              onMouseDown={() => select(s.code)}
              className="w-full text-left px-3 py-2 font-body text-sm text-foreground-950 hover:bg-accent-500/10 flex items-center gap-2"
            >
              <span className="font-mono text-xs text-accent-500 w-6">{s.code}</span>
              <span>{s.name}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

const paymentMethods = [
  {
    id: 'zelle',
    name: 'Zelle',
    description: 'Send via Zelle',
    icon: 'ri-bank-card-line',
  },
  {
    id: 'cashapp',
    name: 'Cash App',
    description: 'Send via Cash App',
    icon: 'ri-money-dollar-circle-line',
  },
  {
    id: 'venmo',
    name: 'Venmo',
    description: 'Send via Venmo',
    icon: 'ri-wallet-3-line',
  },
  {
    id: 'usdt',
    name: 'USDT (Tether)',
    description: 'USDT — ERC-20 or Solana',
    icon: 'ri-coin-line',
  },
  {
    id: 'usdc',
    name: 'USDC',
    description: 'USDC — ERC-20 or Solana',
    icon: 'ri-coin-line',
  },
  {
    id: 'bitcoin',
    name: 'Bitcoin (BTC) — Save 5% Instantly',
    description: 'Bitcoin — unique address per order. 5% discount applied automatically.',
    icon: 'ri-bit-coin-line',
  },
];

export default function CheckoutPage() {
  const navigate = useNavigate();
  const {
    items, totalPrice, clearCart,
    couponCode, setCouponCode, couponApplied, setCouponApplied,
    couponDiscount, setCouponDiscount, couponFreeShipping, setCouponFreeShipping,
  } = useCart();
  const [selectedPayment, setSelectedPayment] = useState('');
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zip: '',
    notes: '',
  });
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string>('');
  const [wcOrderId, setWcOrderId] = useState<string>('');
  const [couponError, setCouponError] = useState('');
  const [couponLoading, setCouponLoading] = useState(false);
  const [txHash, setTxHash] = useState('');
  const [guideOpen, setGuideOpen] = useState(true);

  // New state for live payment system
  const [memoCode] = useState(() => generateMemo());
  const [p2pHandle, setP2pHandle] = useState<string>('');
  const [p2pLoading, setP2pLoading] = useState(false);
  const [cryptoNetwork, setCryptoNetwork] = useState<'erc20' | 'solana'>('erc20');
  const [btcAddress, setBtcAddress] = useState<string>('');
  const [btcLoading, setBtcLoading] = useState(false);
  const [btcError, setBtcError] = useState<string>('');
  const [confirmedTotal, setConfirmedTotal] = useState(0);
  const [mmsConsent, setMmsConsent] = useState(false);
  const [showPayQR, setShowPayQR] = useState(false);
  const [noShipping, setNoShipping] = useState(false);
  const [loggedInUserId, setLoggedInUserId] = useState<number | null>(null);

  // Prefill from the logged-in customer's saved info (set at login — see
  // src/pages/login/page.tsx) so a returning customer doesn't have to
  // retype their address every time, and pick up their admin-toggled
  // No Shipping / Local Pickup flag (WooCommerce > Customer Tiers).
  useEffect(() => {
    try {
      const raw = sessionStorage.getItem('msv_user');
      if (!raw) return;
      const u = JSON.parse(raw);
      if (u?.userId) setLoggedInUserId(u.userId);
      if (u?.noShipping === true) setNoShipping(true);
      setFormData((prev) => ({
        ...prev,
        fullName: prev.fullName || [u.firstName, u.lastName].filter(Boolean).join(' ') || u.displayName || '',
        email: prev.email || u.email || '',
        phone: prev.phone || u.billing?.phone || '',
        address: prev.address || u.billing?.address_1 || '',
        city: prev.city || u.billing?.city || '',
        state: prev.state || u.billing?.state || '',
        zip: prev.zip || u.billing?.postcode || '',
      }));
    } catch { /* ignore — sessionStorage unavailable or malformed */ }
  }, []);

  // 5% instant BTC discount — matches VP/Liberty's checkout, which MSV was
  // missing entirely (2026-07-21).
  const isBtc = selectedPayment === 'bitcoin';
  const btcDiscount = isBtc ? parseFloat(((totalPrice * 5) / 100).toFixed(2)) : 0;

  const shipping = noShipping ? 0 : ((totalPrice >= 200 || couponFreeShipping) ? 0 : 15);

  // Sales tax — ported from VP's checkout (2026-07-21) so state collection
  // actually does something instead of being a free-text label. Computed
  // live off formData.state on every render (recalculates the moment the
  // customer lands on /checkout with a saved address, or the moment they
  // pick/type a state), same as VP — not gated behind any other step.
  const IDAHO_TAX_RATE = 0.06; // 6% Idaho state sales tax
  const taxableSubtotal = Math.max(0, totalPrice - couponDiscount - btcDiscount);
  const tax = formData.state.trim().toUpperCase() === 'ID'
    ? parseFloat((taxableSubtotal * IDAHO_TAX_RATE).toFixed(2))
    : 0;

  const orderTotal = Math.max(0, taxableSubtotal + shipping + tax);

  const fetchBtcAddress = async () => {
    setBtcLoading(true);
    setBtcError('');
    setBtcAddress('');
    try {
      const res = await fetch(`/api/btc?invoiceId=${memoCode}`);
      if (res.ok) {
        const data = await res.json();
        setBtcAddress(data.address);
      } else {
        let msg = `Error ${res.status}`;
        try { const j = await res.json(); msg = j.error ?? msg; } catch { /* ignore */ }
        setBtcError(msg);
      }
    } catch {
      setBtcError('Network error — please try again.');
    } finally {
      setBtcLoading(false);
    }
  };

  const handlePaymentSelect = async (methodId: string) => {
    setSelectedPayment(methodId);
    setP2pHandle('');
    setBtcAddress('');
    setBtcError('');

    if (methodId === 'cashapp' || methodId === 'venmo' || methodId === 'zelle') {
      setP2pLoading(true);
      try {
        const result = await assignP2PHandle(methodId as 'cashapp' | 'venmo' | 'zelle');
        setP2pHandle(result.handle);
      } finally {
        setP2pLoading(false);
      }
    }

    if (methodId === 'bitcoin') {
      await fetchBtcAddress();
    }
  };

  const getActiveCryptoAddress = () => {
    if (selectedPayment === 'bitcoin') return btcAddress;
    return cryptoNetwork === 'erc20' ? ERC20_ADDRESS : SOLANA_ADDRESS;
  };

  const isP2P = ['zelle', 'cashapp', 'venmo'].includes(selectedPayment);
  const isCrypto = ['bitcoin', 'usdt', 'usdc'].includes(selectedPayment);

  const getPayQRUrl = () => {
    if (selectedPayment === 'cashapp') {
      const deepLink = `https://cash.app/${p2pHandle ?? '$VVGOps'}?amount=${confirmedTotal.toFixed(2)}&note=${encodeURIComponent(memoCode)}`;
      return `https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=${encodeURIComponent(deepLink)}`;
    }
    if (selectedPayment === 'venmo') {
      const deepLink = `https://venmo.com/${(p2pHandle ?? 'VVGOps').replace('@', '')}?txn=pay&amount=${confirmedTotal.toFixed(2)}&note=${encodeURIComponent(memoCode)}`;
      return `https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=${encodeURIComponent(deepLink)}`;
    }
    return '';
  };

  if (items.length === 0 && !submitted) {
    return (
      <PageLayout>
        <div className="py-24 text-center grain-overlay">
          <div className="relative z-10 max-w-xl mx-auto px-4">
            <span className="w-12 h-12 flex items-center justify-center text-accent-500/40 mx-auto mb-4">
              <i className="ri-shopping-bag-line text-2xl" />
            </span>
            <h1 className="font-heading text-xl tracking-[0.2em] uppercase text-foreground-950 mb-3">
              Your Cart is Empty
            </h1>
            <p className="font-body text-sm italic text-foreground-600 mb-6">
              Add some research compounds to your cart before proceeding to checkout.
            </p>
            <button
              onClick={() => navigate('/shop')}
              className="bg-accent-500 hover:bg-accent-400 text-foreground-950 font-heading text-xs tracking-[0.2em] uppercase py-3 px-8 border border-accent-500 transition-all duration-300"
            >
              Browse Products
            </button>
          </div>
        </div>
      </PageLayout>
    );
  }

  if (submitted) {
    return (
      <PageLayout>
        <div className="py-24 text-center grain-overlay">
          <div className="relative z-10 max-w-xl mx-auto px-4">
            <span className="w-16 h-16 flex items-center justify-center text-accent-500 mx-auto mb-4 border border-accent-500 rounded-full">
              <i className="ri-check-line text-xl" />
            </span>
            <h1 className="font-heading text-xl tracking-[0.2em] uppercase text-foreground-950 mb-3">
              Order Submitted
            </h1>
            <p className="font-body text-sm text-foreground-600 leading-relaxed mb-2">
              Thank you for your order. We have received your request and will send a payment confirmation within 24 hours.
            </p>
            <p className="font-body text-sm text-foreground-600 leading-relaxed mb-6">
              Please complete your payment via the selected method. Your order will be processed once payment is confirmed.
            </p>
            <div className="p-4 border border-accent-500/30 bg-background-100/40 mb-6">
              <p className="font-mono text-xs text-foreground-600 mb-2">
                Order Total: <span className="text-accent-500 font-bold text-sm">${confirmedTotal.toFixed(2)}</span>
              </p>
              <p className="font-mono text-xs text-foreground-600 mb-3">
                Payment Method: <span className="text-foreground-950">{paymentMethods.find(p => p.id === selectedPayment)?.name}</span>
              </p>
              <div className="border-t border-accent-500/20 pt-3">
                <p className="font-sans text-[10px] tracking-widest uppercase text-[#B08D57] mb-1">Your Order Reference</p>
                <p className="font-mono text-lg font-bold text-foreground-950 tracking-widest">{memoCode}</p>
                {wcOrderId && (
                  <p className="font-mono text-xs text-foreground-600 mt-1">
                    WC Order: <span className="text-foreground-950 font-bold">#{wcOrderId}</span>
                  </p>
                )}
                <p className="font-body text-xs text-foreground-600/60 mt-1">
                  Include this code as the memo/note with your payment.
                </p>
              </div>
            </div>

            {/* Quick-pay deep links for Cash App / Venmo */}
            {(selectedPayment === 'cashapp' || selectedPayment === 'venmo') && (
              <div className="mb-6 space-y-3">
                <p className="font-sans text-[10px] tracking-widest uppercase text-accent-500 text-center">
                  Quick Pay
                </p>
                {selectedPayment === 'cashapp' && (
                  <a
                    href={`https://cash.app/${p2pHandle ?? '$VVGOps'}?amount=${confirmedTotal.toFixed(2)}&note=${encodeURIComponent(memoCode)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 w-full py-3 bg-[#00D54B] hover:bg-[#00bf43] text-white font-heading text-xs tracking-[0.15em] uppercase border border-[#00D54B] transition-colors"
                  >
                    <i className="ri-money-dollar-circle-line" />
                    Pay ${confirmedTotal.toFixed(2)} via Cash App
                  </a>
                )}
                {selectedPayment === 'venmo' && (
                  <a
                    href={`https://account.venmo.com/u/${(p2pHandle ?? '@VVGOps').replace('@', '')}?txn=pay&amount=${confirmedTotal.toFixed(2)}&note=${encodeURIComponent(memoCode)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 w-full py-3 bg-[#3D95CE] hover:bg-[#2e7eb5] text-white font-heading text-xs tracking-[0.15em] uppercase border border-[#3D95CE] transition-colors"
                  >
                    <i className="ri-wallet-3-line" />
                    Pay ${confirmedTotal.toFixed(2)} via Venmo
                  </a>
                )}
                {/* QR scan button — desktop users can scan with phone */}
                <button
                  onClick={() => setShowPayQR(true)}
                  className="flex items-center justify-center gap-2 w-full py-2.5 bg-foreground-950/5 hover:bg-foreground-950/10 text-foreground-600 font-heading text-xs tracking-[0.15em] uppercase border border-foreground-950/20 transition-colors"
                >
                  <i className="ri-qr-code-line" />
                  Scan QR to Pay on Phone
                </button>
                <p className="font-mono text-[9px] text-foreground-600/50 text-center">
                  Memo code pre-filled automatically · Opens app on your device
                </p>
              </div>
            )}

            {/* Crypto (BTC/USDT/USDC) payment instructions — shown on the
                confirmation screen too, not just before submit, so a
                customer who clicks straight to checkout without copying the
                address first still has a way to pay. Mirrors the pre-submit
                wallet/QR block above. */}
            {isCrypto && (
              <div className="mb-6 text-left space-y-4 p-4 border border-accent-500/30 bg-background-100/40">
                <p className="font-sans text-[10px] tracking-widest uppercase text-accent-500 text-center">
                  Complete Your Payment
                </p>
                <div>
                  <p className="font-sans text-[10px] tracking-widest uppercase text-[#B08D57] mb-2">
                    {selectedPayment === 'bitcoin'
                      ? 'Bitcoin (BTC) Address'
                      : selectedPayment === 'usdt'
                      ? `USDT — ${cryptoNetwork === 'erc20' ? 'ERC-20' : 'Solana'} Address`
                      : `USDC — ${cryptoNetwork === 'erc20' ? 'ERC-20' : 'Solana'} Address`}
                  </p>
                  <div className="flex items-center gap-2">
                    <p className="font-mono text-xs text-foreground-950 bg-background-50 border border-secondary-500/30 px-3 py-2 flex-1 break-all">
                      {getActiveCryptoAddress() || '—'}
                    </p>
                    <button
                      type="button"
                      onClick={() => navigator.clipboard?.writeText(getActiveCryptoAddress())}
                      className="w-8 h-8 flex items-center justify-center border border-secondary-500/30 hover:border-[#B08D57] text-foreground-600 hover:text-[#B08D57] transition-colors flex-shrink-0"
                      title="Copy address"
                    >
                      <i className="ri-file-copy-line text-xs" />
                    </button>
                  </div>
                </div>
                {getActiveCryptoAddress() && (
                  <div className="flex justify-center">
                    <img
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=${encodeURIComponent(getActiveCryptoAddress())}`}
                      alt="Wallet QR Code"
                      width={160}
                      height={160}
                      className="border border-[#DBD0C2] bg-white"
                    />
                  </div>
                )}
                <p className="font-mono text-[10px] text-foreground-600/60 text-center">
                  Send the exact order total (${confirmedTotal.toFixed(2)}) ·{' '}
                  {selectedPayment === 'bitcoin' ? 'Bitcoin mainnet only.' : cryptoNetwork === 'erc20' ? 'Ethereum network only.' : 'Solana network only.'}
                </p>
              </div>
            )}

            {/* QR code modal */}
            {showPayQR && (selectedPayment === 'cashapp' || selectedPayment === 'venmo') && (
              <div
                className="fixed inset-0 z-[200] flex items-center justify-center bg-black/70 backdrop-blur-sm"
                onClick={() => setShowPayQR(false)}
              >
                <div
                  className="relative bg-background-50 border border-accent-500/40 p-6 max-w-xs w-full mx-4 shadow-2xl"
                  onClick={(e) => e.stopPropagation()}
                >
                  <button
                    onClick={() => setShowPayQR(false)}
                    className="absolute top-3 right-3 text-foreground-600 hover:text-foreground-950 transition-colors"
                    aria-label="Close QR code"
                  >
                    <i className="ri-close-line text-xl" aria-hidden="true" />
                  </button>
                  <p className="font-sans text-[10px] tracking-widest uppercase text-accent-500 text-center mb-1">
                    Scan to Pay via {selectedPayment === 'cashapp' ? 'Cash App' : 'Venmo'}
                  </p>
                  <p className="font-mono text-xs text-foreground-600 text-center mb-4">
                    ${confirmedTotal.toFixed(2)} · Ref: {memoCode}
                  </p>
                  <div className="flex justify-center mb-4">
                    <img
                      src={getPayQRUrl()}
                      alt={`QR code — scan to pay $${confirmedTotal.toFixed(2)} via ${selectedPayment === 'cashapp' ? 'Cash App' : 'Venmo'}`}
                      width={200}
                      height={200}
                      className="border border-foreground-950/10 p-2 bg-white"
                    />
                  </div>
                  <p className="font-mono text-[9px] text-foreground-600/50 text-center">
                    Point your phone camera at the code · Amount &amp; memo pre-filled
                  </p>
                </div>
              </div>
            )}

            <button
              onClick={() => navigate('/shop')}
              className="bg-accent-500 hover:bg-accent-400 text-foreground-950 font-heading text-xs tracking-[0.2em] uppercase py-3 px-8 border border-accent-500 transition-all duration-300"
            >
              Continue Shopping
            </button>
          </div>
        </div>
      </PageLayout>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPayment || submitting) return;
    setSubmitting(true);
    setSubmitError('');
    try {
      const res = await fetch('/api/submit-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customer: formData,
          ...(loggedInUserId ? { userId: loggedInUserId } : {}),
          items,
          paymentMethod: selectedPayment,
          paymentMethodTitle: paymentMethods.find(p => p.id === selectedPayment)?.name ?? selectedPayment,
          memoCode,
          orderTotal,
          couponCode: couponApplied ? couponCode : undefined,
          couponDiscount: couponApplied ? couponDiscount : undefined,
          notes: formData.notes,
          txHash: txHash || undefined,
          btcAddress: selectedPayment === 'bitcoin' ? btcAddress : undefined,
          // USDT/USDC — the fixed per-network wallet address the customer was
          // shown, so the email/order-confirmation flow can include it the
          // same way it already does for BTC (see submit-order.ts).
          cryptoAddress: (selectedPayment === 'usdt' || selectedPayment === 'usdc') ? getActiveCryptoAddress() : undefined,
          cryptoToken: (selectedPayment === 'usdt' || selectedPayment === 'usdc') ? selectedPayment.toUpperCase() : undefined,
          cryptoNetwork: (selectedPayment === 'usdt' || selectedPayment === 'usdc') ? cryptoNetwork : undefined,
          // Affiliate attribution — 30-day cookie set by AffiliateTracker on ?ref= visits.
          // The vp-affiliates WP plugin reads this meta on order creation to attribute
          // a pending commission, then confirms it once the order ships (status: completed).
          affiliateRef: getAffiliateRef() || undefined,
        }),
      });
      const data = await res.json() as { order_id?: string; order_number?: string; error?: string; wc_code?: string; wc_message?: string; wc_status?: number };
      if (!res.ok || data.error) {
        const detail = data.wc_message ? ` (${data.wc_code}: ${data.wc_message})` : '';
        setSubmitError((data.error ?? 'Failed to submit order.') + detail);
        return;
      }
      setWcOrderId(String(data.order_number ?? data.order_id ?? ''));
      setConfirmedTotal(orderTotal);
      clearCart();
      setSubmitted(true);
    } catch {
      setSubmitError('Network error. Please check your connection and try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleApplyCoupon = async () => {
    const code = couponCode.trim();
    if (!code) return;
    setCouponLoading(true);
    setCouponError('');
    setCouponApplied(null);
    try {
      const res = await fetch('/api/validate-coupon', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, orderTotal: totalPrice + shipping }),
      });
      const data = await res.json() as { valid?: boolean; discount?: number; freeShipping?: boolean; error?: string };
      if (!res.ok || !data.valid) {
        setCouponError(data.error ?? 'Invalid coupon code.');
        setCouponApplied(false);
      } else {
        setCouponDiscount(data.discount ?? 0);
        setCouponFreeShipping(data.freeShipping ?? false);
        setCouponApplied(true);
      }
    } catch {
      setCouponError('Could not validate coupon. Try again.');
      setCouponApplied(false);
    } finally {
      setCouponLoading(false);
    }
  };

  // If the "Save 15% off your first order" popup on SplashScreen already
  // issued a real coupon for this shopper (stored in CartContext so it
  // survives navigation), auto-validate and apply it the first time they
  // land on checkout with items in the cart, rather than making them
  // retype a code they already "redeemed" earlier.
  useEffect(() => {
    if (couponCode && couponApplied === null && items.length > 0 && !couponLoading) {
      handleApplyCoupon();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items.length]);

  return (
    <PageLayout>
      <div className="py-8 md:py-12 grain-overlay">
        <div className="relative z-10 max-w-7xl mx-auto px-4 md:px-8">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 mb-8 font-body text-xs text-foreground-600">
            <button onClick={() => navigate('/')} className="hover:text-accent-500 transition-colors">Home</button>
            <span>/</span>
            <span className="text-foreground-950 uppercase tracking-wider">Checkout</span>
          </div>

          <h1 className="font-heading text-2xl md:text-3xl tracking-[0.15em] uppercase text-foreground-950 mb-8">
            Checkout
          </h1>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 lg:gap-12">
            {/* Left: Form */}
            <div className="lg:col-span-2">
              <form onSubmit={handleSubmit} className="space-y-8">

                {/* Checkout Guide */}
                <div className="p-5 border border-[#B08D57]/30 bg-[#B08D57]/5">
                  <button
                    type="button"
                    onClick={() => setGuideOpen(!guideOpen)}
                    className="w-full flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <span className="w-6 h-6 flex items-center justify-center text-[#B08D57] text-xs">
                        <i className="ri-information-line" />
                      </span>
                      <span className="font-heading text-xs tracking-[0.2em] uppercase text-foreground-950">How to Complete Your Order</span>
                    </div>
                    <i className={`ri-arrow-${guideOpen ? 'up' : 'down'}-s-line text-[#B08D57]`} />
                  </button>
                  {guideOpen && (
                    <div className="mt-4 space-y-3">
                      {[
                        { step: '01', text: 'Fill in your contact information and shipping address below.' },
                        { step: '02', text: 'Select your preferred payment method — Zelle, Cash App, Venmo, or Crypto.' },
                        { step: '03', text: 'For P2P payments (Zelle/Venmo/CashApp): after submitting, send the exact amount to the handle shown. Include your order number as the memo.' },
                        { step: '04', text: 'For Crypto: send to the wallet address displayed. Upload your payment screenshot and transaction hash below.' },
                        { step: '05', text: 'Your order ships once payment is confirmed, typically within 24 hours.' },
                      ].map(({ step, text }) => (
                        <div key={step} className="flex items-start gap-3">
                          <span className="font-mono text-[10px] text-[#B08D57] font-bold flex-shrink-0 mt-0.5">{step}</span>
                          <p className="font-sans text-sm text-foreground-600 leading-relaxed font-light">{step === '03' || step === '04' ? <strong className="font-medium text-foreground-950">{text.split(':')[0]}:</strong> : null}{step === '03' || step === '04' ? text.split(':').slice(1).join(':') : text}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Contact Information */}
                <div className="p-6 border border-secondary-500/20 bg-background-100/40">
                  <h2 className="font-heading text-sm tracking-[0.2em] uppercase text-foreground-950 mb-5 flex items-center gap-3">
                    <span className="w-6 h-6 flex items-center justify-center text-accent-500 text-xs">
                      <i className="ri-user-line" />
                    </span>
                    Contact Information
                  </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="font-heading text-sm tracking-[0.15em] uppercase text-foreground-600 mb-1.5 block">
                        Full Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.fullName}
                        onChange={(e) => handleChange('fullName', e.target.value)}
                        className="w-full bg-background-50 border border-secondary-500/40 font-body text-base text-foreground-950 py-2.5 px-3 focus:outline-none focus:border-accent-500 placeholder:text-foreground-600/40"
                        placeholder="Dr. Jane Smith"
                      />
                    </div>
                    <div>
                      <label className="font-heading text-sm tracking-[0.15em] uppercase text-foreground-600 mb-1.5 block">
                        Email Address *
                      </label>
                      <input
                        type="email"
                        name="email"
                        required
                        value={formData.email}
                        onChange={(e) => handleChange('email', e.target.value)}
                        className="w-full bg-background-50 border border-secondary-500/40 font-body text-base text-foreground-950 py-2.5 px-3 focus:outline-none focus:border-accent-500 placeholder:text-foreground-600/40"
                        placeholder="research@institution.edu"
                      />
                    </div>
                    <div>
                      <label className="font-heading text-sm tracking-[0.15em] uppercase text-foreground-600 mb-1.5 block">
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => handleChange('phone', e.target.value)}
                        className="w-full bg-background-50 border border-secondary-500/40 font-body text-base text-foreground-950 py-2.5 px-3 focus:outline-none focus:border-accent-500 placeholder:text-foreground-600/40"
                        placeholder="(555) 000-0000"
                      />
                      <label className="flex items-start gap-2 mt-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={mmsConsent}
                          onChange={(e) => setMmsConsent(e.target.checked)}
                          className="mt-0.5 accent-accent-500 w-3.5 h-3.5 flex-shrink-0"
                        />
                        <span className="font-body text-xs text-foreground-600/70 leading-relaxed">
                          By checking this box, you agree to receive text messages from My Secret Vitality at the number provided. Consent is not a condition to purchase. Message frequency varies. Message and data rates may apply. Reply STOP to cancel or HELP for help. View our{' '}
                          <a href="/privacy-policy" className="underline">Privacy Policy</a> and{' '}
                          <a href="/terms-of-service" className="underline">Terms of Service</a>.
                        </span>
                      </label>
                    </div>
                    <div>
                      <label className="font-heading text-sm tracking-[0.15em] uppercase text-foreground-600 mb-1.5 block">
                        Institution / Lab
                      </label>
                      <input
                        type="text"
                        className="w-full bg-background-50 border border-secondary-500/40 font-body text-base text-foreground-950 py-2.5 px-3 focus:outline-none focus:border-accent-500 placeholder:text-foreground-600/40"
                        placeholder="Boston Research Institute"
                      />
                    </div>
                  </div>
                </div>

                {/* Shipping Address */}
                <div className="p-6 border border-secondary-500/20 bg-background-100/40">
                  <h2 className="font-heading text-sm tracking-[0.2em] uppercase text-foreground-950 mb-5 flex items-center gap-3">
                    <span className="w-6 h-6 flex items-center justify-center text-accent-500 text-xs">
                      <i className="ri-truck-line" />
                    </span>
                    Shipping Address
                  </h2>
                  <div className="space-y-4">
                    <div>
                      <label className="font-heading text-sm tracking-[0.15em] uppercase text-foreground-600 mb-1.5 block">
                        Street Address *
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.address}
                        onChange={(e) => handleChange('address', e.target.value)}
                        className="w-full bg-background-50 border border-secondary-500/40 font-body text-base text-foreground-950 py-2.5 px-3 focus:outline-none focus:border-accent-500 placeholder:text-foreground-600/40"
                        placeholder="247 Research Way, Suite 400"
                      />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div>
                        <label className="font-heading text-sm tracking-[0.15em] uppercase text-foreground-600 mb-1.5 block">
                          City *
                        </label>
                        <input
                          type="text"
                          required
                          value={formData.city}
                          onChange={(e) => handleChange('city', e.target.value)}
                          className="w-full bg-background-50 border border-secondary-500/40 font-body text-base text-foreground-950 py-2.5 px-3 focus:outline-none focus:border-accent-500 placeholder:text-foreground-600/40"
                          placeholder="Boston"
                        />
                      </div>
                      <div>
                        <label className="font-heading text-sm tracking-[0.15em] uppercase text-foreground-600 mb-1.5 block">
                          State *
                        </label>
                        <StateAutocomplete value={formData.state} onChange={(v) => handleChange('state', v)} />
                      </div>
                      <div>
                        <label className="font-heading text-sm tracking-[0.15em] uppercase text-foreground-600 mb-1.5 block">
                          ZIP Code *
                        </label>
                        <input
                          type="text"
                          required
                          value={formData.zip}
                          onChange={(e) => handleChange('zip', e.target.value)}
                          className="w-full bg-background-50 border border-secondary-500/40 font-body text-base text-foreground-950 py-2.5 px-3 focus:outline-none focus:border-accent-500 placeholder:text-foreground-600/40"
                          placeholder="02118"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Payment Method */}
                <div className="p-6 border border-secondary-500/20 bg-background-100/40">
                  <h2 className="font-heading text-sm tracking-[0.2em] uppercase text-foreground-950 mb-5 flex items-center gap-3">
                    <span className="w-6 h-6 flex items-center justify-center text-accent-500 text-xs">
                      <i className="ri-secure-payment-line" />
                    </span>
                    Payment Method
                  </h2>
                  <div className="space-y-3">
                    {paymentMethods.map((method) => (
                      <button
                        key={method.id}
                        type="button"
                        onClick={() => handlePaymentSelect(method.id)}
                        className={`w-full flex items-center gap-4 p-4 border transition-all duration-300 text-left ${
                          selectedPayment === method.id
                            ? 'border-accent-500 bg-background-100/80'
                            : 'border-secondary-500/20 bg-background-100/30 hover:border-secondary-500/40'
                        }`}
                      >
                        <span className={`w-10 h-10 flex items-center justify-center text-lg ${selectedPayment === method.id ? 'text-accent-500' : 'text-foreground-600/40'}`}>
                          <i className={method.icon} />
                        </span>
                        <div className="flex-1">
                          <p className="font-heading text-xs tracking-wider uppercase text-foreground-950">
                            {method.name}
                          </p>
                          <p className="font-body text-xs text-foreground-600/70 mt-0.5">
                            {method.description}
                          </p>
                        </div>
                        <span className={`w-5 h-5 rounded-full border flex items-center justify-center flex-shrink-0 ${
                          selectedPayment === method.id ? 'border-accent-500 bg-accent-500' : 'border-accent-500/30'
                        }`}>
                          {selectedPayment === method.id && (
                            <i className="ri-check-line text-[10px] text-foreground-950" />
                          )}
                        </span>
                      </button>
                    ))}
                  </div>
                  {!selectedPayment && (
                    <p className="font-body text-sm text-red-900/70 mt-3">
                      Please select a payment method to continue.
                    </p>
                  )}
                </div>

                {/* Payment Instructions — P2P */}
                {isP2P && (
                  <div className="p-6 border border-[#B08D57]/40 bg-[#B08D57]/5 space-y-5">
                    <h3 className="font-heading text-xs tracking-[0.2em] uppercase text-foreground-950 flex items-center gap-2">
                      <i className="ri-send-plane-line text-[#B08D57]" />
                      Payment Instructions
                    </h3>

                    {/* Handle */}
                    <div>
                      <p className="font-sans text-[10px] tracking-widest uppercase text-[#B08D57] mb-2">
                        Send To
                      </p>
                      {p2pLoading ? (
                        <div className="flex items-center gap-3 bg-background-50 border border-secondary-500/30 px-3 py-2.5">
                          <div className="w-4 h-4 border-2 border-[#B08D57]/40 border-t-[#B08D57] rounded-full animate-spin flex-shrink-0" />
                          <span className="font-mono text-xs text-foreground-600/60">Assigning handle…</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <p className="font-mono text-sm font-bold text-foreground-950 bg-background-50 border border-secondary-500/30 px-3 py-2 flex-1">
                            {p2pHandle}
                          </p>
                          <button
                            type="button"
                            onClick={() => navigator.clipboard?.writeText(p2pHandle)}
                            className="w-8 h-8 flex items-center justify-center border border-secondary-500/30 hover:border-[#B08D57] text-foreground-600 hover:text-[#B08D57] transition-colors flex-shrink-0"
                            title="Copy handle"
                          >
                            <i className="ri-file-copy-line text-xs" />
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Amount */}
                    <div>
                      <p className="font-sans text-[10px] tracking-widest uppercase text-[#B08D57] mb-2">Amount to Send</p>
                      <p className="font-mono text-sm font-bold text-foreground-950 bg-background-50 border border-secondary-500/30 px-3 py-2">
                        ${orderTotal.toFixed(2)}
                      </p>
                    </div>

                    {/* Memo */}
                    <div>
                      <p className="font-sans text-[10px] tracking-widest uppercase text-[#B08D57] mb-2">Payment Memo / Reference</p>
                      <div className="flex items-center gap-2">
                        <p className="font-mono text-sm font-bold text-foreground-950 bg-background-50 border border-[#B08D57]/40 px-3 py-2 flex-1 tracking-widest">
                          {memoCode}
                        </p>
                        <button
                          type="button"
                          onClick={() => navigator.clipboard?.writeText(memoCode)}
                          className="w-8 h-8 flex items-center justify-center border border-secondary-500/30 hover:border-[#B08D57] text-foreground-600 hover:text-[#B08D57] transition-colors flex-shrink-0"
                          title="Copy memo code"
                        >
                          <i className="ri-file-copy-line text-xs" />
                        </button>
                      </div>
                      <p className="font-body text-xs text-foreground-600/60 mt-1.5">
                        Include this code in the memo/note field of your payment so we can match it to your order.
                      </p>
                    </div>
                  </div>
                )}

                {/* Payment Instructions — Crypto */}
                {isCrypto && (
                  <div className="p-6 border border-[#B08D57]/40 bg-[#B08D57]/5 space-y-5">
                    <h3 className="font-heading text-xs tracking-[0.2em] uppercase text-foreground-950 flex items-center gap-2">
                      <i className="ri-bit-coin-line text-[#B08D57]" />
                      Payment Instructions
                    </h3>

                    {/* Network toggle for USDT/USDC */}
                    {(selectedPayment === 'usdt' || selectedPayment === 'usdc') && (
                      <div>
                        <p className="font-sans text-[10px] tracking-widest uppercase text-[#B08D57] mb-2">Select Network</p>
                        <div className="flex gap-0">
                          <button
                            type="button"
                            onClick={() => setCryptoNetwork('erc20')}
                            className={`flex-1 py-2 px-4 font-heading text-xs tracking-[0.15em] uppercase border transition-all duration-200 ${
                              cryptoNetwork === 'erc20'
                                ? 'bg-[#B08D57] text-foreground-950 border-[#B08D57]'
                                : 'bg-background-50 text-foreground-600 border-secondary-500/30 hover:border-[#B08D57]/40'
                            }`}
                          >
                            ERC-20
                          </button>
                          <button
                            type="button"
                            onClick={() => setCryptoNetwork('solana')}
                            className={`flex-1 py-2 px-4 font-heading text-xs tracking-[0.15em] uppercase border-t border-b border-r transition-all duration-200 ${
                              cryptoNetwork === 'solana'
                                ? 'bg-[#B08D57] text-foreground-950 border-[#B08D57]'
                                : 'bg-background-50 text-foreground-600 border-secondary-500/30 hover:border-[#B08D57]/40'
                            }`}
                          >
                            Solana
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Wallet address */}
                    <div>
                      <p className="font-sans text-[10px] tracking-widest uppercase text-[#B08D57] mb-2">
                        {selectedPayment === 'bitcoin'
                          ? 'Bitcoin (BTC) Address'
                          : selectedPayment === 'usdt'
                          ? `USDT — ${cryptoNetwork === 'erc20' ? 'ERC-20' : 'Solana'} Address`
                          : `USDC — ${cryptoNetwork === 'erc20' ? 'ERC-20' : 'Solana'} Address`}
                      </p>
                      {selectedPayment === 'bitcoin' && btcLoading ? (
                        <div className="flex items-center gap-3 bg-background-50 border border-secondary-500/30 px-3 py-2.5">
                          <div className="w-4 h-4 border-2 border-[#B08D57]/40 border-t-[#B08D57] rounded-full animate-spin flex-shrink-0" />
                          <span className="font-mono text-xs text-foreground-600/60">Generating address…</span>
                        </div>
                      ) : selectedPayment === 'bitcoin' && btcError ? (
                        <div className="bg-background-50 border border-red-300/50 px-3 py-2.5 space-y-2">
                          <p className="font-mono text-xs text-red-600 break-all">{btcError}</p>
                          <button
                            type="button"
                            onClick={fetchBtcAddress}
                            className="font-heading text-[10px] tracking-[0.12em] uppercase text-[#B08D57] border border-[#B08D57]/40 px-3 py-1.5 hover:bg-[#B08D57] hover:text-[#E1E4D9] transition-colors"
                          >
                            Retry
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <p className="font-mono text-xs text-foreground-950 bg-background-50 border border-secondary-500/30 px-3 py-2 flex-1 break-all">
                            {getActiveCryptoAddress() || '—'}
                          </p>
                          <button
                            type="button"
                            onClick={() => navigator.clipboard?.writeText(getActiveCryptoAddress())}
                            className="w-8 h-8 flex items-center justify-center border border-secondary-500/30 hover:border-[#B08D57] text-foreground-600 hover:text-[#B08D57] transition-colors flex-shrink-0"
                            title="Copy address"
                          >
                            <i className="ri-file-copy-line text-xs" />
                          </button>
                        </div>
                      )}
                    </div>

                    {/* QR code */}
                    {(selectedPayment !== 'bitcoin' || btcAddress) && (
                      <div className="flex items-start gap-4">
                        <div>
                          <p className="font-sans text-[10px] tracking-widest uppercase text-[#B08D57] mb-2">Scan QR Code</p>
                          <img
                            src={`https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=${encodeURIComponent(getActiveCryptoAddress())}`}
                            alt="Wallet QR Code"
                            className="w-[120px] h-[120px] border border-[#DBD0C2]"
                          />
                        </div>
                        <div className="flex-1">
                          <p className="font-sans text-[10px] tracking-widest uppercase text-[#B08D57] mb-2">Important</p>
                          <ul className="space-y-1.5">
                            {[
                              'Send the exact order total — no rounding.',
                              selectedPayment === 'bitcoin'
                                ? 'Bitcoin mainnet only.'
                                : cryptoNetwork === 'erc20'
                                ? 'Ethereum network only. Do NOT send via other networks.'
                                : 'Solana network only. Do NOT send via other networks.',
                              'Upload your payment screenshot and TX hash below.',
                              'Order ships within 24 hrs of confirmed payment.',
                            ].map((note, i) => (
                              <li key={i} className="flex items-start gap-2">
                                <span className="text-[#B08D57] text-[8px] mt-1.5">✦</span>
                                <span className="font-sans text-xs text-foreground-600 leading-relaxed font-light">{note}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    )}

                    {/* Memo */}
                    <div>
                      <p className="font-sans text-[10px] tracking-widest uppercase text-[#B08D57] mb-2">Payment Memo / Reference</p>
                      <div className="flex items-center gap-2">
                        <p className="font-mono text-sm font-bold text-foreground-950 bg-background-50 border border-[#B08D57]/40 px-3 py-2 flex-1 tracking-widest">
                          {memoCode}
                        </p>
                        <button
                          type="button"
                          onClick={() => navigator.clipboard?.writeText(memoCode)}
                          className="w-8 h-8 flex items-center justify-center border border-secondary-500/30 hover:border-[#B08D57] text-foreground-600 hover:text-[#B08D57] transition-colors flex-shrink-0"
                          title="Copy memo code"
                        >
                          <i className="ri-file-copy-line text-xs" />
                        </button>
                      </div>
                      <p className="font-body text-xs text-foreground-600/60 mt-1.5">
                        Include this code in the transaction memo/tag when sending crypto so we can match your payment.
                      </p>
                    </div>

                    {/* Email confirmation instruction */}
                    <div className="pt-2 border-t border-[#B08D57]/20 space-y-3">
                      <div>
                        <label className="font-sans text-[10px] tracking-widest uppercase text-[#B08D57] mb-1.5 block">Transaction Hash / ID</label>
                        <input
                          type="text"
                          value={txHash}
                          onChange={(e) => setTxHash(e.target.value)}
                          placeholder="0x... or txid..."
                          className="w-full bg-background-50 border border-secondary-500/40 font-mono text-xs text-foreground-950 py-2.5 px-3 focus:outline-none focus:border-[#B08D57] placeholder:text-foreground-600/40"
                        />
                      </div>
                      <div className="p-4 border-2 border-[#B08D57] bg-[#B08D57]/10 flex items-start gap-3">
                        <i className="ri-mail-send-line text-[#B08D57] text-xl flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="font-heading text-xs tracking-[0.15em] uppercase text-foreground-950 mb-1">
                            Required: Email Your Transaction Screenshot
                          </p>
                          <p className="font-body text-xs text-foreground-600 leading-relaxed">
                            After sending, email your <strong>transaction hash (TXID)</strong> and a <strong>screenshot of payment</strong> to{' '}
                            <strong className="text-[#B08D57]">orders@mysecretvitality.com</strong>{' '}
                            with subject <strong>Order {memoCode}</strong>.
                            Without this your order cannot be verified.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Order Notes */}
                <div className="p-6 border border-secondary-500/20 bg-background-100/40">
                  <h2 className="font-heading text-sm tracking-[0.2em] uppercase text-foreground-950 mb-5 flex items-center gap-3">
                    <span className="w-6 h-6 flex items-center justify-center text-accent-500 text-xs">
                      <i className="ri-file-text-line" />
                    </span>
                    Order Notes
                  </h2>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => handleChange('notes', e.target.value)}
                    rows={3}
                    maxLength={500}
                    className="w-full bg-background-50 border border-secondary-500/40 font-body text-base text-foreground-950 py-2.5 px-3 focus:outline-none focus:border-accent-500 placeholder:text-foreground-600/40 resize-none"
                    placeholder="Any special instructions for your order..."
                  />
                  <p className="font-mono text-xs text-foreground-600/50 mt-1.5 text-right">
                    {formData.notes.length}/500
                  </p>
                </div>

                {/* Mobile-only order summary — shown just above submit on small screens */}
                <div className="block lg:hidden p-5 border border-secondary-500/20 bg-background-100/40">
                  <h3 className="font-heading text-xs tracking-[0.2em] uppercase text-foreground-950 mb-4">
                    Order Summary
                  </h3>
                  <div className="space-y-3 mb-4">
                    {items.map((item) => (
                      <div key={item.id} className="flex justify-between items-start gap-3">
                        <div className="flex items-start gap-2 min-w-0">
                          <span className="font-mono text-[10px] text-accent-500 flex-shrink-0">{item.quantity}×</span>
                          <div className="min-w-0">
                            <p className="font-heading text-xs tracking-wider uppercase text-foreground-950 truncate">{item.name}</p>
                            <p className="font-mono text-[10px] text-foreground-600/60">{item.dosage}</p>
                          </div>
                        </div>
                        <span className="font-mono text-xs text-accent-500 font-bold flex-shrink-0">${(item.price * item.quantity).toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                  <div className="accent-rule mb-4" />
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="font-body text-sm text-foreground-600">Subtotal</span>
                      <span className="font-mono text-sm text-foreground-950">${totalPrice.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-body text-sm text-foreground-600">Shipping</span>
                      <span className="font-mono text-sm text-foreground-950">
                        {shipping === 0
                          ? <span className={couponFreeShipping ? 'text-green-700' : ''}>{couponFreeShipping ? 'Free (coupon)' : 'Free'}</span>
                          : `$${shipping.toFixed(2)}`}
                      </span>
                    </div>
                    {couponDiscount > 0 && (
                      <div className="flex justify-between">
                        <span className="font-body text-sm text-green-700">Coupon ({couponCode.toUpperCase()})</span>
                        <span className="font-mono text-sm text-green-700">−${couponDiscount.toFixed(2)}</span>
                      </div>
                    )}
                    {isBtc && btcDiscount > 0 && (
                      <div className="flex justify-between">
                        <span className="font-body text-sm text-green-700">BTC Discount (5%)</span>
                        <span className="font-mono text-sm text-green-700">−${btcDiscount.toFixed(2)}</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className="font-body text-sm text-foreground-600">Tax</span>
                      <span className="font-mono text-sm text-foreground-950">{tax > 0 ? `$${tax.toFixed(2)}` : '—'}</span>
                    </div>
                  </div>
                  <div className="accent-rule my-4" />
                  <div className="flex justify-between items-center">
                    <span className="font-heading text-xs tracking-wider uppercase text-foreground-950">Total</span>
                    <span className="font-mono text-xl text-accent-500 font-bold">${orderTotal.toFixed(2)}</span>
                  </div>
                </div>

                {/* Terms of Service */}
                <label className="flex items-start gap-3 cursor-pointer">
                  <input type="checkbox" required className="mt-1 w-4 h-4 accent-[#B08D57]" />
                  <span className="font-sans text-sm text-foreground-600 leading-relaxed">
                    I have read and agree to the{' '}
                    <a href="/terms-of-service" className="text-[#B08D57] underline underline-offset-2">Terms of Service</a>
                    {' '}and confirm that all products are purchased for lawful research use only.
                  </span>
                </label>

                {/* Submit */}
                {submitError && (
                  <div role="alert" className="p-3 border border-red-900/40 bg-red-900/10">
                    <p className="font-body text-sm text-red-900/90 leading-relaxed">{submitError}</p>
                  </div>
                )}
                {selectedPayment === 'bitcoin' && !btcAddress && !btcLoading && !btcError && (
                  <p className="font-sans text-xs text-[#B08D57] text-center">
                    Waiting for BTC address to generate before you can submit.
                  </p>
                )}
                <button
                  type="submit"
                  disabled={!selectedPayment || submitting || (selectedPayment === 'bitcoin' && (!btcAddress || !!btcError || btcLoading))}
                  className={`w-full font-heading text-xs tracking-[0.2em] uppercase py-4 border transition-all duration-300 whitespace-nowrap ${
                    selectedPayment && !submitting && !(selectedPayment === 'bitcoin' && (!btcAddress || !!btcError || btcLoading))
                      ? 'bg-accent-500 hover:bg-accent-400 text-foreground-950 border-accent-500 hover:shadow-[0_0_20px_rgba(184,148,42,0.3)]'
                      : 'bg-foreground-600/10 text-foreground-600/40 border-foreground-600/20 cursor-not-allowed'
                  }`}
                >
                  {submitting ? 'Submitting...' : 'Submit Order'}
                </button>

                {/* Disclaimer */}
                <div className="p-4 border border-dashed border-red-900/20 bg-red-900/[0.02]">
                  <div className="flex items-start gap-3">
                    <span className="w-5 h-5 flex items-center justify-center text-red-900/50 mt-0.5">
                      <i className="ri-error-warning-line" />
                    </span>
                    <div>
                      <p className="font-heading text-[10px] tracking-[0.15em] uppercase text-red-900/80 mb-1">
                        For Research Use Only
                      </p>
                      <p className="font-mono text-sm leading-relaxed text-foreground-600/60">
                        By submitting this order, you confirm that you are a qualified researcher aged 21 or older. All products are for laboratory research use only and not intended for human consumption, injection, or therapeutic use.
                      </p>
                    </div>
                  </div>
                </div>
              </form>
            </div>

            {/* Right: Order Summary */}
            {/* BUG FIX 2026-07-24: this sidebar had no responsive visibility
                class of its own — only `lg:col-span-1` for grid placement.
                Below the `lg` breakpoint the 2-column grid collapses to a
                single column, so this block stacked directly underneath the
                separate "Mobile-only order summary" block above (which DOES
                correctly hide itself via `lg:hidden`), showing the order
                summary twice. Explicit `hidden lg:block` makes this one
                desktop-only, matching its mobile counterpart. Ported from
                the same fix on VP/Liberty. */}
            <div className="hidden lg:block lg:col-span-1">
              <div className="sticky top-6 border border-secondary-500/20 bg-background-100/40 p-6">
                <h2 className="font-heading text-sm tracking-[0.2em] uppercase text-foreground-950 mb-5">
                  Order Summary
                </h2>

                <div className="space-y-4 mb-6">
                  {items.map((item) => (
                    <div key={item.id} className="flex items-start gap-3">
                      <div className="w-8 h-8 bg-accent-500/10 flex items-center justify-center flex-shrink-0">
                        <span className="font-mono text-[10px] text-accent-500">{item.quantity}x</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-heading text-sm tracking-wider uppercase text-foreground-950 truncate">
                          {item.name}
                        </p>
                        <p className="font-body text-xs italic text-foreground-600/70 truncate">
                          {item.peptideCode}
                        </p>
                        <p className="font-mono text-xs text-accent-700">
                          {item.dosage}
                        </p>
                      </div>
                      <span className="font-mono text-xs text-accent-500 font-bold flex-shrink-0">
                        ${(item.price * item.quantity).toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="accent-rule mb-5" />

                {/* Coupon Code */}
                <div className="mb-5">
                  <label className="font-heading text-xs tracking-[0.15em] uppercase text-foreground-600 mb-2 block">
                    Coupon Code
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={couponCode}
                      onChange={(e) => { setCouponCode(e.target.value); setCouponApplied(null); }}
                      className="flex-1 bg-background-50 border border-secondary-500/20 font-mono text-sm text-foreground-950 py-2 px-3 focus:outline-none focus:border-accent-500 placeholder:text-foreground-600/40"
                      placeholder="Enter code"
                    />
                    <button
                      type="button"
                      onClick={handleApplyCoupon}
                      disabled={couponLoading}
                      className="bg-accent-500 hover:bg-accent-400 text-foreground-950 font-heading text-xs tracking-[0.15em] uppercase px-4 py-2 border border-accent-500 transition-all duration-300 whitespace-nowrap disabled:opacity-50"
                    >
                      {couponLoading ? '...' : 'Apply'}
                    </button>
                  </div>
                  {couponApplied === true && (
                    <p className="font-mono text-xs text-green-600 mt-1.5">✓ Coupon applied — saving ${couponDiscount.toFixed(2)}</p>
                  )}
                  {couponError && (
                    <p className="font-mono text-xs text-red-600 mt-1.5">{couponError}</p>
                  )}
                </div>

                <div className="accent-rule mb-5" />

                <div className="space-y-2.5">
                  <div className="flex justify-between items-center">
                    <span className="font-body text-sm text-foreground-600">Subtotal</span>
                    <span className="font-mono text-sm text-foreground-950">${totalPrice.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="font-body text-sm text-foreground-600">Shipping</span>
                    <span className="font-mono text-sm text-foreground-950">
                      {shipping === 0
                        ? <span className={couponFreeShipping ? 'text-green-700' : ''}>{couponFreeShipping ? 'Free (coupon)' : 'Free'}</span>
                        : `$${shipping.toFixed(2)}`}
                    </span>
                  </div>
                  {couponDiscount > 0 && (
                    <div className="flex justify-between items-center">
                      <span className="font-body text-sm text-green-700">Coupon ({couponCode.toUpperCase()})</span>
                      <span className="font-mono text-sm text-green-700">−${couponDiscount.toFixed(2)}</span>
                    </div>
                  )}
                  {isBtc && btcDiscount > 0 && (
                    <div className="flex justify-between items-center">
                      <span className="font-body text-sm text-green-700">BTC Discount (5%)</span>
                      <span className="font-mono text-sm text-green-700">−${btcDiscount.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between items-center">
                    <span className="font-body text-sm text-foreground-600">Tax</span>
                    <span className="font-mono text-sm text-foreground-950">{tax > 0 ? `$${tax.toFixed(2)}` : '—'}</span>
                  </div>
                </div>

                <div className="accent-rule my-5" />

                <div className="flex justify-between items-center">
                  <span className="font-heading text-xs tracking-wider uppercase text-foreground-950">Total</span>
                  <span className="font-mono text-xl text-accent-500 font-bold">
                    ${orderTotal.toFixed(2)}
                  </span>
                </div>

                {/* Shipping note */}
                <div className="mt-5 p-3 border border-secondary-500/10 bg-background-100/30">
                  <div className="flex items-start gap-2.5">
                    <span className="w-4 h-4 flex items-center justify-center text-accent-500 mt-0.5">
                      <i className="ri-truck-line text-xs" />
                    </span>
                    <div>
                      <p className="font-heading text-[10px] tracking-[0.15em] uppercase text-foreground-950">Free Shipping</p>
                      <p className="font-mono text-xs text-foreground-600/70 mt-0.5">On orders over $200</p>
                    </div>
                  </div>
                </div>

                {/* Payment note */}
                <div className="mt-3 p-3 border border-secondary-500/10 bg-background-100/30">
                  <div className="flex items-start gap-2.5">
                    <span className="w-4 h-4 flex items-center justify-center text-accent-500 mt-0.5">
                      <i className="ri-secure-payment-line text-xs" />
                    </span>
                    <div>
                      <p className="font-heading text-[10px] tracking-[0.15em] uppercase text-foreground-950">Secure Payment</p>
                      <p className="font-mono text-xs text-foreground-600/70 mt-0.5">We accept Zelle, Cash App, Venmo, BTC, USDT & USDC</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </PageLayout>
  );
}
