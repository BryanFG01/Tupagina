import { z } from 'zod'
import { updateLanding, getLandingById } from '@/infrastructure/repositories/landing.repository'
import { blocksSaveSchema } from '@/domain/landing/block.schemas'
import type { LandingPage } from '@/domain/landing/landing.types'

export const updateLandingSchema = z.object({
  title:       z.string().min(2).max(100).optional(),
  description: z.string().max(200).optional(),
  blocks:      blocksSaveSchema.optional(),  // permisivo: guarda cualquier contenido sin validar campos internos
})

export type UpdateLandingInput = z.infer<typeof updateLandingSchema>

export async function updateLandingService(
  id: string,
  userId: string,
  input: UpdateLandingInput
): Promise<LandingPage> {
  const existing = await getLandingById(id, userId)

  if (!existing) {
    throw new Error('Landing no encontrada')
  }

  const updated = await updateLanding(id, userId, {
    title: input.title,
    description: input.description,
    blocks: input.blocks,
  })

  return updated
}
