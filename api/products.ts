import type { VercelRequest, VercelResponse } from '@vercel/node';

const WC_URL          = (process.env.WC_URL ?? '').replace(/\/$/, '');
const WC_USER         = process.env.WC_USER ?? '';
const WC_APP_PASSWORD = process.env.WC_APP_PASSWORD ?? '';

function wcAuth(): string {
  return 'Basic ' + Buffer.from(`${WC_USER}:${WC_APP_PASSWORD}`).toString('base64');
}

function getMeta(metaData: any[], key: string): string {
  return metaData?.find((m: any) => m.key === key || m.key === `_${key}`)?.value ?? '';
}

const TIER_KEYS = ['retail', 'wholesale', 'affiliate', 'friends_family'] as const;

/** Reads the 4 `_tier_price_*` fields written by the vp-tier-pricing WP
 *  plugin out of a product or variation's meta_data. Any tier left unset
 *  is simply omitted — src/utils/pricing.ts falls back to the base price. */
function getTierPrices(metaData: any[]): Record<string, number> | undefined {
  const out: Record<string, number> = {};
  for (const key of TIER_KEYS) {
    const raw = getMeta(metaData, `tier_price_${key}`);
    const val = parseFloat(raw);
    if (raw !== '' && !Number.isNaN(val) && val > 0) out[key] = val;
  }
  return Object.keys(out).length ? out : undefined;
}

function stripHtml(html: string): string {
  return (html || '').replace(/<[^>]+>/g, '').replace(/&nbsp;/g, ' ').trim();
}

function mapSubcategory(catName: string): string {
  const c = catName.toLowerCase();
  if (c.includes('blend'))   return 'blends';
  if (c.includes('glp'))     return 'glp';
  if (c.includes('metabolic') || c.includes('bioregul')) return 'metabolic';
  return 'peptides';
}

function mapCategory(catName: string): string {
  const sub = mapSubcategory(catName);
  if (sub === 'blends')    return 'blends';
  if (sub === 'metabolic') return 'bioregulators';
  return 'compounds';
}

// BUG FIX 2026-07-23: this used to derive status from quantity alone, and
// returned 'In Stock' whenever qty was null — which is the common case,
// since most of the catalog doesn't use WooCommerce's quantity tracking
// (manage_stock). That meant a product manually marked "Out of stock" in
// wc-admin (via the plain in-stock/out-of-stock toggle, not a quantity)
// still showed as available here, because this function never looked at
// WC's own authoritative `stock_status` field at all. Now that field is
// checked first; quantity only refines "in stock" into "low stock" once we
// already know it's actually in stock.
function stockStatus(wcStatus: string | undefined, qty: number | null): string {
  if (wcStatus === 'outofstock')  return 'Out of Stock';
  if (wcStatus === 'onbackorder') return 'On Backorder';
  if (qty !== null && qty !== undefined) {
    if (qty <= 0)  return 'Out of Stock';
    if (qty <= 10) return 'Low Stock';
  }
  return 'In Stock';
}

function extractDosageFromName(name: string): string {
  return (
    name.match(/—\s*([\d.]+\s*mg(?:\/\w+)?)/i)?.[1]?.trim() ||
    name.match(/\b([\d.]+\s*mg(?:\/\w+)?)\b/i)?.[1]?.trim() ||
    ''
  );
}

function slugifyPart(s: string): string {
  return (s || '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

// Added 2026-07-24 — product URLs used to be the raw WooCommerce numeric id
// (or "{productId}-{variationId}" for a variant), e.g. /product/794. Simple
// products already have a real, unique WordPress slug (p.slug) — use it
// directly. Variations don't have their own slug in WooCommerce's REST API,
// so build one from the parent's slug + the variation's dosage, falling
// back to the variation id if a dosage string is empty or collides.
function buildVariationSlug(parentSlug: string, dosage: string, variationId: number, used: Set<string>): string {
  const base = dosage ? `${parentSlug}-${slugifyPart(dosage)}` : `${parentSlug}-${variationId}`;
  if (!used.has(base)) { used.add(base); return base; }
  const withId = `${base}-${variationId}`;
  used.add(withId);
  return withId;
}

function flattenProducts(wcProducts: any[], variationsMap: Record<number, any[]>): any[] {
  const result: any[] = [];
  const usedSlugs = new Set<string>();
  for (const p of wcProducts) {
    const meta        = p.meta_data ?? [];
    const peptideCode = getMeta(meta, 'peptide_code');
    const casNumber   = getMeta(meta, 'cas') || getMeta(meta, 'cas_number');
    const purity      = getMeta(meta, 'purity') || '≥99%';
    const hasCoa      = getMeta(meta, 'has_coa') === '1';
    const coaUrl      = getMeta(meta, 'coa_url') || '#';
    const testUrl     = getMeta(meta, 'test_url') || '#';
    const wcCat       = p.categories?.[0]?.name ?? '';
    const image       = p.images?.[0]?.src ?? '';
    const description = stripHtml(p.description);
    const rating      = parseFloat(p.average_rating ?? '5') || 5;
    const reviewCount = p.rating_count ?? 0;

    if (p.type === 'variable') {
      for (const v of (variationsMap[p.id] ?? [])) {
        const dosageAttr = v.attributes?.find((a: any) => a.name?.toLowerCase() === 'dosage');
        const price = parseFloat(v.price || v.regular_price || '0');
        if (!price) continue;
        const qty = v.stock_quantity ?? p.stock_quantity ?? null;
        const wcStatus = v.stock_status ?? p.stock_status;
        const varMeta = v.meta_data ?? [];
        const dosage = dosageAttr?.option || extractDosageFromName(p.name) || '';
        result.push({
          id: `${p.id}-${v.id}`,
          slug: buildVariationSlug(p.slug || String(p.id), dosage, v.id, usedSlugs),
          wcProductId: p.id, wcVariationId: v.id,
          sku: v.sku || '', name: p.name, peptideCode, casNumber,
          category: mapCategory(wcCat), subcategory: mapSubcategory(wcCat),
          purity, priceMin: price, priceMax: price,
          dosage, description, rating, reviewCount,
          stockCount: qty ?? 99, stockStatus: stockStatus(wcStatus, qty),
          featured: !!p.featured, popular: false,
          hasCoa: getMeta(varMeta, 'has_coa') === '1' || hasCoa,
          coaUrl, testUrl, image,
          tierPrices: getTierPrices(varMeta.length ? varMeta : meta),
        });
      }
    } else {
      const price = parseFloat(p.price || p.regular_price || '0');
      if (!price) continue;
      const qty = p.stock_quantity ?? null;
      result.push({
        id: String(p.id), slug: p.slug || String(p.id), wcProductId: p.id, wcVariationId: null,
        sku: p.sku || '', name: p.name, peptideCode, casNumber,
        category: mapCategory(wcCat), subcategory: mapSubcategory(wcCat),
        purity, priceMin: price, priceMax: price,
        dosage: p.attributes?.find((a: any) => a.name?.toLowerCase() === 'dosage')?.options?.[0] || extractDosageFromName(p.name) || '',
        description, rating, reviewCount,
        stockCount: qty ?? 99, stockStatus: stockStatus(p.stock_status, qty),
        featured: !!p.featured, popular: false, hasCoa, coaUrl, testUrl, image,
        tierPrices: getTierPrices(meta),
      });
    }
  }
  return result;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });
  if (!WC_URL) return res.status(500).json({ error: 'WC_URL not configured' });

  const headers = { Authorization: wcAuth(), 'Content-Type': 'application/json' };

  // Piggyback the unpaid-order sweep off catalog traffic (2026-07-17). This
  // is the real safety net for the overselling fix — Vercel's Hobby plan
  // only allows daily cron jobs, far too coarse for a 2-hour hold window, so
  // instead we ride along on an endpoint that's hit constantly anyway. The WP
  // side self-rate-limits to once every 15 minutes regardless of how often
  // this fires, so the cost here is one cheap, usually-skipped request.
  try {
    await fetch(`${WC_URL}/wp-json/vp-products/v1/sweep-expired`, {
      method: 'POST',
      headers,
      signal: AbortSignal.timeout(4_000),
    });
  } catch (e) {
    console.error('[products] expired-order sweep failed (non-fatal)', e);
  }

  try {
    // Fetch every published product — paginated (WC's REST API caps
    // per_page at 100 and this endpoint used to only ever request page 1,
    // silently dropping any product past the 100th). This didn't matter
    // while the combined catalog (all 3 storefronts share one WooCommerce
    // install) stayed under 100 total published products, but it now
    // regularly exceeds that, and products past the cutoff vanished from
    // EVERY storefront regardless of their _vpcms_storefronts tag — not a
    // per-brand filtering bug, a page-1-only bug. Keep requesting pages
    // until WC's X-WP-TotalPages header says there are no more.
    // Page 1 first (need its X-WP-TotalPages header before we know how many
    // more requests to make), then every remaining page in PARALLEL rather
    // than one-at-a-time — sequential paging was pushing total wall-clock
    // time for this endpoint close to (and, without an explicit longer
    // function timeout configured in vercel.json — which MSV's was missing
    // entirely until now — past) the serverless function's execution limit
    // once the catalog grew past one page, which surfaced as an
    // intermittent hard failure that made the frontend silently fall back
    // to its baked-in mock catalog.
    const fetchPage = async (n: number) => {
      const r = await fetch(
        `${WC_URL}/wp-json/wc/v3/products?per_page=100&status=publish&page=${n}`,
        { headers, signal: AbortSignal.timeout(15_000) }
      );
      if (!r.ok) {
        const text = await r.text();
        throw new Error(`WC fetch failed (${r.status}): ${text}`);
      }
      const products: any[] = await r.json();
      const totalPagesHeader = r.headers.get('X-WP-TotalPages');
      return { products, totalPages: totalPagesHeader ? parseInt(totalPagesHeader, 10) || 1 : 1 };
    };

    const first = await fetchPage(1);
    const allProducts: any[] = [...first.products];
    if (first.totalPages > 1) {
      const rest = await Promise.all(
        Array.from({ length: first.totalPages - 1 }, (_, i) => fetchPage(i + 2))
      );
      for (const { products } of rest) allProducts.push(...products);
    }

    // Filter by storefront using meta_data
    const wcProducts = allProducts.filter((p) => {
      const sfMeta = (p.meta_data ?? []).find((m: any) => m.key === '_vpcms_storefronts');
      if (!sfMeta?.value || sfMeta.value === '[]' || sfMeta.value === '') return true;
      try { return JSON.parse(sfMeta.value).includes('msv'); } catch { return true; }
    });

    const variableProducts = wcProducts.filter((p) => p.type === 'variable');
    const variationsMap: Record<number, any[]> = {};

    await Promise.all(variableProducts.map(async (p) => {
      try {
        const r = await fetch(`${WC_URL}/wp-json/wc/v3/products/${p.id}/variations?per_page=100`,
          { headers, signal: AbortSignal.timeout(10_000) });
        if (r.ok) variationsMap[p.id] = await r.json();
      } catch { variationsMap[p.id] = []; }
    }));

    const products = flattenProducts(wcProducts, variationsMap);
    res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate=600');
    return res.status(200).json(products);
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Unknown error' });
  }
}
