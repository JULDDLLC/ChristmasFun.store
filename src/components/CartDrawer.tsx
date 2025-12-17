import { useState } from "react";
import { X } from "lucide-react";

export interface CartItem {
  id: string;
  title: string;
  price: number;
  priceId: string;
  image?: string;
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  clearCart: () => void;
}

const CHECKOUT_URL =
  "https://kvnbgubooykiveogifwt.supabase.co/functions/v1/christmas-multi-checkout";

export default function CartDrawer({
  isOpen,
  onClose,
  items,
  clearCart,
}: Props) {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const total = items.reduce((sum, i) => sum + i.price, 0);

  const validEmail = (v: string) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);

  async function checkout() {
    setError("");

    if (!validEmail(email)) {
      setError("Invalid email");
      return;
    }

    if (!items.length) {
      setError("Cart is empty");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch(CHECKOUT_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          apikey: import.meta.env.VITE_SUPABASE_ANON_KEY!,
        },
        body: JSON.stringify({
          email,
          items: items.map((i) => ({
            priceId: i.priceId,
            quantity: 1,
          })),
        }),
      });

      const data = await res.json();

      if (!res.ok || !data?.url) {
        throw new Error(data?.error || "Checkout failed");
      }

      window.location.href = data.url;
    } catch (e: any) {
      setError(e.message || "Checkout error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/60">
      <div className="absolute right-0 top-0 h-full w-[420px] bg-[#0C141D] text-white p-6 overflow-y-auto">
        <button onClick={onClose} className="absolute right-4 top-4">
          <X />
        </button>

        <h2 className="text-xl font-bold mb-4">Your Cart</h2>

        {items.map((item) => (
          <div key={item.id} className="flex gap-3 mb-3">
            {item.image && (
              <img src={item.image} className="w-14 h-14 rounded" />
            )}
            <div className="flex-1">
              <p className="font-semibold">{item.title}</p>
              <p className="text-sm">${item.price.toFixed(2)}</p>
            </div>
          </div>
        ))}

        <div className="mt-6">
          <p className="font-bold mb-2">Total: ${total.toFixed(2)}</p>

          <input
            className="w-full p-2 rounded text-black"
            placeholder="Email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          {error && (
            <p className="text-red-400 text-sm mt-2">{error}</p>
          )}

          <button
            disabled={loading}
            onClick={checkout}
            className="w-full bg-red-600 mt-4 py-3 rounded font-bold"
          >
            {loading ? "Processing…" : "Proceed to Checkout"}
          </button>

          <button
            onClick={clearCart}
            className="w-full text-sm mt-3 opacity-70"
          >
            Clear Cart
          </button>
        </div>
      </div>
    </div>
  );
}
