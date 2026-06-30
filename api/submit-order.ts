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

interface CartItem {
  id: string | number
  name: string
  price: number
  quantity: number
  peptideCode?: string
  dosage?: string
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

  const { customer, items, paymentMethod, paymentMethodTitle, memoCode, notes, couponCode, couponDiscount, txHash, btcAddress } = body

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
      console.error('[submit-order] WC error:', wcRes.status, JSON.stringify(data))
      res.status(502).json({
        error: 'Failed to create order in WooCommerce',
        wc_status: wcRes.status,
        wc_code: data.code,
        wc_message: data.message,
      }); return
    }

    res.status(200).json({ order_id: data.id, order_number: data.number ?? data.id, memo_code: memoCode })
  } catch (err) {
    console.error('[submit-order] Exception:', err)
    res.status(500).json({ error: 'Internal error submitting order' })
  }
}
