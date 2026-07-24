import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { captureAffiliateRef } from '@/utils/affiliate';

/**
 * Mounted once in App.tsx alongside ScrollToTop. Checks every route change
 * for a ?ref=CODE query param and, if present, sets the 30-day affiliate
 * cookie and records the click. Renders nothing.
 */
export default function AffiliateTracker() {
  const { search } = useLocation();

  useEffect(() => {
    captureAffiliateRef();
  }, [search]);

  return null;
}
