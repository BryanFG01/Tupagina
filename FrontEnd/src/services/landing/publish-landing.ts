import { getLandingById, publishLanding } from '@/infrastructure/repositories/landing.repository'
import type { LandingPage } from '@/domain/landing/landing.types'

export async function publishLandingService(
  id: string,
  userId: string,
  publish: boolean
): Promise<LandingPage> {
  const existing = await getLandingById(id, userId)

  if (!existing) {
    throw new Error('Landing no encontrada')
  }

  if (publish && existing.blocks.length === 0) {
    throw new Error('Agrega al menos un bloque antes de publicar')
  }

  return publishLanding(id, userId, publish)
}
