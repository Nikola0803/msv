/**
 * POST /api/contact
 * Body: { name, email, institution?, message }
 *
 * 1. Saves email to shared WP CRM (source: contact-form, storefront: msv)
 * 2. Sends admin notification via WP — admin email is set per-storefront in WP Admin → Settings → VP CRM
 */
import type { VercelRequest, VercelResponse } from '@vercel/node'

const WC_URL = (process.env.WC_URL ?? '').replace(/\/$/, '').replace(/^https:\/\//, 'http://')
const WP_USER = process.env.WC_USER ?? ''
const WP_PASS = process.env.WC_APP_PASSWORD ?? ''
const STOREFRONT = process.env.STOREFRONT || 'msv'

function auth(): string {
  return 'Basic ' + Buffer.from(`${WP_USER}:${WP_PASS}`).toString('base64')
}

async function wpPost(path: string, body: unknown): Promise<Response> {
  return fetch(WC_URL + path, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: auth() },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(8_000),
  })
}

export default async function handler(req: VercelRequest, res: VercelResponse): Promise<void> {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' }); return
  }

  const { name, email, institution, message } = (req.body ?? {}) as {
    name?: string; email?: string; institution?: string; message?: string
  }

  if (!email || !String(email).includes('@')) {
    res.status(400).json({ error: 'Valid email required' }); return
  }
  if (!message || String(message).trim().length < 5) {
    res.status(400).json({ error: 'Message required' }); return
  }

  const errors: string[] = []

  // 1. Save to CRM
  try {
    await wpPost('/wp-json/vp-crm/v1/subscribe', {
      email: String(email).trim(),
      name: String(name || '').trim(),
      source: 'contact-form',
      storefront: STOREFRONT,
    })
  } catch (e) {
    errors.push('crm: ' + (e instanceof Error ? e.message : String(e)))
  }

  // 2. Admin notification via WP (admin email is configured per-storefront in VP CRM settings)
  try {
    await wpPost('/wp-json/vp-crm/v1/contact-notify', {
      name: String(name || '').trim(),
      email: String(email).trim(),
      institution: String(institution || '').trim(),
      message: String(message).trim(),
      storefront: STOREFRONT,
    })
  } catch (e) {
    errors.push('notify: ' + (e instanceof Error ? e.message : String(e)))
  }

  if (errors.length) console.warn('[contact]', errors)

  // Always return success — admin errors shouldn't block the visitor
  res.status(200).json({ success: true })
}
