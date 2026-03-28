'use client'

import { useEffect, useRef, useState } from 'react'
import type { StatsContent, BlockStyle } from '@/domain/landing/block.types'

type Props = { content: StatsContent; style?: BlockStyle }

// Extracts a numeric part for animation, e.g. "+10,000" → 10000
function parseNumber(value: string): number | null {
  const clean = value.replace(/[^0-9.]/g, '')
  const n = parseFloat(clean)
  return isNaN(n) ? null : n
}

function AnimatedValue({ value, animate, accentColor }: { value: string; animate: boolean; accentColor: string }) {
  const [display, setDisplay] = useState(animate ? '0' : value)
  const ref = useRef<HTMLSpanElement>(null)
  const started = useRef(false)

  useEffect(() => {
    if (!animate) return
    const numeric = parseNumber(value)
    if (numeric === null) { setDisplay(value); return }

    const prefix = value.match(/^[^0-9]*/)?.[0] ?? ''
    const suffix = value.match(/[^0-9.,]+$/)?.[0] ?? ''
    const hasDecimal = value.includes('.')

    // Intersection Observer — start counter when visible
    const observer = new IntersectionObserver(entries => {
      if (!entries[0]?.isIntersecting || started.current) return
      started.current = true
      observer.disconnect()

      const duration = 1600
      const start = performance.now()
      function tick(now: number) {
        const elapsed = Math.min((now - start) / duration, 1)
        const ease = 1 - Math.pow(1 - elapsed, 3) // ease-out cubic
        const current = Math.round(ease * numeric!)
        const formatted = current.toLocaleString('es')
        setDisplay(`${prefix}${hasDecimal ? (ease * numeric!).toFixed(1) : formatted}${suffix}`)
        if (elapsed < 1) requestAnimationFrame(tick)
        else setDisplay(value)
      }
      requestAnimationFrame(tick)
    }, { threshold: 0.3 })

    if (ref.current) observer.observe(ref.current)
    return () => observer.disconnect()
  }, [value, animate])

  return (
    <span ref={ref} className="tabular-nums" style={{ color: accentColor }}>
      {display}
    </span>
  )
}

export function StatsBlock({ content, style }: Props) {
  const { items, title, subtitle, layout, cardStyle, animate } = content
  // style prop (Estilo tab) takes precedence over content colors
  const backgroundColor = (style?.backgroundColor && style.backgroundColor !== 'default') ? style.backgroundColor : content.backgroundColor
  const textColor       = (style?.textColor       && style.textColor       !== 'default') ? style.textColor       : content.textColor
  const accentColor     = (style?.buttonColor      && style.buttonColor     !== 'default') ? style.buttonColor     : content.accentColor

  const gridCls = layout === 'grid-2'
    ? 'grid grid-cols-2 gap-6'
    : layout === 'grid-4'
    ? 'grid grid-cols-2 sm:grid-cols-4 gap-6'
    : 'flex flex-wrap justify-center gap-8 sm:gap-12'

  const itemCls = (() => {
    switch (cardStyle) {
      case 'card':     return 'bg-white rounded-2xl shadow-sm border border-gray-100 p-6 text-center'
      case 'bordered': return 'border-2 rounded-2xl p-6 text-center'
      case 'colored':  return 'rounded-2xl p-6 text-center text-white'
      default:         return 'text-center py-4 px-6'  // minimal
    }
  })()

  return (
    <section style={{ backgroundColor }} className="py-14 px-4 sm:px-6">
      <div className="max-w-5xl mx-auto">
        {/* Heading */}
        {(title || subtitle) && (
          <div className="text-center mb-10">
            {title && (
              <h2 className="text-2xl sm:text-3xl font-black tracking-tight mb-2" style={{ color: textColor }}>
                {title}
              </h2>
            )}
            {subtitle && (
              <p className="text-base opacity-60" style={{ color: textColor }}>{subtitle}</p>
            )}
          </div>
        )}

        {/* Stats */}
        <div className={gridCls}>
          {items.map(item => (
            <div
              key={item.id}
              className={itemCls}
              style={
                cardStyle === 'bordered' ? { borderColor: item.color ?? accentColor } :
                cardStyle === 'colored'  ? { backgroundColor: item.color ?? accentColor } :
                undefined
              }
            >
              {item.icon && (
                <div className="text-3xl mb-2 leading-none">{item.icon}</div>
              )}
              <div className="text-3xl sm:text-4xl font-black leading-none mb-1.5">
                <AnimatedValue
                  value={item.value}
                  animate={animate}
                  accentColor={cardStyle === 'colored' ? '#ffffff' : (item.color ?? accentColor)}
                />
              </div>
              <p
                className="text-sm font-medium leading-snug opacity-70"
                style={{ color: cardStyle === 'colored' ? '#ffffff' : textColor }}
              >
                {item.label}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
