import type { VercelRequest, VercelResponse } from '@vercel/node'
import { createHash } from 'crypto'

// Unified env vars — same names as Vintage Peptides. WC_URL points to the shared WordPress.
const WP_BASE = (process.env.WC_URL ?? '').replace(/\/$/, '')
const WP_USER = process.env.WC_USER ?? ''
const WP_PASS = process.env.WC_APP_PASSWORD ?? ''

function wcAuthHeader(): string {
  return 'Basic ' + Buffer.from(`${WP_USER}:${WP_PASS}`).toString('base64')
}

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

/** Deterministic, stable code per email — e.g. WELCOME15-A1B2C3D4. */
function couponCodeForEmail(email: string): string {
  const hash = createHash('sha256').update(email.trim().toLowerCase()).digest('hex').slice(0, 8).toUpperCase()
  return `WELCOME15-${hash}`
}

/**
 * Body: { email, name? } — issues a REAL, one-time-use 15%-off WooCommerce
 * coupon for the "Save 15% off your first order" popup on SplashScreen.
 * Deterministic per-email code so resubmitting the same email is idempotent.
 *
 * NOTE 2026-07-23: this used to be its own file, api/first-order-coupon.ts.
 * Merged in here instead — Vercel's Hobby plan caps a deployment at 12
 * serverless functions (see .vercelignore), and this project was already
 * sitting exactly at that cap, so adding a 13th file broke the build
 * ("No more than 12 Serverless Functions..."). Dispatching on body shape
 * (email vs. code/orderTotal) keeps this one file doing both jobs.
 */
async function issueFirstOrderCoupon(email: string, name: string | undefined, res: VercelResponse): Promise<void> {
  if (!email || !isValidEmail(email)) {
    res.status(400).json({ error: 'A valid email address is required.' }); return
  }
  if (!WP_BASE) {
    res.status(500).json({ error: 'WC_URL not configured' }); return
  }

  const headers = { Authorization: wcAuthHeader(), 'Content-Type': 'application/json' }
  const code = couponCodeForEmail(email)

  try {
    const lookup = await fetch(
      `${WP_BASE}/wp-json/wc/v3/coupons?code=${encodeURIComponent(code.toLowerCase())}`,
      { headers, signal: AbortSignal.timeout(10_000) }
    )
    if (lookup.ok) {
      const existing = await lookup.json()
      if (Array.isArray(existing) && existing.length > 0) {
        res.status(200).json({ code, discountPct: 15, existing: true }); return
      }
    }

    const expires = new Date()
    expires.setDate(expires.getDate() + 30)

    const create = await fetch(`${WP_BASE}/wp-json/wc/v3/coupons`, {
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
    })

    if (!create.ok) {
      const text = await create.text()
      if (create.status === 400 && /already exists/i.test(text)) {
        res.status(200).json({ code, discountPct: 15, existing: true }); return
      }
      console.error('[validate-coupon:issue] WC create failed', create.status, text)
      res.status(502).json({ error: 'Could not create your coupon. Please try again.' }); return
    }

    res.status(200).json({ code, discountPct: 15, existing: false })
  } catch (err: any) {
    console.error('[validate-coupon:issue]', err)
    res.status(500).json({ error: err.message || 'Unknown error creating coupon' })
  }
}

export default async function handler(req: VercelRequest, res: VercelResponse): Promise<void> {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
  if (req.method === 'OPTIONS') { res.status(204).end(); return }
  if (req.method !== 'POST') { res.status(405).json({ error: 'Method not allowed' }); return }

  const body = (req.body ?? {}) as { code?: string; orderTotal?: number; email?: string; name?: string }

  // Coupon-issuance flow (email present, no code/orderTotal — the shape
  // checkout's "apply a code" flow never sends).
  if (body.email && typeof body.code === 'undefined' && typeof body.orderTotal === 'undefined') {
    await issueFirstOrderCoupon(body.email, body.name, res)
    return
  }

  const { code, orderTotal } = body as { code: string; orderTotal: number }
  if (!code || typeof orderTotal !== 'number') {
    res.status(400).json({ error: 'Missing code or orderTotal' }); return
  }

  // Fetch coupon from WC
  const slug = encodeURIComponent(code.trim().toLowerCase())
  const wcRes = await fetch(`${WP_BASE}/wp-json/wc/v3/coupons?code=${slug}`, {
    headers: { Authorization: wcAuthHeader() },
  }).catch(() => null)

  if (!wcRes || !wcRes.ok) {
    res.status(502).json({ error: 'Could not reach WooCommerce' }); return
  }

  const coupons = await wcRes.json() as Array<{
    id: number
    code: string
    discount_type: string
    amount: string
    minimum_amount: string
    maximum_amount: string
    usage_limit: number | null
    usage_count: number
    date_expires: string | null
    individual_use: boolean
    free_shipping: boolean
  }>

  if (!coupons.length) {
    res.status(404).json({ error: 'Invalid coupon code.' }); return
  }

  const c = coupons[0]

  // Check expiry
  if (c.date_expires && new Date(c.date_expires) < new Date()) {
    res.status(400).json({ error: 'This coupon has expired.' }); return
  }

  // Check usage limit
  if (c.usage_limit !== null && c.usage_count >= c.usage_limit) {
    res.status(400).json({ error: 'This coupon has reached its usage limit.' }); return
  }

  // Check minimum amount
  if (c.minimum_amount && orderTotal < parseFloat(c.minimum_amount)) {
    res.status(400).json({ error: `Minimum order of $${c.minimum_amount} required for this coupon.` }); return
  }

  // Calculate discount
  let discount = 0
  if (c.discount_type === 'percent') {
    discount = (orderTotal * parseFloat(c.amount)) / 100
  } else if (c.discount_type === 'fixed_cart' || c.discount_type === 'fixed_product') {
    discount = parseFloat(c.amount)
  }
  discount = Math.min(discount, orderTotal) // can't discount more than total

  res.status(200).json({
    valid: true,
    discount: parseFloat(discount.toFixed(2)),
    freeShipping: !!c.free_shipping,
    type: c.discount_type,
    discount_type: c.discount_type,
    amount: c.amount,
    coupon_id: c.id,
  })
}
