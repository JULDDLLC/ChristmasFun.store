import React from 'react';
import { ShoppingCart } from 'lucide-react';
import { useCart } from '../contexts/CartContext';

interface CartButtonProps {
  onClick: () => void;
}

export const CartButton: React.FC<CartButtonProps> = ({ onClick }) => {
  const { getCartCount } = useCart();
  const itemCount = getCartCount();

  return (
    <button
      onClick={onClick}
      className="relative p-2 rounded-lg bg-white/10 hover:bg-white/20 border border-white/20 hover:border-white/30 transition-all duration-200"
      aria-label="Shopping cart"
    >
      <ShoppingCart className="w-6 h-6 text-white" />
      {itemCount > 0 && (
        <span className="absolute -top-2 -right-2 bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center animate-pulse shadow-lg">
          {itemCount > 99 ? '99+' : itemCount}
        </span>
      )}
    </button>
  );
};
