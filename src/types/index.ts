export type ProductCategory = 'paella' | 'tortilla' | 'postre' | 'extra'

export type Product = {
  id: string
  name: string
  description: string
  price: number
  emoji: string
  category: ProductCategory
  people?: string
  image?: string
  imageAlt?: string
  priceDetail?: string
}

export type CartItem = Product & {
  quantity: number
}

export type Cart = Record<string, number>

export type PickupSlot = {
  value: string
  label: string
  isAvailable?: boolean
  reason?: string
}

export type FormErrors = Partial<Record<'name' | 'phone' | 'date' | 'time', string>>

export type OrderStatus = 
  | 'pending'
  | 'deposit_paid'
  | 'fully_paid'
  | 'in_production'
  | 'ready'
  | 'delivered'
  | 'cancelled'

export type OrderItem = {
  id?: string
  order_id?: string
  product_id: string
  product_name: string
  quantity: number
  unit_price: number
  total_price: number
}

export type Order = {
  id: string
  created_at: string
  customer_name: string
  customer_phone: string
  people_count: number
  pickup_date: string
  pickup_time: string
  subtotal: number
  total: number
  status: OrderStatus
  has_paella: boolean
  notes?: string
  items?: OrderItem[]
}
