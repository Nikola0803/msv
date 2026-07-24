/**
 * POST /api/crm-subscribe
 * Body: { email: string; name?: string }
 *
 * Subscribes an MSV visitor to the newsletter via the shared WordPress vp-crm plugin.
 * Tags the subscriber with storefront=msv so the admin can filter by brand.
 */
import type { VercelRequest, VercelResponse } from '@vercel/node'

const WC_URL = (process.env.WC_URL ?? '').replace(/\/$/, '')
const STOREFRONT = process.env.STOREFRONT || 'msv'

export default async function handler(req: VercelRequest, res: VercelResponse): Promise<void> {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' }); return
  }

  if (!WC_URL) {
    res.status(500).json({ error: 'WC_URL not configured' }); return
  }

  const { email, name } = (req.body ?? {}) as { email?: string; name?: string }

  if (!email || !email.includes('@')) {
    res.status(400).json({ error: 'Valid email is required' }); return
  }

  // Force HTTP — VPS has no SSL cert yet; server-side HTTP is fine (not mixed content)
  const base = WC_URL.replace(/^https:\/\//, 'http://')

  const tryFetch = () => fetch(`${base}/wp-json/vp-crm/v1/subscribe`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: email.trim(),
      name: name ?? '',
      source: 'newsletter-popup',
      storefront: STOREFRONT,
    }),
    signal: AbortSignal.timeout(8_000),
  })

  try {
    let wpRes: Response
    try {
      wpRes = await tryFetch()
    } catch {
      wpRes = await tryFetch() // retry once
    }

    const data = await wpRes.json().catch(() => ({}))

    if (!wpRes.ok) {
      res.status(wpRes.status).json({ error: (data as { error?: string }).error ?? 'Subscription failed' }); return
    }

    res.status(200).json({ success: true })
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    res.status(500).json({ error: msg })
  }
}
