/**
 * Worker rotation client — MSV storefront
 *
 * Source of truth: shared WordPress REST API /wp-json/vp-p2p/v1/assign?method=X&storefront=msv
 * Fallback: static MSV_WORKERS config + localStorage counter (local dev / WP unreachable)
 *
 * VITE_WC_URL must be set on the Vercel project to point to the unified WordPress.
 * The p2p assign endpoint is public (no auth) so it can be called directly from the browser.
 */
import { MSV_WORKERS } from '@/config/workers';

const WP_BASE = import.meta.env.VITE_WC_URL
  ? String(import.meta.env.VITE_WC_URL).replace(/\/$/, '')
  : '';

export interface AssignResult {
  handle: string;
  worker_id: string;
  worker_name: string;
  method: string;
  source: 'server' | 'fallback';
}

function getLocalFallback(method: 'cashapp' | 'venmo' | 'zelle'): AssignResult {
  const active = MSV_WORKERS.filter(w => w.active && w.handles[method]);
  const counterKey = `msv_p2p_${method}_counter`;
  const counter = parseInt(localStorage.getItem(counterKey) || '0', 10);
  const worker = active[counter % active.length] ?? MSV_WORKERS[0];
  localStorage.setItem(counterKey, String((counter + 1) % Math.max(1, active.length)));
  return {
    handle: worker.handles[method],
    worker_id: worker.id,
    worker_name: worker.name,
    method,
    source: 'fallback',
  };
}

export async function assignP2PHandle(method: 'cashapp' | 'venmo' | 'zelle'): Promise<AssignResult> {
  if (!WP_BASE) return getLocalFallback(method);
  try {
    const res = await fetch(
      `${WP_BASE}/wp-json/vp-p2p/v1/assign?method=${method}&storefront=msv`,
      { signal: AbortSignal.timeout(4000) }
    );
    if (!res.ok) throw new Error('API error');
    const data = await res.json();
    return { ...data, source: 'server' };
  } catch {
    return getLocalFallback(method);
  }
}
