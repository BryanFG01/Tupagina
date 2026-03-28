import { z } from 'zod'
import { slugExists, createLanding } from '@/infrastructure/repositories/landing.repository'
import type { LandingPage } from '@/domain/landing/landing.types'

export const createLandingSchema = z.object({
  title: z.string().min(2, 'El título debe tener al menos 2 caracteres').max(100),
  slug: z
    .string()
    .min(2, 'El slug debe tener al menos 2 caracteres')
    .max(60)
    .regex(/^[a-z0-9-]+$/, 'Solo letras minúsculas, números y guiones'),
  description: z.string().max(200).optional(),
})

export type CreateLandingInput = z.infer<typeof createLandingSchema>

export async function createLandingService(
  userId: string,
  input: CreateLandingInput
): Promise<LandingPage> {
  const taken = await slugExists(input.slug)

  if (taken) {
    throw new Error('Esa URL ya está en uso. Prueba con otra.')
  }

  const landing = await createLanding(userId, {
    title: input.title,
    slug: input.slug,
    description: input.description,
  })

  return landing
}

// Genera un slug a partir del título
export function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // quita acentos
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .slice(0, 60)
}
