import { Link } from 'react-router-dom';
import { useProducts } from '../../../context/ProductsContext';
import ProductCard from './ProductCard';

export default function ProductGrid() {
  const { products } = useProducts();
  return (
    <section className="py-16 md:py-24 bg-[#E1E4D9]" id="peptides">
      <div className="max-w-7xl mx-auto px-4 md:px-6">
        {/* Section header */}
        <div className="text-center mb-12">
          <p className="font-sans text-[10px] uppercase tracking-[0.18em] text-[#8E9A8A] mb-3 font-normal">
            ✦ OUR PEPTIDES ✦
          </p>
          <h2 className="font-heading text-[34px] md:text-[38px] text-[#2F3430] mb-3 font-light">
            Research-Grade Peptides
          </h2>
          <p className="font-heading italic text-sm text-[#B08D57] font-light">
            Third-party tested. Certificate of Analysis provided.
          </p>
        </div>

        {/* Product grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-5">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>

        {/* View all link */}
        <div className="text-center mt-12">
          <Link
            to="/shop"
            className="inline-flex items-center gap-2 font-sans text-[10px] uppercase tracking-[0.14em] text-[#8E9A8A] hover:text-[#4A5C4A] transition-colors whitespace-nowrap font-normal"
          >
            VIEW FULL CATALOGUE →
          </Link>
        </div>
      </div>
    </section>
  );
}