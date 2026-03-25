export type PaymentStatus = 'PENDING' | 'COMPLETED' | 'FAILED' | 'REFUNDED'

export type Payment = {
  id: string
  landingId: string
  userId: string
  amount: number // en centavos
  currency: string
  status: PaymentStatus
  provider: 'stripe' | 'mercadopago'
  externalId: string | null
  buyerEmail: string | null
  buyerName: string | null
  createdAt: Date
}

export type CreateCheckoutInput = {
  landingId: string
  userId: string
  amount: number
  currency: string
  provider: 'stripe' | 'mercadopago'
  description: string
  successUrl: string
  cancelUrl: string
}

export type CheckoutResult = {
  paymentId: string
  checkoutUrl: string
}
