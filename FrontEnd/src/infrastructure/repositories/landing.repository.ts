import { prisma } from '@/infrastructure/db/prisma'
import type { LandingPage, CreateLandingInput, UpdateLandingInput } from '@/domain/landing/landing.types'
import type { Block } from '@/domain/landing/block.types'

function mapToLanding(raw: {
  id: string
  userId: string
  title: string
  slug: string
  description: string | null
  blocks: unknown
  published: boolean
  createdAt: Date
  updatedAt: Date
}): LandingPage {
  let blocks: Block[] = []
  try {
    const parsed = typeof raw.blocks === 'string' ? JSON.parse(raw.blocks) : raw.blocks
    blocks = Array.isArray(parsed) ? (parsed as Block[]) : []
  } catch {
    blocks = []
  }
  return { ...raw, blocks }
}

export async function getLandingsByUserId(userId: string): Promise<LandingPage[]> {
  const rows = await prisma.landingPage.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
  })
  return rows.map(mapToLanding)
}

export async function getLandingById(id: string, userId: string): Promise<LandingPage | null> {
  const row = await prisma.landingPage.findFirst({
    where: { id, userId },
  })
  return row ? mapToLanding(row) : null
}

export async function getLandingBySlug(slug: string): Promise<LandingPage | null> {
  const row = await prisma.landingPage.findUnique({
    where: { slug },
  })
  return row ? mapToLanding(row) : null
}

export async function slugExists(slug: string): Promise<boolean> {
  const count = await prisma.landingPage.count({ where: { slug } })
  return count > 0
}

export async function createLanding(userId: string, input: CreateLandingInput): Promise<LandingPage> {
  const row = await prisma.landingPage.create({
    data: {
      userId,
      title: input.title,
      slug: input.slug,
      description: input.description ?? null,
      blocks: '[]',
    },
  })
  return mapToLanding(row)
}

export async function updateLanding(id: string, userId: string, input: UpdateLandingInput): Promise<LandingPage> {
  const row = await prisma.landingPage.update({
    where: { id },
    data: {
      ...(input.title !== undefined && { title: input.title }),
      ...(input.description !== undefined && { description: input.description }),
      ...(input.blocks !== undefined && { blocks: JSON.stringify(input.blocks) }),
    },
  })
  return mapToLanding(row)
}

export async function publishLanding(id: string, userId: string, published: boolean): Promise<LandingPage> {
  const row = await prisma.landingPage.update({
    where: { id },
    data: { published },
  })
  return mapToLanding(row)
}

export async function deleteLanding(id: string, userId: string): Promise<void> {
  await prisma.landingPage.delete({ where: { id } })
}
