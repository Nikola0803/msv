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

function stockStatus(qty: number | null): string {
  if (qty === null || qty === undefined) return 'In Stock';
  if (qty <= 0)  return 'Out of Stock';
  if (qty <= 10) return 'Low Stock';
  return 'In Stock';
}

function flattenProducts(wcProducts: any[], variationsMap: Record<number, any[]>): any[] {
  const result: any[] = [];
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
        result.push({
          id: `${p.id}-${v.id}`, wcProductId: p.id, wcVariationId: v.id,
          sku: v.sku || '', name: p.name, peptideCode, casNumber,
          category: mapCategory(wcCat), subcategory: mapSubcategory(wcCat),
          purity, priceMin: price, priceMax: price,
          dosage: dosageAttr?.option ?? '', description, rating, reviewCount,
          stockCount: qty ?? 99, stockStatus: stockStatus(qty),
          featured: !!p.featured, popular: false,
          hasCoa: getMeta(v.meta_data ?? [], 'has_coa') === '1' || hasCoa,
          coaUrl, testUrl, image,
        });
      }
    } else {
      const price = parseFloat(p.price || p.regular_price || '0');
      if (!price) continue;
      const qty = p.stock_quantity ?? null;
      result.push({
        id: String(p.id), wcProductId: p.id, wcVariationId: null,
        sku: p.sku || '', name: p.name, peptideCode, casNumber,
        category: mapCategory(wcCat), subcategory: mapSubcategory(wcCat),
        purity, priceMin: price, priceMax: price,
        dosage: p.attributes?.find((a: any) => a.name?.toLowerCase() === 'dosage')?.options?.[0] ?? '',
        description, rating, reviewCount,
        stockCount: qty ?? 99, stockStatus: stockStatus(qty),
        featured: !!p.featured, popular: false, hasCoa, coaUrl, testUrl, image,
      });
    }
  }
  return result;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });
  if (!WC_URL) return res.status(500).json({ error: 'WC_URL not configured' });

  const headers = { Authorization: wcAuth(), 'Content-Type': 'application/json' };

  try {
    const productsRes = await fetch(
      `${WC_URL}/wp-json/wc/v3/products?per_page=100&status=publish`,
      { headers, signal: AbortSignal.timeout(15_000) }
    );
    if (!productsRes.ok) {
      const text = await productsRes.text();
      return res.status(502).json({ error: `WC fetch failed (${productsRes.status})`, detail: text });
    }

    const allProducts: any[] = await productsRes.json();

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
