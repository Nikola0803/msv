import type { VercelRequest, VercelResponse } from '@vercel/node'

// Unified env vars — same names as Vintage Peptides project.
// Set STOREFRONT=msv on this Vercel project; WC_URL points to the shared WordPress.
const WP_BASE = (process.env.WC_URL ?? '').replace(/\/$/, '')
const WP_USER = process.env.WC_USER ?? ''
const WP_PASS = process.env.WC_APP_PASSWORD ?? ''
const STOREFRONT = process.env.STOREFRONT || 'msv'

function basicAuth(): string {
  return 'Basic ' + Buffer.from(`${WP_USER}:${WP_PASS}`).toString('base64')
}

// ── Stock reservation (overselling fix, 2026-07-17) ──────────────────────────
// MSV orders are built from fee_lines, not real WooCommerce line_items, so
// WooCommerce's own stock tracking never sees these orders at all — there was
// zero automatic stock tracking here, on top of the same pending/on-hold
// unpaid-window problem VP and Liberty had. Cart items carry `peptideCode`,
// which resolves to a real product/variation via the same shared WP endpoint
// vp-cms/vp-products already exposes to all 3 storefronts (one SKU = one
// WooCommerce product, so a sale on any site reduces the same physical stock).
interface StockItem { product_id: number; variation_id: number; qty: number }
interface StockAdjustResult { post_id: number; ok: boolean; managed?: boolean; reason?: string; available?: number }

async function resolveSkuIds(sku: string): Promise<{ product_id: number; variation_id: number } | null> {
  try {
    const url = `${WP_BASE}/wp-json/vp-products/v1/by-sku?sku=${encodeURIComponent(sku)}`
    const r = await fetch(url, { headers: { Authorization: basicAuth() }, signal: AbortSignal.timeout(5000) })
    if (!r.ok) return null
    const data = await r.json() as { product_id?: number; variation_id?: number }
    if (!data.product_id) return null
    return { product_id: data.product_id, variation_id: data.variation_id ?? 0 }
  } catch {
    return null
  }
}

async function adjustStock(items: StockItem[], direction: 'decrease' | 'increase'): Promise<StockAdjustResult[]> {
  if (items.length === 0) return []
  try {
    const r = await fetch(`${WP_BASE}/wp-json/vp-products/v1/adjust-stock`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: basicAuth() },
      body: JSON.stringify({ items, direction }),
      signal: AbortSignal.timeout(10_000),
    })
    if (!r.ok) {
      console.error('[submit-order] adjust-stock HTTP', r.status)
      return []
    }
    const data = await r.json() as { results?: StockAdjustResult[] }
    return data.results ?? []
  } catch (e) {
    console.error('[submit-order] adjust-stock request failed', e)
    return []
  }
}

interface CartItem {
  id: string | number
  name: string
  price: number
  quantity: number
  peptideCode?: string
  dosage?: string
  // Real WooCommerce numeric ids, carried through from the product record
  // (2026-07-24) — lets stock reservation skip the by-SKU lookup entirely
  // when present, instead of depending on `peptideCode` (which is often
  // blank) resolving via the WP endpoint below.
  wcProductId?: number
  wcVariationId?: number | null
  // Subscribe & Save — present when the customer picked a subscription interval
  subscribeInterval?: 30 | 60 | 90 | 180
  subscriptionDiscountPct?: number
}

interface OrderPayload {
  customer: {
    fullName: string
    email: string
    phone: string
    address: string
    city: string
    state: string
    zip: string
  }
  // Present when the shopper is logged in — links the order to their WC
  // customer record and lets us sync their address back after checkout.
  userId?: number
  items: CartItem[]
  paymentMethod: string
  paymentMethodTitle: string
  memoCode: string
  orderTotal: number
  notes: string
  couponCode?: string
  couponDiscount?: number
  txHash?: string
  btcAddress?: string
  // USDT/USDC — mirrors the VP/Liberty checkout's meta scheme so the
  // WP-side email template can show a wallet address/QR for those too,
  // not just BTC.
  cryptoAddress?: string
  cryptoToken?: string
  cryptoNetwork?: string
  affiliateRef?: string
}

export default async function handler(req: VercelRequest, res: VercelResponse): Promise<void> {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

  if (req.method === 'OPTIONS') { res.status(204).end(); return }
  if (req.method !== 'POST') { res.status(405).json({ error: 'Method not allowed' }); return }

  if (!WP_BASE || !WP_USER || !WP_PASS) {
    console.error('[submit-order] Missing env vars: WC_URL, WC_USER, or WC_APP_PASSWORD')
    res.status(500).json({ error: 'Order service not configured' }); return
  }

  const body = req.body as OrderPayload
  if (!body?.customer?.email || !body?.items?.length) {
    res.status(400).json({ error: 'Missing required fields' }); return
  }

  const { customer, userId, items, paymentMethod, paymentMethodTitle, memoCode, notes, couponCode, couponDiscount, txHash, btcAddress, cryptoAddress, cryptoToken, cryptoNetwork, affiliateRef } = body

  // Split fullName into first/last
  const nameParts = customer.fullName.trim().split(' ')
  const firstName = nameParts[0] ?? ''
  const lastName = nameParts.slice(1).join(' ') || '-'

  // fee_lines avoid needing a product_id/SKU — ideal for headless custom orders.
  // Once MSV products are in the shared WP catalog with SKUs you can switch to line_items.
  const feeLines = items.map(item => ({
    name: item.name + (item.dosage ? ` — ${item.dosage}` : '') + (item.quantity > 1 ? ` ×${item.quantity}` : ''),
    total: (item.price * item.quantity).toFixed(2),
    tax_class: '',
    tax_status: 'none',
  }))

  const address = {
    first_name: firstName,
    last_name: lastName,
    email: customer.email,
    phone: customer.phone,
    address_1: customer.address,
    city: customer.city,
    state: customer.state,
    postcode: customer.zip,
    country: 'US',
  }

  const metaData: Array<{ key: string; value: string }> = [
    { key: 'storefront', value: STOREFRONT },
    { key: 'memo_code', value: memoCode },
    { key: 'invoice_id', value: memoCode },
    { key: 'payment_method_detail', value: paymentMethodTitle },
  ]
  if (couponCode) metaData.push({ key: 'coupon_code', value: couponCode })
  if (couponDiscount) metaData.push({ key: 'coupon_discount', value: String(couponDiscount) })
  if (txHash) metaData.push({ key: 'tx_hash', value: txHash })
  if (btcAddress) metaData.push({ key: 'btc_address', value: btcAddress })
  // USDT/USDC — same generic 'crypto_address' meta key the WP-side email
  // template (vp-cms.php's {payment_instructions} var) checks, so the
  // wallet address/QR shows up in the confirmation email for these too.
  if (cryptoAddress) metaData.push({ key: 'crypto_address', value: cryptoAddress })
  if (cryptoToken) metaData.push({ key: 'crypto_token', value: cryptoToken })
  if (cryptoNetwork) metaData.push({ key: 'crypto_network', value: cryptoNetwork })
  // Affiliate attribution — read from the vp_aff_ref cookie client-side (see
  // src/utils/affiliate.ts). The vp-affiliates WP plugin reads this meta the
  // moment the order is created and records a pending commission against it.
  if (affiliateRef) metaData.push({ key: 'affiliate_ref', value: affiliateRef })

  // Subscribe & Save — present when any cart item has a subscribeInterval.
  // MSV orders are built from fee_lines (no product catalog/SKUs yet), not
  // real WooCommerce line_items, so the msv-subscriptions plugin can't
  // reconstruct the subscription's item list from $order->get_items() the
  // way it can on Vintage Peptides. Instead we hand it the whole cart
  // pre-shaped as JSON in its own meta field — self-contained, and it'll
  // keep working unchanged even after MSV products get real SKUs later.
  const subItem = items.find((i) => i.subscribeInterval)
  if (subItem) {
    metaData.push({ key: 'subscription_interval', value: String(subItem.subscribeInterval) })
    metaData.push({ key: 'subscription_discount_pct', value: String(subItem.subscriptionDiscountPct ?? 0) })
    metaData.push({
      key: 'subscription_items',
      value: JSON.stringify(items.map((i) => ({
        sku: i.peptideCode ?? '',
        name: i.name + (i.dosage ? ` — ${i.dosage}` : ''),
        quantity: i.quantity,
        unit_price: i.price,
        discounted_price: i.price, // ProductCard already applies the subscriber discount before adding to cart
      }))),
    })
  }

  const wcOrder = {
    status: 'on-hold',
    billing: address,
    shipping: address,
    fee_lines: feeLines,
    payment_method: paymentMethod,
    payment_method_title: paymentMethodTitle,
    customer_note: notes,
    meta_data: metaData,
    set_paid: false,
    ...(userId ? { customer_id: userId } : {}),
  }

  // Reserve stock before creating the order — resolve each cart item's SKU
  // to a real product/variation ID and atomically decrement it. Items with
  // no peptideCode (custom/non-catalog items) are skipped, matching prior
  // behavior for those.
  const stockLookups = await Promise.all(
    items.map(async (item) => {
      if (item.wcProductId) return { product_id: item.wcProductId, variation_id: item.wcVariationId ?? 0, qty: item.quantity }
      if (!item.peptideCode) return null
      const ids = await resolveSkuIds(item.peptideCode)
      return ids ? { product_id: ids.product_id, variation_id: ids.variation_id, qty: item.quantity } : null
    })
  )
  const stockItems: StockItem[] = stockLookups.filter((x): x is StockItem => x !== null)
  let reservedItems: StockItem[] = []

  if (stockItems.length > 0) {
    const adjustResults = await adjustStock(stockItems, 'decrease')
    const byPostId = new Map(adjustResults.map((r) => [r.post_id, r]))
    const outOfStock = stockItems.filter((item) => {
      const key = item.variation_id || item.product_id
      const result = byPostId.get(key)
      return result && result.managed && !result.ok
    })

    if (outOfStock.length > 0) {
      const succeeded = stockItems.filter((item) => {
        const key = item.variation_id || item.product_id
        const result = byPostId.get(key)
        return result && result.ok && result.managed
      })
      if (succeeded.length > 0) await adjustStock(succeeded, 'increase')

      res.status(409).json({
        error: 'One or more items just sold out. Please review your cart.',
        outOfStock: outOfStock.map((i) => i.variation_id || i.product_id),
      }); return
    }

    reservedItems = stockItems.filter((item) => {
      const key = item.variation_id || item.product_id
      const result = byPostId.get(key)
      return result && result.ok && result.managed
    })
  }

  try {
    const wcRes = await fetch(`${WP_BASE}/wp-json/wc/v3/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: basicAuth(),
      },
      body: JSON.stringify(wcOrder),
    })

    const data = await wcRes.json() as { id?: number; number?: string; message?: string; code?: string; data?: unknown }

    if (!wcRes.ok) {
      if (reservedItems.length > 0) await adjustStock(reservedItems, 'increase')
      console.error('[submit-order] WC error:', wcRes.status, JSON.stringify(data))
      res.status(502).json({
        error: 'Failed to create order in WooCommerce',
        wc_status: wcRes.status,
        wc_code: data.code,
        wc_message: data.message,
      }); return
    }

    // Best-effort sync of the shopper's new address back onto their saved WC
    // customer record — WooCommerce does NOT do this automatically just
    // because customer_id was set on the order. Non-fatal: a failure here
    // shouldn't fail an otherwise-successful checkout.
    if (userId) {
      try {
        await fetch(`${WP_BASE}/wp-json/wc/v3/customers/${userId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json', Authorization: basicAuth() },
          body: JSON.stringify({ billing: address, shipping: address }),
        })
      } catch (e) {
        console.error('[submit-order] customer address sync failed (non-fatal)', e)
      }
    }

    res.status(200).json({ order_id: data.id, order_number: data.number ?? data.id, memo_code: memoCode })
  } catch (err) {
    console.error('[submit-order] Exception:', err)
    if (reservedItems.length > 0) await adjustStock(reservedItems, 'increase')
    res.status(500).json({ error: 'Internal error submitting order' })
  }
}
