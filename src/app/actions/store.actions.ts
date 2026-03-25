'use server'

import { getServerSession } from 'next-auth'
import { authOptions } from '@/infrastructure/auth/auth-options'
import { createProductSchema, updateProductSchema, storeCheckoutSchema } from '@/domain/store/store.schemas'
import {
  createProductService, updateProductService,
  deleteProductService, getDashboardProducts,
} from '@/services/store/product.service'
import { createStoreCheckout } from '@/services/store/create-store-checkout.service'
import { getOrdersByLanding } from '@/infrastructure/repositories/order.repository'
import type { Product, Order } from '@/domain/store/store.types'

type ActionResult<T> = { success: true; data: T } | { success: false; error: string }

async function requireSession() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) throw new Error('No autorizado')
  return session.user.id as string
}

// ─── Productos ────────────────────────────────────────────────────────────────

export async function getProductsAction(landingId: string): Promise<ActionResult<Product[]>> {
  try {
    const userId = await requireSession()
    const products = await getDashboardProducts(landingId, userId)
    return { success: true, data: products }
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : 'Error' }
  }
}

export async function createProductAction(
  landingId: string,
  input: unknown
): Promise<ActionResult<Product>> {
  try {
    const userId = await requireSession()
    const parsed = createProductSchema.safeParse(input)
    if (!parsed.success) return { success: false, error: parsed.error.errors[0]?.message ?? 'Datos inválidos' }
    const product = await createProductService(landingId, userId, parsed.data)
    return { success: true, data: product }
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : 'Error al crear producto' }
  }
}

export async function updateProductAction(
  productId: string,
  landingId: string,
  input: unknown
): Promise<ActionResult<Product>> {
  try {
    const userId = await requireSession()
    const parsed = updateProductSchema.safeParse(input)
    if (!parsed.success) return { success: false, error: parsed.error.errors[0]?.message ?? 'Datos inválidos' }
    const product = await updateProductService(productId, landingId, userId, parsed.data)
    return { success: true, data: product }
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : 'Error al actualizar' }
  }
}

export async function deleteProductAction(
  productId: string,
  landingId: string
): Promise<ActionResult<null>> {
  try {
    const userId = await requireSession()
    await deleteProductService(productId, landingId, userId)
    return { success: true, data: null }
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : 'Error al eliminar' }
  }
}

// ─── Checkout de tienda ───────────────────────────────────────────────────────

export async function createStoreCheckoutAction(input: unknown): Promise<ActionResult<{ checkoutUrl: string }>> {
  const parsed = storeCheckoutSchema.safeParse(input)
  if (!parsed.success) return { success: false, error: parsed.error.errors[0]?.message ?? 'Carrito inválido' }

  try {
    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'
    const result = await createStoreCheckout(parsed.data, appUrl)
    return { success: true, data: { checkoutUrl: result.checkoutUrl } }
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : 'Error al procesar el pago' }
  }
}

// ─── Pedidos ──────────────────────────────────────────────────────────────────

export async function getOrdersAction(landingId: string): Promise<ActionResult<Order[]>> {
  try {
    await requireSession()
    const orders = await getOrdersByLanding(landingId)
    return { success: true, data: orders }
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : 'Error' }
  }
}
