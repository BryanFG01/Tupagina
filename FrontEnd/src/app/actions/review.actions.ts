'use server'

import { createReviewSchema } from '@/domain/store/store.schemas'
import { submitReview, getProductReviews } from '@/services/store/review.service'
import type { Review } from '@/domain/store/store.types'

type ActionResult<T> = { success: true; data: T } | { success: false; error: string }

export async function createReviewAction(input: unknown): Promise<ActionResult<Review>> {
  const parsed = createReviewSchema.safeParse(input)
  if (!parsed.success) return { success: false, error: parsed.error.errors[0]?.message ?? 'Datos inválidos' }

  try {
    const review = await submitReview(parsed.data)
    return { success: true, data: review }
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : 'Error al enviar la reseña' }
  }
}

export async function getProductReviewsAction(
  productId: string
): Promise<ActionResult<{ reviews: Review[]; average: number; count: number }>> {
  try {
    const result = await getProductReviews(productId)
    return { success: true, data: result }
  } catch {
    return { success: false, error: 'Error al cargar las reseñas' }
  }
}
