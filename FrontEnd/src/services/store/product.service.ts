import { getLandingById } from '@/infrastructure/repositories/landing.repository'
import {
  getProductsByLanding, getAllProductsByLanding, createProduct,
  updateProduct, deleteProduct,
} from '@/infrastructure/repositories/product.repository'
import type { Product, CreateProductInput, UpdateProductInput } from '@/domain/store/store.types'

export async function getPublicProducts(landingId: string): Promise<Product[]> {
  return getProductsByLanding(landingId)
}

export async function getDashboardProducts(landingId: string, userId: string): Promise<Product[]> {
  const landing = await getLandingById(landingId, userId)
  if (!landing) throw new Error('Landing no encontrada')
  return getAllProductsByLanding(landingId)
}

export async function createProductService(
  landingId: string,
  userId: string,
  input: CreateProductInput
): Promise<Product> {
  const landing = await getLandingById(landingId, userId)
  if (!landing) throw new Error('Landing no encontrada')
  return createProduct(landingId, input)
}

export async function updateProductService(
  productId: string,
  landingId: string,
  userId: string,
  input: UpdateProductInput
): Promise<Product> {
  const landing = await getLandingById(landingId, userId)
  if (!landing) throw new Error('No autorizado')
  return updateProduct(productId, input)
}

export async function deleteProductService(
  productId: string,
  landingId: string,
  userId: string
): Promise<void> {
  const landing = await getLandingById(landingId, userId)
  if (!landing) throw new Error('No autorizado')
  await deleteProduct(productId)
}
