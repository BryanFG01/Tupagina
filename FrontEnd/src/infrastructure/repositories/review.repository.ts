import { prisma } from '@/infrastructure/db/prisma'
import type { Review, CreateReviewInput } from '@/domain/store/store.types'

function mapReview(raw: {
  id: string; productId: string; orderId: string | null; rating: number
  comment: string | null; buyerName: string; buyerEmail: string | null
  approved: boolean; createdAt: Date
}): Review {
  return raw
}

export async function createReview(data: CreateReviewInput): Promise<Review> {
  const row = await prisma.review.create({
    data: {
      productId:  data.productId,
      orderId:    data.orderId    ?? null,
      rating:     data.rating,
      comment:    data.comment    ?? null,
      buyerName:  data.buyerName,
      buyerEmail: data.buyerEmail ?? null,
    },
  })
  return mapReview(row)
}

export async function getReviewsByProduct(productId: string): Promise<Review[]> {
  const rows = await prisma.review.findMany({
    where: { productId, approved: true },
    orderBy: { createdAt: 'desc' },
    take: 50,
  })
  return rows.map(mapReview)
}

export async function getReviewStats(productId: string): Promise<{ average: number; count: number }> {
  const result = await prisma.review.aggregate({
    where: { productId, approved: true },
    _avg: { rating: true },
    _count: { rating: true },
  })
  return {
    average: result._avg.rating ?? 0,
    count:   result._count.rating,
  }
}
