'use client'

import type { BrandsBannerContent, BlockStyle } from '@/domain/landing/block.types'

type Props = {
  content: BrandsBannerContent
  style?: BlockStyle
}

const SPEED_MAP = { slow: 50, normal: 28, fast: 14 }

const FONT_SIZE: Record<BrandsBannerContent['fontSize'], string> = {
  xs: 'text-xs',
  sm: 'text-sm',
  md: 'text-base',
  lg: 'text-lg',
}

const FONT_WEIGHT: Record<BrandsBannerContent['fontWeight'], string> = {
  normal: 'font-normal',
  medium: 'font-medium',
  bold:   'font-bold',
  black:  'font-black',
}

function Separator({ type, color }: { type: BrandsBannerContent['separator']; color: string }) {
  if (type === 'none') return null
  const cls = 'flex-shrink-0 opacity-30'
  if (type === 'dot')   return <span className={cls} style={{ color }}>●</span>
  if (type === 'slash') return <span className={cls} style={{ color }}>/</span>
  if (type === 'line')  return <span className={`${cls} inline-block w-px h-4 bg-current`} style={{ color }} />
  return null
}

export function BrandsBannerBlock({ content, style }: Props) {
  const {
    items, speed, direction, pauseOnHover, separator, fontSize, fontWeight,
    uppercase, letterSpacing, label, imageHeight = 32,
  } = content

  const backgroundColor = (style?.backgroundColor && style.backgroundColor !== 'default')
    ? style.backgroundColor
    : content.backgroundColor
  const textColor = (style?.textColor && style.textColor !== 'default')
    ? style.textColor
    : content.textColor

  if (items.length === 0) return null

  const duration = SPEED_MAP[speed]
  const animName = direction === 'right' ? 'ticker-right' : 'ticker-left'
  const animStyle = `${animName} ${duration}s linear infinite`

  const fontCls = [
    FONT_SIZE[fontSize],
    FONT_WEIGHT[fontWeight],
    uppercase ? 'uppercase' : '',
    letterSpacing ? 'tracking-widest' : 'tracking-normal',
  ].filter(Boolean).join(' ')

  // Repeat items enough times so the strip always fills wide screens
  // We render COPIES sets; animation moves by 1/COPIES of total = 1 full set width
  const COPIES = 6
  const renderSet = (setIdx: number) =>
    items.map((item, i) => (
      <span
        key={`${item.id}-s${setIdx}-i${i}`}
        className="flex items-center flex-shrink-0"
        style={{ gap: '2rem' }}
      >
        {i > 0 && <Separator type={separator} color={item.color ?? textColor} />}
        {item.type === 'image' && item.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={item.imageUrl}
            alt={item.text}
            style={{ height: imageHeight, width: 'auto', objectFit: 'contain', opacity: 0.8 }}
            className="flex-shrink-0 select-none"
          />
        ) : (
          <span
            className={`flex-shrink-0 select-none ${fontCls}`}
            style={{ color: item.color ?? textColor }}
          >
            {item.text}
          </span>
        )}
      </span>
    ))

  // Animation: move by 1/COPIES of total track width = exactly one set
  const pct = `${(1 / COPIES) * 100}%`
  const keyframesName = direction === 'right' ? 'ticker-right' : 'ticker-left'
  const animStyleStr = `${keyframesName} ${duration}s linear infinite`

  return (
    <div style={{ backgroundColor }} className="w-full">
      <style>{`
        @keyframes ticker-left {
          0%   { transform: translateX(0); }
          100% { transform: translateX(-${pct}); }
        }
        @keyframes ticker-right {
          0%   { transform: translateX(-${pct}); }
          100% { transform: translateX(0); }
        }
        .ticker-pause:hover .ticker-track {
          animation-play-state: paused;
        }
      `}</style>

      {/* Optional label */}
      {label && (
        <p
          className="text-center text-xs font-semibold tracking-widest uppercase pt-4 pb-1 opacity-40"
          style={{ color: textColor }}
        >
          {label}
        </p>
      )}

      {/* Ticker — overflow hidden, full width, fade on edges */}
      <div
        className={`overflow-hidden py-4 w-full ${pauseOnHover ? 'ticker-pause' : ''}`}
        style={{
          maskImage: 'linear-gradient(to right, transparent 0%, black 8%, black 92%, transparent 100%)',
          WebkitMaskImage: 'linear-gradient(to right, transparent 0%, black 8%, black 92%, transparent 100%)',
        }}
      >
        <div
          className="ticker-track flex items-center w-max"
          style={{ animation: animStyleStr, gap: '3rem' }}
        >
          {Array.from({ length: COPIES }, (_, si) => (
            <span key={si} className="flex items-center flex-shrink-0" style={{ gap: '2rem' }}>
              {renderSet(si)}
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}
