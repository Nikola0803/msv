/**
 * Role-based tier pricing.
 *
 * Every customer is manually assigned one of 4 pricing tiers by an admin
 * in WooCommerce (see WP Plugins/vp-tier-pricing). Guests and customers
 * with no assigned tier default to Retail — the same price the site has
 * always shown, so this is fully backwards compatible.
 *
 * Tier prices are attached to each product/variation by the /api/products
 * proxy as `tierPrices`, sourced from `_tier_price_*` product meta. The
 * customer's own tier is attached to their session at login (see
 * /api/auth's `login` action, which fans out to the vp-tier-pricing/v1/
 * user-tier endpoint) and stored alongside the rest of `msv_user` in
 * sessionStorage, matching how the app already tracks the logged-in user
 * (see Navbar.tsx / login/page.tsx).
 *
 * customPct is an optional, per-customer, per-brand override an admin can
 * set on that same profile (WooCommerce > Customer Tiers, or the user's
 * own profile page) — a straight % off Retail for one specific person,
 * outside the 4 fixed tiers, mirroring how vp-affiliates lets an admin
 * give one affiliate a custom commission % instead of the storefront
 * default. When set, it takes priority over whichever tier is assigned.
 */

import type { Product } from '@/mocks/products';

export type PricingTier = 'retail' | 'wholesale' | 'affiliate' | 'friends_family';

export interface TierPrices {
  retail?: number;
  wholesale?: number;
  affiliate?: number;
  friends_family?: number;
}

export const TIER_LABELS: Record<PricingTier, string> = {
  retail: 'Retail',
  wholesale: 'Wholesale',
  affiliate: 'Affiliate',
  friends_family: 'Friends & Family',
};

const VALID_TIERS: PricingTier[] = ['retail', 'wholesale', 'affiliate', 'friends_family'];

/** Reads the logged-in user's assigned pricing tier out of the same
 *  sessionStorage blob the rest of the app already uses. Defaults to
 *  'retail' for guests, or if no tier was ever assigned. */
export function getCurrentUserTier(): PricingTier {
  try {
    const raw = sessionStorage.getItem('msv_user');
    if (!raw) return 'retail';
    const user = JSON.parse(raw);
    const tier = user?.tier;
    return VALID_TIERS.includes(tier) ? tier : 'retail';
  } catch {
    return 'retail';
  }
}

/** Reads the logged-in user's custom discount % override (if an admin set
 *  one for this brand), or null if none is set — meaning use the tier's
 *  normal fixed price instead. See /api/auth's login action, which fans
 *  the vp-tier-pricing/v1/user-tier response's `custom_pct` field into
 *  `msv_user.customPct` alongside `tier`. */
export function getCurrentUserCustomPct(): number | null {
  try {
    const raw = sessionStorage.getItem('msv_user');
    if (!raw) return null;
    const user = JSON.parse(raw);
    const pct = user?.customPct;
    return typeof pct === 'number' && pct >= 0 && pct <= 100 ? pct : null;
  } catch {
    return null;
  }
}

/** Resolves the price a single flattened product/variation record should
 *  show for a given tier, falling back to the record's own base price
 *  (WooCommerce's regular product price) if that tier was never set for
 *  this SKU — so partially-priced catalogs never show $0 or blank. A
 *  customPct override (see getCurrentUserCustomPct) beats the tier price
 *  entirely — it's a straight % off Retail for that one customer. */
export function getTierPrice(
  product: Pick<Product, 'priceMin'> & { tierPrices?: TierPrices },
  tier: PricingTier = getCurrentUserTier(),
  customPct: number | null = getCurrentUserCustomPct()
): number {
  const retail = product.tierPrices?.retail ?? product.priceMin;

  if (customPct !== null && typeof retail === 'number' && retail > 0) {
    return Math.round(retail * (1 - customPct / 100) * 100) / 100;
  }

  const fromTier = product.tierPrices?.[tier];
  if (typeof fromTier === 'number' && fromTier > 0) return fromTier;

  if (tier !== 'retail' && typeof retail === 'number' && retail > 0) return retail;

  return product.priceMin;
}

/** Returns a new product array with priceMin/priceMax overridden to the
 *  given tier's price (or the customer's custom % override, if any).
 *  Every existing call site (ProductCard, shop sort, groupProducts, the
 *  PDP, the cart's add-to-cart snapshot) reads price off priceMin/priceMax
 *  already, so applying the tier once here — right where products enter
 *  the app via useProducts() — is enough to make every one of them
 *  tier-aware without individually touching each. */
export function applyTierPricing<T extends Product & { tierPrices?: TierPrices }>(
  products: T[],
  tier: PricingTier = getCurrentUserTier(),
  customPct: number | null = getCurrentUserCustomPct()
): T[] {
  return products.map((p) => {
    const price = getTierPrice(p, tier, customPct);
    return price === p.priceMin && price === p.priceMax ? p : { ...p, priceMin: price, priceMax: price };
  });
}
