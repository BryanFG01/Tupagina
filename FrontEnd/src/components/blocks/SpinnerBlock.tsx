'use client'

import { useEffect, useState } from 'react'
import type { SpinnerContent } from '@/domain/landing/block.types'

type Props = { content: SpinnerContent; previewMode?: boolean }

// ─── Spinners SVG integrados ──────────────────────────────────────────────────

function CircleSpinner({ color, size }: { color: string; size: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 50 50"
      className="animate-spin"
      style={{ animationDuration: '0.9s' }}
    >
      <circle cx="25" cy="25" r="20" fill="none" stroke={color} strokeWidth="4" strokeOpacity="0.2" />
      <path
        d="M25 5 A20 20 0 0 1 45 25"
        fill="none"
        stroke={color}
        strokeWidth="4"
        strokeLinecap="round"
      />
    </svg>
  )
}

function DotsSpinner({ color, size }: { color: string; size: number }) {
  const r = Math.round(size * 0.12)
  const gap = Math.round(size * 0.28)
  const cx = size / 2
  const cy = size / 2
  return (
    <svg width={size} height={size * 0.4} viewBox={`0 0 ${size} ${size * 0.4}`}>
      {[0, 1, 2].map((i) => (
        <circle
          key={i}
          cx={cx - gap + i * gap}
          cy={size * 0.2}
          r={r}
          fill={color}
          style={{
            animation: 'bounce 1.2s infinite ease-in-out',
            animationDelay: `${i * 0.2}s`,
          }}
        />
      ))}
      <style>{`
        @keyframes bounce {
          0%, 80%, 100% { transform: scale(0); }
          40% { transform: scale(1); }
        }
      `}</style>
    </svg>
  )
}

function PulseSpinner({ color, size }: { color: string; size: number }) {
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: '50%',
        backgroundColor: color,
        animation: 'pulse-ring 1.4s ease-in-out infinite',
      }}
    >
      <style>{`
        @keyframes pulse-ring {
          0%   { transform: scale(0.8); opacity: 1; }
          50%  { transform: scale(1.1); opacity: 0.5; }
          100% { transform: scale(0.8); opacity: 1; }
        }
      `}</style>
    </div>
  )
}

function BarsSpinner({ color, size }: { color: string; size: number }) {
  const barW = Math.round(size * 0.16)
  const barH = Math.round(size * 0.6)
  const gap = Math.round(size * 0.12)
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap, height: size }}>
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          style={{
            width: barW,
            height: barH,
            backgroundColor: color,
            borderRadius: 4,
            animation: 'bar-scale 1.2s ease-in-out infinite',
            animationDelay: `${i * 0.15}s`,
          }}
        />
      ))}
      <style>{`
        @keyframes bar-scale {
          0%, 80%, 100% { transform: scaleY(0.4); }
          40% { transform: scaleY(1); }
        }
      `}</style>
    </div>
  )
}

// ─── Componente principal ─────────────────────────────────────────────────────

export function SpinnerBlock({ content, previewMode = false }: Props) {
  const [fading, setFading] = useState(false)
  const [hidden, setHidden] = useState(false)

  useEffect(() => {
    // En el editor/preview no se auto-oculta — siempre visible para poder editar
    if (previewMode) return

    const duration = content.duration ?? 2000
    const fadeTimer = setTimeout(() => setFading(true), duration)
    const hideTimer = setTimeout(() => setHidden(true), duration + 500)
    return () => {
      clearTimeout(fadeTimer)
      clearTimeout(hideTimer)
    }
  }, [content.duration, previewMode])

  if (hidden) return null

  const size = content.imageSize ?? 80

  const imageAnimClass =
    content.imageAnimation === 'spin'   ? 'animate-spin'   :
    content.imageAnimation === 'pulse'  ? 'animate-pulse'  :
    content.imageAnimation === 'bounce' ? 'animate-bounce' : ''

  const spinnerNode = content.customImage ? (
    <img
      src={content.customImage}
      alt="Cargando…"
      className={imageAnimClass}
      style={{ width: size, height: size, objectFit: 'contain' }}
    />
  ) : (
    <>
      {content.spinnerType === 'circle' && <CircleSpinner color={content.accentColor} size={size} />}
      {content.spinnerType === 'dots'   && <DotsSpinner   color={content.accentColor} size={size} />}
      {content.spinnerType === 'pulse'  && <PulseSpinner  color={content.accentColor} size={size} />}
      {content.spinnerType === 'bars'   && <BarsSpinner   color={content.accentColor} size={size} />}
    </>
  )

  // En el editor se muestra como bloque estático (no fixed) para no tapar el canvas
  if (previewMode) {
    return (
      <div
        className="w-full flex flex-col items-center justify-center select-none py-12"
        style={{ backgroundColor: content.backgroundColor }}
      >
        <div className="mb-1 text-[10px] font-semibold uppercase tracking-widest opacity-40"
          style={{ color: content.textColor }}>
          Vista previa — Spinner de carga
        </div>
        {spinnerNode}
        {content.text && (
          <p className="mt-4 text-sm font-medium" style={{ color: content.textColor }}>
            {content.text}
          </p>
        )}
      </div>
    )
  }

  return (
    <div
      className="fixed inset-0 z-[9999] flex flex-col items-center justify-center select-none"
      style={{
        backgroundColor: content.backgroundColor,
        opacity: fading ? 0 : 1,
        transition: 'opacity 0.5s ease',
        pointerEvents: fading ? 'none' : 'all',
      }}
    >
      {spinnerNode}
      {content.text && (
        <p
          className="mt-4 text-sm font-medium"
          style={{ color: content.textColor }}
        >
          {content.text}
        </p>
      )}
    </div>
  )
}
