import { getLandingsByUserId, getLandingById, getLandingBySlug } from '@/infrastructure/repositories/landing.repository'
import type { LandingPage } from '@/domain/landing/landing.types'

export async function getUserLandings(userId: string): Promise<LandingPage[]> {
  return getLandingsByUserId(userId)
}

export async function getLandingForEditor(id: string, userId: string): Promise<LandingPage> {
  const landing = await getLandingById(id, userId)

  if (!landing) {
    throw new Error('Landing no encontrada')
  }

  return landing
}

export async function getPublicLanding(slug: string): Promise<LandingPage> {
  const landing = await getLandingBySlug(slug)

  if (!landing) {
    throw new Error('Página no encontrada')
  }

  if (!landing.published) {
    throw new Error('Esta página no está publicada')
  }

  return landing
}
