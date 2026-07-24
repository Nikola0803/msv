/**
 * POST /api/affiliate-track-click
 * Body: { ref_code: string, landing_url?: string }
 *
 * Fire-and-forget proxy called once per visit when a ?ref=CODE link lands on
 * the site (see src/utils/affiliate.ts). Records the click server-side so
 * click counts can't be forged from the browser, and confirms whether the
 * code is a real, active affiliate before we bother keeping the cookie.
 *
 * Requires the vp-affiliates plugin endpoint POST /vp-affiliates/v1/track-click.
 */
import type { VercelRequest, VercelResponse } from '@vercel/node';

// Strip any trailing slash — a WC_URL with one would otherwise produce a
// double slash before "/wp-json/...", which some WP hosts/proxies mis-route.
const WC_URL = (process.env.WC_URL || process.env.VITE_WC_URL || '').replace(/\/+$/, '');
const WC_USER = process.env.WC_USER || '';
const WC_APP_PASSWORD = process.env.WC_APP_PASSWORD || '';
const STOREFRONT = process.env.STOREFRONT || 'msv';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { ref_code, landing_url } = req.body ?? {};
  if (!ref_code || typeof ref_code !== 'string') {
    return res.status(400).json({ error: 'ref_code is required.' });
  }
  if (!WC_URL) {
    return res.status(500).json({ error: 'Server configuration error.' });
  }

  try {
    const r = await fetch(`${WC_URL}/wp-json/vp-affiliates/v1/track-click`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Basic ' + Buffer.from(`${WC_USER}:${WC_APP_PASSWORD}`).toString('base64'),
      },
      body: JSON.stringify({
        ref_code: ref_code.slice(0, 60),
        storefront: STOREFRONT,
        landing_url: typeof landing_url === 'string' ? landing_url.slice(0, 500) : '',
      }),
      signal: AbortSignal.timeout(8_000),
    });

    const data = await r.json().catch(() => ({ valid: false }));
    return res.status(200).json({ valid: !!data.valid });
  } catch (e) {
    console.error('[affiliate-track-click]', e);
    // Never fail loudly on this — it's a background beacon, not user-facing.
    return res.status(200).json({ valid: false });
  }
}
