export interface IProduct {
    name: string
    id: string
    price: number
}

export interface IDiscount {
    products: Array<string>
    name: string
    discountAmount: number
    minQuantityRequired: number
}
 
export interface ICartItem {
     product_id: string
     quantity: number  
}
 