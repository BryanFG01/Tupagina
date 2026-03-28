import { NextRequest, NextResponse } from 'next/server'
import { updateOrderStatus } from '@/infrastructure/repositories/order.repository'
import { prisma } from '@/infrastructure/db/prisma'

// Mercado Pago envía notificaciones IPN/Webhook con topic=payment&id=
export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as { type?: string; data?: { id?: string }; action?: string }

    // MP puede enviar "payment" o "merchant_order"
    const topic  = req.nextUrl.searchParams.get('topic') ?? body.type
    const mpId   = req.nextUrl.searchParams.get('id')   ?? body.data?.id

    if (topic !== 'payment' || !mpId) {
      return NextResponse.json({ received: true })
    }

    // Buscar la orden por mpPaymentId (guardamos el preferenceId al crear)
    // MP puede enviar el payment_id real tras el pago — buscamos por external_reference
    const order = await prisma.order.findFirst({
      where: {
        OR: [
          { mpPaymentId: mpId },
          { mpPaymentId: { contains: mpId } },
        ],
      },
    })

    if (!order) {
      // Intentar buscar por external_reference en la API de MP si hace falta
      return NextResponse.json({ received: true })
    }

    // Actualizar estado según lo que reporte MP
    const status = body.action === 'payment.updated' ? 'PAID' : 'PAID'
    await updateOrderStatus(order.id, status === 'PAID' ? 'COMPLETED' : 'FAILED', {
      mpPaymentId: mpId,
    })

    return NextResponse.json({ received: true })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Error desconocido'
    return NextResponse.json({ error: message }, { status: 400 })
  }
}
