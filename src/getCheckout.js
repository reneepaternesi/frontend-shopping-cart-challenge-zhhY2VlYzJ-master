import { Checkout } from "./Checkout";
import data from "./data/data.json";

export function getCheckout() {
  return { checkout: new Checkout(data.products, data.discounts), products: data.products, discounts: data.discounts };
}
