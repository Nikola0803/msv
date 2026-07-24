import { useRef } from 'react';
import type { Product } from '../../../mocks/products';
import ProductCard from './ProductCard';

interface ProductCarouselProps {
  title: string;
  products: Product[];
}

export default function ProductCarousel({ title, products }: ProductCarouselProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (!scrollRef.current) return;
    const scrollAmount = 320;
    scrollRef.current.scrollBy({
      left: direction === 'left' ? -scrollAmount : scrollAmount,
      behavior: 'smooth',
    });
  };

  if (products.length === 0) return null;

  return (
    <div className="mb-10">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <span className="w-2 h-2 bg-accent-500" />
          <h3 className="font-heading text-xs tracking-[0.15em] uppercase text-foreground-950 font-semibold">
            {title}
          </h3>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => scroll('left')}
            className="w-8 h-8 flex items-center justify-center border border-secondary-500/40 text-foreground-600 hover:border-accent-500 hover:text-accent-500 transition-colors rounded-[2px]"
            aria-label="Scroll left"
          >
            <i className="ri-arrow-left-line text-sm" />
          </button>
          <button
            onClick={() => scroll('right')}
            className="w-8 h-8 flex items-center justify-center border border-secondary-500/40 text-foreground-600 hover:border-accent-500 hover:text-accent-500 transition-colors rounded-[2px]"
            aria-label="Scroll right"
          >
            <i className="ri-arrow-right-line text-sm" />
          </button>
        </div>
      </div>

      <div
        ref={scrollRef}
        className="flex gap-4 overflow-x-auto scrollbar-hide scroll-smooth snap-x snap-mandatory pb-2"
      >
        {products.map((product) => (
          <div
            key={product.id}
            className="w-[280px] md:w-[300px] flex-shrink-0 snap-start"
          >
            <ProductCard product={product} />
          </div>
        ))}
      </div>
    </div>
  );
}