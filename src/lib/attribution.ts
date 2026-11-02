// Campaign attribution: remember which campaign link brought a buyer to the
// store, and pass it along at checkout so the Stripe order record carries
// the campaign (utm_source, utm_medium, utm_campaign). Without this, clicks
// can be counted per campaign but purchases cannot be attributed.

export type Attribution = {
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
};

const STORAGE_KEY = "cf_attribution";
const UTM_KEYS = ["utm_source", "utm_medium", "utm_campaign"] as const;

export function captureAttribution(): void {
  try {
    const params = new URLSearchParams(window.location.search);
    const found: Attribution = {};
    for (const key of UTM_KEYS) {
      const value = params.get(key);
      if (value) found[key] = value.slice(0, 100);
    }
    if (Object.keys(found).length > 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(found));
    }
  } catch {
    // Attribution is best effort only; it must never break the page.
  }
}

export function getAttribution(): Attribution | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Attribution;
    return parsed && typeof parsed === "object" ? parsed : null;
  } catch {
    return null;
  }
}

// Capture on first load of any page that imports this module.
captureAttribution();
