import { prisma } from '@/infrastructure/db/prisma'
import type { Order, OrderStatus, PaymentProvider, ShippingAddress } from '@/domain/store/store.types'

function mapOrder(raw: {
  id: string; landingId: string; buyerEmail: string | null; buyerName: string | null
  buyerPhone: string | null; shippingAddress: string | null
  totalAmount: number; currency: string; status: string
  paymentProvider: string; stripeSessionId: string | null; mpPaymentId: string | null
  createdAt: Date; updatedAt: Date
  items: { id: string; orderId: string; productId: string; name: string; unitPrice: number; quantity: number }[]
}): Order {
  return {
    ...raw,
    status: raw.status as OrderStatus,
    paymentProvider: raw.paymentProvider as PaymentProvider,
    shippingAddress: raw.shippingAddress
      ? (JSON.parse(raw.shippingAddress) as ShippingAddress)
      : null,
  }
}

export async function createOrderWithItems(data: {
  landingId: string
  currency: string
  paymentProvider?: PaymentProvider
  buyerName?: string
  buyerEmail?: string
  buyerPhone?: string
  shippingAddress?: ShippingAddress
  items: { productId: string; name: string; unitPrice: number; quantity: number }[]
}): Promise<Order> {
  const totalAmount = data.items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0)

  const row = await prisma.order.create({
    data: {
      landingId: data.landingId,
      currency: data.currency,
      paymentProvider: data.paymentProvider ?? 'stripe',
      buyerName:  data.buyerName  ?? null,
      buyerEmail: data.buyerEmail ?? null,
      buyerPhone: data.buyerPhone ?? null,
      shippingAddress: data.shippingAddress
        ? JSON.stringify(data.shippingAddress)
        : null,
      totalAmount,
      status: 'PENDING',
      items: {
        create: data.items.map(item => ({
          productId: item.productId,
          name: item.name,
          unitPrice: item.unitPrice,
          quantity: item.quantity,
        })),
      },
    },
    include: { items: true },
  })
  return mapOrder(row)
}

export async function updateOrderStatus(
  id: string,
  status: OrderStatus,
  data?: { buyerEmail?: string; buyerName?: string; stripeSessionId?: string; mpPaymentId?: string }
): Promise<void> {
  await prisma.order.update({
    where: { id },
    data: {
      status,
      ...(data?.buyerEmail      && { buyerEmail: data.buyerEmail }),
      ...(data?.buyerName       && { buyerName: data.buyerName }),
      ...(data?.stripeSessionId && { stripeSessionId: data.stripeSessionId }),
      ...(data?.mpPaymentId     && { mpPaymentId: data.mpPaymentId }),
    },
  })
}

export async function getOrdersByBuyerEmail(email: string): Promise<Order[]> {
  const rows = await prisma.order.findMany({
    where: { buyerEmail: email, status: { not: 'PENDING' } },
    include: { items: true },
    orderBy: { createdAt: 'desc' },
  })
  return rows.map(mapOrder)
}

export async function getOrderByStripeSession(sessionId: string): Promise<Order | null> {
  const row = await prisma.order.findFirst({
    where: { stripeSessionId: sessionId },
    include: { items: true },
  })
  return row ? mapOrder(row) : null
}

export async function getOrdersByLanding(landingId: string): Promise<Order[]> {
  const rows = await prisma.order.findMany({
    where: { landingId },
    include: { items: true },
    orderBy: { createdAt: 'desc' },
  })
  return rows.map(mapOrder)
}
