import type { Block } from '@/domain/landing/block.types'
import { HeroBlock }             from './HeroBlock'
import { ServicesBlock }         from './ServicesBlock'
import { TestimonialsBlock }     from './TestimonialsBlock'
import { PaymentBlock }          from './PaymentBlock'
import { ContactBlock }          from './ContactBlock'
import { StoreBlock }            from './StoreBlock'
import { StoreBannerBlock }      from './StoreBannerBlock'
import { FloatingButtonsBlock }  from './FloatingButtonsBlock'
import { FooterBlock }           from './FooterBlock'
import { FaqBlock }              from './FaqBlock'
import { NavbarBlock }           from './NavbarBlock'
import { BrandsBannerBlock }    from './BrandsBannerBlock'
import { GalleryBlock }         from './GalleryBlock'
import { StatsBlock }           from './StatsBlock'
import { FeaturesBlock }        from './FeaturesBlock'
import { AnimatedBlock }         from './AnimatedBlock'
import { IconsTickerBlock }     from './IconsTickerBlock'
import { SpinnerBlock }         from './SpinnerBlock'

type Props = {
  block: Block
  landingId?: string
  currency?: string
  previewMode?: boolean
}

export function BlockRenderer({ block, landingId = '', currency = 'usd', previewMode = false }: Props) {
  const s = block.style

  // Floating buttons render outside normal flow — no animation wrapper
  if (block.type === 'floating-buttons') {
    return <FloatingButtonsBlock content={block.content} previewMode={previewMode} landingId={landingId} />
  }

  // Loading spinner renders as a fixed overlay — no animation wrapper, no layout flow
  if (block.type === 'loading-spinner') {
    return <SpinnerBlock content={block.content} previewMode={previewMode} />
  }

  const inner = (() => {
    switch (block.type) {
      case 'hero':         return <HeroBlock         content={block.content} style={s} />
      case 'services':     return <ServicesBlock     content={block.content} style={s} />
      case 'testimonials': return <TestimonialsBlock content={block.content} style={s} />
      case 'payment':      return <PaymentBlock      content={block.content} style={s} landingId={landingId} previewMode={previewMode} />
      case 'contact':      return <ContactBlock      content={block.content} style={s} />
      case 'store':        return <StoreBlock        content={block.content} style={s} previewMode={previewMode} />
      case 'store-banner': return <StoreBannerBlock  content={block.content} style={s} previewMode={previewMode} landingId={landingId} currency={currency} />
      case 'footer':       return <FooterBlock       content={block.content} style={s} />
      case 'faq':          return <FaqBlock          content={block.content} style={s} />
      case 'navbar':         return <NavbarBlock         content={block.content} style={s} landingId={landingId} currency={currency} previewMode={previewMode} />
      case 'brands-banner': return <BrandsBannerBlock  content={block.content} style={s} />
      case 'gallery':    return <GalleryBlock    content={block.content} style={s} />
      case 'stats':     return <StatsBlock     content={block.content} style={s} />
      case 'features':      return <FeaturesBlock      content={block.content} style={s} />
      case 'icons-ticker':     return <IconsTickerBlock  content={block.content} style={s} />
      default:                  return null
    }
  })()

  return (
    <AnimatedBlock animation={s?.animation}>
      {inner}
    </AnimatedBlock>
  )
}
