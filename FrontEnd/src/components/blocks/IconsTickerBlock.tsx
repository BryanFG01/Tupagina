'use client'

import type { IconsTickerContent, IconTickerItem, IconTickerBadge, BlockStyle } from '@/domain/landing/block.types'

type Props = { content: IconsTickerContent; style?: BlockStyle }

const SPEED_MAP  = { slow: 50, normal: 30, fast: 14 }
const ICON_SIZE  = { sm: 56,  md: 72,  lg: 96 }
const ROUNDED_CLS = { sm: 'rounded-xl', md: 'rounded-2xl', full: 'rounded-full' }
const GAP_PX     = { sm: 12, md: 20,  lg: 32 }

const COPIES = 6

// Pre-computed at module level to avoid SSR/client floating-point mismatch
function _starburstPoints(cx: number, cy: number, outerR: number, innerR: number, numSpikes: number): string {
  const pts: string[] = []
  for (let i = 0; i < numSpikes * 2; i++) {
    const angle = (Math.PI * i) / numSpikes - Math.PI / 2
    const r = i % 2 === 0 ? outerR : innerR
    pts.push(`${cx + r * Math.cos(angle)},${cy + r * Math.sin(angle)}`)
  }
  return pts.join(' ')
}
const STARBURST_POINTS = _starburstPoints(50, 50, 48, 34, 10)

export function IconsTickerBlock({ content }: Props) {
  const {
    title, items = [], speed, direction, backgroundColor, cardBg, textColor,
    accentColor, pauseOnHover, iconSize, showLabels, rounded, gap,
    displayMode = 'ticker', gridColumns = 4,
  } = content

  if (!items || items.length === 0) return null

  const duration    = SPEED_MAP[speed]
  const animName    = direction === 'right' ? 'icons-ticker-right' : 'icons-ticker-left'
  const pct         = `${(1 / COPIES) * 100}%`
  const sz          = ICON_SIZE[iconSize]
  const roundedCls  = ROUNDED_CLS[rounded]
  const gapPx       = GAP_PX[gap]

  // Posición del badge sobre la tarjeta
  const BADGE_POS: Record<string, { top?: number; bottom?: number; left?: number; right?: number }> = {
    'top-right':    { top: -8,  right: -8  },
    'top-left':     { top: -8,  left:  -8  },
    'bottom-right': { bottom: -8, right: -8 },
    'bottom-left':  { bottom: -8, left:  -8 },
  }

  function BadgeEl({ badge }: { badge: IconTickerBadge }) {
    const pos = BADGE_POS[badge.position] ?? BADGE_POS['top-right']
    const pct = (badge.size ?? 48) / 100
    const badgeSz = Math.round(sz * pct)
    // Tamaño de fuente proporcional al badge, ajustado por longitud del texto
    const textLen = badge.text.length
    const baseFontPx = badgeSz * (textLen <= 4 ? 0.26 : textLen <= 7 ? 0.21 : 0.17)
    const fontPx = Math.max(7, Math.round(baseFontPx))
    // Dividir en líneas (máx 2) para el SVG text
    const words = badge.text.trim().split(' ')
    const line1 = words.slice(0, Math.ceil(words.length / 2)).join(' ')
    const line2 = words.length > 1 ? words.slice(Math.ceil(words.length / 2)).join(' ') : null

    if (badge.shape === 'starburst') {
      const pts = STARBURST_POINTS
      return (
        <div className="absolute z-10" style={{ ...pos, width: badgeSz, height: badgeSz }}>
          <svg viewBox="0 0 100 100" width={badgeSz} height={badgeSz} style={{ position: 'absolute', inset: 0, overflow: 'visible' }}>
            <polygon points={pts} fill={badge.bg} filter="drop-shadow(0 1px 3px rgba(0,0,0,0.25))" />
          </svg>
          {/* Texto encima del SVG para mejor rendering */}
          <div style={{
            position: 'absolute', inset: 0,
            display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center',
            color: badge.color, fontWeight: 900,
            fontSize: fontPx, lineHeight: 1.15,
            textAlign: 'center', padding: '4px',
            userSelect: 'none',
          }}>
            <span>{line1}</span>
            {line2 && <span>{line2}</span>}
          </div>
        </div>
      )
    }

    if (badge.shape === 'square') {
      return (
        <div className="absolute z-10 font-black text-center leading-tight flex items-center justify-center"
          style={{
            ...pos,
            minWidth: badgeSz,
            minHeight: badgeSz * 0.6,
            padding: '3px 5px',
            borderRadius: 5,
            backgroundColor: badge.bg,
            color: badge.color,
            fontSize: fontPx,
            boxShadow: '0 1px 4px rgba(0,0,0,0.22)',
          }}
        >
          <div style={{ lineHeight: 1.15 }}>
            <div>{line1}</div>
            {line2 && <div>{line2}</div>}
          </div>
        </div>
      )
    }

    // pill (default)
    return (
      <div className="absolute z-10 font-black text-center leading-tight flex items-center justify-center"
        style={{
          ...pos,
          minWidth: badgeSz,
          padding: `3px ${Math.round(badgeSz * 0.18)}px`,
          borderRadius: 999,
          backgroundColor: badge.bg,
          color: badge.color,
          fontSize: fontPx,
          boxShadow: '0 1px 4px rgba(0,0,0,0.2)',
          whiteSpace: 'nowrap',
        }}
      >
        {badge.text}
      </div>
    )
  }

  function ItemCard({ item }: { item: IconTickerItem }) {
    return (
      <div className="flex flex-col items-center select-none" style={{ gap: 6, width: sz + 16 }}>
        <div
          className={`relative flex items-center justify-center overflow-visible ${roundedCls} transition-transform hover:scale-105`}
          style={{
            width: sz,
            height: sz,
            backgroundColor: cardBg,
            border: `1.5px solid ${accentColor}22`,
            boxShadow: '0 1px 4px rgba(0,0,0,0.07)',
          }}
        >
          {item.badge && <BadgeEl badge={item.badge} />}
          {item.iconType === 'image' && item.icon && (item.icon.startsWith('http') || item.icon.startsWith('/')) ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={item.icon}
              alt={item.label}
              style={{ width: sz * 0.72, height: sz * 0.72, objectFit: 'contain' }}
              onError={e => {
                e.currentTarget.style.display = 'none'
                const parent = e.currentTarget.parentElement
                if (parent) {
                  const span = document.createElement('span')
                  span.style.fontSize = `${sz * 0.32}px`
                  span.style.lineHeight = '1.2'
                  span.style.color = textColor
                  span.style.fontWeight = '700'
                  span.style.textAlign = 'center'
                  span.style.padding = '2px'
                  span.textContent = item.label
                  parent.appendChild(span)
                }
              }}
            />
          ) : (
            <span style={{ fontSize: sz * 0.44, lineHeight: 1 }}>{item.icon || item.label.slice(0, 2)}</span>
          )}
        </div>
        {showLabels && (
          <span
            className="text-[11px] font-semibold text-center leading-tight"
            style={{ color: textColor, maxWidth: sz + 8 }}
          >
            {item.label}
          </span>
        )}
      </div>
    )
  }

  function ItemWrapper({ item, idx }: { item: IconTickerItem; idx: number }) {
    return item.url ? (
      <a key={idx} href={item.url} className="no-underline flex-shrink-0">
        <ItemCard item={item} />
      </a>
    ) : (
      <div key={idx} className="flex-shrink-0">
        <ItemCard item={item} />
      </div>
    )
  }

  // ── Static row ──────────────────────────────────────────────────────────────
  if (displayMode === 'row') {
    return (
      <div style={{ backgroundColor }} className="w-full py-6">
        {title && (
          <p className="text-center text-xs font-bold tracking-widest uppercase mb-5 opacity-40"
            style={{ color: textColor }}>
            {title}
          </p>
        )}
        <div className="flex flex-wrap items-start justify-center px-4" style={{ gap: gapPx }}>
          {items.map((item, i) => <ItemWrapper key={item.id} item={item} idx={i} />)}
        </div>
      </div>
    )
  }

  // ── Static grid ─────────────────────────────────────────────────────────────
  if (displayMode === 'grid') {
    return (
      <div style={{ backgroundColor }} className="w-full py-8">
        {title && (
          <p className="text-center text-xs font-bold tracking-widest uppercase mb-6 opacity-40"
            style={{ color: textColor }}>
            {title}
          </p>
        )}
        <div
          className="max-w-5xl mx-auto px-6"
          style={{
            display: 'grid',
            gridTemplateColumns: `repeat(${gridColumns}, minmax(0, 1fr))`,
            gap: gapPx,
            justifyItems: 'center',
          }}
        >
          {items.map((item, i) => <ItemWrapper key={item.id} item={item} idx={i} />)}
        </div>
      </div>
    )
  }

  // ── Animated ticker (default) ───────────────────────────────────────────────
  return (
    <div style={{ backgroundColor }} className="w-full py-6">
      <style>{`
        @keyframes icons-ticker-left {
          0%   { transform: translateX(0); }
          100% { transform: translateX(-${pct}); }
        }
        @keyframes icons-ticker-right {
          0%   { transform: translateX(-${pct}); }
          100% { transform: translateX(0); }
        }
        .icons-ticker-pause:hover .icons-ticker-track {
          animation-play-state: paused;
        }
      `}</style>

      {title && (
        <p
          className="text-center text-xs font-bold tracking-widest uppercase mb-5 opacity-40"
          style={{ color: textColor }}
        >
          {title}
        </p>
      )}

      <div
        className={`overflow-hidden w-full ${pauseOnHover ? 'icons-ticker-pause' : ''}`}
        style={{
          maskImage: 'linear-gradient(to right, transparent 0%, black 8%, black 92%, transparent 100%)',
          WebkitMaskImage: 'linear-gradient(to right, transparent 0%, black 8%, black 92%, transparent 100%)',
        }}
      >
        <div
          className="icons-ticker-track flex items-start w-max"
          style={{ animation: `${animName} ${duration}s linear infinite`, gap: gapPx, paddingInline: gapPx }}
        >
          {Array.from({ length: COPIES }, (_, si) =>
            items.map((item, i) => {
              const key = `${item.id}-s${si}-i${i}`
              return item.url ? (
                <a key={key} href={item.url} className="no-underline flex-shrink-0">
                  <ItemCard item={item} />
                </a>
              ) : (
                <div key={key} className="flex-shrink-0">
                  <ItemCard item={item} />
                </div>
              )
            })
          )}
        </div>
      </div>
    </div>
  )
}
