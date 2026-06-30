// DIAGNOSTIC ONLY — delete this file after testing
import type { VercelRequest, VercelResponse } from '@vercel/node'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*')

  // Updated to unified env vars (WC_URL / WC_USER / WC_APP_PASSWORD)
  const WP_BASE = process.env.WC_URL ?? 'NOT SET'
  const WP_USER = process.env.WC_USER ?? 'NOT SET'
  const WP_PASS = process.env.WC_APP_PASSWORD ?? 'NOT SET'

  const auth = 'Basic ' + Buffer.from(`${WP_USER}:${WP_PASS}`).toString('base64')

  // Test 1: can we reach WP at all?
  let wpReachable = false
  let wpStatus = 0
  try {
    const r = await fetch(`${WP_BASE}/wp-json`, { headers: { Authorization: auth } })
    wpStatus = r.status
    wpReachable = r.ok
  } catch (e) {
    wpStatus = -1
  }

  // Test 2: can we reach WC REST API?
  let wcStatus = 0
  let wcBody: unknown = null
  try {
    const r = await fetch(`${WP_BASE}/wp-json/wc/v3/orders?per_page=1`, {
      headers: { Authorization: auth, 'Content-Type': 'application/json' }
    })
    wcStatus = r.status
    wcBody = await r.json()
  } catch (e) {
    wcBody = String(e)
  }

  res.status(200).json({
    env: {
      WC_URL: WP_BASE,
      WC_USER_prefix: WP_USER.substring(0, 10) + '...',
      WC_APP_PASSWORD_set: WP_PASS !== 'NOT SET',
    },
    wp_reachable: wpReachable,
    wp_status: wpStatus,
    wc_status: wcStatus,
    wc_response: wcBody,
  })
}
