import Stripe from 'stripe'

// Lazy init — solo falla cuando se llama una función de pago, no al importar
function getStripe(): Stripe {
  if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error('Falta la variable de entorno STRIPE_SECRET_KEY')
  }
  return new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: '2025-02-24.acacia',
  })
}

// Named export for webhook handler (uses getStripe() lazily)
export const stripe = {
  webhooks: {
    constructEvent: (payload: string, signature: string, secret: string) =>
      getStripe().webhooks.constructEvent(payload, signature, secret),
  },
}

// Checkout para múltiples productos (tienda)
export async function createStripeStoreCheckout(params: {
  orderId: string
  currency: string
  lineItems: { name: string; unitAmount: number; quantity: number }[]
  successUrl: string
  cancelUrl: string
  buyerEmail?: string
}): Promise<{ sessionId: string; checkoutUrl: string }> {
  const session = await getStripe().checkout.sessions.create({
    payment_method_types: ['card'],
    mode: 'payment',
    client_reference_id: `order_${params.orderId}`,
    customer_email: params.buyerEmail,
    line_items: params.lineItems.map(item => ({
      price_data: {
        currency: params.currency,
        product_data: { name: item.name },
        unit_amount: item.unitAmount,
      },
      quantity: item.quantity,
    })),
    success_url: params.successUrl,
    cancel_url: params.cancelUrl,
  })

  if (!session.url) throw new Error('Stripe no retornó una URL de checkout')
  return { sessionId: session.id, checkoutUrl: session.url }
}

export async function createStripeCheckoutSession(params: {
  paymentId: string
  amount: number
  currency: string
  description: string
  successUrl: string
  cancelUrl: string
  buyerEmail?: string
}): Promise<{ sessionId: string; checkoutUrl: string }> {
  const session = await getStripe().checkout.sessions.create({
    payment_method_types: ['card'],
    mode: 'payment',
    client_reference_id: params.paymentId,
    customer_email: params.buyerEmail,
    line_items: [
      {
        price_data: {
          currency: params.currency,
          product_data: {
            name: params.description,
          },
          unit_amount: params.amount,
        },
        quantity: 1,
      },
    ],
    success_url: params.successUrl,
    cancel_url: params.cancelUrl,
  })

  if (!session.url) {
    throw new Error('Stripe no retornó una URL de checkout')
  }

  return {
    sessionId: session.id,
    checkoutUrl: session.url,
  }
}
