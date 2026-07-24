import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';

/** Bulk pricing tiers — applied per-item based on quantity of that item */
export function tieredUnitPrice(basePrice: number, qty: number): number {
  if (qty >= 6) return parseFloat((basePrice * 0.92).toFixed(2));
  if (qty >= 3) return parseFloat((basePrice * 0.95).toFixed(2));
  return basePrice;
}

export interface CartItem {
  id: string;
  name: string;
  peptideCode: string;
  price: number;
  dosage: string;
  quantity: number;
  imageUrl?: string;
  /** Real WooCommerce numeric product/variation id, carried through from the
   *  Product record this item was added from. See checkout/page.tsx — sent
   *  directly on the order's line_items so WC's REST API always has a real
   *  product_id/variation_id, instead of depending entirely on the
   *  "peptide_code" meta-lookup fallback (which silently broke checkout for
   *  any product missing that custom field — 2026-07-24 fix). */
  wcProductId?: number;
  wcVariationId?: number | null;
  // Subscribe & Save
  subscribeInterval?: 30 | 60 | 90 | 180; // days between renewals; undefined = one-time
  subscriptionDiscountPct?: number;         // e.g. 10 = 10% off
}

interface CartContextType {
  items: CartItem[];
  addItem: (item: Omit<CartItem, 'quantity'>) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  totalItems: number;
  totalPrice: number;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  // BUG FIX 2026-07-23: an applied affiliate/promo coupon used to live in
  // CheckoutPage's own local useState. That component unmounts whenever the
  // customer navigates away from /checkout (e.g. back to the shop to add
  // another item), which reset the coupon to its initial "not applied"
  // state on remount — the code visibly "disappeared" even though nothing
  // about the cart itself ever touched it. Moving it up into CartContext
  // (mounted once, above the router, alongside `items`) makes it survive
  // navigation exactly like the cart contents already do.
  couponCode: string;
  setCouponCode: (code: string) => void;
  couponApplied: boolean | null;
  setCouponApplied: (applied: boolean | null) => void;
  couponDiscount: number;
  setCouponDiscount: (amount: number) => void;
  couponFreeShipping: boolean;
  setCouponFreeShipping: (freeShipping: boolean) => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [couponCode, setCouponCode] = useState('');
  const [couponApplied, setCouponApplied] = useState<boolean | null>(null);
  const [couponDiscount, setCouponDiscount] = useState(0);
  const [couponFreeShipping, setCouponFreeShipping] = useState(false);

  const addItem = useCallback((newItem: Omit<CartItem, 'quantity'>) => {
    setItems((prev) => {
      const existing = prev.find((i) => i.id === newItem.id);
      if (existing) {
        return prev.map((i) =>
          i.id === newItem.id ? { ...i, quantity: i.quantity + 1 } : i
        );
      }
      return [...prev, { ...newItem, quantity: 1 }];
    });
    setIsOpen(true);
  }, []);

  const removeItem = useCallback((id: string) => {
    setItems((prev) => prev.filter((i) => i.id !== id));
  }, []);

  const updateQuantity = useCallback((id: string, quantity: number) => {
    if (quantity < 1) {
      setItems((prev) => prev.filter((i) => i.id !== id));
      return;
    }
    setItems((prev) =>
      prev.map((i) => (i.id === id ? { ...i, quantity } : i))
    );
  }, []);

  const clearCart = useCallback(() => {
    setItems([]);
    // An order was just placed (or the cart is being reset) — a coupon
    // shouldn't silently carry over to whatever the customer buys next.
    setCouponCode('');
    setCouponApplied(null);
    setCouponDiscount(0);
    setCouponFreeShipping(false);
  }, []);

  const totalItems = items.reduce((sum, i) => sum + i.quantity, 0);
  const totalPrice = items.reduce((sum, i) => sum + tieredUnitPrice(i.price, i.quantity) * i.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        totalItems,
        totalPrice,
        couponCode,
        setCouponCode,
        couponApplied,
        setCouponApplied,
        couponDiscount,
        setCouponDiscount,
        couponFreeShipping,
        setCouponFreeShipping,
        isOpen,
        setIsOpen,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}