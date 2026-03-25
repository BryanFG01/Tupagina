import { prisma } from '@/infrastructure/db/prisma'
import type { Product, CreateProductInput, UpdateProductInput } from '@/domain/store/store.types'

function map(raw: {
  id: string; landingId: string; name: string; description: string | null
  imageUrl: string | null; price: number; comparePrice: number | null
  stock: number; active: boolean; category: string | null; badge: string | null
  createdAt: Date; updatedAt: Date
}): Product {
  return raw
}

export async function getProductsByLanding(landingId: string): Promise<Product[]> {
  const rows = await prisma.product.findMany({
    where: { landingId, active: true },
    orderBy: { createdAt: 'asc' },
  })
  return rows.map(map)
}

export async function getAllProductsByLanding(landingId: string): Promise<Product[]> {
  const rows = await prisma.product.findMany({
    where: { landingId },
    orderBy: { createdAt: 'asc' },
  })
  return rows.map(map)
}

export async function getProductById(id: string): Promise<Product | null> {
  const row = await prisma.product.findUnique({ where: { id } })
  return row ? map(row) : null
}

export async function createProduct(landingId: string, input: CreateProductInput): Promise<Product> {
  const row = await prisma.product.create({
    data: {
      landingId,
      name:         input.name,
      description:  input.description ?? null,
      imageUrl:     input.imageUrl || null,
      price:        input.price,
      comparePrice: input.comparePrice ?? null,
      stock:        input.stock ?? -1,
      category:     input.category || null,
      badge:        input.badge || null,
    },
  })
  return map(row)
}

export async function updateProduct(id: string, input: UpdateProductInput): Promise<Product> {
  const row = await prisma.product.update({
    where: { id },
    data: {
      ...(input.name         !== undefined && { name: input.name }),
      ...(input.description  !== undefined && { description: input.description }),
      ...(input.imageUrl     !== undefined && { imageUrl: input.imageUrl || null }),
      ...(input.price        !== undefined && { price: input.price }),
      ...(input.comparePrice !== undefined && { comparePrice: input.comparePrice ?? null }),
      ...(input.stock        !== undefined && { stock: input.stock }),
      ...(input.active       !== undefined && { active: input.active }),
      ...(input.category     !== undefined && { category: input.category || null }),
      ...(input.badge        !== undefined && { badge: input.badge || null }),
    },
  })
  return map(row)
}

export async function deleteProduct(id: string): Promise<void> {
  await prisma.product.delete({ where: { id } })
}

export async function getManyProductsById(ids: string[]): Promise<Product[]> {
  const rows = await prisma.product.findMany({ where: { id: { in: ids }, active: true } })
  return rows.map(map)
}
