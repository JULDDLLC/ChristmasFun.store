import React, { useState } from 'react';
import { StripeProduct } from '../stripe-config';
import { useAuth } from '../hooks/useAuth';
import { useCart } from '../contexts/CartContext';
import { supabase } from '../lib/supabase';
import { Loader2, ShoppingCart, CreditCard, Plus, Check } from 'lucide-react';

interface ProductCardProps {
  product: StripeProduct;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { user } = useAuth();
  const { addToCart, isInCart } = useCart();
  const [loading, setLoading] = useState(false);
  const [showAdded, setShowAdded] = useState(false);

  const handleAddToCart = () => {
    addToCart(product);
    setShowAdded(true);
    setTimeout(() => setShowAdded(false), 2000);
  };

  const handlePurchase = async () => {
    if (!user) {
      alert('Please sign in to make a purchase');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/stripe-checkout`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          price_id: product.priceId,
          mode: product.mode,
          success_url: `${window.location.origin}/success?session_id={CHECKOUT_SESSION_ID}`,
          cancel_url: window.location.href,
        }),
      });

      const data = await response.json();

      if (data.url) {
        window.location.href = data.url;
      } else {
        throw new Error('Failed to create checkout session');
      }
    } catch (error) {
      console.error('Error creating checkout:', error);
      alert('Failed to start checkout process. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(price);
  };

  return (
    <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20 hover:border-white/30 transition-all duration-300 hover:transform hover:scale-105">
      <div className="flex items-start justify-between mb-4">
        <h3 className="text-xl font-bold text-white">{product.name}</h3>
        <div className="flex items-center space-x-2">
          {product.mode === 'subscription' ? (
            <CreditCard className="w-5 h-5 text-blue-400" />
          ) : (
            <ShoppingCart className="w-5 h-5 text-green-400" />
          )}
          <span className="text-sm text-white/70 capitalize">{product.mode}</span>
        </div>
      </div>
      
      <p className="text-white/80 text-sm mb-6 line-clamp-3">{product.description}</p>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="text-2xl font-bold text-white">
            {formatPrice(product.price)}
            {product.mode === 'subscription' && <span className="text-sm text-white/70">/month</span>}
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={handleAddToCart}
            disabled={showAdded}
            className="flex-1 bg-white/10 hover:bg-white/20 disabled:opacity-50 border border-white/20 hover:border-white/30 text-white px-4 py-2 rounded-lg font-medium transition-all duration-200 flex items-center justify-center space-x-2"
          >
            {showAdded ? (
              <>
                <Check className="w-4 h-4" />
                <span>Added!</span>
              </>
            ) : (
              <>
                <Plus className="w-4 h-4" />
                <span>Add to Cart</span>
              </>
            )}
          </button>

          <button
            onClick={handlePurchase}
            disabled={loading}
            className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg font-medium transition-all duration-200 flex items-center justify-center space-x-2"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>
                {product.mode === 'subscription' ? (
                  <CreditCard className="w-4 h-4" />
                ) : (
                  <ShoppingCart className="w-4 h-4" />
                )}
                <span>{product.mode === 'subscription' ? 'Subscribe' : 'Buy Now'}</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};