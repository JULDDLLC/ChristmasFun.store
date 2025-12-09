import React, { useState } from 'react';
import { X, Minus, Plus, Trash2, ShoppingBag, Loader2 } from 'lucide-react';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../hooks/useAuth';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({ isOpen, onClose }) => {
  const { items, removeFromCart, updateQuantity, getCartTotal, clearCart } = useCart();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(price);
  };

  const handleCheckout = async () => {
    if (!user) {
      alert('Please sign in to checkout');
      return;
    }

    if (items.length === 0) {
      return;
    }

    const hasSubscription = items.some(item => item.product.mode === 'subscription');
    const hasPayment = items.some(item => item.product.mode === 'payment');

    if (hasSubscription && hasPayment) {
      alert('Cannot mix subscriptions and one-time purchases in the same cart. Please checkout separately.');
      return;
    }

    if (hasSubscription && items.length > 1) {
      alert('You can only subscribe to one product at a time. Please remove other subscriptions from your cart.');
      return;
    }

    setLoading(true);
    try {
      const lineItems = items.map(item => ({
        price: item.product.priceId,
        quantity: item.quantity,
      }));

      const mode = hasSubscription ? 'subscription' : 'payment';

      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/stripe-checkout`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          price_id: items[0].product.priceId,
          mode: mode,
          success_url: `${window.location.origin}/success?session_id={CHECKOUT_SESSION_ID}`,
          cancel_url: window.location.href,
        }),
      });

      const data = await response.json();

      if (data.url) {
        clearCart();
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

  if (!isOpen) return null;

  return (
    <>
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 transition-opacity"
        onClick={onClose}
      />
      <div className="fixed right-0 top-0 h-full w-full max-w-md bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 shadow-2xl z-50 transform transition-transform duration-300 ease-in-out flex flex-col">
        <div className="flex items-center justify-between p-6 border-b border-white/20">
          <h2 className="text-2xl font-bold text-white flex items-center space-x-2">
            <ShoppingBag className="w-6 h-6" />
            <span>Shopping Cart</span>
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-white/10 transition-colors"
            aria-label="Close cart"
          >
            <X className="w-6 h-6 text-white" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <ShoppingBag className="w-16 h-16 text-white/30 mb-4" />
              <p className="text-white/60 text-lg mb-2">Your cart is empty</p>
              <p className="text-white/40 text-sm">Add some products to get started</p>
            </div>
          ) : (
            <div className="space-y-4">
              {items.map((item) => (
                <div
                  key={item.product.id}
                  className="bg-white/10 backdrop-blur-md rounded-lg p-4 border border-white/20"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h3 className="text-white font-semibold mb-1">{item.product.name}</h3>
                      <p className="text-white/60 text-sm mb-2 line-clamp-2">
                        {item.product.description}
                      </p>
                      <p className="text-white font-bold">
                        {formatPrice(item.product.price)}
                        {item.product.mode === 'subscription' && (
                          <span className="text-sm text-white/70">/month</span>
                        )}
                      </p>
                    </div>
                    <button
                      onClick={() => removeFromCart(item.product.id)}
                      className="p-2 rounded-lg hover:bg-red-500/20 transition-colors"
                      aria-label="Remove item"
                    >
                      <Trash2 className="w-5 h-5 text-red-400" />
                    </button>
                  </div>

                  {item.product.mode === 'payment' && (
                    <div className="flex items-center space-x-3">
                      <button
                        onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                        className="p-1 rounded bg-white/10 hover:bg-white/20 transition-colors"
                        disabled={item.quantity <= 1}
                      >
                        <Minus className="w-4 h-4 text-white" />
                      </button>
                      <span className="text-white font-medium w-8 text-center">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                        className="p-1 rounded bg-white/10 hover:bg-white/20 transition-colors"
                        disabled={item.quantity >= 10}
                      >
                        <Plus className="w-4 h-4 text-white" />
                      </button>
                      <span className="text-white/60 text-sm ml-auto">
                        Subtotal: {formatPrice(item.product.price * item.quantity)}
                      </span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {items.length > 0 && (
          <div className="border-t border-white/20 p-6 bg-black/20">
            <div className="flex items-center justify-between mb-4">
              <span className="text-white text-lg font-semibold">Total:</span>
              <span className="text-white text-2xl font-bold">
                {formatPrice(getCartTotal())}
              </span>
            </div>
            <button
              onClick={handleCheckout}
              disabled={loading}
              className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed text-white py-3 rounded-lg font-bold transition-all duration-200 flex items-center justify-center space-x-2"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  <ShoppingBag className="w-5 h-5" />
                  <span>Proceed to Checkout</span>
                </>
              )}
            </button>
            <button
              onClick={clearCart}
              disabled={loading}
              className="w-full mt-2 text-white/60 hover:text-white text-sm py-2 transition-colors"
            >
              Clear Cart
            </button>
          </div>
        )}
      </div>
    </>
  );
};
