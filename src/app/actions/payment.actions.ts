'use server'

import { z } from 'zod'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/infrastructure/auth/auth-options'
import { createCheckout } from '@/services/payment/create-checkout'

const createCheckoutSchema = z.object({
  landingId: z.string().cuid(),
  amount: z.number().min(100),
  currency: z.enum(['usd', 'ars', 'mxn', 'cop', 'clp']),
  provider: z.enum(['stripe', 'mercadopago']),
  description: z.string().min(1),
})

type ActionResult<T> =
  | { success: true; data: T }
  | { success: false; error: string }

export async function createCheckoutAction(
  input: unknown
): Promise<ActionResult<{ checkoutUrl: string }>> {
  const session = await getServerSession(authOptions)

  if (!session?.user?.id) {
    return { success: false, error: 'Debes iniciar sesión para pagar' }
  }

  const parsed = createCheckoutSchema.safeParse(input)

  if (!parsed.success) {
    return { success: false, error: 'Datos de pago inválidos' }
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'

  try {
    const result = await createCheckout({
      ...parsed.data,
      userId: session.user.id,
      successUrl: `${appUrl}/pago/confirmado?landing=${parsed.data.landingId}`,
      cancelUrl: `${appUrl}/p/${parsed.data.landingId}`,
    })

    return { success: true, data: { checkoutUrl: result.checkoutUrl } }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Error al procesar el pago'
    return { success: false, error: message }
  }
}
