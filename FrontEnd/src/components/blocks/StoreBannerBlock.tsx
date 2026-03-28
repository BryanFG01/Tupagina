'use client'

import { useState, useEffect, useCallback } from 'react'
import type { StoreBannerContent, BlockStyle } from '@/domain/landing/block.types'
import { useCartOptional } from '@/components/store/StoreProvider'
import { CartDrawer } from '@/components/store/CartDrawer'

type Props = {
  content: StoreBannerContent
  previewMode?: boolean
  style?: BlockStyle
  landingId?: string
  currency?: string
}

function buildOverlay(color?: string, opacity?: number): string {
  const c = color ?? '#000000'
  const o = (opacity ?? 45) / 100
  const r = parseInt(c.slice(1, 3), 16)
  const g = parseInt(c.slice(3, 5), 16)
  const b = parseInt(c.slice(5, 7), 16)
  return `rgba(${r},${g},${b},${o})`
}

export function StoreBannerBlock({ content, previewMode = false, landingId = '', currency = 'usd' }: Props) {
  const cart = useCartOptional()
  const openCart = cart?.openCart

  const slides     = content.slides ?? []
  const hasSlides  = slides.length > 1
  const transition = content.slideTransition ?? 'fade'
  const interval   = content.slideInterval ?? 4000

  const [active, setActive]   = useState(0)
  const [sliding, setSliding] = useState(false)

  const goTo = useCallback((idx: number) => {
    if (idx === active) return
    setSliding(true)
    setTimeout(() => {
      setActive(idx)
      setSliding(false)
    }, transition === 'slide' ? 350 : 400)
  }, [active, transition])

  const next = useCallback(() => goTo((active + 1) % slides.length), [active, slides.length, goTo])
  const prev = useCallback(() => goTo((active - 1 + slides.length) % slides.length), [active, slides.length, goTo])

  useEffect(() => {
    if (!hasSlides || previewMode) return
    const timer = setInterval(next, interval)
    return () => clearInterval(timer)
  }, [hasSlides, interval, next, previewMode])

  const isLight       = content.textColor === 'light'
  const textClass     = isLight ? 'text-white' : 'text-gray-900'
  const subTextClass  = isLight ? 'text-white/70' : 'text-gray-600'
  const btnPrimaryClass = isLight
    ? 'bg-white text-gray-900 hover:bg-gray-100'
    : 'bg-gray-900 text-white hover:bg-gray-800'

  const overlayRgba = buildOverlay(content.overlayColor, content.overlayOpacity)
  const bgPos       = content.backgroundPosition ?? 'center'
  const hasVideo    = !!content.backgroundVideo

  // Decide qué imagen de fondo usar
  const activeBg = slides.length > 0
    ? slides[active]?.image ?? ''
    : content.backgroundImage ?? ''
  const activePos = slides.length > 0
    ? (slides[active]?.position ?? 'center')
    : bgPos

  // Floating cart (legacy cartButton field)
  const cartPlacement = content.cartButton ?? 'none'
  const isFloating    = cartPlacement.startsWith('floating-')
  const FLOATING_POS: Record<string, string> = {
    'floating-br': 'bottom-6 right-6',
    'floating-bl': 'bottom-6 left-6',
    'floating-tr': 'top-24 right-6',
    'floating-tl': 'top-24 left-6',
  }

  return (
    <div className="relative overflow-hidden" style={{ backgroundColor: content.backgroundColor }}>

      {/* ── Fondo: slideshow o imagen única ── */}
      {hasSlides ? (
        <div className="absolute inset-0">
          {slides.map((slide, i) => { const slideKey = slide.id ?? `slide-${i}`;
            const isActive = i === active
            if (transition === 'slide') {
              const offset = i === active ? 0 : i < active ? -100 : 100
              return (
                <div
                  key={slideKey}
                  className="absolute inset-0"
                  style={{
                    backgroundImage: `linear-gradient(${overlayRgba}, ${overlayRgba}), url(${slide.image})`,
                    backgroundSize: 'cover',
                    backgroundPosition: slide.position ?? 'center',
                    transform: `translateX(${sliding && isActive ? 0 : isActive ? 0 : offset}%)`,
                    opacity: isActive ? 1 : 0,
                    transition: 'transform 0.4s ease, opacity 0.4s ease',
                    zIndex: isActive ? 1 : 0,
                  }}
                />
              )
            }
            return (
              <div
                key={slideKey}
                className="absolute inset-0"
                style={{
                  backgroundImage: `linear-gradient(${overlayRgba}, ${overlayRgba}), url(${slide.image})`,
                  backgroundSize: 'cover',
                  backgroundPosition: slide.position ?? 'center',
                  opacity: isActive ? 1 : 0,
                  transition: 'opacity 0.5s ease',
                  zIndex: isActive ? 1 : 0,
                }}
              />
            )
          })}
        </div>
      ) : (
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: activeBg && !hasVideo
              ? `linear-gradient(${overlayRgba}, ${overlayRgba}), url(${activeBg})`
              : undefined,
            backgroundSize: 'cover',
            backgroundPosition: activePos,
          }}
        >
          {hasVideo && (
            <>
              <video autoPlay muted loop playsInline
                className="absolute inset-0 w-full h-full object-cover"
                style={{ objectPosition: bgPos }}>
                <source src={content.backgroundVideo} />
              </video>
              <div className="absolute inset-0" style={{ backgroundColor: overlayRgba }} />
            </>
          )}
        </div>
      )}

      {/* ── Contenido ── */}
      <div className="relative z-10">

        {/* Barra de anuncio */}
        {content.announcement && (
          <div className={`text-center py-2 px-4 text-xs font-semibold border-b ${
            isLight ? 'border-white/10 text-white/80' : 'border-black/10 text-gray-700'
          }`}>
            {content.announcement}
          </div>
        )}

        {/* Hero */}
        <div className="max-w-6xl mx-auto px-6 py-16 sm:py-24 text-center">
          <h1 className={`text-4xl sm:text-6xl font-black tracking-tight leading-none mb-4 ${textClass}`}>
            {content.storeName}
          </h1>
          <p className={`text-lg sm:text-xl mb-10 max-w-xl mx-auto ${subTextClass}`}>
            {content.tagline}
          </p>
          <a
            href={content.ctaTarget}
            className={`inline-flex items-center gap-2.5 px-8 py-4 rounded-2xl font-bold text-base shadow-lg transition-all hover:scale-105 active:scale-95 ${btnPrimaryClass}`}
          >
            {content.ctaText}
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12,5 19,12 12,19"/>
            </svg>
          </a>

          {/* Controles del slideshow */}
          {hasSlides && (
            <div className="mt-8 flex flex-col items-center gap-4">
              {/* Dots */}
              <div className="flex items-center gap-2">
                {slides.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => goTo(i)}
                    className={`rounded-full transition-all ${
                      i === active
                        ? 'w-6 h-2.5 bg-white'
                        : 'w-2.5 h-2.5 bg-white/40 hover:bg-white/70'
                    }`}
                    aria-label={`Imagen ${i + 1}`}
                  />
                ))}
              </div>
              {/* Flechas */}
              <div className="flex items-center gap-3">
                <button
                  onClick={prev}
                  className={`w-9 h-9 rounded-full flex items-center justify-center transition-all ${
                    isLight ? 'bg-white/20 hover:bg-white/30 text-white' : 'bg-black/15 hover:bg-black/25 text-gray-900'
                  }`}
                  aria-label="Anterior"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <polyline points="15 18 9 12 15 6"/>
                  </svg>
                </button>
                <span className={`text-xs font-semibold tabular-nums ${isLight ? 'text-white/60' : 'text-gray-600'}`}>
                  {active + 1} / {slides.length}
                </span>
                <button
                  onClick={next}
                  className={`w-9 h-9 rounded-full flex items-center justify-center transition-all ${
                    isLight ? 'bg-white/20 hover:bg-white/30 text-white' : 'bg-black/15 hover:bg-black/25 text-gray-900'
                  }`}
                  aria-label="Siguiente"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <polyline points="9 18 15 12 9 6"/>
                  </svg>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* CartDrawer para carrito flotante (legacy) */}
      {isFloating && !previewMode && (
        <CartDrawer landingId={landingId} currency={currency} />
      )}

      {/* Floating cart (legacy cartButton field) */}
      {isFloating && (
        <button
          onClick={previewMode ? undefined : openCart}
          className={`fixed z-30 w-14 h-14 rounded-full bg-indigo-600 hover:bg-indigo-700 text-white shadow-2xl transition-all active:scale-95 flex items-center justify-center ${FLOATING_POS[cartPlacement] ?? 'bottom-6 right-6'}`}
          aria-label="Abrir carrito"
        >
          <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
            <path d="M1 1h4l2.68 13.39a2 2 0 002 1.61h9.72a2 2 0 001.96-1.61l1.54-7.39H6"/>
          </svg>
          {(cart?.count ?? 0) > 0 && (
            <span className="absolute -top-2.5 -right-2.5 bg-red-500 text-white font-black rounded-full w-6 h-6 text-[11px] flex items-center justify-center">
              {(cart?.count ?? 0) > 9 ? '9+' : cart?.count}
            </span>
          )}
        </button>
      )}
    </div>
  )
}
