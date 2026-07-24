import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useProducts } from '../../../context/ProductsContext';
import ProductCard from './ProductCard';
import { groupProducts } from '@/utils/groupProducts';

const TABS = [
  { label: 'All',       value: 'all'      },
  { label: 'Blends',    value: 'blends'   },
  { label: 'GLP',       value: 'glp'      },
  { label: 'Peptides',  value: 'peptides' },
  { label: 'Metabolic', value: 'metabolic'},
] as const;

type Tab = typeof TABS[number]['value'];

export default function ProductGrid() {
  const { products, loading } = useProducts();
  const [active, setActive] = useState<Tab>('all');

  const filtered = active === 'all'
    ? products
    : products.filter(p => p.subcategory === active);

  const grouped = groupProducts(filtered);

  return (
    <section className="py-16 md:py-24 bg-[#E1E4D9]" id="peptides">
      <div className="max-w-7xl mx-auto px-4 md:px-6">
        {/* Section header */}
        <div className="text-center mb-10">
          <p className="font-sans text-[10px] uppercase tracking-[0.18em] text-[#4A5C4A] mb-3 font-normal">
            ✦ OUR PEPTIDES ✦
          </p>
          <h2 className="font-heading text-[34px] md:text-[38px] text-[#2F3430] mb-3 font-light">
            Research-Grade Peptides
          </h2>
          <p className="font-heading italic text-sm text-[#B08D57] font-light">
            Third-party tested. Certificate of Analysis provided.
          </p>
        </div>

        {/* Category filter tabs */}
        <div className="flex items-center justify-center gap-0 mb-10 border border-[#2F3430]/12 rounded-[2px] w-fit mx-auto overflow-hidden">
          {TABS.map((tab) => (
            <button
              key={tab.value}
              type="button"
              onClick={() => setActive(tab.value)}
              className={`
                font-sans text-[9px] uppercase tracking-[0.14em] px-5 py-2.5 transition-all duration-200 whitespace-nowrap
                ${active === tab.value
                  ? 'bg-[#2F3430] text-[#E1E4D9]'
                  : 'bg-transparent text-[#2F3430]/60 hover:text-[#2F3430] hover:bg-[#2F3430]/6'
                }
              `}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Product grid */}
        {loading && grouped.length === 0 ? (
          <p className="text-center font-sans text-xs uppercase tracking-[0.14em] text-[#2F3430]/50 py-10">
            Loading catalogue…
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-5">
            {grouped.map(({ primary, variants }) => (
              <ProductCard key={primary.id} product={primary} variants={variants} />
            ))}
          </div>
        )}

        {/* View all link */}
        <div className="text-center mt-12">
          <Link
            to="/shop"
            className="inline-flex items-center gap-2 font-sans text-[10px] uppercase tracking-[0.14em] text-[#4A5C4A] hover:text-[#4A5C4A] transition-colors whitespace-nowrap font-normal"
          >
            VIEW FULL CATALOGUE →
          </Link>
        </div>
      </div>
    </section>
  );
}
