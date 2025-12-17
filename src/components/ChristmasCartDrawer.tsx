import React from "react";
import CardDrawer, { CardDrawer as NamedCardDrawer } from "./CardDrawer";

/**
 * Your app imports this component in multiple ways across different files.
 * So we export BOTH:
 *  - named:  ChristmasCartDrawer
 *  - default: ChristmasCartDrawer
 */
export const ChristmasCartDrawer = NamedCardDrawer;
export default CardDrawer;


