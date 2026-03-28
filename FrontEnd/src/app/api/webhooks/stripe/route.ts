import { NextRequest, NextResponse } from 'next/server'
import { handleStripeWebhook } from '@/services/payment/handle-webhook'

export async function POST(req: NextRequest) {
  const payload = await req.text()
  const signature = req.headers.get('stripe-signature')

  if (!signature) {
    return NextResponse.json({ error: 'Falta la firma del webhook' }, { status: 400 })
  }

  try {
    await handleStripeWebhook(payload, signature)
    return NextResponse.json({ received: true })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Error desconocido'
    return NextResponse.json({ error: message }, { status: 400 })
  }
}

// Stripe requiere el body sin parsear (raw)
export const config = {
  api: {
    bodyParser: false,
  },
}
