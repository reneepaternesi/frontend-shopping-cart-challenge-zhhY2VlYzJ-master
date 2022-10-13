/**
 * Attention, do you like Typescript?
 * Just rename this file from .js to .ts and enjoy Type Safety.
 */

 export interface Checkout {
  /**
   * Scans a product adding it to the current cart.
   * @param code The product identifier
   * @returns itself to allow function chaining
   */
  scan(code: string, quantity: number): this;
  /**
   * Returns the value of all cart products with the discounts applied.
   */
   total(): number;
   /**
    * 
    */
   applyDiscount(carQuantity: number, productPrice: number, discount: IDiscount): number;
}

import { IProduct, ICartItem, IDiscount } from "./Interfaces";

export class Checkout implements Checkout  {
  products: Array<IProduct>
  cart: Array<ICartItem>
  discounts: Array<IDiscount>

  constructor(products: Array<IProduct>, discounts: Array<IDiscount>) {
    this.products = products || []
    this.discounts = discounts || []
    this.cart = []
  }

  scan(code: string, quantity: number) {
    // check if product has already been added to cart
    const productInCart = this.cart.find((item) => item.product_id === code)
    if (productInCart) {
      // remove profuct from cart when quantity is 0
      if (quantity === 0) {
        this.cart.splice(this.cart.findIndex(item => item.product_id === code), 1)
      }
      // update product quantity
      productInCart.quantity = quantity
    } else {
      // add product to cart
      const carItem: ICartItem = {
        product_id: code,
        quantity: quantity  
      }
      this.cart.push(carItem)
    }
    return this
  }
  total() {
    let total = 0
    let subtotal = 0
    this.cart.map((item => {
      // calculate product subtotal
      const productPrice = this.products.find((product) => product.id === item.product_id)?.price || 0
      subtotal = item.quantity * productPrice
      // apply discount to product subtotal
      this.discounts.map(discount => {
        if (discount.products.find((productDiscount) => productDiscount === item.product_id && item.quantity >= discount.minQuantityRequired)) {
          // asumming discount are not cumulative, but can be scalable to be
          subtotal = this.applyDiscount(item.quantity, productPrice, discount)
       }
      })
      total += subtotal
    }))

    return total;
  }
  applyDiscount(carQuantity: number, productPrice: number, discount: IDiscount,) {
    let subtotal = 0
    switch (discount.name) {
      case "2-for-1":
        subtotal = (carQuantity - Math.floor(carQuantity/discount.minQuantityRequired)) * productPrice
        break
      case "bulk":
        subtotal = (carQuantity * productPrice) - ((carQuantity * productPrice) * discount.discountAmount)
        break
    }

    return subtotal
  }
}

export default Checkout;
