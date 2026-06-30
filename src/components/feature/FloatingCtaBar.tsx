import { useCart } from '../../context/CartContext';
import { useNavigate } from 'react-router-dom';

export default function FloatingCtaBar() {
  const { items, totalItems, totalPrice, setIsOpen } = useCart();
  const navigate = useNavigate();

  if (items.length === 0) {
    return (
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-[#2F3430] border-t border-[#B08D57]/40 md:hidden">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2">
            <span className="w-4 h-4 flex items-center justify-center text-[#B08D57] text-xs">
              <i className="ri-truck-line" />
            </span>
            <span className="font-sans text-[10px] text-[#E1E4D9]/70 tracking-wider">
              Free Shipping on Orders $200+
            </span>
          </div>
          <button
            onClick={() => navigate('/shop')}
            className="font-sans text-[10px] tracking-[0.14em] uppercase text-[#B08D57] border border-[#B08D57]/40 px-4 py-2 hover:bg-[#B08D57] hover:text-[#2F3430] transition-colors rounded-[2px]"
          >
            Shop Now
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-[#2F3430] border-t border-[#B08D57]/40 md:hidden">
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-2">
          <span className="w-4 h-4 flex items-center justify-center text-[#B08D57] text-xs">
            <i className="ri-truck-line" />
          </span>
          <span className="font-sans text-[10px] text-[#E1E4D9]/70 tracking-wider">
            {totalPrice >= 200 ? (
              <span className="text-[#B08D57]">Free shipping unlocked ✦</span>
            ) : (
              <>${(200 - totalPrice).toFixed(0)} away from free shipping</>
            )}
          </span>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/shop')}
            className="font-sans text-[10px] tracking-[0.14em] uppercase text-[#B08D57] border border-[#B08D57]/40 px-3 py-2 hover:bg-[#B08D57] hover:text-[#2F3430] transition-colors rounded-[2px]"
          >
            Shop
          </button>

          <button
            onClick={() => setIsOpen(true)}
            className="relative flex items-center gap-2 bg-[#B08D57] text-[#2F3430] font-sans text-[10px] tracking-[0.14em] uppercase px-4 py-2 hover:bg-[#c49a5e] transition-colors rounded-[2px]"
          >
            <span className="w-4 h-4 flex items-center justify-center">
              <i className="ri-shopping-bag-line" />
            </span>
            Cart
            {totalItems > 0 && (
              <span className="absolute -top-2 -right-2 w-5 h-5 bg-[#2F3430] border border-[#B08D57] text-[#E1E4D9] text-[9px] flex items-center justify-center font-sans rounded-[2px]">
                {totalItems}
              </span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}