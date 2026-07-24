/**
 * useBundles — fetches live stack/bundle data from WP via /api/bundles.
 *
 * Starts with mock data immediately (never blank), replaces with live data
 * when the API responds with a non-empty array. Pattern mirrors useProducts.
 */

import { useState, useEffect } from 'react';
import { bundles as MOCK_BUNDLES, type Bundle } from '@/mocks/bundles';

// ─── Module-level cache ────────────────────────────────────────────────────────
let cachedBundles: Bundle[] | null = null;
let inflightPromise: Promise<Bundle[]> | null = null;

function loadBundles(): Promise<Bundle[]> {
  if (inflightPromise) return inflightPromise;
  inflightPromise = fetch('/api/bundles')
    .then((r) => {
      if (!r.ok) throw new Error(`Bundles API returned ${r.status}`);
      return r.json() as Promise<Bundle[]>;
    })
    .then((data) => {
      if (Array.isArray(data) && data.length > 0) {
        cachedBundles = data;
        return data;
      }
      // API returned empty — keep using mock
      return MOCK_BUNDLES;
    })
    .catch(() => {
      inflightPromise = null; // allow retry on next mount
      return MOCK_BUNDLES;
    });
  return inflightPromise;
}

// ─── Hook ─────────────────────────────────────────────────────────────────────
export function useBundles() {
  const [bundles, setBundles] = useState<Bundle[]>(cachedBundles ?? MOCK_BUNDLES);
  const [loading, setLoading] = useState<boolean>(!cachedBundles);

  useEffect(() => {
    if (cachedBundles) {
      setBundles(cachedBundles);
      setLoading(false);
      return;
    }
    let cancelled = false;
    setLoading(true);
    loadBundles().then((data) => {
      if (!cancelled) {
        setBundles(data);
        setLoading(false);
      }
    });
    return () => { cancelled = true; };
  }, []);

  return { bundles, loading };
}
