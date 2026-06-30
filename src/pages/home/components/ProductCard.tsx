import { useState } from 'react';
import { useCart } from '../../../context/CartContext';
import { useNavigate } from 'react-router-dom';
import type { Product } from '../../../mocks/products';

interface ProductCardProps {
  product: Product;
}

function StarRating({ rating, count }: { rating: number; count: number }) {
  return (
    <div className="flex items-center gap-1">
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <span
            key={star}
            className={`w-3 h-3 flex items-center justify-center text-[10px] ${
              star <= Math.round(rating) ? 'text-[#B08D57]' : 'text-[#DBD0C2]'
            }`}
          >
            <i className={star <= Math.round(rating) ? 'ri-star-fill' : 'ri-star-line'} />
          </span>
        ))}
      </div>
      <span className="font-sans text-[10px] text-[#7A8A76] ml-1 font-light">({count})</span>
    </div>
  );
}

function ProductCardImage({ product }: { product: Product }) {
  const [imgFailed, setImgFailed] = useState(false);

  return (
    <div className="absolute inset-0 overflow-hidden bg-[#0c0f0b]">
      {/* Photo background — same image every card */}
      {!imgFailed && (
        <img
          src={product.image}
          alt={product.name}
          className="absolute inset-0 w-full h-full object-cover object-center transition-transform duration-700 group-hover:scale-[1.03]"
          onError={() => setImgFailed(true)}
        />
      )}

      {/* Fallback dark gradient if image not yet saved */}
      {imgFailed && (
        <div className="absolute inset-0" style={{
          background: 'linear-gradient(135deg, #0c0f0b 0%, #2a3826 45%, #101510 100%)',
        }} />
      )}

      {/* Darkening overlay for badge legibility */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-black/30 pointer-events-none" />

      {/* Product name at bottom, over the image */}
      <div className="absolute bottom-0 left-0 right-0 px-4 pb-4 pt-10 pointer-events-none"
        style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.75) 0%, transparent 100%)' }}
      >
        <p className="font-heading text-[#B08D57] text-lg font-semibold tracking-[0.04em] leading-tight drop-shadow-sm">
          {product.name}
        </p>
        <div className="w-6 h-[0.5px] bg-[#B08D57]/60 mt-1.5 mb-1" />
        <p className="font-sans text-[#DBD0C2]/70 text-[9px] uppercase tracking-[0.14em] font-light">
          Research Grade · {product.purity}
        </p>
      </div>

      {/* Gold corner accents */}
      <div className="absolute top-0 left-0 w-5 h-5 border-t border-l border-[#B08D57]/40 pointer-events-none" />
      <div className="absolute top-0 right-0 w-5 h-5 border-t border-r border-[#B08D57]/40 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-5 h-5 border-b border-l border-[#B08D57]/40 pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-5 h-5 border-b border-r border-[#B08D57]/40 pointer-events-none" />
    </div>
  );
}

export default function ProductCard({ product }: ProductCardProps) {
  const { addItem } = useCart();
  const navigate = useNavigate();
  const dosageOptions = product.dosage.split(' / ');
  const [selectedDosage, setSelectedDosage] = useState(dosageOptions[0]);

  const handleAddToCart = () => {
    addItem({
      id: product.id,
      name: product.name,
      peptideCode: product.peptideCode,
      price: product.priceMin,
      dosage: selectedDosage,
    });
  };

  return (
    <div
      className="group bg-white border border-[#DBD0C2] rounded-[4px] flex flex-col h-full transition-all duration-300 hover:border-[#B08D57] hover:shadow-sm"
      data-product-shop
    >
      {/* Image area */}
      <button
        onClick={() => navigate(`/product/${product.id}`)}
        className="relative aspect-[4/5] overflow-hidden w-full text-left cursor-pointer"
      >
        {/* Stock status badge */}
        {product.stockStatus !== 'In Stock' && (
          <span className="absolute top-3 right-3 z-20 bg-black/60 text-[#B08D57] font-sans text-[9px] tracking-[0.08em] uppercase px-2 py-0.5 rounded-[2px] font-normal backdrop-blur-sm">
            {product.stockStatus}
          </span>
        )}

        <div className="w-full h-full transition-transform duration-700 group-hover:scale-[1.02]">
          <ProductCardImage product={product} />
        </div>
      </button>

      {/* Content */}
      <div className="p-4 flex flex-col flex-1">
        {/* Star rating */}
        <div className="mb-2">
          <StarRating rating={product.rating} count={product.reviewCount} />
        </div>

        {/* Product code */}
        <button
          onClick={() => navigate(`/product/${product.id}`)}
          className="text-left cursor-pointer"
        >
          <h3 className="font-sans text-lg font-bold text-[#2F3430] mb-0.5">
            {product.name}
          </h3>
        </button>

        {/* Full chemical name */}
        <p className="font-heading text-sm text-[#7A8A76] mb-1 font-light">
          {product.peptideCode}
        </p>

        {/* CAS number */}
        <p className="font-sans text-[10px] text-[#7A8A76] mb-3 font-mono font-light">
          CAS: {product.casNumber}
        </p>

        {/* Dosage selectors */}
        <div className="flex flex-wrap items-center gap-1.5 mb-3">
          {dosageOptions.map((dose) => (
            <button
              key={dose}
              onClick={() => setSelectedDosage(dose)}
              className={`font-sans text-[10px] px-2.5 py-1 border rounded-[2px] transition-colors whitespace-nowrap cursor-pointer font-normal ${
                selectedDosage === dose
                  ? 'border-[#B08D57] text-[#B08D57] bg-[#B08D57]/5'
                  : 'border-[#DBD0C2] text-[#7A8A76] hover:border-[#B08D57]'
              }`}
            >
              {dose}
            </button>
          ))}
        </div>

        {/* Price */}
        <p className="font-heading text-xl text-[#2F3430] mb-3">
          ${product.priceMin} – ${product.priceMax}
        </p>

        {/* View links */}
        <div className="flex items-center gap-3 mb-3">
          <span className="font-sans text-[10px] text-[#8E9A8A] underline underline-offset-2 cursor-pointer hover:text-[#4A5C4A] transition-colors font-normal">
            View Tests
          </span>
          <span className="text-[#DBD0C2] text-[10px]">|</span>
          <span className="font-sans text-[10px] text-[#8E9A8A] underline underline-offset-2 cursor-pointer hover:text-[#4A5C4A] transition-colors font-normal">
            View COA
          </span>
        </div>

        {/* Short description */}
        <p className="font-sans text-xs text-[#7A8A76] leading-relaxed mb-4 font-light line-clamp-2 flex-1">
          {product.description}
        </p>

        {/* Disclaimer chip */}
        <div className="bg-[#FFF8EE] border border-[#DBD0C2]/30 px-3 py-2 mb-3 rounded-[2px]">
          <p className="font-sans text-[10px] text-[#B08D57] font-light">
            ☒ Research Use Only — Not for Human Consumption
          </p>
        </div>

        {/* Add to Cart button */}
        <button
          onClick={handleAddToCart}
          className="w-full bg-[#2F3430] text-[#E1E4D9] font-sans text-[10px] uppercase tracking-[0.12em] py-3 rounded-[2px] hover:bg-[#B08D57] transition-colors whitespace-nowrap font-medium"
        >
          Add to Cart
        </button>

        {/* Stock status below button */}
        {product.stockStatus === 'In Stock' ? (
          <p className="font-sans text-[9px] text-[#8E9A8A] text-center mt-2 font-normal">
            In Stock
          </p>
        ) : (
          <p className="font-sans text-[9px] text-[#B08D57] text-center mt-2 font-normal">
            {product.stockStatus}
          </p>
        )}
      </div>
    </div>
  );
}