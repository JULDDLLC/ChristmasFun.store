import React, { useMemo, useState } from "react";
import { useChristmasCart } from "../contexts/ChristmasCartContext";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  customerEmail?: string;
};

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || "";
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || "";

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test((email || "").trim());
}

export function ChristmasCartDrawer({ isOpen, onClose, customerEmail }: Props) {
  const { items, total, clearCart, removeFromCart } = useChristmasCart() as any;

  const [email, setEmail] = useState(customerEmail || "");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const computedTotal = useMemo(() => {
    if (typeof total === "number") return total;
    if (!Array.isArray(items)) return 0;
    return items.reduce((sum: number, i: any) => sum + (i.price || 0) * (i.quantity || 1), 0);
  }, [total, items]);

  async function handleCheckout() {
    setError("");

    if (!Array.isArray(items) || items.length === 0) {
      setError("Cart is empty");
      return;
    }

    if (!isValidEmail(email)) {
      setError("Invalid cart or email");
      return;
    }

    if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
      setError("Missing Supabase env (VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY)");
      return;
    }

    setBusy(true);

    try {
      const res = await fetch(`${SUPABASE_URL}/functions/v1/christmas-checkout`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
          // IMPORTANT: do NOT send "apikey" header from the browser
          // Your screenshot shows CORS blocks it as a disallowed request header.
        },
        body: JSON.stringify({
          email,
          items,
        }),
      });

      const text = await res.text();
      let data: any = null;
      try {
        data = text ? JSON.parse(text) : null;
      } catch {
        data = null;
      }

      if (!res.ok) {
        setError((data && (data.error || data.message)) || "Checkout failed. Please try again.");
        return;
      }

      if (!data?.url) {
        setError("Checkout failed. Missing redirect URL.");
        return;
      }

      window.location.href = data.url;
    } catch (e) {
      setError("Configuration error. Please try again later.");
    } finally {
      setBusy(false);
    }
  }

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[200]">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />

      <div className="absolute right-0 top-0 h-full w-full max-w-md bg-slate-950 border-l border-white/10 p-6 overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-white text-xl font-semibold">Your Cart</h3>
          <button
            onClick={onClose}
            className="text-white/70 hover:text-white px-3 py-1 rounded-lg border border-white/10"
          >
            Close
          </button>
        </div>

        <div className="text-white/80 mb-4">
          Total: <span className="text-amber-300 font-bold">${computedTotal.toFixed(2)}</span>
        </div>

        <div className="mb-4">
          <label className="block text-white/70 text-sm mb-2">Email Address</label>
          <input
            type="email"
            placeholder="you@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-xl bg-white/10 border border-white/20 text-white px-4 py-3 outline-none focus:ring-2 focus:ring-amber-400"
          />
        </div>

        {error ? (
          <div className="mb-4 rounded-xl bg-red-900/40 border border-red-500/50 text-red-200 p-3">
            {error}
          </div>
        ) : null}

        <button
          disabled={busy}
          onClick={handleCheckout}
          className="w-full rounded-xl bg-gradient-to-r from-red-600 to-red-700 text-amber-100 font-bold py-3 border border-amber-400/30 disabled:opacity-60"
        >
          {busy ? "Processing..." : "Proceed to Checkout"}
        </button>

        <button
          onClick={() => clearCart?.()}
          className="w-full mt-3 rounded-xl bg-white/10 text-white/80 font-semibold py-3 border border-white/15 hover:bg-white/15"
        >
          Clear Cart
        </button>

        <div className="mt-6 space-y-3">
          {(Array.isArray(items) ? items : []).map((item: any) => (
            <div
              key={item.id}
              className="rounded-2xl bg-white/5 border border-white/10 p-3 flex gap-3"
            >
              {item.image ? (
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-16 h-20 object-cover rounded-xl border border-white/10"
                />
              ) : (
                <div className="w-16 h-20 rounded-xl bg-white/10 border border-white/10" />
              )}

              <div className="flex-1">
                <div className="text-white font-semibold text-sm">{item.name}</div>
                {item.description ? (
                  <div className="text-white/60 text-xs mt-1">{item.description}</div>
                ) : null}
                <div className="text-amber-200 text-sm mt-2">
                  ${(item.price || 0).toFixed(2)}
                </div>
              </div>

              <button
                onClick={() => removeFromCart?.(item.id)}
                className="text-white/60 hover:text-white text-sm px-2"
                title="Remove"
              >
                ✕
              </button>
            </div>
          ))}
        </div>

        {(Array.isArray(items) ? items.length : 0) === 0 ? (
          <div className="text-white/60 text-sm mt-6">Your cart is empty.</div>
        ) : null}
      </div>
    </div>
  );
}

export default ChristmasCartDrawer;
