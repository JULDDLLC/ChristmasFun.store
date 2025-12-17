import React from "react";
import CartDrawer, { CartDrawer as NamedCartDrawer } from "./CartDrawer";

/**
 * Your app imports this component in multiple ways across different files.
 * So we export BOTH:
 *  - named:  ChristmasCartDrawer
 *  - default: ChristmasCartDrawer
 */
export const ChristmasCartDrawer = NamedCartDrawer;
export default CartDrawer;


