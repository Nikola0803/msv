// Run: npm install @scure/bip32 @scure/btc-signer
import type { VercelRequest, VercelResponse } from '@vercel/node'
import { HDKey } from '@scure/bip32'
import * as btc from '@scure/btc-signer'

// Unified env vars — same names as Vintage Peptides. WC_URL points to the shared WordPress.
const WP_BASE = (process.env.WC_URL ?? '').replace(/\/$/, '')
const WP_USER = process.env.WC_USER ?? ''
const WP_PASS = process.env.WC_APP_PASSWORD ?? ''
const BLOCKCYPHER_TOKEN = process.env.BLOCKCYPHER_TOKEN ?? ''
const VERCEL_URL = process.env.VERCEL_URL ?? ''

function basicAuth(): string {
  return 'Basic ' + Buffer.from(`${WP_USER}:${WP_PASS}`).toString('base64')
}

export default async function handler(req: VercelRequest, res: VercelResponse): Promise<void> {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

  if (req.method === 'OPTIONS') {
    res.status(204).end()
    return
  }

  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Method not allowed' })
    return
  }

  const { invoiceId } = req.query

  if (!invoiceId || typeof invoiceId !== 'string' || invoiceId.trim() === '') {
    res.status(400).json({ error: 'Missing or invalid invoiceId query parameter' })
    return
  }

  // Step 1: Fetch next index and zpub from WordPress
  let index: number
  let zpub: string

  try {
    const wpRes = await fetch(`${WP_BASE}/wp-json/msv-btc/v1/next-index`, {
      method: 'GET',
      headers: {
        Authorization: basicAuth(),
        'Content-Type': 'application/json',
      },
    })

    if (!wpRes.ok) {
      const body = await wpRes.text()
      console.error('[btc] WP next-index error:', wpRes.status, body)
      res.status(503).json({ error: 'Failed to fetch next BTC index from WordPress', details: body })
      return
    }

    const data = (await wpRes.json()) as { index: number; zpub: string }
    index = data.index
    zpub = data.zpub
  } catch (err) {
    console.error('[btc] WP next-index fetch exception:', err)
    res.status(503).json({ error: 'Unable to reach WordPress endpoint for next-index' })
    return
  }

  // Step 2: Derive child public key and encode as P2WPKH (bc1q...) address
  let address: string

  try {
    const root = HDKey.fromExtendedKey(zpub)
    const child = root.deriveChild(0).deriveChild(index)

    if (!child.publicKey) {
      throw new Error('Derived child has no public key')
    }

    const payment = btc.p2wpkh(child.publicKey)
    if (!payment.address) {
      throw new Error('p2wpkh returned no address')
    }
    address = payment.address
  } catch (err) {
    console.error('[btc] HD derivation error:', err)
    res.status(500).json({ error: 'BTC address derivation failed', details: String(err) })
    return
  }

  // Step 3: Record assignment in WordPress (two endpoints)
  // /record-assignment → admin log (single JSON array option)
  // /assign-address    → fast per-address WP option for notify webhook lookup
  await Promise.allSettled([
    fetch(`${WP_BASE}/wp-json/msv-btc/v1/record-assignment`, {
      method: 'POST',
      headers: { Authorization: basicAuth(), 'Content-Type': 'application/json' },
      body: JSON.stringify({ invoiceId, address, index }),
    }).then(r => { if (!r.ok) r.text().then(b => console.error('[btc] record-assignment error:', r.status, b)) })
      .catch(err => console.error('[btc] record-assignment exception:', err)),

    fetch(`${WP_BASE}/wp-json/msv-btc/v1/assign-address`, {
      method: 'POST',
      headers: { Authorization: basicAuth(), 'Content-Type': 'application/json' },
      body: JSON.stringify({ invoiceId, address, index }),
    }).then(r => { if (!r.ok) r.text().then(b => console.error('[btc] assign-address error:', r.status, b)) })
      .catch(err => console.error('[btc] assign-address exception:', err)),
  ])

  // Step 4: Register address for monitoring with BlockCypher (non-blocking on failure)
  try {
    const hookUrl = `https://${VERCEL_URL}/api/btc-payment-notify`
    const bcRes = await fetch(
      `https://api.blockcypher.com/v1/btc/main/hooks?token=${BLOCKCYPHER_TOKEN}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          event: 'unconfirmed-tx',
          address,
          url: hookUrl,
        }),
      }
    )

    if (!bcRes.ok) {
      const body = await bcRes.text()
      console.error('[btc] BlockCypher webhook registration error:', bcRes.status, body)
    }
  } catch (err) {
    console.error('[btc] BlockCypher webhook registration exception:', err)
    // Non-fatal — address is still valid, monitoring just won't auto-fire
  }

  res.status(200).json({ address, index, invoiceId })
}
