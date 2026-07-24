/**
 * POST /api/first-order-coupon
 * Body: { email: string, name?: string }
 *
 * Issues a REAL, one-time-use 15%-off WooCommerce coupon tied to the
 * submitted email, for the "Save 15% off your first order" popup on
 * SplashScreen. The code is derived deterministically from the email (not
 * random) so submitting the same email twice returns the SAME coupon
 * instead of minting a new one every time — WC's `email_restrictions` +
 * `usage_limit: 1` still guarantee it can only be redeemed once.
 *
 * Same WC REST auth pattern as submit-order.ts / validate-coupon.ts
 * (Basic auth via WP Application Password, WC_USER/WC_APP_PASSWORD).
 */
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createHash } from 'crypto';

const WC_URL = (process.env.WC_URL ?? '').replace(/\/$/, '');
const WC_USER = process.env.WC_USER ?? '';
const WC_APP_PASSWORD = process.env.WC_APP_PASSWORD ?? '';

function wcAuth(): string {
  return 'Basic ' + Buffer.from(`${WC_USER}:${WC_APP_PASSWORD}`).toString('base64');
}

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

/** Deterministic, stable code per email — e.g. WELCOME15-A1B2C3D4. */
function couponCodeForEmail(email: string): string {
  const hash = createHash('sha256').update(email.trim().toLowerCase()).digest('hex').slice(0, 8).toUpperCase();
  return `WELCOME15-${hash}`;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  if (!WC_URL) return res.status(500).json({ error: 'WC_URL not configured' });

  const { email, name } = (req.body ?? {}) as { email?: string; name?: string };
  if (!email || !isValidEmail(email)) {
    return res.status(400).json({ error: 'A valid email address is required.' });
  }

  const headers = { Authorization: wcAuth(), 'Content-Type': 'application/json' };
  const code = couponCodeForEmail(email);

  try {
    const lookup = await fetch(
      `${WC_URL}/wp-json/wc/v3/coupons?code=${encodeURIComponent(code.toLowerCase())}`,
      { headers, signal: AbortSignal.timeout(10_000) }
    );
    if (lookup.ok) {
      const existing = await lookup.json();
      if (Array.isArray(existing) && existing.length > 0) {
        return res.status(200).json({ code, discountPct: 15, existing: true });
      }
    }

    const expires = new Date();
    expires.setDate(expires.getDate() + 30);

    const create = await fetch(`${WC_URL}/wp-json/wc/v3/coupons`, {
      method: 'POST',
      headers,
      signal: AbortSignal.timeout(10_000),
      body: JSON.stringify({
        code: code.toLowerCase(),
        discount_type: 'percent',
        amount: '15',
        individual_use: true,
        usage_limit: 1,
        email_restrictions: [email.trim().toLowerCase()],
        date_expires: expires.toISOString().slice(0, 10),
        description: `First-order 15% popup — ${name || email}`,
      }),
    });

    if (!create.ok) {
      const text = await create.text();
      if (create.status === 400 && /already exists/i.test(text)) {
        return res.status(200).json({ code, discountPct: 15, existing: true });
      }
      console.error('[first-order-coupon] WC create failed', create.status, text);
      return res.status(502).json({ error: 'Could not create your coupon. Please try again.' });
    }

    return res.status(200).json({ code, discountPct: 15, existing: false });
  } catch (err: any) {
    console.error('[first-order-coupon]', err);
    return res.status(500).json({ error: err.message || 'Unknown error creating coupon' });
  }
}
