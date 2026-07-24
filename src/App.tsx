import { useState } from 'react';
import { CartProvider } from './context/CartContext';
import { SectionsProvider, useSections } from './context/SectionsContext';
import { ProductsProvider } from './context/ProductsContext';
import { BrowserRouter } from "react-router-dom";
import { AppRoutes } from "./router";
import { I18nextProvider } from "react-i18next";
import i18n from "./i18n";
import CartDrawer from "./components/feature/CartDrawer";
import FloatingCtaBar from "./components/feature/FloatingCtaBar";
import ScrollToTop from "./components/ScrollToTop";
import SplashScreen from "./components/feature/SplashScreen";
import AffiliateTracker from "./components/AffiliateTracker";

// ── CMS status indicator (dev only) ──────────────────────────────────────────
function CMSBadge() {
  const { fromCMS, loading } = useSections();
  if (import.meta.env.PROD) return null;
  return (
    <div style={{ position: 'fixed', bottom: 8, right: 8, zIndex: 9999, fontSize: 11,
      padding: '3px 8px', borderRadius: 4, background: loading ? '#888' : fromCMS ? '#166534' : '#92400e',
      color: '#fff', fontFamily: 'monospace', pointerEvents: 'none' }}>
      {loading ? '⏳ CMS…' : fromCMS ? '✓ CMS Live' : '⚠ Fallback'}
    </div>
  );
}

// ── Maintenance gate ──────────────────────────────────────────────────────────
// See VP's App.tsx for the full explanation — entering the right password
// (VITE_SITE_PASSWORD, set in Vercel's env vars) unlocks the site for that
// browser for the rest of the session, so testers/admins aren't locked out
// while ordinary visitors are blocked by "Maintenance" mode in WP Admin.
const SITE_UNLOCK_KEY = 'msv_site_unlocked';

function MaintenancePasswordForm({ onUnlock }: { onUnlock: () => void }) {
  const [input, setInput] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const configured = import.meta.env.VITE_SITE_PASSWORD as string | undefined;
    if (!configured) {
      setError('No site password is configured yet — set VITE_SITE_PASSWORD in Vercel and redeploy.');
      return;
    }
    if (input === configured) {
      sessionStorage.setItem(SITE_UNLOCK_KEY, '1');
      onUnlock();
    } else {
      setError('Incorrect password.');
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: '#1a2b1a', color: '#B08D57', fontFamily: 'Georgia, serif', textAlign: 'center', padding: 40 }}>
      <div style={{ maxWidth: 360, width: '100%' }}>
        <p style={{ fontSize: 12, letterSpacing: '0.3em', textTransform: 'uppercase', opacity: 0.6, marginBottom: 16 }}>
          My Secret Vitality
        </p>
        <h1 style={{ fontSize: 22, fontWeight: 400, marginBottom: 12 }}>Site Temporarily Unavailable</h1>
        <p style={{ fontSize: 14, opacity: 0.7, marginBottom: 24 }}>
          This site is currently undergoing maintenance. If you have the access password, enter it below.
        </p>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <input
            type="password"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Access password"
            autoFocus
            style={{ width: '100%', boxSizing: 'border-box', background: '#132013', border: '1px solid #B08D5755',
              color: '#EDE4D3', fontFamily: 'Georgia, serif', fontSize: 14, padding: '10px 12px', borderRadius: 4 }}
          />
          {error && <p style={{ fontSize: 12, color: '#e08080' }}>{error}</p>}
          <button type="submit" style={{ background: '#B08D57', color: '#1a2b1a', border: 'none',
            fontFamily: 'Georgia, serif', fontSize: 13, letterSpacing: '0.1em', textTransform: 'uppercase',
            padding: '10px 12px', borderRadius: 4, cursor: 'pointer' }}>
            Enter
          </button>
        </form>
      </div>
    </div>
  );
}

function MaintenanceGate({ children }: { children: React.ReactNode }) {
  const { sections, loading } = useSections();
  const [unlocked, setUnlocked] = useState(() => sessionStorage.getItem(SITE_UNLOCK_KEY) === '1');

  if (loading) return null;

  if (sections._maintenance && !unlocked) {
    return <MaintenancePasswordForm onUnlock={() => setUnlocked(true)} />;
  }
  return <>{children}</>;
}

function App() {
  return (
    <I18nextProvider i18n={i18n}>
      <SectionsProvider>
        <ProductsProvider>
        <CartProvider>
          <BrowserRouter basename={__BASE_PATH__}>
            <MaintenanceGate>
              <SplashScreen />
              <ScrollToTop />
              <AffiliateTracker />
              <AppRoutes />
              <CartDrawer />
              <FloatingCtaBar />
            </MaintenanceGate>
            <CMSBadge />
          </BrowserRouter>
        </CartProvider>
        </ProductsProvider>
      </SectionsProvider>
    </I18nextProvider>
  );
}

export default App;