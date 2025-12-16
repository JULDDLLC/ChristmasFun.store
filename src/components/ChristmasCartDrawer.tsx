import React, { useState, useEffect } from 'react';
import { X, Trash2, ShoppingBag, Loader2, Sparkles, Gift, Mail } from 'lucide-react';
import { useChristmasCart } from '../contexts/ChristmasCartContext';
import { SUPABASE_ANON_KEY, SUPABASE_URL } from '../lib/supabase';

interface ChristmasCartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  customerEmail?: string;
}

export const ChristmasCartDrawer: React.FC<ChristmasCartDrawerProps> = ({
  isOpen,
  onClose,
  customerEmail: initialEmail,
}) => {
  const { items, removeFromCart, getCartTotal, clearCart } = useChristmasCart();
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');

  useEffect(() => {
    const savedEmail = localStorage.getItem('christmas_customer_email');
    if (savedEmail) {
      setEmail(savedEmail);
    } else if (initialEmail) {
      setEmail(initialEmail);
    }
  }, [initialEmail]);

  useEffect(() => {
    if (email && email.includes('@')) {
      localStorage.setItem('christmas_customer_email', email);
      setEmailError('');
    }
  }, [email]);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(price);
  };

  const validateEmail = (emailToValidate: string) => {
    if (!emailToValidate) return 'Email is required';
    if (!emailToValidate.includes('@') || !emailToValidate.includes('.')) {
      return 'Please enter a valid email address';
    }
    return '';
  };

  const handleCheckout = async () => {
    const validationError = validateEmail(email);
    if (validationError) {
      setEmailError(validationError);
      return;
    }

    if (items.length === 0) return;

    setLoading(true);
    setEmailError('');

    try {
      const functionsBaseUrl = (SUPABASE_URL || '').trim();
      const supabaseAnonKey = (SUPABASE_ANON_KEY || '').trim();

      if (!functionsBaseUrl) {
        setEmailError('Supabase URL is missing.');
        return;
      }

    if (!supabaseAnonKey) {
  console.warn('Supabase anon key missing at runtime – continuing');
}

      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        apikey: supabaseAnonKey,
        Authorization: `Bearer ${supabaseAnonKey}`,
      };

      const response = await fetch(`${functionsBaseUrl}/functions/v1/christmas-multi-checkout`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          items: items.map((item) => {
            const priceNumber = Number(item.price);
            const priceCents = Number.isFinite(priceNumber) ? Math.round(priceNumber * 100) : 0;

            return {
              type: item.type,
              designNumber: item.designNumber ?? null,
              noteNumber: item.noteNumber ?? null,
              name: item.name,
              // keep the original for display/debug
              price: priceNumber,
              // IMPORTANT: integer cents for DB inserts
              priceCents,
            };
          }),
          customerEmail: email,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        try {
          const errorData = JSON.parse(errorText);
          setEmailError(errorData.error || 'Checkout failed. Please try again.');
        } catch {
          setEmailError('Checkout failed. Please try again.');
        }
        return;
      }

      const data = await response.json();

      if (data.error) {
        setEmailError(data.error);
        return;
      }

      if (data.url) {
        clearCart();
        window.location.href = data.url;
        return;
      }

      setEmailError('No checkout URL returned. Please try again.');
    } catch (error) {
      console.error('Checkout error:', error);
      setEmailError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const santaLetters = items.filter((item) => item.type === 'santa_letter');
  const christmasNotes = items.filter((item) => item.type === 'christmas_note');

  // Your line is mathematically fine. It just uses items.length (all items).
  // If you meant "14 letters", change items.length to santaLetters.length.
  const totalSavings = items.length >= 14 ? items.length * 0.99 - 9.99 : 0;

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 transition-opacity" onClick={onClose} />
      <div className="fixed right-0 top-0 h-full w-full max-w-md bg-gradient-to-br from-slate-950 via-blue-950 to-slate-950 shadow-2xl z-50 transform transition-transform duration-300 ease-in-out flex flex-col border-l border-white/20">
        <div className="flex items-center justify-between p-6 border-b border-white/20 bg-white/5 backdrop-blur-xl">
          <h2 className="text-2xl font-serif text-white flex items-center space-x-2">
            <ShoppingBag className="w-6 h-6 text-amber-300" />
            <span>Your Cart</span>
          </h2>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-white/10 transition-colors" aria-label="Close cart">
            <X className="w-6 h-6 text-white" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <ShoppingBag className="w-16 h-16 text-white/30 mb-4" />
              <p className="text-white/60 text-lg mb-2">Your cart is empty</p>
              <p className="text-white/40 text-sm">Add some magical designs to get started</p>
            </div>
          ) : (
            <div className="space-y-6">
              {santaLetters.length > 0 && (
                <div>
                  <h3 className="text-amber-300 font-serif text-lg mb-3 flex items-center gap-2">
                    <Sparkles className="w-5 h-5" />
                    Santa Letters ({santaLetters.length})
                  </h3>
                  <div className="space-y-3">
                    {santaLetters.map((item) => (
                      <div
                        key={item.id}
                        className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20 group hover:bg-white/15 transition-all"
                      >
                        <div className="flex items-start gap-3">
                          <div className="w-16 h-20 rounded-lg overflow-hidden flex-shrink-0 bg-white/5">
                            <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="text-white font-semibold text-sm mb-1 truncate">{item.name}</h4>
                            <p className="text-white/60 text-xs mb-2 line-clamp-2">{item.description}</p>
                            <p className="text-amber-300 font-bold text-sm">{formatPrice(item.price)}</p>
                          </div>
                          <button
                            onClick={() => removeFromCart(item.id)}
                            className="p-2 rounded-lg hover:bg-red-500/20 transition-colors flex-shrink-0"
                            aria-label="Remove item"
                          >
                            <Trash2 className="w-4 h-4 text-red-400" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {christmasNotes.length > 0 && (
                <div>
                  <h3 className="text-amber-300 font-serif text-lg mb-3 flex items-center gap-2">
                    <Gift className="w-5 h-5" />
                    Christmas Notes ({christmasNotes.length})
                  </h3>
                  <div className="space-y-3">
                    {christmasNotes.map((item) => (
                      <div
                        key={item.id}
                        className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20 group hover:bg-white/15 transition-all"
                      >
                        <div className="flex items-start gap-3">
                          <div className="w-16 h-20 rounded-lg overflow-hidden flex-shrink-0 bg-white/5">
                            <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="text-white font-semibold text-sm mb-1 truncate">{item.name}</h4>
                            <p className="text-white/60 text-xs mb-2 line-clamp-2">{item.description}</p>
                            <p className="text-amber-300 font-bold text-sm">{formatPrice(item.price)}</p>
                          </div>
                          <button
                            onClick={() => removeFromCart(item.id)}
                            className="p-2 rounded-lg hover:bg-red-500/20 transition-colors flex-shrink-0"
                            aria-label="Remove item"
                          >
                            <Trash2 className="w-4 h-4 text-red-400" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {totalSavings > 0 && (
                <div className="bg-gradient-to-r from-amber-500/20 to-amber-600/20 backdrop-blur-md rounded-xl p-4 border border-amber-400/30">
                  <div className="flex items-center gap-2 mb-2">
                    <Sparkles className="w-5 h-5 text-amber-300" />
                    <p className="text-amber-200 font-semibold">Bundle Savings Available!</p>
                  </div>
                  <p className="text-white/80 text-sm">
                    You could save {formatPrice(totalSavings)} with the Complete Bundle (18 designs) for just $9.99!
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {items.length > 0 && (
          <div className="border-t border-white/20 p-6 bg-black/20 backdrop-blur-xl">
            <div className="flex items-center justify-between mb-4">
              <span className="text-white text-lg font-semibold">Total:</span>
              <span className="text-amber-300 text-2xl font-bold">{formatPrice(getCartTotal())}</span>
            </div>

            <div className="mb-4">
              <label htmlFor="cart-email" className="block text-white text-sm font-medium mb-2 flex items-center gap-2">
                <Mail className="w-4 h-4" />
                Email Address
              </label>
              <input
                id="cart-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your.email@example.com"
                className={`w-full px-4 py-3 rounded-xl bg-white/10 backdrop-blur-md border ${
                  emailError ? 'border-red-400 ring-2 ring-red-400/50' : 'border-white/20'
                } text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-amber-400 transition-all`}
              />
              {emailError && (
                <p className="mt-2 text-red-300 text-sm flex items-center gap-1">
                  <span className="text-red-400">⚠</span>
                  {emailError}
                </p>
              )}
            </div>

            <button
              onClick={handleCheckout}
              disabled={loading || items.length === 0}
              className="w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 disabled:opacity-50 disabled:cursor-not-allowed text-amber-100 py-3 rounded-xl font-bold transition-all duration-200 flex items-center justify-center space-x-2 border border-amber-400/30 shadow-lg hover:shadow-red-500/50"
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
