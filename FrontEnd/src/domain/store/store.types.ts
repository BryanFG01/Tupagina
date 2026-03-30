// ─── Producto ────────────────────────────────────────────────────────────────

export type Product = {
  id: string
  landingId: string
  name: string
  description: string | null
  imageUrl: string | null
  price: number         // en centavos
  currency: string      // "USD", "EUR", etc.
  comparePrice: number | null  // precio original tachado (oferta)
  stock: number         // -1 = ilimitado
  active: boolean
  category: string | null
  badge: string | null       // "Nuevo" | "Oferta" | "Popular" | custom
  badgeShape: string | null  // "pill" | "square" | "starburst"
  badgeSize: string | null   // "sm" | "md" | "lg"
  badgeColor: string | null
  createdAt: Date
  updatedAt: Date
}

export type CreateProductInput = {
  name: string
  description?: string
  imageUrl?: string
  price: number         // en centavos
  currency?: string
  comparePrice?: number // precio original tachado
  stock?: number
  category?: string
  badge?: string
  badgeShape?: string
  badgeSize?: string
  badgeColor?: string
}

export type UpdateProductInput = Partial<CreateProductInput> & { active?: boolean }

// ─── Carrito ─────────────────────────────────────────────────────────────────

export type CartItem = {
  productId: string
  name: string
  imageUrl: string | null
  unitPrice: number  // snapshot al agregar
  quantity: number
}

// ─── Dirección de envío ───────────────────────────────────────────────────────

export type ShippingAddress = {
  street:  string
  city:    string
  state:   string
  zipCode: string
  country: string
}

// ─── Orden ───────────────────────────────────────────────────────────────────

export type OrderStatus = 'PENDING' | 'COMPLETED' | 'FAILED' | 'REFUNDED'
export type PaymentProvider = 'stripe' | 'mercadopago'

export type Order = {
  id: string
  landingId: string
  buyerEmail: string | null
  buyerName: string | null
  buyerPhone: string | null
  shippingAddress: ShippingAddress | null
  totalAmount: number
  currency: string
  status: OrderStatus
  paymentProvider: PaymentProvider
  stripeSessionId: string | null
  mpPaymentId: string | null
  createdAt: Date
  items: OrderItem[]
}

export type OrderItem = {
  id: string
  orderId: string
  productId: string
  name: string
  unitPrice: number
  quantity: number
}

export type StoreCheckoutInput = {
  landingId: string
  currency: string
  paymentProvider: PaymentProvider
  buyerName?: string
  buyerEmail?: string
  buyerPhone?: string
  shippingAddress?: ShippingAddress
  items: { productId: string; quantity: number }[]
}

export type StoreCheckoutResult = {
  orderId: string
  checkoutUrl: string
}

// ─── Reviews ─────────────────────────────────────────────────────────────────

export type Review = {
  id: string
  productId: string
  orderId: string | null
  rating: number        // 1-5
  comment: string | null
  buyerName: string
  buyerEmail: string | null
  approved: boolean
  createdAt: Date
}

export type CreateReviewInput = {
  productId: string
  orderId?: string
  rating: number
  comment?: string
  buyerName: string
  buyerEmail?: string
}
