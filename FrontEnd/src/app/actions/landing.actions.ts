'use server'

import { safeGetSession } from '@/infrastructure/auth/auth-options'
import { createLandingService, createLandingSchema } from '@/services/landing/create-landing'
import { updateLandingService, updateLandingSchema } from '@/services/landing/update-landing'
import { publishLandingService } from '@/services/landing/publish-landing'
import { getUserLandings, getLandingForEditor } from '@/services/landing/get-landings'
import { deleteLanding } from '@/infrastructure/repositories/landing.repository'
import type { LandingPage } from '@/domain/landing/landing.types'

type ActionResult<T> =
  | { success: true; data: T }
  | { success: false; error: string }

async function requireSession() {
  const session = await safeGetSession()
  if (!session?.user?.id) throw new Error('No autorizado')
  return session.user.id
}

export async function createLandingAction(
  input: unknown
): Promise<ActionResult<LandingPage>> {
  try {
    const userId = await requireSession()
    const parsed = createLandingSchema.safeParse(input)

    if (!parsed.success) {
      const firstError = parsed.error.errors[0]
      return { success: false, error: firstError?.message ?? 'Datos inválidos' }
    }

    const landing = await createLandingService(userId, parsed.data)
    return { success: true, data: landing }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Error al crear la página'
    return { success: false, error: message }
  }
}

export async function updateLandingAction(
  id: string,
  input: unknown
): Promise<ActionResult<LandingPage>> {
  try {
    const userId = await requireSession()
    const parsed = updateLandingSchema.safeParse(input)

    if (!parsed.success) {
      const firstError = parsed.error.errors[0]
      return { success: false, error: firstError?.message ?? 'Datos inválidos' }
    }

    const landing = await updateLandingService(id, userId, parsed.data)
    return { success: true, data: landing }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Error al guardar'
    return { success: false, error: message }
  }
}

export async function publishLandingAction(
  id: string,
  publish: boolean
): Promise<ActionResult<LandingPage>> {
  try {
    const userId = await requireSession()
    const landing = await publishLandingService(id, userId, publish)
    return { success: true, data: landing }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Error al publicar'
    return { success: false, error: message }
  }
}

export async function deleteLandingAction(id: string): Promise<ActionResult<null>> {
  try {
    const userId = await requireSession()
    await deleteLanding(id, userId)
    return { success: true, data: null }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Error al eliminar'
    return { success: false, error: message }
  }
}

export async function getLandingsAction(): Promise<ActionResult<LandingPage[]>> {
  try {
    const userId = await requireSession()
    const landings = await getUserLandings(userId)
    return { success: true, data: landings }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Error al cargar'
    return { success: false, error: message }
  }
}

export async function getLandingAction(id: string): Promise<ActionResult<LandingPage>> {
  try {
    const userId = await requireSession()
    const landing = await getLandingForEditor(id, userId)
    return { success: true, data: landing }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Error al cargar'
    return { success: false, error: message }
  }
}
