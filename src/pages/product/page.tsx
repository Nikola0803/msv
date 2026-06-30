import { useParams, useNavigate } from 'react-router-dom';
import { useState, useMemo } from 'react';
import PageLayout from '@/components/feature/PageLayout';
import { useCart } from '@/context/CartContext';
import { useProducts } from '@/context/ProductsContext';
import ProductCard from '@/pages/home/components/ProductCard';

const tabs = [
  { label: 'Overview', value: 'overview' },
  { label: 'COA', value: 'coa' },
  { label: 'Test Results', value: 'tests' },
  { label: 'Research Protocol', value: 'protocol' },
];

const commonQuestions = [
  {
    q: 'What purity level does this product meet?',
    a: 'All My Secret Vitality compounds are purified by preparative HPLC to ≥99.0% purity, verified by analytical HPLC and electrospray mass spectrometry. Each batch receives a lot-specific Certificate of Analysis (CoA).',
  },
  {
    q: 'How should I store this product?',
    a: 'Lyophilized vials should be stored at -20°C in a desiccated environment. Reconstituted solutions are stable for 14 days at 2–8°C or 90 days at -20°C when stored in suitable aliquots.',
  },
  {
    q: 'Is this product suitable for human use?',
    a: 'No. All products sold by My Secret Vitality are strictly for laboratory research use only. They are not intended for human consumption, injection, or therapeutic use. By purchasing, you confirm you are a qualified researcher using this product in a controlled laboratory setting.',
  },
  {
    q: 'What is the reconstitution process?',
    a: 'Reconstitute with bacteriostatic water (0.9% benzyl alcohol) or sterile water for injection. Allow the vial to come to room temperature before opening. Add solvent slowly down the inner wall of the vial. Do not shake vigorously — gentle swirling is preferred.',
  },
  {
    q: 'Do you provide third-party testing documentation?',
    a: 'Yes. Every batch is independently tested by third-party laboratories. Full HPLC, Mass Spectrometry, and Amino Acid Analysis reports are available for download under the COA tab on each product page.',
  },
  {
    q: 'What are the shipping options?',
    a: 'We offer tracked domestic US shipping. Orders over $200 qualify for free shipping. All orders placed before 2:00 PM EST are dispatched the same day.',
  },
];

export default function ProductDetail() {
  const { products } = useProducts();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addItem } = useCart();
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedDosage, setSelectedDosage] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [openQuestion, setOpenQuestion] = useState<number | null>(0);

  const product = products.find((p) => p.id === id);

  const relatedProducts = useMemo(() => {
    if (!product) return [];
    const sameCategory = products.filter(
      (p) => p.id !== product.id && p.subcategory === product.subcategory
    );
    if (sameCategory.length >= 4) {
      return sameCategory.slice(0, 4);
    }
    const others = products.filter(
      (p) => p.id !== product.id && !sameCategory.includes(p)
    );
    return [...sameCategory, ...others].slice(0, 4);
  }, [product]);

  if (!product) {
    return (
      <PageLayout>
        <div className="py-24 text-center bg-background-50 grain-overlay">
          <div className="relative z-10">
            <span className="text-accent-500 text-lg font-heading italic">✦</span>
            <h1 className="font-heading text-xl tracking-[0.15em] uppercase text-foreground-950 mt-3 font-light">
              Product Not Found
            </h1>
            <button
              onClick={() => navigate('/shop')}
              className="mt-6 font-heading text-xs tracking-[0.15em] uppercase text-accent-500 hover:text-accent-400 transition-colors"
            >
              Return to Catalog
            </button>
          </div>
        </div>
      </PageLayout>
    );
  }

  const dosages = product.dosage.split(' / ');
  const currentPrice = selectedDosage ? product.priceMax : product.priceMin;
  const totalPrice = currentPrice * quantity;

  const StarRating = () => (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <span
          key={star}
          className={`w-3.5 h-3.5 flex items-center justify-center text-xs ${
            star <= Math.round(product.rating) ? 'text-accent-500' : 'text-accent-500/20'
          }`}
        >
          <i className="ri-star-fill" />
        </span>
      ))}
      <span className="font-mono text-xs text-foreground-600 ml-2">{product.rating} / 5.0</span>
      <span className="font-body text-xs text-foreground-600/60 ml-2 font-light">({product.reviewCount} verified reviews)</span>
    </div>
  );

  return (
    <PageLayout>
      <div className="py-8 md:py-12 bg-background-50 grain-overlay">
        <div className="relative z-10 max-w-7xl mx-auto px-4 md:px-8">
          <div className="flex items-center gap-2 mb-8 font-body text-xs text-foreground-600 font-light">
            <button onClick={() => navigate('/')} className="hover:text-accent-500 transition-colors">Home</button>
            <span>/</span>
            <button onClick={() => navigate('/shop')} className="hover:text-accent-500 transition-colors">Shop</button>
            <span>/</span>
            <span className="text-foreground-950 uppercase tracking-wider">{product.name}</span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16">
            <div>
              <div className="aspect-[4/5] border border-secondary-500/30 bg-background-100/40 relative overflow-hidden rounded-[2px]">
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-full object-cover object-center"
                />
                <div className="absolute top-4 left-4 stamp-badge w-16 h-16">
                  <span className="text-center leading-tight text-[11px]">
                    {product.purity}
                    <br />
                    <span className="text-[8px]">PURITY</span>
                  </span>
                </div>
                <div className="absolute top-4 right-4">
                  {product.stockCount <= 25 ? (
                    <span className="bg-foreground-950/90 border border-accent-500 text-accent-500 font-heading text-[9px] tracking-[0.15em] uppercase px-2.5 py-1 rounded-[2px]">
                      Only {product.stockCount} Left
                    </span>
                  ) : product.stockCount <= 60 ? (
                    <span className="bg-foreground-950/80 text-background-50/90 font-heading text-[9px] tracking-[0.15em] uppercase px-2.5 py-1 rounded-[2px] border border-secondary-500/20">
                      Low Stock
                    </span>
                  ) : (
                    <span className="bg-accent-500 text-foreground-950 font-heading text-[9px] tracking-[0.15em] uppercase px-2.5 py-1 rounded-[2px]">
                      In Stock
                    </span>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3 mt-4">
                <div className="aspect-square border border-secondary-500/20 bg-background-100/40 flex flex-col items-center justify-center p-2 text-center rounded-[2px]">
                  <span className="w-6 h-6 flex items-center justify-center text-accent-500 mb-1">
                    <i className="ri-flask-line text-sm" />
                  </span>
                  <span className="font-mono text-[10px] text-foreground-600/70 leading-tight">HPLC<br />Verified</span>
                </div>
                <div className="aspect-square border border-secondary-500/20 bg-background-100/40 flex flex-col items-center justify-center p-2 text-center rounded-[2px]">
                  <span className="w-6 h-6 flex items-center justify-center text-accent-500 mb-1">
                    <i className="ri-bar-chart-line text-sm" />
                  </span>
                  <span className="font-mono text-[10px] text-foreground-600/70 leading-tight">Mass<br />Spec ID</span>
                </div>
                <div className="aspect-square border border-secondary-500/20 bg-background-100/40 flex flex-col items-center justify-center p-2 text-center rounded-[2px]">
                  <span className="w-6 h-6 flex items-center justify-center text-accent-500 mb-1">
                    <i className="ri-map-pin-line text-sm" />
                  </span>
                  <span className="font-mono text-[10px] text-foreground-600/70 leading-tight">USA<br />Lyophilized</span>
                </div>
              </div>
            </div>

            <div>
              <div className="mb-2">
                <span className="font-mono text-[10px] tracking-wider uppercase text-accent-500">{product.subcategory}</span>
              </div>
              <h1 className="font-heading text-2xl md:text-3xl tracking-[0.12em] uppercase text-foreground-950 mb-2 font-light">
                {product.name}
              </h1>
              <p className="font-body text-base italic text-foreground-600 mb-3 font-light">
                {product.peptideCode}
              </p>
              <div className="mb-4">
                <StarRating />
              </div>
              <p className="font-mono text-sm text-accent-700 mb-6">
                CAS: {product.casNumber}
              </p>

              <div className="accent-rule max-w-xs mb-6" />

              <p className="font-body text-sm text-foreground-600 leading-relaxed mb-6 font-light">
                {product.description}
              </p>

              <div className="mb-6">
                <p className="font-heading text-[11px] tracking-[0.15em] uppercase text-foreground-950 mb-3 font-semibold">
                  Select Dosage
                </p>
                <div className="flex flex-wrap gap-2">
                  {dosages.map((d) => (
                    <button
                      key={d}
                      onClick={() => setSelectedDosage(d)}
                      className={`font-mono text-xs px-5 py-2.5 border rounded-[2px] transition-all duration-300 ${
                        selectedDosage === d
                          ? 'bg-accent-500 text-foreground-950 border-accent-500'
                          : 'bg-transparent text-foreground-600 border-secondary-500/40 hover:border-accent-500'
                      }`}
                    >
                      {d.trim()}
                    </button>
                  ))}
                </div>
              </div>

              <div className="mb-6">
                <p className="font-heading text-[11px] tracking-[0.15em] uppercase text-foreground-950 mb-3 font-semibold">
                  Quantity
                </p>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-10 h-10 flex items-center justify-center border border-secondary-500/30 text-foreground-950 hover:bg-accent-500 hover:text-foreground-950 rounded-[2px] transition-colors"
                  >
                    <i className="ri-subtract-line" />
                  </button>
                  <div className="w-12 h-10 flex items-center justify-center border border-secondary-500/30 font-mono text-sm text-foreground-950 rounded-[2px]">
                    {quantity}
                  </div>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="w-10 h-10 flex items-center justify-center border border-secondary-500/30 text-foreground-950 hover:bg-accent-500 hover:text-foreground-950 rounded-[2px] transition-colors"
                  >
                    <i className="ri-add-line" />
                  </button>
                </div>
              </div>

              <div className="flex items-baseline gap-4 mb-8">
                <span className="font-mono text-3xl text-accent-500 font-bold">
                  ${totalPrice}
                </span>
                <span className="font-body text-xs italic text-foreground-600 font-light">
                  ${currentPrice} per vial
                </span>
              </div>

              <button
                onClick={() =>
                  addItem({
                    id: product.id,
                    name: product.name,
                    peptideCode: product.peptideCode,
                    price: currentPrice,
                    dosage: selectedDosage || product.dosage,
                  })
                }
                className="w-full md:w-auto bg-accent-500 hover:bg-accent-400 text-foreground-950 font-heading text-xs tracking-[0.15em] uppercase py-4 px-12 border border-accent-500 rounded-[2px] transition-all duration-300 hover:shadow-[0_0_20px_rgba(176,141,87,0.3)] whitespace-nowrap"
              >
                Add to Cart
              </button>

              <div className="mt-3">
                <button
                  onClick={() => setActiveTab('coa')}
                  className="flex items-center gap-2 font-mono text-xs text-accent-500 hover:text-accent-700 transition-colors"
                >
                  <span className="w-4 h-4 flex items-center justify-center">
                    <i className="ri-file-list-3-line" />
                  </span>
                  View Certificate of Analysis (CoA)
                </button>
              </div>

              <div className="mt-5 flex items-center gap-2 p-3 border border-red-900/10 bg-red-900/[0.03] rounded-[2px]">
                <span className="w-5 h-5 flex items-center justify-center text-red-800/70">
                  <i className="ri-fire-line" />
                </span>
                <span className="font-mono text-xs text-red-900/80">
                  Limited stock — <strong className="text-red-900">13 people</strong> are viewing this product right now
                </span>
              </div>

              <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="flex items-start gap-2.5 p-3 border border-secondary-500/20 bg-background-100/40 rounded-[2px]">
                  <span className="w-5 h-5 flex items-center justify-center text-accent-500 mt-0.5">
                    <i className="ri-time-line" />
                  </span>
                  <div>
                    <p className="font-heading text-[10px] tracking-[0.15em] uppercase text-foreground-950">Same-Day Processing</p>
                    <p className="font-mono text-[10px] text-foreground-600/70 mt-0.5">Order before 2pm EST</p>
                  </div>
                </div>
                <div className="flex items-start gap-2.5 p-3 border border-secondary-500/20 bg-background-100/40 rounded-[2px]">
                  <span className="w-5 h-5 flex items-center justify-center text-accent-500 mt-0.5">
                    <i className="ri-truck-line" />
                  </span>
                  <div>
                    <p className="font-heading text-[10px] tracking-[0.15em] uppercase text-foreground-950">Tracked Delivery</p>
                    <p className="font-mono text-[10px] text-foreground-600/70 mt-0.5">US domestic shipping only</p>
                  </div>
                </div>
                <div className="flex items-start gap-2.5 p-3 border border-secondary-500/20 bg-background-100/40 sm:col-span-2 rounded-[2px]">
                  <span className="w-5 h-5 flex items-center justify-center text-accent-500 mt-0.5">
                    <i className="ri-customer-service-2-line" />
                  </span>
                  <div>
                    <p className="font-heading text-[10px] tracking-[0.15em] uppercase text-foreground-950">7-Day Expert Support</p>
                    <p className="font-mono text-[10px] text-foreground-600/70 mt-0.5">(208) 243-9222</p>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-4 mt-5 text-xs">
                <span className="flex items-center gap-1.5 font-mono text-foreground-600/60">
                  <span className="w-3.5 h-3.5 flex items-center justify-center text-accent-500">
                    <i className="ri-shield-check-line" />
                  </span>
                  Third-Party Tested
                </span>
                <span className="flex items-center gap-1.5 font-mono text-foreground-600/60">
                  <span className="w-3.5 h-3.5 flex items-center justify-center text-accent-500">
                    <i className="ri-truck-line" />
                  </span>
                  Free Shipping $200+
                </span>
                <span className="flex items-center gap-1.5 font-mono text-foreground-600/60">
                  <span className="w-3.5 h-3.5 flex items-center justify-center text-accent-500">
                    <i className="ri-refresh-line" />
                  </span>
                  Same-Day Dispatch
                </span>
              </div>

              <div className="mt-6 p-4 border border-dashed border-red-900/20 bg-red-900/[0.02] rounded-[2px]">
                <div className="flex items-start gap-3">
                  <span className="w-5 h-5 flex items-center justify-center text-red-900/50 mt-0.5">
                    <i className="ri-error-warning-line" />
                  </span>
                  <div>
                    <p className="font-heading text-[10px] tracking-[0.15em] uppercase text-red-900/80 mb-1">
                      For Research Use Only
                    </p>
                    <p className="font-mono text-[10px] leading-relaxed text-foreground-600/60">
                      Not intended for human consumption, injection, or therapeutic use. By purchasing, you confirm you are a qualified researcher using this product in a controlled laboratory setting.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="mt-16 border-t border-secondary-500/20 pt-8">
            <div className="flex flex-wrap gap-2 mb-8">
              {tabs.map((tab) => (
                <button
                  key={tab.value}
                  onClick={() => setActiveTab(tab.value)}
                  className={`font-heading text-[11px] tracking-[0.15em] uppercase px-5 py-2 border rounded-[2px] transition-all duration-300 whitespace-nowrap ${
                    activeTab === tab.value
                      ? 'bg-foreground-950 text-background-50 border-foreground-950'
                      : 'bg-transparent text-foreground-600 border-secondary-500/40 hover:border-accent-500 hover:text-foreground-950'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <div className="min-h-[200px]">
              {activeTab === 'overview' && (
                <div className="space-y-4">
                  <h3 className="font-heading text-sm tracking-[0.15em] uppercase text-foreground-950 font-semibold">
                    Product Overview
                  </h3>
                  <p className="font-body text-sm text-foreground-600 leading-relaxed font-light">
                    {product.description} This compound is lyophilized via solid-phase peptide synthesis (SPPS)
                    using Fmoc chemistry on a polystyrene resin. The crude peptide is purified by preparative
                    HPLC to a purity of {product.purity} or greater, as verified by analytical HPLC and
                    electrospray mass spectrometry.
                  </p>
                  <p className="font-body text-sm text-foreground-600 leading-relaxed font-light">
                    Each vial contains lyophilized powder sealed under argon. Reconstitution should be performed
                    with bacteriostatic water or the appropriate solvent for your research protocol. Store
                    lyophilized material at -20°C and reconstituted solution at 2-8°C.
                  </p>
                </div>
              )}

              {activeTab === 'coa' && (
                <div className="space-y-6">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                    <div className="p-4 border border-secondary-500/20 bg-background-100/30 rounded-[2px]">
                      <p className="font-mono text-[10px] text-foreground-600/60 uppercase mb-1">Purity</p>
                      <p className="font-mono text-lg text-accent-500 font-bold">{product.purity}</p>
                    </div>
                    <div className="p-4 border border-secondary-500/20 bg-background-100/30 rounded-[2px]">
                      <p className="font-mono text-[10px] text-foreground-600/60 uppercase mb-1">Appearance</p>
                      <p className="font-mono text-sm text-foreground-950">White Powder</p>
                    </div>
                    <div className="p-4 border border-secondary-500/20 bg-background-100/30 rounded-[2px]">
                      <p className="font-mono text-[10px] text-foreground-600/60 uppercase mb-1">Moisture</p>
                      <p className="font-mono text-sm text-foreground-950">&lt; 3.0%</p>
                    </div>
                    <div className="p-4 border border-secondary-500/20 bg-background-100/30 rounded-[2px]">
                      <p className="font-mono text-[10px] text-foreground-600/60 uppercase mb-1">Endotoxin</p>
                      <p className="font-mono text-sm text-foreground-950">&lt; 5 EU/mg</p>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-heading text-sm tracking-[0.15em] uppercase text-foreground-950 mb-5 font-semibold">
                      Download Documents
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {[
                        { name: 'Certificate of Analysis (COA)', file: `${product.name}_COA_LotVP2026-05.pdf`, size: '284 KB', date: 'May 2026', icon: 'ri-file-list-3-line' },
                        { name: 'HPLC Purity Report', file: `${product.name}_HPLC_2026-05.pdf`, size: '1.2 MB', date: 'May 2026', icon: 'ri-bar-chart-box-line' },
                        { name: 'Mass Spectrometry Report', file: `${product.name}_MS_2026-05.pdf`, size: '856 KB', date: 'May 2026', icon: 'ri-pulse-line' },
                        { name: 'Safety Data Sheet (SDS)', file: `${product.name}_SDS_2026.pdf`, size: '412 KB', date: 'May 2026', icon: 'ri-shield-check-line' },
                      ].map((doc, i) => (
                        <div key={i} className="flex items-center gap-4 p-4 border border-secondary-500/20 bg-background-100/30 hover:bg-background-100/50 transition-colors rounded-[2px]">
                          <span className="w-10 h-10 flex items-center justify-center text-accent-500 text-lg flex-shrink-0">
                            <i className={doc.icon} />
                          </span>
                          <div className="flex-1 min-w-0">
                            <p className="font-heading text-xs tracking-wider uppercase text-foreground-950 truncate">{doc.name}</p>
                            <p className="font-mono text-[10px] text-foreground-600/60 mt-0.5">
                              {doc.file} &middot; {doc.size} &middot; {doc.date}
                            </p>
                          </div>
                          <button className="flex items-center gap-1.5 px-3 py-2 border border-secondary-500/40 text-foreground-950 hover:bg-accent-500 hover:text-foreground-950 rounded-[2px] transition-all duration-300 flex-shrink-0">
                            <span className="w-4 h-4 flex items-center justify-center text-xs">
                              <i className="ri-download-line" />
                            </span>
                            <span className="font-mono text-[10px] tracking-wider uppercase">Download</span>
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="p-4 border border-dashed border-secondary-500/20 bg-background-100/20 rounded-[2px]">
                    <div className="flex items-start gap-3">
                      <span className="w-5 h-5 flex items-center justify-center text-accent-500/50 mt-0.5">
                        <i className="ri-information-line" />
                      </span>
                      <div>
                        <p className="font-heading text-[10px] tracking-[0.15em] uppercase text-foreground-950/80 mb-1">
                          Lot-Specific Documentation
                        </p>
                        <p className="font-mono text-[10px] leading-relaxed text-foreground-600/60">
                          All documents are lot-specific and generated by independent third-party laboratories. Each batch receives a unique lot number (e.g., VP2026-05) for full traceability. Download links are active for 90 days from batch release.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'tests' && (
                <div className="space-y-4">
                  <h3 className="font-heading text-sm tracking-[0.15em] uppercase text-foreground-950 font-semibold">
                    Analytical Test Results
                  </h3>
                  <div className="space-y-3">
                    {[
                      { test: 'HPLC Purity', result: product.purity, method: 'C18 reverse-phase, 220nm' },
                      { test: 'Mass Spectrometry', result: 'Confirmed', method: 'ESI-TOF MS' },
                      { test: 'Amino Acid Analysis', result: '±2% expected', method: 'Pre-column derivatization' },
                      { test: 'Peptide Content', result: '≥85%', method: 'Ninhydrin assay' },
                    ].map((t, i) => (
                      <div key={i} className="flex items-center justify-between p-3 border border-secondary-500/20 bg-background-100/30 rounded-[2px]">
                        <div>
                          <p className="font-heading text-xs tracking-wider uppercase text-foreground-950">{t.test}</p>
                          <p className="font-mono text-[10px] text-foreground-600/60">{t.method}</p>
                        </div>
                        <p className="font-mono text-sm text-accent-500 font-bold">{t.result}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === 'protocol' && (
                <div className="space-y-4">
                  <h3 className="font-heading text-sm tracking-[0.15em] uppercase text-foreground-950 font-semibold">
                    Research Protocol Notes
                  </h3>
                  <div className="p-5 border border-secondary-500/30 bg-background-100/40 rounded-[2px]">
                    <p className="font-body text-sm text-foreground-600 leading-relaxed mb-4 font-light">
                      <strong className="text-foreground-950">Storage:</strong> Lyophilized vials should be stored at
                      -20°C in a desiccated environment. Reconstituted solutions are stable for 14 days at 2-8°C
                      or 90 days at -20°C when stored in suitable aliquots.
                    </p>
                    <p className="font-body text-sm text-foreground-600 leading-relaxed mb-4 font-light">
                      <strong className="text-foreground-950">Reconstitution:</strong> Reconstitute with bacteriostatic
                      water (0.9% benzyl alcohol) or sterile water for injection. Allow the vial to come to room
                      temperature before opening. Add solvent slowly down the inner wall of the vial. Do not shake
                      vigorously — gentle swirling is preferred to avoid mechanical degradation.
                    </p>
                    <p className="font-body text-sm italic text-foreground-600/60 font-light">
                      These notes are for research reference only and do not constitute usage instructions.
                      Researchers should develop protocols appropriate to their specific experimental design.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Common Questions */}
          <div className="mt-16 border-t border-secondary-500/20 pt-8">
            <div className="mb-8">
              <span className="font-mono text-[10px] tracking-wider uppercase text-accent-500">FAQ</span>
              <h2 className="font-heading text-xl md:text-2xl tracking-[0.12em] uppercase text-foreground-950 mt-2 font-light">
                Common Questions
              </h2>
            </div>
            <div className="space-y-0">
              {commonQuestions.map((faq, i) => (
                <div key={i} className="border-b border-secondary-500/20">
                  <button
                    onClick={() => setOpenQuestion(openQuestion === i ? null : i)}
                    className="w-full flex items-center justify-between py-4 text-left group"
                  >
                    <span className="font-heading text-sm tracking-[0.1em] uppercase text-foreground-950 group-hover:text-accent-500 transition-colors font-semibold">
                      {faq.q}
                    </span>
                    <span className={`w-6 h-6 flex items-center justify-center text-foreground-600 transition-transform duration-300 ${openQuestion === i ? 'rotate-45' : ''}`}>
                      <i className="ri-add-line" />
                    </span>
                  </button>
                  {openQuestion === i && (
                    <div className="pb-4 pr-8">
                      <p className="font-body text-sm text-foreground-600 leading-relaxed font-light">
                        {faq.a}
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {relatedProducts.length > 0 && (
          <div className="mt-16 border-t border-secondary-500/20 pt-16">
            <div className="relative z-10 max-w-7xl mx-auto px-4 md:px-8">
              <div className="text-center mb-10">
                <span className="font-mono text-[10px] tracking-wider uppercase text-accent-500">More Products</span>
                <h2 className="font-heading text-xl md:text-2xl tracking-[0.12em] uppercase text-foreground-950 mt-2 font-light">
                  You May Also Like
                </h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5">
                {relatedProducts.map((p) => (
                  <ProductCard key={p.id} product={p} />
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* CTA Section */}
      <div className="relative bg-foreground-950 overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://readdy.ai/api/search-image?query=Abstract%20dark%20charcoal%20gray%20texture%20background%20with%20subtle%20antique%20gold%20metallic%20veins%20and%20organic%20grain%20patterns%2C%20rich%20luxurious%20vintage%20aesthetic%2C%20minimal%20elegant%20laboratory%20dark%20mood%2C%20high%20resolution%20texture%20background%2C%20no%20text%2C%20no%20objects%2C%20pure%20texture&width=1400&height=600&seq=cta-bg-v2&orientation=landscape')] bg-cover bg-center opacity-30" />
        <div className="absolute inset-0 bg-gradient-to-r from-foreground-950/90 via-foreground-950/70 to-foreground-950/90" />
        <div className="relative z-10 max-w-4xl mx-auto px-4 md:px-8 py-16 md:py-24 text-center">
          <span className="font-mono text-[10px] tracking-[0.15em] uppercase text-accent-500 mb-4 block">
            Ready to Start?
          </span>
          <h2 className="font-heading text-3xl md:text-5xl tracking-[0.1em] uppercase text-background-50 mb-4 leading-tight font-light">
            Premium<br />
            <span className="text-accent-500">Peptides.</span><br />
            Proven Quality.
          </h2>
          <p className="font-body text-sm text-background-50/70 leading-relaxed max-w-xl mx-auto mb-8 font-light">
            Research-grade peptides lyophilized and verified in the USA. Fast shipping, full documentation, expert support.
          </p>
          <button
            onClick={() => navigate('/shop')}
            className="bg-accent-500 hover:bg-accent-400 text-foreground-950 font-heading text-xs tracking-[0.15em] uppercase py-4 px-12 border border-accent-500 rounded-[2px] transition-all duration-300 hover:shadow-[0_0_30px_rgba(176,141,87,0.4)] whitespace-nowrap"
          >
            Shop All Peptides
          </button>
        </div>
      </div>
    </PageLayout>
  );
}