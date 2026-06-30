import { useCart } from '../../context/CartContext';

export default function UtilityBar() {
  const { totalItems, setIsOpen } = useCart();

  return (
    <div className="w-full bg-foreground-950 text-background-50 py-2 px-4 md:px-8 relative z-40">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-6 text-xs font-body font-light tracking-wide">
          <a
            href="mailto:help@mysecretvitality.com"
            className="flex items-center gap-2 hover:text-accent-500 transition-colors whitespace-nowrap"
          >
            <span className="w-4 h-4 flex items-center justify-center">
              <i className="ri-mail-line text-xs" />
            </span>
            help@mysecretvitality.com
          </a>
          <span className="text-background-50/30">|</span>
          <a
            href="tel:+18667884577"
            className="flex items-center gap-2 hover:text-accent-500 transition-colors whitespace-nowrap"
          >
            <span className="w-4 h-4 flex items-center justify-center">
              <i className="ri-phone-line text-xs" />
            </span>
            (866) 788-GLP1
          </a>
        </div>

        <button
          onClick={() => setIsOpen(true)}
          className="flex items-center gap-2 hover:text-accent-500 transition-colors group"
        >
          <span className="relative">
            <span className="w-8 h-8 flex items-center justify-center rounded-full border border-secondary-500/60 group-hover:border-accent-500 transition-colors">
              <i className="ri-shopping-bag-line text-sm" />
            </span>
            {totalItems > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-accent-500 text-foreground-950 text-[10px] font-bold rounded-full flex items-center justify-center font-mono">
                {totalItems}
              </span>
            )}
          </span>
          <span className="font-body text-xs tracking-widest uppercase hidden sm:inline font-light">
            Cart
          </span>
        </button>
      </div>
    </div>
  );
}