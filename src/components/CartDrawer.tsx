import React, { useEffect, useMemo, useState } from "react";

type CartItem = {
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
  isOpen: boolean;
  onClose: () => void;
  items?: CartItem[];
  total?: number;
  onClearCart?: () => void;
  onRemoveItem?: (id: string) => void;
};

const SUPABASE_FUNCTIONS_BASE =
  (import.meta as any)?.env?.VITE_SUPABASE_FUNCTIONS_BASE ||
  "https://kvnbgubookyikveogifwt.supabase.co/functions/v1";

const SUPABASE_ANON_KEY =
  (import.meta as any)?.env?.VITE_SUPABASE_ANON_KEY ||
  (import.meta as any)?.env?.VITE_SUPABASE_ANON ||
  "";

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

export function CartDrawer({
  isOpen,
  onClose,
  items = [],
  total,
  onClearCart,
  onRemoveItem,
}: Props) {
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const computedTotal = useMemo(() => {
    if (typeof total === "number") return total;
    return items.reduce((sum, it) => sum + (it.price || 0) * (it.quantity || 1), 0);
  }, [items, total]);

  useEffect(() => {
    if (!isOpen) {
      setBusy(false);
      setError(null);
    }
  }, [isOpen]);

  async function proceedToCheckout() {
    setError(null);

    const cleanEmail = email.trim();
    if (!items.length || !isValidEmail(cleanEmail)) {
      setError(!items.length ? "Invalid cart or email" : "Invalid email");
      return;
    }

    setBusy(true);
    try {
      const url = `${SUPABASE_FUNCTIONS_BASE}/christmas-multi-checkout`;

      const headers: Record<string, string> = {
        "content-type": "application/json",
      };

      if (SUPABASE_ANON_KEY) {
        headers["apikey"] = SUPABASE_ANON_KEY;
        headers["authorization"] = `Bearer ${SUPABASE_ANON_KEY}`;
      }

      const payload = {
        email: cleanEmail,
        cart: items.map((it) => ({
          id: it.id,
          name: it.name,
          description: it.description,
          price: it.price,
          quantity: it.quantity ?? 1,
          image: it.image,
          type: it.type,
          designNumber: it.designNumber,
        })),
      };

      const res = await fetch(url, {
        method: "POST",
        headers,
        body: JSON.stringify(payload),
      });

      const text = await res.text();
      let data: any = null;
      try {
        data = text ? JSON.parse(text) : null;
      } catch {
        data = { raw: text };
      }

      if (!res.ok) {
        setError(data?.error || "Configuration error. Please try again later.");
        return;
      }

      const checkoutUrl =
        data?.url || data?.checkoutUrl || data?.checkout_url || data?.sessionUrl || data?.session_url;

      if (checkoutUrl && typeof checkoutUrl === "string") {
        window.location.href = checkoutUrl;
        return;
      }

      setError("Configuration error. Please try again later.");
    } catch {
      setError("Network error occurred. Try again.");
    } finally {
      setBusy(false);
    }
  }

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50"
      role="dialog"
      aria-modal="true"
      aria-label="Cart"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      style={{ background: "rgba(0,0,0,0.55)" }}
    >
      <div className="absolute right-0 top-0 h-full w-full max-w-md bg-[#0b1320] border-l border-white/10 shadow-2xl flex flex-col">
        <div className="p-4 flex items-center justify-between border-b border-white/10">
          <div className="text-white font-semibold">Your Cart</div>
          <button
            className="text-white/70 hover:text-white text-sm"
            onClick={onClose}
            disabled={busy}
            type="button"
          >
            Close
          </button>
        </div>

        <div className="flex-1 overflow-auto p-4 space-y-3">
          {items.length === 0 ? (
            <div className="text-white/70 text-sm">Your cart is empty.</div>
          ) : (
            items.map((it) => (
              <div
                key={it.id}
                className="rounded-xl border border-white/10 bg-white/5 p-3 flex gap-3 items-center"
              >
                {it.image ? (
                  <img
                    src={it.image}
                    alt={it.name}
                    className="h-12 w-12 rounded-lg object-cover border border-white/10"
                    loading="lazy"
                  />
                ) : (
                  <div className="h-12 w-12 rounded-lg bg-white/10 border border-white/10" />
                )}

                <div className="flex-1 min-w-0">
                  <div className="text-white text-sm font-medium truncate">{it.name}</div>
                  {it.description ? (
                    <div className="text-white/60 text-xs truncate">{it.description}</div>
                  ) : null}
                  <div className="text-[#f7d46b] text-sm font-semibold">
                    ${(it.price ?? 0).toFixed(2)}
                  </div>
                </div>

                {onRemoveItem ? (
                  <button
                    type="button"
                    className="text-white/60 hover:text-white text-xs px-2 py-1 rounded-md border border-white/10"
                    onClick={() => onRemoveItem(it.id)}
                    disabled={busy}
                    title="Remove"
                  >
                    Remove
                  </button>
                ) : null}
              </div>
            ))
          )}
        </div>

        <div className="p-4 border-t border-white/10 space-y-3">
          <div className="flex items-center justify-between">
            <div className="text-white/80 text-sm">Total:</div>
            <div className="text-[#f7d46b] text-xl font-bold">${computedTotal.toFixed(2)}</div>
          </div>

          <label className="block">
            <div className="text-white/80 text-sm mb-1">Email Address</div>
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full rounded-xl bg-black/20 border border-white/10 px-3 py-3 text-white outline-none focus:border-white/30"
              disabled={busy}
              inputMode="email"
              autoComplete="email"
            />
          </label>

          {error ? (
            <div className="text-amber-300 text-sm flex items-center gap-2">
              <span>⚠</span>
              <span>{error}</span>
            </div>
          ) : null}

          <button
            type="button"
            onClick={proceedToCheckout}
            disabled={busy}
            className="w-full rounded-xl bg-red-600 hover:bg-red-700 disabled:opacity-60 disabled:hover:bg-red-600 text-white font-semibold py-3"
          >
            {busy ? "Working..." : "Proceed to Checkout"}
          </button>

          {onClearCart ? (
            <button
              type="button"
              onClick={onClearCart}
              disabled={busy}
              className="w-full text-white/70 hover:text-white text-sm py-2"
            >
              Clear Cart
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
}

export default CartDrawer;
