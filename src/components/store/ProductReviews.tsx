'use client'

import { useState, useEffect } from 'react'
import { createReviewAction, getProductReviewsAction } from '@/app/actions/review.actions'
import type { Review } from '@/domain/store/store.types'

type Props = { productId: string }

function Stars({ rating, interactive = false, onChange }: {
  rating: number
  interactive?: boolean
  onChange?: (r: number) => void
}) {
  const [hovered, setHovered] = useState(0)
  const active = interactive ? (hovered || rating) : rating

  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map(i => (
        <button
          key={i}
          type="button"
          onClick={() => onChange?.(i)}
          onMouseEnter={() => interactive && setHovered(i)}
          onMouseLeave={() => interactive && setHovered(0)}
          className={`text-lg leading-none transition-transform ${interactive ? 'cursor-pointer hover:scale-110' : 'cursor-default'}`}
          disabled={!interactive}
        >
          <span className={i <= active ? 'text-amber-400' : 'text-gray-200'}>★</span>
        </button>
      ))}
    </div>
  )
}

function ReviewCard({ review }: { review: Review }) {
  return (
    <div className="py-4 border-b border-gray-100 last:border-0">
      <div className="flex items-center justify-between mb-1">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 text-xs font-bold">
            {review.buyerName.charAt(0).toUpperCase()}
          </div>
          <span className="text-sm font-semibold text-gray-800">{review.buyerName}</span>
        </div>
        <Stars rating={review.rating} />
      </div>
      {review.comment && (
        <p className="text-sm text-gray-500 leading-relaxed mt-1 pl-9">{review.comment}</p>
      )}
      <p className="text-[11px] text-gray-300 mt-1.5 pl-9">
        {new Date(review.createdAt).toLocaleDateString('es-MX', { day: '2-digit', month: 'long', year: 'numeric' })}
      </p>
    </div>
  )
}

export function ProductReviews({ productId }: Props) {
  const [reviews,  setReviews]  = useState<Review[]>([])
  const [average,  setAverage]  = useState(0)
  const [count,    setCount]    = useState(0)
  const [loading,  setLoading]  = useState(true)
  const [showForm, setShowForm] = useState(false)

  // Formulario
  const [rating,    setRating]    = useState(5)
  const [comment,   setComment]   = useState('')
  const [buyerName, setBuyerName] = useState('')
  const [buyerEmail,setBuyerEmail]= useState('')
  const [submitting,setSubmitting]= useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)

  useEffect(() => {
    getProductReviewsAction(productId).then(res => {
      if (res.success) {
        setReviews(res.data.reviews)
        setAverage(res.data.average)
        setCount(res.data.count)
      }
      setLoading(false)
    })
  }, [productId])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setFormError(null)
    setSubmitting(true)
    const result = await createReviewAction({
      productId,
      rating,
      comment:    comment.trim()    || undefined,
      buyerName:  buyerName.trim(),
      buyerEmail: buyerEmail.trim() || undefined,
    })
    setSubmitting(false)
    if (!result.success) { setFormError(result.error); return }
    setSubmitted(true)
    setReviews(prev => [result.data, ...prev])
    setCount(c => c + 1)
    setAverage(prev => prev === 0 ? rating : (prev * (count) + rating) / (count + 1))
    setShowForm(false)
    setComment(''); setBuyerName(''); setBuyerEmail(''); setRating(5)
  }

  return (
    <div className="mt-6 pt-6 border-t border-gray-100">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-bold text-gray-900 text-base">Reseñas</h3>
          {count > 0 && (
            <div className="flex items-center gap-2 mt-0.5">
              <Stars rating={Math.round(average)} />
              <span className="text-sm text-gray-500">{average.toFixed(1)} de 5 · {count} reseña{count !== 1 ? 's' : ''}</span>
            </div>
          )}
        </div>
        {!submitted && (
          <button
            onClick={() => setShowForm(v => !v)}
            className="text-xs font-bold text-indigo-600 hover:text-indigo-700 border border-indigo-200 hover:border-indigo-400 px-3 py-1.5 rounded-xl transition-all"
          >
            {showForm ? 'Cancelar' : '+ Escribir reseña'}
          </button>
        )}
      </div>

      {/* Formulario */}
      {showForm && (
        <form onSubmit={handleSubmit} className="bg-gray-50 rounded-2xl p-4 mb-5 space-y-3">
          <div>
            <p className="text-xs font-semibold text-gray-600 mb-2">Tu puntuación</p>
            <Stars rating={rating} interactive onChange={setRating} />
          </div>
          <input
            value={buyerName}
            onChange={e => setBuyerName(e.target.value)}
            required
            placeholder="Tu nombre *"
            className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
          />
          <input
            value={buyerEmail}
            onChange={e => setBuyerEmail(e.target.value)}
            type="email"
            placeholder="Tu email (opcional)"
            className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
          />
          <textarea
            value={comment}
            onChange={e => setComment(e.target.value)}
            placeholder="Cuéntanos tu experiencia (opcional)…"
            rows={3}
            className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white resize-none"
          />
          {formError && <p className="text-xs text-red-600 bg-red-50 px-3 py-2 rounded-lg">{formError}</p>}
          <button
            type="submit"
            disabled={submitting || !buyerName.trim()}
            className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold rounded-xl transition-all disabled:opacity-60"
          >
            {submitting ? 'Enviando…' : 'Publicar reseña'}
          </button>
        </form>
      )}

      {submitted && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 mb-5 text-center">
          <p className="text-emerald-700 font-semibold text-sm">¡Gracias por tu reseña!</p>
        </div>
      )}

      {/* Lista */}
      {loading ? (
        <div className="py-6 text-center text-gray-400 text-sm">Cargando reseñas…</div>
      ) : reviews.length === 0 ? (
        <div className="py-6 text-center text-gray-400 text-sm">
          Sé el primero en dejar una reseña
        </div>
      ) : (
        <div>
          {reviews.map(r => <ReviewCard key={r.id} review={r} />)}
        </div>
      )}
    </div>
  )
}
