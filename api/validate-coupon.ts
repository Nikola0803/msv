import type { VercelRequest, VercelResponse } from '@vercel/node'

// Unified env vars — same names as Vintage Peptides. WC_URL points to the shared WordPress.
const WP_BASE = (process.env.WC_URL ?? '').replace(/\/$/, '')
const WP_USER = process.env.WC_USER ?? ''
const WP_PASS = process.env.WC_APP_PASSWORD ?? ''

function wcAuthHeader(): string {
  return 'Basic ' + Buffer.from(`${WP_USER}:${WP_PASS}`).toString('base64')
}

export default async function handler(req: VercelRequest, res: VercelResponse): Promise<void> {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
  if (req.method === 'OPTIONS') { res.status(204).end(); return }
  if (req.method !== 'POST') { res.status(405).json({ error: 'Method not allowed' }); return }

  const { code, orderTotal } = req.body as { code: string; orderTotal: number }
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
    discount_type: c.discount_type,
    amount: c.amount,
    coupon_id: c.id,
  })
}
