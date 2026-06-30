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
function MaintenanceGate({ children }: { children: React.ReactNode }) {
  const { sections, loading } = useSections();
  if (loading) return null;
  if (sections._maintenance) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: '#1a2b1a', color: '#B08D57', fontFamily: 'Georgia, serif', textAlign: 'center', padding: 40 }}>
        <div>
          <p style={{ fontSize: 12, letterSpacing: '0.3em', textTransform: 'uppercase', opacity: 0.6, marginBottom: 16 }}>
            My Secret Vitality
          </p>
          <h1 style={{ fontSize: 22, fontWeight: 400, marginBottom: 12 }}>Site Temporarily Unavailable</h1>
          <p style={{ fontSize: 14, opacity: 0.7, maxWidth: 400 }}>
            This site is currently undergoing maintenance. Please check back soon or contact your administrator.
          </p>
        </div>
      </div>
    );
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