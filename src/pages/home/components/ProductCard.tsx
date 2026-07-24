import { useState } from 'react';
import { useCart } from '../../../context/CartContext';
import { useNavigate } from 'react-router-dom';
import type { Product } from '../../../mocks/products';

interface ProductCardProps {
  product: Product;
  variants?: Product[]; // all dosage variants — if provided, shows a dosage selector
}

/** Strip trailing "— Xmg" / "- Xmg" / "— Xmg/Vial" suffix to get display base name */
function baseName(name: string): string {
  return name.replace(/\s*[-–—]\s*[\d.]+\s*mg.*$/i, '').trim();
}

/** Clean dosage label: "10mg/Vial" → "10mg" */
function cleanDosage(d: string): string {
  return d.replace(/\/vial/i, '').trim();
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
      <span className="font-sans text-[10px] text-[#3D4E3D] ml-1 font-light">({count})</span>
    </div>
  );
}

function ProductCardImage({ product, displayName }: { product: Product; displayName: string }) {
  const [imgFailed, setImgFailed] = useState(false);

  return (
    <div className="absolute inset-0 overflow-hidden bg-[#0c0f0b]">
      {/* Photo background */}
      {!imgFailed && (
        <img
          src={product.image}
          alt={product.name}
          className="absolute inset-0 w-full h-full object-cover object-center transition-transform duration-700 group-hover:scale-[1.03]"
          onError={() => setImgFailed(true)}
        />
      )}

      {imgFailed && (
        <div className="absolute inset-0" style={{
          background: 'linear-gradient(135deg, #0c0f0b 0%, #2a3826 45%, #101510 100%)',
        }} />
      )}

      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-black/30 pointer-events-none" />

      {/* Product name at bottom, over the image */}
      <div className="absolute bottom-0 left-0 right-0 px-4 pb-4 pt-10 pointer-events-none"
        style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.75) 0%, transparent 100%)' }}
      >
        <p className="font-heading text-[#B08D57] text-lg font-semibold tracking-[0.04em] leading-tight drop-shadow-sm">
          {displayName}
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

// Set to true (or set VITE_ENABLE_SUBSCRIPTIONS=true in Vercel) to show the
// Subscribe & Save toggle on product cards. Keep false until the msv-subs WP
// plugin is installed, activated, and discount tiers are configured.
const SUBSCRIPTIONS_ENABLED = import.meta.env.VITE_ENABLE_SUBSCRIPTIONS === 'true';

const INTERVALS: { days: 30 | 60 | 90 | 180; label: string }[] = [
  { days: 30,  label: 'Every 30 days' },
  { days: 60,  label: 'Every 60 days' },
  { days: 90,  label: 'Every 90 days' },
  { days: 180, label: 'Every 180 days' },
];

// Discount tiers: days → % off
const DEFAULT_TIERS: Record<number, number> = { 30: 10, 60: 12, 90: 15, 180: 20 };

let cachedTiers: Record<number, number> | null = null;
async function fetchTiers(): Promise<Record<number, number>> {
  if (cachedTiers) return cachedTiers;
  try {
    const wpUrl = import.meta.env.VITE_WC_URL || 'https://db.vintagepeptides.com';
    const r = await fetch(`${wpUrl}/wp-json/msv-subs/v1/discount-tiers`);
    if (r.ok) cachedTiers = await r.json();
  } catch { /* use defaults */ }
  return cachedTiers ?? DEFAULT_TIERS;
}

export default function ProductCard({ product, variants }: ProductCardProps) {
  const { addItem } = useCart();
  const navigate = useNavigate();

  // Multi-variant support
  const allVariants = variants && variants.length > 0 ? variants : [product];
  // BUG FIX 2026-07-24: this always defaulted to allVariants[0] — the
  // CHEAPEST dosage (groupProducts.ts sorts variants by price) — regardless
  // of whether that specific dosage was in stock. A product with its cheapest
  // dosage sold out but OTHER dosages available would show "Out of Stock" as
  // its first impression on the shop grid, even though it's actually
  // purchasable. Prefer the cheapest IN-STOCK dosage instead; only fall back
  // to the cheapest overall if every dosage is sold out. Ported from VP.
  const defaultVariant = allVariants.find((v) => v.stockStatus !== 'Out of Stock') ?? allVariants[0];
  const [selected, setSelected] = useState<Product>(defaultVariant);
  const isMulti = allVariants.length > 1;

  // For single-product dosage split (original behaviour)
  const singleDosageOptions = selected.dosage.split(' / ');
  const [selectedSingleDosage, setSelectedSingleDosage] = useState(singleDosageOptions[0]);

  const displayName = isMulti ? baseName(selected.name) : selected.name;

  // Subscribe & Save state
  const [purchaseMode, setPurchaseMode] = useState<'once' | 'subscribe'>('once');
  const [subInterval, setSubInterval] = useState<30 | 60 | 90 | 180>(30);
  const [tiers, setTiers] = useState<Record<number, number>>(DEFAULT_TIERS);

  useState(() => { fetchTiers().then(setTiers); });

  const handleAddToCart = () => {
    const dosageLabel = isMulti
      ? cleanDosage(selected.dosage)
      : selectedSingleDosage;
    const discountPct = purchaseMode === 'subscribe' ? tiers[subInterval] : undefined;
    const finalPrice = purchaseMode === 'subscribe'
      ? parseFloat((selected.priceMin * (1 - tiers[subInterval] / 100)).toFixed(2))
      : selected.priceMin;
    addItem({
      id: selected.id,
      wcProductId: selected.wcProductId,
      wcVariationId: selected.wcVariationId,
      name: selected.name,
      peptideCode: selected.peptideCode,
      price: finalPrice,
      dosage: dosageLabel,
      ...(purchaseMode === 'subscribe' && {
        subscribeInterval: subInterval,
        subscriptionDiscountPct: discountPct,
      }),
    });
  };

  return (
    <div
      className="group bg-white border border-[#DBD0C2] rounded-[4px] flex flex-col h-full transition-all duration-300 hover:border-[#B08D57] hover:shadow-sm"
      data-product-shop
    >
      {/* Image area — clicks to selected variant's product page */}
      <button
        onClick={() => navigate(`/product/${selected.slug || selected.id}`)}
        className="relative aspect-[4/5] overflow-hidden w-full text-left cursor-pointer"
      >
        {selected.stockStatus !== 'In Stock' && (
          <span className="absolute top-3 right-3 z-20 bg-black/60 text-[#B08D57] font-sans text-[9px] tracking-[0.08em] uppercase px-2 py-0.5 rounded-[2px] font-normal backdrop-blur-sm">
            {selected.stockStatus}
          </span>
        )}

        <div className="w-full h-full transition-transform duration-700 group-hover:scale-[1.02]">
          <ProductCardImage product={selected} displayName={displayName} />
        </div>
      </button>

      {/* Content */}
      <div className="p-4 flex flex-col flex-1">
        {/* Star rating */}
        <div className="mb-2">
          <StarRating rating={selected.rating} count={selected.reviewCount} />
        </div>

        {/* Product name */}
        <button
          onClick={() => navigate(`/product/${selected.slug || selected.id}`)}
          className="text-left cursor-pointer"
        >
          <h3 className="font-sans text-lg font-bold text-[#2F3430] mb-0.5">
            {displayName}
          </h3>
        </button>

        {/* Full chemical name */}
        <p className="font-heading text-sm text-[#3D4E3D] mb-1 font-light">
          {selected.peptideCode}
        </p>

        {/* CAS number */}
        <p className="font-sans text-[10px] text-[#3D4E3D] mb-3 font-mono font-light">
          CAS: {selected.casNumber}
        </p>

        {/* Dosage selectors */}
        <div className="flex flex-wrap items-center gap-1.5 mb-3">
          {isMulti ? (
            // Multi-variant: one button per variant
            allVariants.map((v) => (
              <button
                key={v.id}
                onClick={() => setSelected(v)}
                className={`font-sans text-[10px] px-2.5 py-1 border rounded-[2px] transition-colors whitespace-nowrap cursor-pointer font-normal ${
                  selected.id === v.id
                    ? 'border-[#B08D57] text-[#B08D57] bg-[#B08D57]/5'
                    : 'border-[#DBD0C2] text-[#3D4E3D] hover:border-[#B08D57]'
                }`}
              >
                {cleanDosage(v.dosage)}
              </button>
            ))
          ) : (
            // Single product: original split-dosage selector
            singleDosageOptions.map((dose) => (
              <button
                key={dose}
                onClick={() => setSelectedSingleDosage(dose)}
                className={`font-sans text-[10px] px-2.5 py-1 border rounded-[2px] transition-colors whitespace-nowrap cursor-pointer font-normal ${
                  selectedSingleDosage === dose
                    ? 'border-[#B08D57] text-[#B08D57] bg-[#B08D57]/5'
                    : 'border-[#DBD0C2] text-[#3D4E3D] hover:border-[#B08D57]'
                }`}
              >
                {cleanDosage(dose)}
              </button>
            ))
          )}
        </div>

        {/* Subscribe & Save toggle — hidden until VITE_ENABLE_SUBSCRIPTIONS=true */}
        {SUBSCRIPTIONS_ENABLED && (
          <div className="mb-3 border border-[#DBD0C2] rounded-[2px] bg-[#FFF8EE]/40">
            <div className="flex">
              <button
                onClick={() => setPurchaseMode('once')}
                className={`flex-1 py-2 font-sans text-[10px] uppercase tracking-[0.1em] transition-colors ${
                  purchaseMode === 'once'
                    ? 'bg-[#2F3430] text-[#E1E4D9]'
                    : 'text-[#3D4E3D] hover:text-[#2F3430]'
                }`}
              >
                One-Time
              </button>
              <button
                onClick={() => setPurchaseMode('subscribe')}
                className={`flex-1 py-2 font-sans text-[10px] uppercase tracking-[0.1em] transition-colors ${
                  purchaseMode === 'subscribe'
                    ? 'bg-[#B08D57] text-[#2F3430]'
                    : 'text-[#3D4E3D] hover:text-[#2F3430]'
                }`}
              >
                Subscribe & Save {purchaseMode === 'subscribe' ? `${tiers[subInterval]}%` : ''}
              </button>
            </div>
            {purchaseMode === 'subscribe' && (
              <div className="px-3 py-2 border-t border-[#DBD0C2]">
                <select
                  value={subInterval}
                  onChange={(e) => setSubInterval(Number(e.target.value) as 30 | 60 | 90 | 180)}
                  className="w-full bg-transparent font-sans text-[10px] tracking-wider text-[#3D4E3D] outline-none cursor-pointer"
                >
                  {INTERVALS.map((i) => (
                    <option key={i.days} value={i.days}>
                      {i.label} — Save {tiers[i.days]}%
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>
        )}

        {/* Price */}
        {SUBSCRIPTIONS_ENABLED && purchaseMode === 'subscribe' ? (
          <div className="flex items-baseline gap-2 mb-3">
            <p className="font-heading text-xl text-[#B08D57]">
              ${(selected.priceMin * (1 - tiers[subInterval] / 100)).toFixed(2)}
            </p>
            <p className="font-sans text-xs text-[#4A5C4A] line-through font-light">${selected.priceMin}</p>
            <span className="font-sans text-[9px] text-[#B08D57]/70 uppercase tracking-wider font-light">/ cycle</span>
          </div>
        ) : (
          <p className="font-heading text-xl text-[#2F3430] mb-3">
            {selected.priceMin === selected.priceMax
              ? `$${selected.priceMin}`
              : `$${selected.priceMin} – $${selected.priceMax}`}
          </p>
        )}

        {/* View links */}
        <div className="flex items-center gap-3 mb-3">
          <span className="font-sans text-[10px] text-[#4A5C4A] underline underline-offset-2 cursor-pointer hover:text-[#4A5C4A] transition-colors font-normal">
            View Tests
          </span>
          <span className="text-[#DBD0C2] text-[10px]">|</span>
          <span className="font-sans text-[10px] text-[#4A5C4A] underline underline-offset-2 cursor-pointer hover:text-[#4A5C4A] transition-colors font-normal">
            View COA
          </span>
        </div>

        {/* Short description */}
        <p className="font-sans text-xs text-[#3D4E3D] leading-relaxed mb-4 font-light line-clamp-2 flex-1">
          {selected.description}
        </p>

        {/* Disclaimer chip */}
        <div className="bg-[#FFF8EE] border border-[#DBD0C2]/30 px-3 py-2 mb-3 rounded-[2px]">
          <p className="font-sans text-[10px] text-[#B08D57] font-light">
            ☒ Research Use Only — Not for Human Consumption
          </p>
        </div>

        {/* Add to Cart button — disabled when actually out of stock (2026-07-23:
            this used to be clickable regardless of stockStatus, so a customer
            could add an out-of-stock item straight to their cart). */}
        <button
          onClick={handleAddToCart}
          disabled={selected.stockStatus === 'Out of Stock'}
          className={`w-full font-sans text-[10px] uppercase tracking-[0.12em] py-3 rounded-[2px] transition-colors whitespace-nowrap font-medium ${
            selected.stockStatus === 'Out of Stock'
              ? 'bg-[#DBD0C2]/40 text-[#8E9A8A] cursor-not-allowed'
              : SUBSCRIPTIONS_ENABLED && purchaseMode === 'subscribe'
              ? 'bg-[#B08D57] text-[#2F3430] hover:bg-[#2F3430] hover:text-[#E1E4D9]'
              : 'bg-[#2F3430] text-[#E1E4D9] hover:bg-[#B08D57]'
          }`}
        >
          {selected.stockStatus === 'Out of Stock'
            ? 'Out of Stock'
            : SUBSCRIPTIONS_ENABLED && purchaseMode === 'subscribe' ? '↻ Subscribe & Save' : 'Add to Cart'}
        </button>

        {/* Stock status below button */}
        {selected.stockStatus === 'In Stock' ? (
          <p className="font-sans text-[9px] text-[#4A5C4A] text-center mt-2 font-normal">
            In Stock
          </p>
        ) : (
          <p className="font-sans text-[9px] text-[#B08D57] text-center mt-2 font-normal">
            {selected.stockStatus}
          </p>
        )}
      </div>
    </div>
  );
}
