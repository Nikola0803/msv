import { useCart } from '../../context/CartContext';
import { useNavigate } from 'react-router-dom';

export default function FloatingCart() {
  const { totalItems, setIsOpen } = useCart();
  const navigate = useNavigate();

  if (totalItems === 0) return null;

  return (
    <button
      onClick={() => setIsOpen(true)}
      className="fixed bottom-6 right-6 z-50 bg-[#2F3430] text-[#E1E4D9] w-14 h-14 flex items-center justify-center cursor-pointer hover:bg-[#3a403b] transition-colors rounded-[2px]"
      aria-label="Open cart"
    >
      <span className="relative">
        <i className="ri-shopping-bag-line text-xl" />
        {totalItems > 0 && (
          <span className="absolute -top-2 -right-2 w-5 h-5 bg-[#B08D57] text-[#E1E4D9] text-[10px] font-bold flex items-center justify-center font-sans rounded-[2px]">
            {totalItems}
          </span>
        )}
      </span>
    </button>
  );
}