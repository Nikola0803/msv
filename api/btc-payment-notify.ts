import type { VercelRequest, VercelResponse } from '@vercel/node'

// Unified env vars — same names as Vintage Peptides. WC_URL points to the shared WordPress.
const WP_BASE = (process.env.WC_URL ?? '').replace(/\/$/, '')
const WP_USER = process.env.WC_USER ?? ''
const WP_PASS = process.env.WC_APP_PASSWORD ?? ''

function basicAuth(): string {
  return 'Basic ' + Buffer.from(`${WP_USER}:${WP_PASS}`).toString('base64')
}

interface BlockCypherPayload {
  addresses: string[]
  confirmations: number
  hash: string
  [key: string]: unknown
}

interface WPOrderResult {
  order_id: number | string
  [key: string]: unknown
}

export default async function handler(req: VercelRequest, res: VercelResponse): Promise<void> {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' })
    return
  }

  let payload: BlockCypherPayload

  try {
    // Vercel parses JSON body automatically when Content-Type is application/json
    payload = req.body as BlockCypherPayload

    if (!payload || !Array.isArray(payload.addresses)) {
      res.status(400).json({ error: 'Invalid payload: missing addresses array' })
      return
    }
  } catch (err) {
    console.error('[btc-payment-notify] Failed to parse body:', err)
    res.status(400).json({ error: 'Failed to parse request body' })
    return
  }

  const { addresses, confirmations, hash } = payload

  // Process each address in the payload
  for (const address of addresses) {
    if (!address || typeof address !== 'string') {
      continue
    }

    let orderId: number | string | null = null

    // Look up the WooCommerce order associated with this address
    try {
      const lookupRes = await fetch(
        `${WP_BASE}/wp-json/msv-btc/v1/lookup-by-address?address=${encodeURIComponent(address)}`,
        {
          method: 'GET',
          headers: {
            Authorization: basicAuth(),
            'Content-Type': 'application/json',
          },
        }
      )

      if (!lookupRes.ok) {
        console.warn(
          `[btc-payment-notify] WP order-by-address returned ${lookupRes.status} for address ${address}`
        )
        continue
      }

      const orderData = (await lookupRes.json()) as WPOrderResult
      if (!orderData || !orderData.order_id) {
        console.log(`[btc-payment-notify] No order found for address ${address}`)
        continue
      }

      orderId = orderData.order_id
    } catch (err) {
      console.error(`[btc-payment-notify] Error looking up order for address ${address}:`, err)
      continue
    }

    // Confirm payment if we have at least 1 confirmation
    if (orderId !== null && confirmations >= 1) {
      try {
        const confirmRes = await fetch(`${WP_BASE}/wp-json/msv-btc/v1/confirm-payment`, {
          method: 'POST',
          headers: {
            Authorization: basicAuth(),
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            order_id: orderId,
            tx_hash: hash,
            confirmations,
          }),
        })

        if (!confirmRes.ok) {
          const body = await confirmRes.text()
          console.error(
            `[btc-payment-notify] WP confirm-payment failed for order ${orderId}:`,
            confirmRes.status,
            body
          )
        } else {
          console.log(
            `[btc-payment-notify] Payment confirmed for order ${orderId} (tx: ${hash}, confirmations: ${confirmations})`
          )
        }
      } catch (err) {
        console.error(
          `[btc-payment-notify] Exception confirming payment for order ${orderId}:`,
          err
        )
      }
    } else if (orderId !== null) {
      console.log(
        `[btc-payment-notify] Order ${orderId} found but confirmations=${confirmations} < 1, skipping confirmation`
      )
    }
  }

  // Always return 200 so BlockCypher doesn't retry indefinitely
  res.status(200).json({ received: true })
}
