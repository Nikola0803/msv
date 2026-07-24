import type { VercelRequest, VercelResponse } from '@vercel/node';

/**
 * POST /api/register
 * Creates a WooCommerce customer account for MSV.
 * Body: { email, password, firstName, lastName?, institution? }
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { email, password, firstName, lastName = '', institution = '', phone = '', mmsConsent = false } = req.body ?? {};

  if (!email || !String(email).includes('@')) {
    return res.status(400).json({ error: 'Valid email is required.' });
  }
  if (!firstName?.trim()) {
    return res.status(400).json({ error: 'Full name is required.' });
  }
  if (!password || String(password).length < 8) {
    return res.status(400).json({ error: 'Password must be at least 8 characters.' });
  }

  const WC_URL = process.env.WC_URL || process.env.VITE_WC_URL || '';
  const WC_USER = process.env.WC_USER || '';
  const WC_APP_PASSWORD = process.env.WC_APP_PASSWORD || '';
  const WC_KEY = process.env.WC_KEY || process.env.VITE_WC_KEY || '';
  const WC_SECRET = process.env.WC_SECRET || process.env.VITE_WC_SECRET || '';

  if (!WC_URL) {
    return res.status(500).json({ error: 'Server configuration error.' });
  }

  const auth =
    WC_USER && WC_APP_PASSWORD
      ? 'Basic ' + Buffer.from(`${WC_USER}:${WC_APP_PASSWORD}`).toString('base64')
      : 'Basic ' + Buffer.from(`${WC_KEY}:${WC_SECRET}`).toString('base64');

  try {
    const r = await fetch(`${WC_URL}/wp-json/wc/v3/customers`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: auth,
        // Lets vp-cms.php's new-account email know which brand to render
        // without depending on the 'storefront' user meta being saved yet —
        // see vpcms_detect_storefront_from_request() for why.
        'X-Vp-Storefront': 'msv',
      },
      body: JSON.stringify({
        email: String(email).trim().toLowerCase(),
        password,
        first_name: String(firstName).trim(),
        last_name: String(lastName).trim(),
        username: String(email).trim().toLowerCase(),
        billing: phone ? { phone: String(phone).trim() } : undefined,
        meta_data: [
          { key: 'storefront', value: 'msv' },
          ...(institution ? [{ key: 'institution', value: String(institution).trim() }] : []),
          ...(phone       ? [{ key: 'phone',        value: String(phone).trim() }]       : []),
          { key: 'mms_consent', value: mmsConsent ? '1' : '0' },
        ],
      }),
    });

    if (!r.ok) {
      const err = await r.json().catch(() => ({})) as any;
      const msg: string =
        err?.message ||
        (err?.code === 'registration-error-email-exists'
          ? 'An account with this email already exists.'
          : 'Registration failed. Please try again.');
      return res.status(400).json({ error: msg });
    }

    return res.status(200).json({ success: true });
  } catch (e) {
    console.error('[msv/register]', e);
    return res.status(500).json({ error: 'Registration failed. Please try again.' });
  }
}
