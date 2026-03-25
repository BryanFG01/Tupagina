import { createReview, getReviewsByProduct, getReviewStats } from '@/infrastructure/repositories/review.repository'
import type { Review, CreateReviewInput } from '@/domain/store/store.types'

export async function submitReview(input: CreateReviewInput): Promise<Review> {
  if (input.rating < 1 || input.rating > 5) throw new Error('La puntuación debe ser entre 1 y 5')
  if (!input.buyerName.trim())              throw new Error('Ingresa tu nombre')
  return createReview(input)
}

export async function getProductReviews(productId: string): Promise<{
  reviews: Review[]
  average: number
  count: number
}> {
  const [reviews, stats] = await Promise.all([
    getReviewsByProduct(productId),
    getReviewStats(productId),
  ])
  return { reviews, ...stats }
}
