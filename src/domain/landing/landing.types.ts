import type { Block } from './block.types'

export type LandingPage = {
  id: string
  userId: string
  title: string
  slug: string
  description: string | null
  blocks: Block[]
  published: boolean
  createdAt: Date
  updatedAt: Date
}

export type CreateLandingInput = {
  title: string
  slug: string
  description?: string
}

export type UpdateLandingInput = {
  title?: string
  description?: string
  blocks?: Block[] | Array<{ id: string; type: string; order: number; content: Record<string, unknown>; style?: Block['style'] }>
}

export type LandingSummary = {
  id: string
  title: string
  slug: string
  published: boolean
  createdAt: Date
  paymentsCount: number
}
