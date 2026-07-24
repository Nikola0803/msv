import type { Product } from '@/mocks/products';

/** Extract base name by stripping trailing "— Xmg" / "- Xmg" dosage suffix */
function getBaseName(name: string): string {
  return name.replace(/\s*[-–—]\s*[\d.]+\s*mg.*$/i, '').trim();
}

/**
 * Groups a flat product list by base name (dosage suffix stripped), so that
 * multi-dosage products (each dosage stored as its own product record) can
 * be rendered as a single card/page with a dosage/variant selector.
 *
 * Used by the Shop grid, the Home page grid, and the Product Detail page —
 * keep this the single source of truth so all three stay in sync.
 */
export function groupProducts(list: Product[]): { primary: Product; variants: Product[] }[] {
  const byBase = new Map<string, Product[]>();
  for (const p of list) {
    const key = getBaseName(p.name);
    const arr = byBase.get(key) ?? [];
    arr.push(p);
    byBase.set(key, arr);
  }
  return Array.from(byBase.values()).map((variants) => {
    const sorted = [...variants].sort((a, b) => a.priceMin - b.priceMin);
    return { primary: sorted[0], variants: sorted };
  });
}
