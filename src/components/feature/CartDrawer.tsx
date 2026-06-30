import { useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext';

export default function CartDrawer() {
  const { items, isOpen, setIsOpen, removeItem, updateQuantity, totalPrice, clearCart } = useCart();
  const navigate = useNavigate();

  if (!isOpen) return null;

  return (
    <>
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[90]"
        onClick={() => setIsOpen(false)}
      />
      <div className="fixed top-0 right-0 h-full w-full max-w-md bg-[#E1E4D9] z-[95] shadow-2xl flex flex-col">
        <div className="flex items-center justify-between p-5 border-b border-[#DBD0C2]">
          <h2 className="font-heading text-sm tracking-[0.2em] uppercase text-[#2F3430]">
            Your Cart
          </h2>
          <button
            onClick={() => setIsOpen(false)}
            className="w-8 h-8 flex items-center justify-center text-[#7A8A76] hover:text-[#2F3430] transition-colors"
          >
            <i className="ri-close-line" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <span className="w-12 h-12 flex items-center justify-center text-[#B08D57]/40 mb-3">
                <i className="ri-shopping-bag-line text-2xl" />
              </span>
              <p className="font-sans text-sm text-[#7A8A76] italic font-light">
                Your cart is empty.
              </p>
              <p className="font-sans text-xs text-[#7A8A76]/60 mt-1 font-light">
                Begin your research journey.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="p-4 border border-[#DBD0C2] bg-white/50 relative rounded-[2px]"
                >
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="font-heading text-xs tracking-wider uppercase text-[#2F3430]">
                        {item.name}
                      </h3>
                      <p className="font-sans text-xs italic text-[#7A8A76] mt-0.5 font-light">
                        {item.peptideCode}
                      </p>
                      <p className="font-mono text-[11px] text-[#B08D57] mt-0.5">
                        {item.dosage}
                      </p>
                    </div>
                    <button
                      onClick={() => removeItem(item.id)}
                      className="w-6 h-6 flex items-center justify-center text-[#7A8A76] hover:text-red-700 transition-colors"
                    >
                      <i className="ri-close-line text-sm" />
                    </button>
                  </div>

                  <div className="flex items-center justify-between mt-3">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className="w-7 h-7 flex items-center justify-center border border-[#DBD0C2] text-[#7A8A76] hover:bg-[#B08D57]/10 transition-colors"
                      >
                        <i className="ri-subtract-line text-xs" />
                      </button>
                      <span className="w-8 text-center font-mono text-sm text-[#2F3430]">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="w-7 h-7 flex items-center justify-center border border-[#DBD0C2] text-[#7A8A76] hover:bg-[#B08D57]/10 transition-colors"
                      >
                        <i className="ri-add-line text-xs" />
                      </button>
                    </div>
                    <span className="font-mono text-sm text-[#B08D57] font-bold">
                      ${(item.price * item.quantity).toFixed(2)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {items.length > 0 && (
          <div className="border-t border-[#DBD0C2]/40 p-5 space-y-3">
            <div className="flex justify-between items-center">
              <span className="font-heading text-xs tracking-wider uppercase text-[#7A8A76]">
                Subtotal
              </span>
              <span className="font-mono text-lg text-[#B08D57] font-bold">
                ${totalPrice.toFixed(2)}
              </span>
            </div>
            <p className="font-sans text-[11px] italic text-[#7A8A76]/80 text-center font-light">
              Shipping & taxes calculated at checkout.
            </p>
            <button
              onClick={() => {
                setIsOpen(false);
                navigate('/checkout');
              }}
              className="w-full bg-[#2F3430] hover:bg-[#B08D57] text-[#E1E4D9] hover:text-[#2F3430] font-sans text-xs tracking-[0.16em] uppercase py-3 rounded-[2px] transition-all duration-300"
            >
              Proceed to Checkout
            </button>
            <button
              onClick={clearCart}
              className="w-full text-center font-sans text-xs text-[#7A8A76] hover:text-[#2F3430] transition-colors py-1"
            >
              Clear Cart
            </button>
          </div>
        )}
      </div>
    </>
  );
}