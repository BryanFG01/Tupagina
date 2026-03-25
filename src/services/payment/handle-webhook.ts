import { stripe } from '@/infrastructure/payments/stripe'
import { updatePaymentByExternalId } from '@/infrastructure/repositories/payment.repository'
import { getOrderByStripeSession, updateOrderStatus } from '@/infrastructure/repositories/order.repository'
import type Stripe from 'stripe'

export async function handleStripeWebhook(
  payload: string,
  signature: string
): Promise<void> {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET

  if (!webhookSecret) {
    throw new Error('Falta STRIPE_WEBHOOK_SECRET')
  }

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(payload, signature, webhookSecret)
  } catch {
    throw new Error('Firma del webhook inválida')
  }

  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.Checkout.Session

      // Store order: client_reference_id starts with "order_"
      if (session.client_reference_id?.startsWith('order_')) {
        const order = await getOrderByStripeSession(session.id)
        if (order) {
          await updateOrderStatus(order.id, 'COMPLETED', {
            buyerEmail: session.customer_details?.email ?? undefined,
            buyerName:  session.customer_details?.name  ?? undefined,
          })
        }
      } else {
        // Single payment block
        await updatePaymentByExternalId(session.id, {
          status: 'COMPLETED',
          buyerEmail: session.customer_details?.email ?? undefined,
          buyerName:  session.customer_details?.name  ?? undefined,
        })
      }
      break
    }

    case 'checkout.session.expired': {
      const session = event.data.object as Stripe.Checkout.Session

      if (session.client_reference_id?.startsWith('order_')) {
        const order = await getOrderByStripeSession(session.id)
        if (order) {
          await updateOrderStatus(order.id, 'FAILED')
        }
      } else {
        await updatePaymentByExternalId(session.id, { status: 'FAILED' })
      }
      break
    }

    default:
      break
  }
}
