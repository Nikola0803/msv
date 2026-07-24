import type { VercelRequest, VercelResponse } from '@vercel/node';

const WP_URL = (process.env.WP_URL ?? process.env.WC_URL ?? '').replace(/\/$/, '');

/**
 * GET /api/bundles
 * Proxies to WP /wp-json/msv/v1/bundles.
 * Returns [] on any error so the frontend always falls back to mock data.
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });
  if (!WP_URL) return res.status(200).json([]);

  try {
    const r = await fetch(`${WP_URL}/wp-json/msv/v1/bundles`, {
      signal: AbortSignal.timeout(8_000),
    });
    if (!r.ok) throw new Error(`WP returned ${r.status}`);
    const data = await r.json();
    res.setHeader('Cache-Control', 's-maxage=120, stale-while-revalidate=300');
    return res.status(200).json(Array.isArray(data) ? data : []);
  } catch {
    // Non-fatal — frontend falls back to mock bundles
    return res.status(200).json([]);
  }
}
