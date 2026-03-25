'use client'

import type { FeaturesContent, BlockStyle } from '@/domain/landing/block.types'

type Props = { content: FeaturesContent; style?: BlockStyle }

const IMG_STYLE: Record<FeaturesContent['imageStyle'], string> = {
  square:    'rounded-none aspect-square',
  rounded:   'rounded-2xl aspect-[4/3]',
  circle:    'rounded-full aspect-square',
  landscape: 'rounded-xl aspect-[16/9]',
  portrait:  'rounded-xl aspect-[3/4]',
}

const GAP: Record<FeaturesContent['gap'], string> = {
  sm: 'gap-4',
  md: 'gap-6',
  lg: 'gap-10',
}

const COLS: Record<2 | 3 | 4, string> = {
  2: 'grid-cols-1 sm:grid-cols-2',
  3: 'grid-cols-1 sm:grid-cols-3',
  4: 'grid-cols-2 sm:grid-cols-4',
}

export function FeaturesBlock({ content, style }: Props) {
  const { title, subtitle, items, columns, imageStyle, layout, gap } = content
  // style prop (Estilo tab) takes precedence over content colors
  const backgroundColor = (style?.backgroundColor && style.backgroundColor !== 'default') ? style.backgroundColor : content.backgroundColor
  const textColor       = (style?.textColor       && style.textColor       !== 'default') ? style.textColor       : content.textColor
  const accentColor     = (style?.buttonColor      && style.buttonColor     !== 'default') ? style.buttonColor     : content.accentColor

  const colsCls = COLS[columns]
  const gapCls  = GAP[gap]
  const imgCls  = IMG_STYLE[imageStyle]

  const isCard       = layout === 'card'
  const isCentered   = layout === 'centered'
  const isHorizontal = layout === 'horizontal'

  return (
    <section style={{ backgroundColor }} className="py-16 px-4 sm:px-6">
      <div className="max-w-6xl mx-auto">
        {/* Heading */}
        {(title || subtitle) && (
          <div className={`mb-12 ${isCentered ? 'text-center' : ''}`}>
            {title && (
              <h2
                className="text-2xl sm:text-3xl font-black tracking-tight mb-3"
                style={{ color: textColor }}
              >
                {title}
              </h2>
            )}
            {subtitle && (
              <p className="text-base max-w-2xl opacity-60" style={{ color: textColor }}>
                {subtitle}
              </p>
            )}
          </div>
        )}

        {/* Items */}
        {isHorizontal ? (
          // Horizontal layout: image left + text right (stacked list)
          <div className={`flex flex-col ${gapCls}`}>
            {items.map((item, i) => (
              <div key={item.id} className={`flex gap-6 items-center ${i % 2 === 1 ? 'flex-row-reverse' : ''}`}>
                {item.image ? (
                  <div className="w-1/2 flex-shrink-0">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={item.image} alt={item.title} className={`w-full h-auto object-cover ${imgCls}`} />
                  </div>
                ) : item.icon ? (
                  <div
                    className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl flex-shrink-0"
                    style={{ backgroundColor: `${accentColor}18` }}
                  >
                    {item.icon}
                  </div>
                ) : null}
                <div className="flex-1">
                  {item.icon && item.image && (
                    <span className="text-2xl mb-2 block">{item.icon}</span>
                  )}
                  <h3 className="text-xl font-bold mb-2" style={{ color: textColor }}>{item.title}</h3>
                  <p className="text-sm leading-relaxed opacity-70" style={{ color: textColor }}>{item.description}</p>
                  {item.ctaText && (
                    <a
                      href={item.ctaUrl ?? '#'}
                      className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold transition-opacity hover:opacity-75"
                      style={{ color: accentColor }}
                    >
                      {item.ctaText}
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-4 h-4">
                        <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12,5 19,12 12,19"/>
                      </svg>
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          // Grid layout (card, minimal, centered)
          <div className={`grid ${colsCls} ${gapCls}`}>
            {items.map(item => (
              <div
                key={item.id}
                className={`flex flex-col ${isCentered ? 'items-center text-center' : ''} ${
                  isCard ? 'bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden' : ''
                }`}
              >
                {/* Image */}
                {item.image && (
                  <div className={`overflow-hidden ${isCard ? 'w-full' : ''}`}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={item.image}
                      alt={item.title}
                      className={`w-full h-auto object-cover transition-transform duration-500 hover:scale-105 ${imgCls}`}
                      loading="lazy"
                    />
                  </div>
                )}

                {/* Content */}
                <div className={`flex flex-col flex-1 ${isCard ? 'p-5' : 'pt-4'}`}>
                  {/* Icon */}
                  {item.icon && (
                    <div
                      className={`text-3xl mb-3 ${isCentered ? 'mx-auto' : ''} w-12 h-12 rounded-2xl flex items-center justify-center`}
                      style={{ backgroundColor: `${accentColor}18` }}
                    >
                      {item.icon}
                    </div>
                  )}

                  <h3
                    className="text-lg font-bold mb-2 leading-tight"
                    style={{ color: textColor }}
                  >
                    {item.title}
                  </h3>
                  <p
                    className="text-sm leading-relaxed opacity-60 flex-1"
                    style={{ color: textColor }}
                  >
                    {item.description}
                  </p>

                  {item.ctaText && (
                    <a
                      href={item.ctaUrl ?? '#'}
                      className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold transition-opacity hover:opacity-75 self-start"
                      style={{ color: accentColor }}
                    >
                      {item.ctaText}
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-4 h-4">
                        <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12,5 19,12 12,19"/>
                      </svg>
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
