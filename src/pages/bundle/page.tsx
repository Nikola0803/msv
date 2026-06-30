import { useParams, useNavigate } from 'react-router-dom';
import PageLayout from '@/components/feature/PageLayout';
import { useCart } from '@/context/CartContext';
import { bundles, getBundleProducts } from '@/mocks/bundles';
import { useState, useMemo } from 'react';

const tabs = [
  { label: 'Overview', value: 'overview' },
  { label: 'COA', value: 'coa' },
  { label: 'Test Results', value: 'tests' },
  { label: 'Research Protocol', value: 'protocol' },
];

export default function BundleDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addItem } = useCart();
  const [activeTab, setActiveTab] = useState('overview');
  const [quantity, setQuantity] = useState(1);
  const [selectedDosages, setSelectedDosages] = useState<Record<string, string>>();

  const bundle = bundles.find((b) => b.id === id);
  const bundleProducts = useMemo(() => (id ? getBundleProducts(id) : []), [id]);

  const overallStock = useMemo(() => {
    if (bundleProducts.length === 0) return 0;
    return Math.min(...bundleProducts.map((bp) => bp.product.stockCount));
  }, [bundleProducts]);

  if (!bundle) {
    return (
      <PageLayout>
        <div className="py-24 text-center grain-overlay">
          <div className="relative z-10">
            <span className="text-accent-500 text-lg">✦</span>
            <h1 className="font-heading text-xl tracking-[0.2em] uppercase text-foreground-950 mt-3">
              Bundle Not Found
            </h1>
            <button
              onClick={() => navigate('/bundles')}
              className="mt-6 font-heading text-xs tracking-[0.2em] uppercase text-accent-500 hover:text-accent-500-light transition-colors"
            >
              Return to Bundles
            </button>
          </div>
        </div>
      </PageLayout>
    );
  }

  const StarRating = () => (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <span
          key={star}
          className={`w-3.5 h-3.5 flex items-center justify-center text-xs ${
            star <= Math.round(bundle.rating) ? 'text-accent-500' : 'text-accent-500/20'
          }`}
        >
          <i className="ri-star-fill" />
        </span>
      ))}
      <span className="font-mono text-xs text-foreground-600 ml-2">{bundle.rating} / 5.0</span>
      <span className="font-body text-xs text-foreground-600/60 ml-2">({bundle.reviewCount} verified reviews)</span>
    </div>
  );

  const handleDosageChange = (productId: string, dosage: string) => {
    setSelectedDosages((prev) => ({ ...prev, [productId]: dosage }));
  };

  const totalPrice = bundle.bundlePrice * quantity;

  return (
    <PageLayout>
      <div className="py-8 md:py-12 grain-overlay">
        <div className="relative z-10 max-w-7xl mx-auto px-4 md:px-8">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 mb-8 font-body text-xs text-foreground-600">
            <button onClick={() => navigate('/')} className="hover:text-accent-500 transition-colors">Home</button>
            <span>/</span>
            <button onClick={() => navigate('/bundles')} className="hover:text-accent-500 transition-colors">Bundles</button>
            <span>/</span>
            <span className="text-foreground-950 uppercase tracking-wider">{bundle.name}</span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16">
            {/* Left: Bundle Image */}
            <div>
              <div className="aspect-[4/5] border border-secondary-500/30 bg-background-100/40 relative overflow-hidden">
                <img
                  src={bundle.image}
                  alt={bundle.name}
                  className="w-full h-full object-cover object-center"
                />
                {/* Purity badge */}
                <div className="absolute top-4 left-4 stamp-badge w-16 h-16">
                  <span className="text-center leading-tight text-[11px]">
                    {bundle.purity}
                    <br />
                    <span className="text-[8px]">PURITY</span>
                  </span>
                </div>
                {/* Stock badge */}
                <div className="absolute top-4 right-4">
                  {overallStock <= 25 ? (
                    <span className="bg-foreground-950/90 border border-accent-500 text-accent-500 font-heading text-[9px] tracking-[0.15em] uppercase px-2.5 py-1">
                      Only {overallStock} Left
                    </span>
                  ) : overallStock <= 60 ? (
                    <span className="bg-foreground-950/80 text-background-50/90 font-heading text-[9px] tracking-[0.15em] uppercase px-2.5 py-1 border border-cream/20">
                      Low Stock
                    </span>
                  ) : (
                    <span className="bg-accent-500 text-foreground-950 font-heading text-[9px] tracking-[0.15em] uppercase px-2.5 py-1">
                      In Stock
                    </span>
                  )}
                </div>
                {/* Savings badge */}
                <div className="absolute bottom-4 left-4">
                  <span className="bg-foreground-950/90 border border-accent-500 text-accent-500 font-heading text-[9px] tracking-[0.15em] uppercase px-2.5 py-1">
                    Save {bundle.savingsPct}%
                  </span>
                </div>
              </div>

              {/* Trust badges row */}
              <div className="grid grid-cols-3 gap-3 mt-4">
                <div className="aspect-square border border-secondary-500/20 bg-background-100/40 flex flex-col items-center justify-center p-2 text-center">
                  <span className="w-6 h-6 flex items-center justify-center text-accent-500 mb-1">
                    <i className="ri-flask-line text-sm" />
                  </span>
                  <span className="font-mono text-[10px] text-foreground-600/70 leading-tight">HPLC<br />Verified</span>
                </div>
                <div className="aspect-square border border-secondary-500/20 bg-background-100/40 flex flex-col items-center justify-center p-2 text-center">
                  <span className="w-6 h-6 flex items-center justify-center text-accent-500 mb-1">
                    <i className="ri-bar-chart-line text-sm" />
                  </span>
                  <span className="font-mono text-[10px] text-foreground-600/70 leading-tight">Mass<br />Spec ID</span>
                </div>
                <div className="aspect-square border border-secondary-500/20 bg-background-100/40 flex flex-col items-center justify-center p-2 text-center">
                  <span className="w-6 h-6 flex items-center justify-center text-accent-500 mb-1">
                    <i className="ri-map-pin-line text-sm" />
                  </span>
                  <span className="font-mono text-[10px] text-foreground-600/70 leading-tight">USA<br />Lyophilized</span>
                </div>
              </div>
            </div>

            {/* Right: Bundle info */}
            <div>
              <div className="mb-2">
                <span className="font-mono text-[10px] tracking-wider uppercase text-accent-500">Research Stack</span>
              </div>
              <h1 className="font-heading text-2xl md:text-3xl tracking-[0.15em] uppercase text-foreground-950 mb-2">
                {bundle.name}
              </h1>
              <div className="mb-4">
                <StarRating />
              </div>

              <div className="accent-rule max-w-xs mb-6" />

              <p className="font-body text-sm text-foreground-600 leading-relaxed mb-6">
                {bundle.description}
              </p>

              {/* Pricing */}
              <div className="flex items-baseline gap-3 mb-2">
                <span className="font-mono text-3xl text-accent-500 font-bold">
                  ${bundle.bundlePrice}
                </span>
                <span className="font-mono text-sm text-foreground-600/40 line-through">
                  ${bundle.originalPrice}
                </span>
              </div>
              <p className="font-body text-xs text-accent-500 mb-6">
                Save ${bundle.originalPrice - bundle.bundlePrice} ({bundle.savingsPct}% off) compared to individual purchase
              </p>

              {/* Products in bundle with options */}
              <div className="mb-6">
                <p className="font-heading text-[11px] tracking-[0.2em] uppercase text-foreground-950 mb-4">
                  Stack Contents
                </p>
                <div className="space-y-4">
                  {bundleProducts.map(({ product, item }) => {
                    const dosages = product.dosage.split(' / ');
                    const selected = selectedDosages[product.id] || item.defaultDosage;
                    return (
                      <div key={product.id} className="flex gap-4 p-4 border border-secondary-500/20 bg-background-100/40">
                        <div className="w-16 h-20 flex-shrink-0 border border-secondary-500/20 overflow-hidden">
                          <img
                            src={product.image}
                            alt={product.name}
                            className="w-full h-full object-cover object-center"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <p className="font-heading text-xs tracking-[0.1em] uppercase text-foreground-950">
                              {product.name}
                            </p>
                            <span className="font-mono text-[10px] text-accent-500">
                              {product.purity}
                            </span>
                          </div>
                          <p className="font-body text-xs italic text-foreground-600/70 mb-2">
                            {product.peptideCode}
                          </p>
                          <div className="flex flex-wrap gap-1.5">
                            {dosages.map((d) => (
                              <button
                                key={d}
                                onClick={() => handleDosageChange(product.id, d)}
                                className={`font-mono text-[10px] px-3 py-1 border transition-all duration-300 ${
                                  selected === d.trim()
                                    ? 'bg-accent-500 text-foreground-950 border-accent-500'
                                    : 'bg-transparent text-foreground-600 border-secondary-500/30 hover:border-accent-500'
                                }`}
                              >
                                {d.trim()}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Quantity selector */}
              <div className="mb-6">
                <p className="font-heading text-[11px] tracking-[0.2em] uppercase text-foreground-950 mb-3">
                  Bundle Quantity
                </p>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-10 h-10 flex items-center justify-center border border-secondary-500/30 text-foreground-950 hover:bg-accent-500 hover:text-foreground-950 transition-colors"
                  >
                    <i className="ri-subtract-line" />
                  </button>
                  <div className="w-12 h-10 flex items-center justify-center border border-secondary-500/30 font-mono text-sm text-foreground-950">
                    {quantity}
                  </div>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="w-10 h-10 flex items-center justify-center border border-secondary-500/30 text-foreground-950 hover:bg-accent-500 hover:text-foreground-950 transition-colors"
                  >
                    <i className="ri-add-line" />
                  </button>
                </div>
              </div>

              {/* Total Price */}
              <div className="flex items-baseline gap-4 mb-8">
                <span className="font-mono text-3xl text-accent-500 font-bold">
                  ${totalPrice}
                </span>
                <span className="font-body text-xs italic text-foreground-600">
                  ${bundle.bundlePrice} per bundle
                </span>
              </div>

              {/* Add to Cart */}
              <button
                onClick={() =>
                  addItem({
                    id: bundle.id,
                    name: bundle.name,
                    peptideCode: bundle.contents.join(' + '),
                    price: bundle.bundlePrice,
                    dosage: `Bundle x${quantity}`,
                  })
                }
                className="w-full md:w-auto bg-accent-500 hover:bg-accent-400 text-foreground-950 font-heading text-xs tracking-[0.2em] uppercase py-4 px-12 border border-accent-500 transition-all duration-300 hover:shadow-[0_0_20px_rgba(184,148,42,0.3)] whitespace-nowrap"
              >
                Add Bundle to Cart
              </button>

              {/* View CoA link */}
              <div className="mt-3">
                <button
                  onClick={() => setActiveTab('coa')}
                  className="flex items-center gap-2 font-mono text-xs text-accent-500 hover:text-foreground-950 transition-colors"
                >
                  <span className="w-4 h-4 flex items-center justify-center">
                    <i className="ri-file-list-3-line" />
                  </span>
                  View Certificate of Analysis (CoA)
                </button>
              </div>

              {/* Urgency strip */}
              <div className="mt-5 flex items-center gap-2 p-3 border border-red-900/10 bg-red-900/[0.03]">
                <span className="w-5 h-5 flex items-center justify-center text-red-800/70">
                  <i className="ri-fire-line" />
                </span>
                <span className="font-mono text-xs text-red-900/80">
                  Limited stock — <strong className="text-red-900">13 people</strong> are viewing this bundle right now
                </span>
              </div>

              {/* Delivery & shipping info */}
              <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="flex items-start gap-2.5 p-3 border border-secondary-500/15 bg-background-100/40">
                  <span className="w-5 h-5 flex items-center justify-center text-accent-500 mt-0.5">
                    <i className="ri-time-line" />
                  </span>
                  <div>
                    <p className="font-heading text-[10px] tracking-[0.15em] uppercase text-foreground-950">Same-Day Processing</p>
                    <p className="font-mono text-[10px] text-foreground-600/70 mt-0.5">Order before 2pm EST</p>
                  </div>
                </div>
                <div className="flex items-start gap-2.5 p-3 border border-secondary-500/15 bg-background-100/40">
                  <span className="w-5 h-5 flex items-center justify-center text-accent-500 mt-0.5">
                    <i className="ri-truck-line" />
                  </span>
                  <div>
                    <p className="font-heading text-[10px] tracking-[0.15em] uppercase text-foreground-950">Tracked Delivery</p>
                    <p className="font-mono text-[10px] text-foreground-600/70 mt-0.5">US domestic shipping only</p>
                  </div>
                </div>
                <div className="flex items-start gap-2.5 p-3 border border-secondary-500/15 bg-background-100/40 sm:col-span-2">
                  <span className="w-5 h-5 flex items-center justify-center text-accent-500 mt-0.5">
                    <i className="ri-customer-service-2-line" />
                  </span>
                  <div>
                    <p className="font-heading text-[10px] tracking-[0.15em] uppercase text-foreground-950">7-Day Expert Support</p>
                    <p className="font-mono text-[10px] text-foreground-600/70 mt-0.5">(208) 243-9222</p>
                  </div>
                </div>
              </div>

              {/* Trust line */}
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

              {/* Research Use Only — prominent disclaimer */}
              <div className="mt-6 p-4 border border-dashed border-red-900/20 bg-red-900/[0.02]">
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
                  className={`font-heading text-[11px] tracking-[0.2em] uppercase px-5 py-2 border transition-all duration-300 whitespace-nowrap ${
                    activeTab === tab.value
                      ? 'bg-foreground-950 text-background-50 border-foreground-950'
                      : 'bg-transparent text-foreground-600 border-secondary-500/30 hover:border-accent-500 hover:text-foreground-950'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <div className="min-h-[200px]">
              {activeTab === 'overview' && (
                <div className="space-y-4">
                  <h3 className="font-heading text-sm tracking-[0.2em] uppercase text-foreground-950">
                    Bundle Overview
                  </h3>
                  <p className="font-body text-sm text-foreground-600 leading-relaxed">
                    {bundle.description} This curated stack combines synergistic compounds selected for complementary research pathways. Each vial is lyophilized via solid-phase peptide synthesis (SPPS) using Fmoc chemistry on a polystyrene resin, then purified by preparative HPLC to a purity of {bundle.purity} or greater.
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                    {bundleProducts.map(({ product }) => (
                      <div key={product.id} className="p-4 border border-secondary-500/20 bg-background-100/30">
                        <div className="w-full aspect-[4/5] border border-secondary-500/20 mb-3 overflow-hidden">
                          <img
                            src={product.image}
                            alt={product.name}
                            className="w-full h-full object-cover object-center"
                          />
                        </div>
                        <p className="font-heading text-xs tracking-[0.1em] uppercase text-foreground-950 mb-1">{product.name}</p>
                        <p className="font-body text-xs italic text-foreground-600/70">{product.peptideCode}</p>
                        <p className="font-mono text-[10px] text-accent-500 mt-2">{product.purity} Purity</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === 'coa' && (
                <div className="space-y-4">
                  <h3 className="font-heading text-sm tracking-[0.2em] uppercase text-foreground-950">
                    Certificate of Analysis
                  </h3>
                  <div className="p-6 border border-secondary-500/30 bg-background-100/40">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center mb-6">
                      <div>
                        <p className="font-mono text-[10px] text-foreground-600/60 uppercase">Purity</p>
                        <p className="font-mono text-lg text-accent-500 font-bold">{bundle.purity}</p>
                      </div>
                      <div>
                        <p className="font-mono text-[10px] text-foreground-600/60 uppercase">Appearance</p>
                        <p className="font-mono text-sm text-foreground-950">White Powder</p>
                      </div>
                      <div>
                        <p className="font-mono text-[10px] text-foreground-600/60 uppercase">Moisture</p>
                        <p className="font-mono text-sm text-foreground-950">&lt; 3.0%</p>
                      </div>
                      <div>
                        <p className="font-mono text-[10px] text-foreground-600/60 uppercase">Endotoxin</p>
                        <p className="font-mono text-sm text-foreground-950">&lt; 5 EU/mg</p>
                      </div>
                    </div>
                    <div className="accent-rule mb-4" />
                    <div className="space-y-3">
                      {bundleProducts.map(({ product }) => (
                        <div key={product.id} className="flex items-center justify-between p-3 border border-secondary-500/10 bg-background-100/20">
                          <p className="font-heading text-xs tracking-wider uppercase text-foreground-950">{product.name}</p>
                          <p className="font-mono text-sm text-accent-500 font-bold">{product.purity}</p>
                        </div>
                      ))}
                    </div>
                    <div className="accent-rule mt-4 mb-4" />
                    <p className="font-body text-xs italic text-foreground-600/70 text-center">
                      Full COA available for download. Lot-specific analysis performed by independent third-party laboratory for each component.
                    </p>
                  </div>
                </div>
              )}

              {activeTab === 'tests' && (
                <div className="space-y-4">
                  <h3 className="font-heading text-sm tracking-[0.2em] uppercase text-foreground-950">
                    Analytical Test Results
                  </h3>
                  <div className="space-y-6">
                    {bundleProducts.map(({ product }) => (
                      <div key={product.id}>
                        <p className="font-heading text-xs tracking-wider uppercase text-foreground-950 mb-3">{product.name}</p>
                        <div className="space-y-3">
                          {[
                            { test: 'HPLC Purity', result: product.purity, method: 'C18 reverse-phase, 220nm' },
                            { test: 'Mass Spectrometry', result: 'Confirmed', method: 'ESI-TOF MS' },
                            { test: 'Amino Acid Analysis', result: '±2% expected', method: 'Pre-column derivatization' },
                            { test: 'Peptide Content', result: '≥85%', method: 'Ninhydrin assay' },
                          ].map((t, i) => (
                            <div key={i} className="flex items-center justify-between p-3 border border-secondary-500/20 bg-background-100/30">
                              <div>
                                <p className="font-heading text-xs tracking-wider uppercase text-foreground-950">{t.test}</p>
                                <p className="font-mono text-[10px] text-foreground-600/60">{t.method}</p>
                              </div>
                              <p className="font-mono text-sm text-accent-500 font-bold">{t.result}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === 'protocol' && (
                <div className="space-y-4">
                  <h3 className="font-heading text-sm tracking-[0.2em] uppercase text-foreground-950">
                    Research Protocol Notes
                  </h3>
                  <div className="p-5 border border-secondary-500/30 bg-background-100/40">
                    <p className="font-body text-sm text-foreground-600 leading-relaxed mb-4">
                      <strong className="text-foreground-950">Storage:</strong> All lyophilized vials should be stored at -20°C in a desiccated environment. Reconstituted solutions are stable for 14 days at 2-8°C or 90 days at -20°C when stored in suitable aliquots.
                    </p>
                    <p className="font-body text-sm text-foreground-600 leading-relaxed mb-4">
                      <strong className="text-foreground-950">Reconstitution:</strong> Reconstitute each vial with bacteriostatic water (0.9% benzyl alcohol) or sterile water for injection. Allow the vial to come to room temperature before opening. Add solvent slowly down the inner wall of the vial. Do not shake vigorously — gentle swirling is preferred to avoid mechanical degradation.
                    </p>
                    <div className="accent-rule mb-4" />
                    <p className="font-body text-sm text-foreground-600 leading-relaxed mb-4">
                      <strong className="text-foreground-950">Stack Synergy:</strong> This bundle is designed so that compounds work through complementary pathways. Researchers should consider the overlapping mechanisms when designing protocols.
                    </p>
                    <p className="font-body text-sm italic text-foreground-600/60">
                      These notes are for research reference only and do not constitute usage instructions. Researchers should develop protocols appropriate to their specific experimental design.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </PageLayout>
  );
}