import { prisma } from '@/infrastructure/db/prisma'
import type { Payment, PaymentStatus } from '@/domain/payment/payment.types'

function mapToPayment(raw: {
  id: string
  landingId: string
  userId: string
  amount: number
  currency: string
  status: string
  provider: string
  externalId: string | null
  buyerEmail: string | null
  buyerName: string | null
  createdAt: Date
}): Payment {
  return {
    ...raw,
    status: raw.status as PaymentStatus,
    provider: raw.provider as 'stripe' | 'mercadopago',
  }
}

export async function createPendingPayment(data: {
  landingId: string
  userId: string
  amount: number
  currency: string
  provider: string
}): Promise<Payment> {
  const row = await prisma.payment.create({
    data: {
      ...data,
      status: 'PENDING',
    },
  })
  return mapToPayment(row)
}

export async function updatePaymentByExternalId(
  externalId: string,
  data: {
    status: PaymentStatus
    buyerEmail?: string
    buyerName?: string
  }
): Promise<Payment | null> {
  const existing = await prisma.payment.findFirst({ where: { externalId } })
  if (!existing) return null

  const row = await prisma.payment.update({
    where: { id: existing.id },
    data: {
      status: data.status,
      ...(data.buyerEmail && { buyerEmail: data.buyerEmail }),
      ...(data.buyerName && { buyerName: data.buyerName }),
    },
  })
  return mapToPayment(row)
}

export async function setPaymentExternalId(id: string, externalId: string): Promise<void> {
  await prisma.payment.update({ where: { id }, data: { externalId } })
}

export async function getPaymentsByLanding(landingId: string): Promise<Payment[]> {
  const rows = await prisma.payment.findMany({
    where: { landingId },
    orderBy: { createdAt: 'desc' },
  })
  return rows.map(mapToPayment)
}

export async function getPaymentsByUser(userId: string): Promise<Payment[]> {
  const rows = await prisma.payment.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
  })
  return rows.map(mapToPayment)
}
