// src/components/ChristmasCartDrawer.tsx

import CartDrawer, { CartDrawer as NamedCartDrawer } from "./CartDrawer";

/**
 * Some parts of the app import:
 *   import { ChristmasCartDrawer } from "../components/ChristmasCartDrawer"
 * So we must provide that named export.
 */
export const ChristmasCartDrawer = NamedCartDrawer;

// Also re-export CartDrawer in case any file imports it from here later.
export const CartDrawer = NamedCartDrawer;

// Keep a default export as well (safe + common in older code)
export default CartDrawer;
