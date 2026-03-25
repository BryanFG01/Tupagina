import type { HeroContent, BlockStyle } from '@/domain/landing/block.types'
import { bsCls, bsStyle, bsBtn } from './blockStyle'

type Props = { content: HeroContent; style?: BlockStyle }

function buildOverlay(color?: string, opacity?: number): string {
  const c = color ?? '#000000'
  const o = (opacity ?? 40) / 100
  // convert hex to rgba
  const r = parseInt(c.slice(1, 3), 16)
  const g = parseInt(c.slice(3, 5), 16)
  const b = parseInt(c.slice(5, 7), 16)
  return `rgba(${r},${g},${b},${o})`
}

export function HeroBlock({ content, style }: Props) {
  const hasMedia = !!(content.backgroundImage || content.backgroundVideo)
  const bgPos = content.backgroundPosition ?? 'center'
  const overlayRgba = buildOverlay(content.overlayColor, content.overlayOpacity)

  return (
    <section
      className={bsCls(style, hasMedia ? '' : 'bg-gradient-to-br from-brand-50 to-white', 'py-20', 'text-center relative overflow-hidden')}
      style={{
        ...bsStyle(style),
        ...(content.backgroundImage && !content.backgroundVideo ? {
          backgroundImage: `linear-gradient(${overlayRgba},${overlayRgba}), url(${content.backgroundImage})`,
          backgroundSize: 'cover',
          backgroundPosition: bgPos,
          color: style?.textColor && style.textColor !== 'default' ? style.textColor : '#fff',
        } : {}),
      }}
    >
      {/* Video background */}
      {content.backgroundVideo && (
        <>
          <video
            autoPlay muted loop playsInline
            className="absolute inset-0 w-full h-full object-cover"
            style={{ objectPosition: bgPos }}
          >
            <source src={content.backgroundVideo} />
          </video>
          <div
            className="absolute inset-0"
            style={{ backgroundColor: overlayRgba }}
          />
        </>
      )}

      <div className="relative z-10 max-w-3xl mx-auto">
        <h1 className="text-4xl md:text-5xl font-bold leading-tight mb-4">
          {content.title}
        </h1>
        <p className="text-xl mb-8 opacity-80">{content.subtitle}</p>
        <a
          href={content.ctaUrl}
          className="inline-block bg-brand-600 text-white text-lg px-8 py-4 rounded-xl hover:opacity-90 transition-all font-medium shadow-lg"
          style={bsBtn(style)}
        >
          {content.ctaText}
        </a>
      </div>
    </section>
  )
}
