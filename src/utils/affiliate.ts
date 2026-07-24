/**
 * Affiliate referral tracking — cookie capture + click beacon.
 *
 * Attribution model: last-click, 30-day rolling window (industry standard —
 * matches AffiliateWP / Refersion / Impact defaults). Visiting a new ?ref=
 * link resets the 30-day clock and overwrites any previous referral, so the
 * affiliate whose link the shopper clicked most recently gets the sale.
 *
 * The cookie only stores the referral code — no PII, nothing sensitive.
 * Server-side (vp-affiliates WP plugin) is the source of truth for whether
 * the code is real; an invalid/disabled code just never earns commission.
 *
 * Ported from the Vintage Peptides frontend — shared vp-affiliates backend
 * (storefront=msv) makes this a drop-in copy, no code changes needed.
 */

export const AFFILIATE_COOKIE_NAME = 'vp_aff_ref';
export const AFFILIATE_COOKIE_DAYS = 30;

function setCookie(name: string, value: string, days: number): void {
  const maxAge = days * 24 * 60 * 60;
  const isHttps = typeof window !== 'undefined' && window.location.protocol === 'https:';
  document.cookie = `${name}=${encodeURIComponent(value)}; Max-Age=${maxAge}; Path=/; SameSite=Lax${isHttps ? '; Secure' : ''}`;
}

function getCookie(name: string): string | null {
  if (typeof document === 'undefined') return null;
  const match = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : null;
}

export function getAffiliateRef(): string | null {
  return getCookie(AFFILIATE_COOKIE_NAME);
}

/**
 * Call once on app mount / route change. Reads ?ref=CODE off the URL, and if
 * present, (re)sets the 30-day cookie and fires a background click beacon.
 * Safe to call on every route change — it's a no-op when there's no ?ref=.
 */
export function captureAffiliateRef(): void {
  if (typeof window === 'undefined') return;

  const params = new URLSearchParams(window.location.search);
  const ref = params.get('ref');
  if (!ref) return;

  const code = ref.trim().toUpperCase().slice(0, 60);
  if (!code) return;

  setCookie(AFFILIATE_COOKIE_NAME, code, AFFILIATE_COOKIE_DAYS);

  // Fire-and-forget — never block navigation on this.
  fetch('/api/affiliate-track-click', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ref_code: code, landing_url: window.location.href }),
    keepalive: true,
  }).catch(() => {
    /* best-effort — a failed click beacon shouldn't affect the visitor */
  });
}
