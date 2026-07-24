import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { products as MOCK_PRODUCTS, type Product } from '../mocks/products';
import { applyTierPricing, getCurrentUserTier, getCurrentUserCustomPct } from '../utils/pricing';

interface ProductsState {
  products: Product[];
  loading: boolean;
  fromApi: boolean;
}

const ProductsContext = createContext<ProductsState>({
  products: [],
  loading: true,
  fromApi: false,
});

// BUG FIX 2026-07-21: this used to fetch exactly once, in a useEffect with a
// [] dependency array, at the moment ProductsProvider first mounted — which,
// since it wraps the whole app at the root (see App.tsx), only ever happens
// once per browser tab. There was no code path that ever fetched again, so
// if an admin edited or deleted products in WooCommerce, the storefront kept
// showing the old catalog for as long as that tab stayed open — an hour, a
// day, whatever — with no relation to the server's Cache-Control TTL, since
// no new request was ever even made. A periodic re-fetch (below) means the
// app keeps itself reasonably in sync without needing a hard reload.
const REFRESH_INTERVAL_MS = 60_000; // 1 minute
const MAX_ATTEMPTS = 3;
const RETRY_DELAY_MS = 700;

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function fetchOnce(signal: AbortSignal): Promise<Product[]> {
  const res = await fetch('/api/products', { signal });
  if (!res.ok) throw new Error(`API error ${res.status}`);
  const data: Product[] = await res.json();
  if (!Array.isArray(data) || data.length === 0) throw new Error('Products API returned no data');
  return data;
}

export function ProductsProvider({ children }: { children: ReactNode }) {
  // BUG FIX 2026-07-24 (critical): this used to seed state with MOCK_PRODUCTS
  // immediately, on every fresh page load, before the live fetch had even
  // been tried. Any component rendering during that window (nav, home,
  // shop, related products) built links off FAKE mock ids (slugs like
  // 'cjc-ipa-10', not WooCommerce's real numeric ids) instead of waiting.
  // If the live /api/products call was ever slow (cold serverless start,
  // slow WC response), users could click through — or refresh moments
  // later once the real catalog loaded — and hit "Product Not Found"
  // because that id never existed in the real catalog. Reproduced
  // identically on every storefront sharing this pattern. Fixed by starting
  // truly empty + loading (every consumer here already gates on `loading`)
  // and retrying the live fetch a few times before ever falling back.
  const [state, setState] = useState<ProductsState>({
    products: [],
    loading: true,
    fromApi: false,
  });

  useEffect(() => {
    let cancelled = false;

    const fetchProducts = async () => {
      for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 10_000);
        try {
          const data = await fetchOnce(controller.signal);
          clearTimeout(timeout);
          if (cancelled) return;
          setState({ products: data, loading: false, fromApi: true });
          return;
        } catch {
          clearTimeout(timeout);
          if (cancelled) return;
          if (attempt < MAX_ATTEMPTS) {
            await sleep(RETRY_DELAY_MS * attempt);
            continue;
          }
          // Every retry failed. Only fall back to mock data if we never got
          // a real catalog yet — a transient failure on a background
          // refresh shouldn't wipe out an already-loaded real catalog.
          setState((prev) => (prev.fromApi ? prev : { products: MOCK_PRODUCTS, loading: false, fromApi: false }));
        }
      }
    };

    fetchProducts();
    const interval = setInterval(fetchProducts, REFRESH_INTERVAL_MS);

    return () => { cancelled = true; clearInterval(interval); };
  }, []);

  return <ProductsContext.Provider value={state}>{children}</ProductsContext.Provider>;
}

/**
 * useProducts — reads the raw catalog from context and re-prices it for
 * the current customer's tier (Retail/Wholesale/Affiliate/Friends &
 * Family — see src/utils/pricing.ts).
 *
 * BUG FIX 2026-07-21: the memo's dependency array used to be just
 * [raw.products]. Since raw.products is the SAME array reference for the
 * entire browser session (ProductsProvider fetches it once, at the app
 * root, and never refetches on navigation), that meant getCurrentUserTier()
 * only ever got evaluated ONCE — at the first render, before anyone had
 * logged in, so it locked in 'retail' and never recalculated again for the
 * rest of the session, no matter who logged in afterward. Every customer,
 * logged in or not, always saw Retail. Reading the tier/customPct here
 * (every render) and listing them as dependencies means a fresh mount of
 * any product-list page after login (Shop, Home, PDP) re-evaluates
 * sessionStorage and actually applies the tier this time.
 */
export function useProducts() {
  const raw = useContext(ProductsContext);
  const tier = getCurrentUserTier();
  const customPct = getCurrentUserCustomPct();
  const products = useMemo(
    () => applyTierPricing(raw.products, tier, customPct),
    [raw.products, tier, customPct]
  );
  return { ...raw, products };
}
