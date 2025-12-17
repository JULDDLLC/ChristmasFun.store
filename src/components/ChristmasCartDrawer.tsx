import CartDrawer from "./CartDrawer";

// Named export (fixes: import { ChristmasCartDrawer } from ".../ChristmasCartDrawer")
export const ChristmasCartDrawer = CartDrawer;

// Default export (fixes: import ChristmasCartDrawer from ".../ChristmasCartDrawer")
export default CartDrawer;

// Re-export any types/named exports from CartDrawer (optional but helpful)
export * from "./CartDrawer";
