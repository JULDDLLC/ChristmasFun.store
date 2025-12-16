import React, { useState } from 'react';
import { X, Minus, Plus, Trash2, ShoppingBag, Loader2 } from 'lucide-react';
import { useCart } from '../contexts/CartContext';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({ isOpen, onClose }) => {
  const { items, removeFromCart, updateQuantity, getCartTotal, clearCart } = useCart();
  const [loading, setLoading] = useState(false);

  const formatPrice = (priceCents: number) =>
    new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format((priceCents || 0) / 100);

  const handleCheckout = async () => {
    if (!items.length || loading) return;

    const supabaseUrl =
      import.meta.env.VITE_SUPABASE_URL ||
      'https://kvnbgubooykiveogifwt.supabase.co';

    const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
      alert('Configuration error. Missing Supabase environment variables.');
      return;
    }

    setLoading(true);

    try {
      // Build payload EXACTLY how christmas-multi-checkout expects it
      const payload = {
        email: items[0].email || null,
        items: items.map((item) => ({
          price_id: item.product.priceId, // Stripe PRICE ID
          quantity: item.quantity || 1,
        })),
        success_url: `${window.location.origin}/thank-you?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: window.location.href,
      };

      const response = await fetch(
        `${supabaseUrl}/functions/v1/christmas-multi-checkout`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${supabaseAnonKey}`,
            apikey: supabaseAnonKey,
          },
          body: JSON.stringify(payload),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        console.error('Checkout failed:', data);
        alert(data?.error || 'Checkout failed.');
        return;
      }

      if (data?.url) {
        clearCart();
        window.location.href = data.url;
        return;
      }

      alert('Failed to start checkout.');
    } catch (err) {
      console.error(err);
      alert('Checkout error.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black/50 z-40" onClick={onClose} />
      <div className="fixed right-0 top-0 h-full w-full max-w-md bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 z-50 flex flex-col">
        <div className="flex justify-between p-6 border-b border-white/20">
          <h2 className="text-xl text-white flex items-center gap-2">
            <ShoppingBag /> Cart
          </h2>
          <button onClick={onClose}>
            <X className="text-white" />
          </button>
        </div>

        <div className="flex-1 p-6 overflow-y-auto space-y-4">
          {items.map((item) => (
            <div key={item.product.id} className="bg-white/10 p-4 rounded">
              <div className="flex justify-between">
                <div>
                  <h3 className="text-white">{item.product.name}</h3>
                  <p className="text-white/60 text-sm">{item.product.description}</p>
                  <p className="text-white font-bold">
                    {formatPrice(item.product.price)}
                  </p>
                </div>
                <button onClick={() => removeFromCart(item.product.id)}>
                  <Trash2 className="text-red-400" />
                </button>
              </div>

              <div className="flex items-center gap-3 mt-3">
                <button
                  onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                  disabled={item.quantity <= 1}
                >
                  <Minus className="text-white" />
                </button>
                <span className="text-white">{item.quantity}</span>
                <button
                  onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                >
                  <Plus className="text-white" />
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="p-6 border-t border-white/20">
          <div className="flex justify-between text-white mb-4">
            <span>Total</span>
            <span className="font-bold">{formatPrice(getCartTotal())}</span>
          </div>

          <button
            onClick={handleCheckout}
            disabled={loading}
            className="w-full bg-green-600 py-3 rounded text-white flex justify-center gap-2"
          >
            {loading ? <Loader2 className="animate-spin" /> : <ShoppingBag />}
            Proceed to Checkout
          </button>
        </div>
      </div>
    </>
  );
};
