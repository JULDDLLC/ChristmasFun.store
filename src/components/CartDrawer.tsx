import React, { useMemo, useState } from "react";

type CartItem = {
  id: string;
  name: string;
  description: string;
  price: number;
  quantity?: number;
  image?: string;
};

type Props = {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  total: number;
  onClearCart: () => void;
  onRemoveItem: (id: string) => void;
};

const SUPABASE_URL =
  import.meta.env.VITE_SUPABASE_URL ||
  import.meta.env.VITE_PUBLIC_SUPABASE_URL ||
  "";

const SUPABASE_ANON_KEY =
  import.meta.env.VITE_SUPABASE_ANON_KEY ||
  import.meta.env.VITE_PUBLIC_SUPABASE_ANON_KEY ||
  "";

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

// IMPORTANT: Export BOTH ways because your codebase imports it BOTH ways:
// - named:  import { CartDrawer } from "./CartDrawer";
// - default: import CartDrawer from "./CartDrawer";
export function CartDrawer({
  isOpen,
  onClose,
  items,
  total,
  onClearCart,
  onRemoveItem,
}: Props) {
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const computedTotal = useMemo(() => {
    return typeof total === "number"
      ? total
      : items.reduce((sum, i) => sum + i.price * (i.quantity || 1), 0);
  }, [total, items]);

  async function handleCheckout() {
    setError("");

    if (!items.length) {
      setError("Cart is empty");
      return;
    }

    if (!isValidEmail(email)) {
      setError("Invalid cart or email");
      return;
    }

    if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
      setError("Checkout temporarily unavailable");
      return;
    }

    setBusy(true);

    try {
      const res = await fetch(`${SUPABASE_URL}/functions/v1/christmas-checkout`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          // Do NOT send apikey from the browser
        },
        body: JSON.stringify({
          email,
          items,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data?.url) {
        throw new Error("Checkout failed");
      }

      window.location.href = data.url;
    } catch {
      setError("Configuration error. Please try again later.");
    } finally {
      setBusy(false);
    }
  }

  if (!isOpen) return null;

  return (
    <div className="cart-drawer">
      <h3>Total: ${computedTotal.toFixed(2)}</h3>

      <input
        type="email"
        placeholder="Email Address"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />

      {error && <p className="error">{error}</p>}

      <button disabled={busy} onClick={handleCheckout}>
        {busy ? "Processing..." : "Proceed to Checkout"}
      </button>

      <button onClick={onClearCart}>Clear Cart</button>
    </div>
  );
}

export default CartDrawer;
