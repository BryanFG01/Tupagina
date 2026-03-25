'use client'

import type { GalleryContent, GalleryImage, BlockStyle } from '@/domain/landing/block.types'

type Props = {
  content: GalleryContent
  style?: BlockStyle
}

const GAP: Record<GalleryContent['gap'], string> = {
  none: 'gap-0',
  sm:   'gap-1',
  md:   'gap-2',
  lg:   'gap-4',
}

const ROUNDED: Record<GalleryContent['rounded'], string> = {
  none: 'rounded-none',
  sm:   'rounded',
  md:   'rounded-xl',
  xl:   'rounded-3xl',
}

const ASPECT: Record<GalleryContent['aspectRatio'], string> = {
  square:    'aspect-square',
  portrait:  'aspect-[3/4]',
  landscape: 'aspect-[4/3]',
  auto:      '',
}

const MAX_W: Record<GalleryContent['maxWidth'], string> = {
  full: 'max-w-full',
  xl:   'max-w-xl',
  '2xl': 'max-w-2xl',
  '6xl': 'max-w-6xl',
}

function Img({ image, className, hoverEffect, rounded, aspectRatio, priority = false }:
  { image: GalleryImage; className?: string; hoverEffect: GalleryContent['hoverEffect']; rounded: string; aspectRatio: string; priority?: boolean }) {

  const overlayHover = hoverEffect === 'overlay'
  const zoom = hoverEffect === 'zoom'
  const darken = hoverEffect === 'darken'

  return (
    <div className={`relative overflow-hidden group ${rounded} ${className ?? ''}`}>
      {/* Image */}
      <div className={`w-full h-full ${aspectRatio}`}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={image.url}
          alt={image.alt}
          className={`w-full h-full object-cover transition-transform duration-500 ${zoom ? 'group-hover:scale-105' : ''}`}
          loading={priority ? 'eager' : 'lazy'}
        />
      </div>

      {/* Darken overlay */}
      {darken && (
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors duration-300" />
      )}

      {/* Overlay effect (hover reveals caption/CTA) */}
      {overlayHover && (
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors duration-300 flex items-end">
          <div className="p-4 translate-y-4 group-hover:translate-y-0 opacity-0 group-hover:opacity-100 transition-all duration-300">
            {image.alt && <p className="text-white text-sm font-medium">{image.alt}</p>}
            {image.ctaText && (
              <a href={image.ctaUrl ?? '#'}
                className="mt-2 inline-block text-xs font-bold text-white border border-white/60 px-3 py-1 rounded-full hover:bg-white hover:text-gray-900 transition-colors">
                {image.ctaText}
              </a>
            )}
          </div>
        </div>
      )}

      {/* Static CTA button — always visible (non-overlay mode) */}
      {!overlayHover && image.ctaText && (
        <div className="absolute bottom-4 left-4">
          <a
            href={image.ctaUrl ?? '#'}
            className="inline-flex items-center gap-1.5 bg-white text-gray-900 text-sm font-semibold px-4 py-2 rounded-xl shadow-lg hover:bg-gray-100 transition-colors"
          >
            {image.ctaText}
          </a>
        </div>
      )}
    </div>
  )
}

export function GalleryBlock({ content }: Props) {
  const { images, layout, gap, rounded, aspectRatio, hoverEffect, backgroundColor, maxWidth } = content

  if (images.length === 0) return null

  const gapCls     = GAP[gap]
  const roundedCls = ROUNDED[rounded]
  const aspectCls  = ASPECT[aspectRatio]
  const maxWCls    = MAX_W[maxWidth]

  const imgProps = { hoverEffect, rounded: roundedCls, aspectRatio: aspectCls }

  function renderLayout() {
    const imgs = images

    // ── Feature left: 1 large left + 2×2 right ──
    if (layout === 'feature-left') {
      const [main, ...rest] = imgs
      if (!main) return null
      return (
        <div className={`grid grid-cols-2 ${gapCls}`} style={{ minHeight: 480 }}>
          {/* Left: full-height main image */}
          <Img image={main} className="h-full" {...imgProps} aspectRatio="" priority />
          {/* Right: 2×2 grid */}
          <div className={`grid grid-cols-2 grid-rows-2 ${gapCls}`}>
            {rest.slice(0, 4).map((img, i) => (
              <Img key={img.id} image={img} className="h-full" {...imgProps} aspectRatio="" />
            ))}
          </div>
        </div>
      )
    }

    // ── Feature right: 2×2 left + 1 large right ──
    if (layout === 'feature-right') {
      const [main, ...rest] = imgs
      if (!main) return null
      return (
        <div className={`grid grid-cols-2 ${gapCls}`} style={{ minHeight: 480 }}>
          <div className={`grid grid-cols-2 grid-rows-2 ${gapCls}`}>
            {rest.slice(0, 4).map((img) => (
              <Img key={img.id} image={img} className="h-full" {...imgProps} aspectRatio="" />
            ))}
          </div>
          <Img image={main} className="h-full" {...imgProps} aspectRatio="" priority />
        </div>
      )
    }

    // ── Feature top: 1 large top + row below ──
    if (layout === 'feature-top') {
      const [main, ...rest] = imgs
      if (!main) return null
      const cols = rest.length <= 2 ? 'grid-cols-2' : rest.length === 3 ? 'grid-cols-3' : 'grid-cols-4'
      return (
        <div className={`flex flex-col ${gapCls}`}>
          <Img image={main} className="w-full" {...imgProps} aspectRatio="aspect-[16/7]" priority />
          <div className={`grid ${cols} ${gapCls}`}>
            {rest.slice(0, 4).map((img) => (
              <Img key={img.id} image={img} {...imgProps} />
            ))}
          </div>
        </div>
      )
    }

    // ── Mosaic: 1 tall left + 2 medium right-top + 2 small right-bottom ──
    if (layout === 'mosaic') {
      const [a, b, c, d, e] = imgs
      return (
        <div className={`grid grid-cols-3 grid-rows-2 ${gapCls}`} style={{ minHeight: 500 }}>
          {/* a: spans 2 rows on the left */}
          {a && <div className="row-span-2 col-span-1">
            <Img image={a} className="h-full" {...imgProps} aspectRatio="" priority />
          </div>}
          {/* b, c: top right 2 cells */}
          {b && <Img image={b} className="h-full" {...imgProps} aspectRatio="" />}
          {c && <Img image={c} className="h-full" {...imgProps} aspectRatio="" />}
          {/* d, e: bottom right 2 cells */}
          {d && <Img image={d} className="h-full" {...imgProps} aspectRatio="" />}
          {e && <Img image={e} className="h-full" {...imgProps} aspectRatio="" />}
        </div>
      )
    }

    // ── Grid layouts ──
    const colsMap: Record<string, string> = {
      'grid-2': 'grid-cols-1 sm:grid-cols-2',
      'grid-3': 'grid-cols-2 sm:grid-cols-3',
      'grid-4': 'grid-cols-2 sm:grid-cols-4',
    }
    const cols = colsMap[layout] ?? 'grid-cols-3'
    return (
      <div className={`grid ${cols} ${gapCls}`}>
        {imgs.map((img, i) => (
          <Img key={img.id} image={img} {...imgProps} priority={i < 4} />
        ))}
      </div>
    )
  }

  return (
    <div style={{ backgroundColor }} className="py-6 px-4 sm:px-6">
      <div className={`mx-auto ${maxWCls}`}>
        {renderLayout()}
      </div>
    </div>
  )
}
