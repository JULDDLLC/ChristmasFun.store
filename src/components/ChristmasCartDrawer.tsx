import CartDrawer from "./CartDrawer";

/**
 * IMPORTANT:
 * This component is imported BOTH ways across the app:
 * 1) import ChristmasCartDrawer from ...
 * 2) import { ChristmasCartDrawer } from ...
 *
 * So we export BOTH.
 */

export const ChristmasCartDrawer = CartDrawer;
export default CartDrawer;
