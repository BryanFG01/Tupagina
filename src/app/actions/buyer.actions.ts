'use server'

import { z } from 'zod'
import { getOrdersByBuyerEmail } from '@/infrastructure/repositories/order.repository'
import type { Order } from '@/domain/store/store.types'

type ActionResult<T> = { success: true; data: T } | { success: false; error: string }

const emailSchema = z.string().email('Ingresa un email válido')

export async function getMyOrdersAction(email: unknown): Promise<ActionResult<Order[]>> {
  const parsed = emailSchema.safeParse(email)
  if (!parsed.success) return { success: false, error: parsed.error.errors[0]?.message ?? 'Email inválido' }

  try {
    const orders = await getOrdersByBuyerEmail(parsed.data)
    return { success: true, data: orders }
  } catch {
    return { success: false, error: 'No se pudieron cargar tus pedidos. Intenta de nuevo.' }
  }
}
