import React, { useMemo, useState } from "react";
import { useChristmasCart } from "../contexts/ChristmasCartContext";

export type CartItem = {
  id: string;
  name: string;
  description?: string;
  price: number;
  quantity?: number;
  image?: string;
  type?: string;
  designNumber?: number;
};

type Props = {
  isOpen?: boolean;
  onClose?: () => void;

  // Optional overrides (if parent passes them)
  items?: CartItem[];
  total?: number;
  onRemoveItem?: (id: string) => void;
  onClearCart?: () => void;
};

function isValidEmail(email: string) {
  const e = (email || "").trim();
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);
}

const SUPABASE_URL =
  (import.meta as any)?.env?.VITE_SUPABASE_URL?.trim?.() ||
  (import.meta as any)?.env?.VITE_PUBLIC_SUPABASE_URL?.trim?.() ||
  "";

const SUPABASE_ANON_KEY =
  (import.meta as any)?.env?.VITE_SUPABASE_ANON_KEY?.trim?.() ||
  (import.meta as any)?.env?.VITE_PUBLIC_SUPABASE_ANON_KEY?.trim?.() ||
  "";

export function CartDrawer(props: Props) {
  const cart = useChristmasCart();

  const items = props.items ?? (cart.items as CartItem[]);
  const total = props.total ?? cart.total;
  const isOpen = props.isOpen ?? cart.isOpen;
  const onClose = props.onClose ?? cart.closeCart;

  const onRemoveItem = props.onRemoveItem ?? cart.removeItem;
  const onClearCart = props.onClearCart ?? cart.clearCart;

  const [email, setEmail] = useState(cart.email || "");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string>("");

  const computedTotal = useMemo(() => {
    if (typeof total === "number") return total;
    return (items || []).reduce((sum, it) => {
      const qty = typeof it.quantity === "number" && it.quantity > 0 ? it.quantity : 1;
      return sum + (Number(it.price) || 0) * qty;
    }, 0);
  }, [items, total]);

  async function proceedToCheckout() {
    const e = (email || "").trim();
    setError("");

    if (!isValidEmail(e)) {
      setError("Invalid email");
      return;
    }

    if (!items || items.length === 0 || computedTotal <= 0) {
      setError("Invalid cart or email");
      return;
    }

    if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
      setError("Missing Supabase env (VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY)");
      return;
    }

    setBusy(true);
    try {
      // keep the context email in sync
      cart.setEmail?.(e);

      const res = await fetch(`${SUPABASE_URL}/functions/v1/christmas-multi-checkout`, {
        method: "POST",
        headers: {
          "content-type": "application/json",
          apikey: SUPABASE_ANON_KEY,
          authorization: `Bearer ${SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({
          email: e,
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
        setError((data && (data.error || data.message)) || `Checkout failed (${res.status})`);
        return;
      }

      const url = data?.url || data?.checkoutUrl || data?.checkout_url;
      if (url && typeof url === "string") {
        window.location.href = url;
        return;
      }

      setError("Checkout failed (missing redirect url)");
    } catch (err: any) {
      setError(err?.message || "Network error");
    } finally {
      setBusy(false);
    }
  }

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50">
      <div
        className="absolute inset-0 bg-black/60"
        onClick={() => {
          if (!busy) onClose?.();
        }}
      />
      <div className="absolute right-0 top-0 h-full w-full max-w-md bg-[#0b1422] text-white shadow-xl flex flex-col">
        <div className="p-4 border-b border-white/10 flex items-center justify-between">
          <div className="font-semibold text-lg">Your Cart</div>
          <button
            className="text-white/70 hover:text-white"
            onClick={() => {
              if (!busy) onClose?.();
            }}
          >
            ✕
          </button>
        </div>

        <div className="flex-1 overflow-auto p-4 space-y-3">
          {(items || []).length === 0 ? (
            <div className="text-white/70">Your cart is empty.</div>
          ) : (
            (items || []).map((it) => (
              <div
                key={it.id}
                className="flex gap-3 p-3 rounded-xl bg-white/5 border border-white/10"
              >
                {it.image ? (
                  <img
                    src={it.image}
                    alt={it.name}
                    className="h-14 w-14 rounded-lg object-cover border border-white/10"
                  />
                ) : (
                  <div className="h-14 w-14 rounded-lg bg-white/10 border border-white/10" />
                )}

                <div className="flex-1">
                  <div className="font-semibold">{it.name}</div>
                  {it.description ? (
                    <div className="text-sm text-white/70 line-clamp-2">{it.description}</div>
                  ) : null}
                  <div className="text-sm mt-1">
                    ${(Number(it.price) || 0).toFixed(2)}
                    {it.quantity && it.quantity > 1 ? ` × ${it.quantity}` : ""}
                  </div>
                </div>

                <button
                  className="text-red-300 hover:text-red-200"
                  onClick={() => {
                    if (!busy) onRemoveItem?.(it.id);
                  }}
                  aria-label="Remove item"
                >
                  🗑
                </button>
              </div>
            ))
          )}
        </div>

        <div className="p-4 border-t border-white/10 space-y-3">
          <div className="flex items-center justify-between text-base">
            <div className="text-white/80">Total:</div>
            <div className="font-bold text-xl">${Number(computedTotal || 0).toFixed(2)}</div>
          </div>

          <div>
            <label className="block text-sm text-white/80 mb-1">Email Address</label>
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-lg px-3 py-2 bg-white/10 border border-white/15 outline-none focus:border-white/30"
              placeholder="you@example.com"
              autoComplete="email"
              disabled={busy}
            />
          </div>

          {error ? (
            <div className="text-sm text-amber-300 flex items-center gap-2">
              <span>⚠</span>
              <span>{error}</span>
            </div>
          ) : null}

          <button
            className="w-full rounded-lg py-3 font-semibold bg-red-600 hover:bg-red-500 disabled:opacity-60 disabled:cursor-not-allowed"
            onClick={proceedToCheckout}
            disabled={busy}
          >
            {busy ? "Working..." : "Proceed to Checkout"}
          </button>

          <button
            className="w-full text-sm text-white/70 hover:text-white"
            onClick={() => {
              if (!busy) onClearCart?.();
            }}
            disabled={busy}
          >
            Clear Cart
          </button>
        </div>
      </div>
    </div>
  );
}

export default CartDrawer;
