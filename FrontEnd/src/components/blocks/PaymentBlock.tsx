'use client'

import { useState } from 'react'
import type { PaymentContent, BlockStyle } from '@/domain/landing/block.types'
import { createCheckoutAction } from '@/app/actions/payment.actions'
import { bsCls, bsStyle } from './blockStyle'

type Props = {
  content: PaymentContent
  landingId: string
  previewMode?: boolean
  style?: BlockStyle
}

export function PaymentBlock({ content, landingId, previewMode = false, style }: Props) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Colores: style prop (Estilo tab) → content colors → defaults
  const sectionBg  = (style?.backgroundColor && style.backgroundColor !== 'default')
    ? style.backgroundColor
    : (content.backgroundColor ?? '#2563eb')
  const textClr    = (style?.textColor && style.textColor !== 'default')
    ? style.textColor
    : (content.textColor ?? '#ffffff')
  const btnBg      = (style?.buttonColor && style.buttonColor !== 'default')
    ? style.buttonColor
    : (content.buttonColor ?? '#ffffff')
  const btnTextClr = (style?.buttonTextColor && style.buttonTextColor !== 'default')
    ? style.buttonTextColor
    : (content.buttonTextColor ?? '#1e3a8a')

  const formattedPrice = new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: content.currency.toUpperCase(),
  }).format(content.price / 100)

  async function handlePay() {
    setError(null)
    setLoading(true)
    const result = await createCheckoutAction({
      landingId,
      amount:       content.price,
      currency:     content.currency,
      provider:     content.provider,
      description:  content.title,
    })
    setLoading(false)
    if (!result.success) { setError(result.error); return }
    window.location.href = result.data.checkoutUrl
  }

  return (
    <section
      className={bsCls(style, '', 'py-16', 'text-center px-4')}
      style={{ ...bsStyle(style), backgroundColor: sectionBg }}
    >
      <div className="max-w-lg mx-auto">
        <h2 className="text-3xl font-bold mb-3" style={{ color: textClr }}>{content.title}</h2>
        <p className="mb-6 text-base leading-relaxed" style={{ color: textClr, opacity: 0.85 }}>{content.description}</p>
        <p className="text-5xl font-black mb-8" style={{ color: textClr }}>{formattedPrice}</p>

        {!previewMode && error && (
          <p className="bg-red-100 text-red-700 text-sm px-4 py-2 rounded-lg mb-4">{error}</p>
        )}

        <button
          type="button"
          disabled={!previewMode && loading}
          onClick={previewMode ? undefined : handlePay}
          className="w-full max-w-xs text-lg font-bold px-8 py-4 rounded-xl shadow-xl transition-opacity hover:opacity-90 disabled:opacity-60 mx-auto block"
          style={{ backgroundColor: btnBg, color: btnTextClr }}
        >
          {!previewMode && loading ? 'Procesando…' : content.buttonText}
        </button>

        {previewMode && (
          <p className="text-xs mt-3" style={{ color: textClr, opacity: 0.5 }}>
            Vista previa — el pago real se activa al publicar
          </p>
        )}
      </div>
    </section>
  )
}
