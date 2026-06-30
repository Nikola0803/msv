import PageLayout from '@/components/feature/PageLayout';
import { bundles } from '@/mocks/bundles';
import { useCart } from '@/context/CartContext';
import { useNavigate } from 'react-router-dom';

export default function BundlesPage() {
  const { addItem } = useCart();
  const navigate = useNavigate();

  return (
    <PageLayout>
      <div className="py-16 md:py-24 grain-overlay">
        <div className="relative z-10 max-w-7xl mx-auto px-4 md:px-8">
          <div className="text-center mb-12">
            <span className="text-accent-500 text-lg">✦</span>
            <h1 className="font-heading text-2xl md:text-3xl tracking-[0.2em] uppercase text-foreground-950 mt-3">
              Research Stacks
            </h1>
            <p className="font-body text-sm italic text-foreground-600 mt-3 max-w-xl mx-auto">
              Curated peptide combinations optimized for specific research pathways. 
              Bundle and save on your laboratory protocols.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {bundles.map((bundle) => (
              <div
                key={bundle.id}
                onClick={() => navigate(`/bundle/${bundle.id}`)}
                className="border border-secondary-500/40 bg-background-100/50 hover:bg-background-100/80 transition-all duration-500 group p-6 md:p-8 flex flex-col cursor-pointer"
              >
                <div className="mb-5">
                  <span className="font-heading text-[10px] tracking-[0.2em] uppercase text-accent-500">
                    Stack Bundle
                  </span>
                  <h2 className="font-heading text-sm tracking-[0.15em] uppercase text-foreground-950 mt-2">
                    {bundle.name}
                  </h2>
                </div>

                <div className="accent-rule mb-5" />

                <div className="space-y-2 mb-5 flex-1">
                  <p className="font-body text-xs text-foreground-600 uppercase tracking-wider">
                    Includes:
                  </p>
                  <ul className="space-y-1.5">
                    {bundle.contents.map((item, i) => (
                      <li
                        key={i}
                        className="font-body text-sm italic text-foreground-600 flex items-center gap-2"
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-accent-500/60 flex-shrink-0" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>

                <p className="font-body text-sm text-foreground-600/70 leading-relaxed mb-5">
                  {bundle.description}
                </p>

                <div className="flex items-baseline gap-3 mb-2">
                  <span className="font-mono text-xl text-accent-500 font-bold">
                    ${bundle.bundlePrice}
                  </span>
                  <span className="font-mono text-sm text-foreground-600/40 line-through">
                    ${bundle.originalPrice}
                  </span>
                </div>

                <p className="font-body text-xs text-accent-500 mb-5">
                  Save ${bundle.originalPrice - bundle.bundlePrice} ({bundle.savingsPct}%)
                </p>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    addItem({
                      id: bundle.id,
                      name: bundle.name,
                      peptideCode: bundle.contents.join(' + '),
                      price: bundle.bundlePrice,
                      dosage: 'Stack Bundle',
                    });
                  }}
                  className="w-full bg-foreground-950 hover:bg-accent-500 text-background-50 hover:text-foreground-950 font-heading text-[11px] tracking-[0.2em] uppercase py-3 border border-foreground-950 hover:border-accent-500 transition-all duration-300"
                >
                  Add to Cart
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </PageLayout>
  );
}