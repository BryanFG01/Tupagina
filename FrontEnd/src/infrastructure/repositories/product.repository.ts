import { prisma } from '@/infrastructure/db/prisma'
import type { Product, CreateProductInput, UpdateProductInput } from '@/domain/store/store.types'

// Encode badge text + shape + size into a single string field
// Format: plain text (backward compat) or JSON {"t":"text","s":"shape","z":"size"}
function encodeBadge(text?: string, shape?: string, size?: string, color?: string, currency?: string): string {
  const t = text || ''
  const s = shape ?? 'pill'
  const z = size ?? 'md'
  const cur = currency ?? 'USD'
  if (s === 'pill' && z === 'md' && !color && cur === 'USD' && t) return t
  return JSON.stringify({ t, s, z, c: color, cur })
}

function parseBadgeField(raw: string | null): { badge: string | null; badgeShape: string | null; badgeSize: string | null; badgeColor: string | null; currency: string } {
  if (!raw) return { badge: null, badgeShape: null, badgeSize: null, badgeColor: null, currency: 'USD' }
  try {
    const obj = JSON.parse(raw) as { t?: string; s?: string; z?: string; c?: string; cur?: string }
    if (typeof obj === 'object' && obj !== null) {
      return { badge: obj.t || null, badgeShape: obj.s ?? 'pill', badgeSize: obj.z ?? 'md', badgeColor: obj.c ?? null, currency: obj.cur ?? 'USD' }
    }
  } catch {}
  return { badge: raw, badgeShape: 'pill', badgeSize: 'md', badgeColor: null, currency: 'USD' }
}

function map(raw: {
  id: string; landingId: string; name: string; description: string | null
  imageUrl: string | null; price: number; comparePrice: number | null
  stock: number; active: boolean; category: string | null; badge: string | null
  createdAt: Date; updatedAt: Date
}): Product {
  const { badge, badgeShape, badgeSize, badgeColor, currency } = parseBadgeField(raw.badge)
  return { ...raw, badge, badgeShape, badgeSize, badgeColor, currency }
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
      badge:        encodeBadge(input.badge, input.badgeShape, input.badgeSize, input.badgeColor, input.currency),
    },
  })
  return map(row)
}

export async function updateProduct(id: string, input: UpdateProductInput): Promise<Product> {
  // If badge is being updated, encode shape+size+color+currency into it
  const encodedBadge = (input.badge !== undefined || input.badgeShape !== undefined || input.badgeSize !== undefined || input.badgeColor !== undefined || input.currency !== undefined)
    ? encodeBadge(input.badge, input.badgeShape, input.badgeSize, input.badgeColor, input.currency)
    : undefined

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
      ...(encodedBadge       !== undefined && { badge: encodedBadge }),
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
