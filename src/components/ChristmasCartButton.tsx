import React from 'react';
import { ShoppingCart } from 'lucide-react';
import { useChristmasCart } from '../contexts/ChristmasCartContext';

interface ChristmasCartButtonProps {
  onClick: () => void;
}

export const ChristmasCartButton: React.FC<ChristmasCartButtonProps> = ({ onClick }) => {
  const { getCartCount } = useChristmasCart();
  const itemCount = getCartCount();

  return (
    <button
      onClick={onClick}
      className="relative p-3 rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20 hover:bg-white/20 transition-all duration-300 group"
      aria-label="Shopping cart"
    >
      <ShoppingCart className="w-6 h-6 text-amber-300 group-hover:text-amber-200 transition-colors" />
      {itemCount > 0 && (
        <span className="absolute -top-2 -right-2 bg-gradient-to-r from-red-600 to-red-700 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center border-2 border-white/20 animate-pulse">
          {itemCount}
        </span>
      )}
    </button>
  );
};
