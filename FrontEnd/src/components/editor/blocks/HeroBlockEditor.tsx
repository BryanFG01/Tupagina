'use client'

import type { HeroContent } from '@/domain/landing/block.types'
import { Input } from '@/components/ui/Input'
import { MediaBackgroundEditor } from './MediaBackgroundEditor'

type Props = {
  content: HeroContent
  onChange: (content: HeroContent) => void
}

export function HeroBlockEditor({ content, onChange }: Props) {
  function update(field: keyof HeroContent, value: string) {
    onChange({ ...content, [field]: value })
  }

  return (
    <div className="space-y-4">
      <Input
        label="Título principal"
        value={content.title}
        onChange={(e) => update('title', e.target.value)}
        placeholder="Bienvenido a mi servicio"
      />
      <Input
        label="Subtítulo"
        value={content.subtitle}
        onChange={(e) => update('subtitle', e.target.value)}
        placeholder="Una descripción clara de lo que ofreces"
      />
      <Input
        label="Texto del botón"
        value={content.ctaText}
        onChange={(e) => update('ctaText', e.target.value)}
        placeholder="Contáctame"
      />
      <Input
        label="Enlace del botón"
        value={content.ctaUrl}
        onChange={(e) => update('ctaUrl', e.target.value)}
        placeholder="#contacto"
        hint="Puede ser #contacto, una URL externa o número de WhatsApp"
      />

      <hr className="border-gray-100" />

      <MediaBackgroundEditor
        values={{
          backgroundImage: content.backgroundImage,
          backgroundVideo: content.backgroundVideo,
          backgroundPosition: content.backgroundPosition,
          overlayColor: content.overlayColor,
          overlayOpacity: content.overlayOpacity,
        }}
        onChange={(media) => onChange({ ...content, ...media })}
        defaultOverlayOpacity={40}
      />
    </div>
  )
}
