import type { VercelRequest, VercelResponse } from '@vercel/node';

/**
 * POST /api/login
 * Body: { email: string, password: string }
 * Validates credentials via the WP msv/v1/login REST endpoint, then
 * attaches the customer's manually-assigned pricing tier for the MSV
 * storefront (Retail / Wholesale / Affiliate / Friends & Family — see
 * WP Plugins/vp-tier-pricing, WooCommerce > Customer Tiers) so the
 * frontend can show correct pricing right after login. Non-fatal if the
 * tier lookup fails — the frontend already defaults to 'retail'.
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { email, password } = req.body ?? {};

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required.' });
  }

  const WC_URL = process.env.WC_URL || process.env.VITE_WC_URL || '';
  const WC_USER = process.env.WC_USER || '';
  const WC_APP_PASSWORD = process.env.WC_APP_PASSWORD || '';

  if (!WC_URL) {
    return res.status(500).json({ error: 'Server configuration error.' });
  }

  const wpAuth = 'Basic ' + Buffer.from(`${WC_USER}:${WC_APP_PASSWORD}`).toString('base64');

  try {
    const r = await fetch(`${WC_URL}/wp-json/msv/v1/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: wpAuth,
      },
      body: JSON.stringify({ email, password }),
    });

    const data = await r.json().catch(() => ({}));

    if (!r.ok) {
      return res.status(401).json({ error: (data as any).error || 'Invalid email or password.' });
    }

    // Resolve the WP user ID from either 'userId' or the 'acct_ref' fallback
    // vp-cms.php's vpcms_rest_login() also sends (that field has been
    // observed missing on some requests while 'acct_ref' carries the same
    // value through fine — see the DIAGNOSTIC comment there). Gating the
    // tier/billing lookups on 'data?.userId' alone would silently skip them
    // on exactly the requests where this happens, same bug ported from VP's
    // api/auth.ts fix (2026-07-21).
    const resolvedUserId = data?.userId ?? data?.acct_ref;

    let tier = 'retail';
    let customPct: number | null = null;
    let noShipping = false;
    if (resolvedUserId) {
      try {
        const tierRes = await fetch(
          `${WC_URL}/wp-json/vp-tier-pricing/v1/user-tier?user_id=${encodeURIComponent(resolvedUserId)}&storefront=msv`,
          { headers: { Authorization: wpAuth }, signal: AbortSignal.timeout(8_000) }
        );
        if (tierRes.ok) {
          const tierData = await tierRes.json().catch(() => ({}));
          if (tierData?.tier) tier = tierData.tier;
          if (typeof tierData?.custom_pct === 'number') customPct = tierData.custom_pct;
          if (tierData?.no_shipping === true) noShipping = true;
        }
      } catch (e) {
        console.error('[msv/login tier lookup]', e);
      }
    }

    // Saved billing address, so checkout can autofill it for a returning
    // logged-in customer instead of leaving the form blank every time.
    let billing: { phone?: string; address_1?: string; city?: string; state?: string; postcode?: string } | null = null;
    if (resolvedUserId) {
      try {
        const custRes = await fetch(
          `${WC_URL}/wp-json/wc/v3/customers/${encodeURIComponent(resolvedUserId)}`,
          { headers: { Authorization: wpAuth }, signal: AbortSignal.timeout(8_000) }
        );
        if (custRes.ok) {
          const custData = await custRes.json().catch(() => ({}));
          if (custData?.billing) {
            billing = {
              phone: custData.billing.phone || '',
              address_1: custData.billing.address_1 || '',
              city: custData.billing.city || '',
              state: custData.billing.state || '',
              postcode: custData.billing.postcode || '',
            };
          }
        }
      } catch (e) {
        console.error('[msv/login billing lookup]', e);
      }
    }

    return res.status(200).json({ ...data, userId: resolvedUserId, tier, customPct, noShipping, billing });
  } catch (e) {
    console.error('[msv/login]', e);
    return res.status(500).json({ error: 'Login failed. Please try again.' });
  }
}
