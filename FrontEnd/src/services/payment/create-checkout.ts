import { getLandingById } from '@/infrastructure/repositories/landing.repository'
import { createPendingPayment, setPaymentExternalId } from '@/infrastructure/repositories/payment.repository'
import { createStripeCheckoutSession } from '@/infrastructure/payments/stripe'
import type { CreateCheckoutInput, CheckoutResult } from '@/domain/payment/payment.types'

export async function createCheckout(input: CreateCheckoutInput): Promise<CheckoutResult> {
  // Verificar que la landing existe y está publicada
  const landing = await getLandingById(input.landingId, input.userId)

  if (!landing) {
    throw new Error('Landing no encontrada')
  }

  // Crear el registro de pago en estado PENDING antes de ir al proveedor
  const payment = await createPendingPayment({
    landingId: input.landingId,
    userId: input.userId,
    amount: input.amount,
    currency: input.currency,
    provider: input.provider,
  })

  if (input.provider === 'stripe') {
    const session = await createStripeCheckoutSession({
      paymentId: payment.id,
      amount: input.amount,
      currency: input.currency,
      description: input.description,
      successUrl: input.successUrl,
      cancelUrl: input.cancelUrl,
    })

    // Guardar el ID de sesión de Stripe
    await setPaymentExternalId(payment.id, session.sessionId)

    return {
      paymentId: payment.id,
      checkoutUrl: session.checkoutUrl,
    }
  }

  // Mercado Pago — se implementa en Fase 2
  throw new Error('Mercado Pago no está disponible aún')
}
