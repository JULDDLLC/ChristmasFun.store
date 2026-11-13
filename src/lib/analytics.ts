// GA4 purchase measurement: the checkout functions redirect buyers to
// Stripe and back to /thank-you?session_id=..., and the ThankYou page only
// knows the session id. So at checkout time we stash the order (items and
// total) in localStorage, and the ThankYou page reads it back and fires the
// GA4 "purchase" event exactly once per session. Everything here is best
// effort only: analytics must never break checkout or the thank-you page.

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
  }
}

export type PendingOrderItem = {
  item_id: string;
  item_name: string;
  price: number;
  quantity: number;
};

type PendingOrder = {
  items: PendingOrderItem[];
  value: number;
  savedAt: number;
};

const PENDING_ORDER_KEY = "cf_pending_order";

export function savePendingOrder(items: PendingOrderItem[], value: number): void {
  try {
    const pending: PendingOrder = { items, value, savedAt: Date.now() };
    localStorage.setItem(PENDING_ORDER_KEY, JSON.stringify(pending));
  } catch {
    // Best effort only; a failed stash just means no purchase event.
  }
}

export function firePendingPurchase(sessionId: string): void {
  try {
    if (!sessionId) return;

    const guardKey = "ga_purchase_fired_" + sessionId;
    if (sessionStorage.getItem(guardKey)) return;

    const raw = localStorage.getItem(PENDING_ORDER_KEY);
    if (!raw) return;

    let pending: PendingOrder | null = null;
    try {
      pending = JSON.parse(raw) as PendingOrder;
    } catch {
      return;
    }
    if (
      !pending ||
      typeof pending !== "object" ||
      !Array.isArray(pending.items) ||
      typeof pending.value !== "number"
    ) {
      return;
    }

    (window as any).gtag?.("event", "purchase", {
      transaction_id: sessionId,
      value: pending.value,
      currency: "USD",
      items: pending.items,
    });

    sessionStorage.setItem(guardKey, "1");
    localStorage.removeItem(PENDING_ORDER_KEY);
  } catch {
    // Best effort only; analytics must never break the thank-you page.
  }
}
