import { useCart } from '../../../context/CartContext';
import { useBundles } from '../../../hooks/useBundles';

export default function BundlesSection() {
  const { addItem } = useCart();
  const { bundles } = useBundles();

  return (
    <section className="py-16 md:py-24 bg-foreground-950 relative overflow-hidden">
      <div className="absolute inset-0 distressed-overlay opacity-20" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 md:px-8">
        <div className="text-center mb-12">
          <span className="text-accent-500 text-lg font-heading italic">✦</span>
          <h2 className="font-heading text-xl md:text-2xl tracking-[0.15em] uppercase text-background-50 mt-3 font-light">
            Research Stacks
          </h2>
          <p className="font-body text-sm italic text-background-50/60 mt-3 max-w-xl mx-auto font-light">
            Curated combinations designed for specific research pathways. Save more when you stack.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {bundles.map((bundle) => (
            <div
              key={bundle.id}
              className="border border-secondary-500/40 bg-foreground-900/60 hover:border-accent-500 hover:bg-foreground-900/80 transition-all duration-500 group p-6 md:p-8 flex flex-col rounded-[2px]"
            >
              <div className="mb-5">
                <span className="font-heading text-[10px] tracking-[0.15em] uppercase text-accent-500">
                  Bundle
                </span>
                <h3 className="font-heading text-sm tracking-[0.12em] uppercase text-background-50 mt-2 font-light">
                  {bundle.name}
                </h3>
              </div>

              <div className="accent-rule mb-5" />

              <div className="space-y-2 mb-5 flex-1">
                <p className="font-body text-xs text-background-50/50 uppercase tracking-wider font-light">
                  Includes:
                </p>
                <ul className="space-y-1.5">
                  {bundle.contents.map((item, i) => (
                    <li
                      key={i}
                      className="font-body text-sm italic text-background-50/80 flex items-center gap-2 font-light"
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-secondary-500/60 flex-shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="flex items-baseline gap-3 mb-2">
                <span className="font-mono text-xl text-accent-500 font-bold">
                  ${bundle.bundlePrice}
                </span>
                <span className="font-mono text-sm text-background-50/40 line-through">
                  ${bundle.originalPrice}
                </span>
              </div>

              <p className="font-body text-xs text-accent-500 mb-5 font-light">
                Save ${bundle.originalPrice - bundle.bundlePrice} ({bundle.savingsPct}%)
              </p>

              <button
                onClick={() =>
                  addItem({
                    id: bundle.id,
                    name: bundle.name,
                    peptideCode: bundle.contents.join(' + '),
                    price: bundle.bundlePrice,
                    dosage: 'Stack Bundle',
                  })
                }
                className="w-full bg-accent-500 hover:bg-accent-400 text-foreground-950 font-heading text-[11px] tracking-[0.15em] uppercase py-3 border border-accent-500 rounded-[2px] transition-all duration-300 hover:shadow-[0_0_15px_rgba(176,141,87,0.3)]"
              >
                Add to Cart
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}