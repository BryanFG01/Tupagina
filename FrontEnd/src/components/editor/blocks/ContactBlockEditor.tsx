'use client'

import type { ContactContent } from '@/domain/landing/block.types'
import { Input } from '@/components/ui/Input'

type Props = {
  content: ContactContent
  onChange: (content: ContactContent) => void
}

export function ContactBlockEditor({ content, onChange }: Props) {
  function update(field: keyof ContactContent, value: string) {
    onChange({ ...content, [field]: value })
  }

  return (
    <div className="space-y-4">
      <Input
        label="Título de la sección"
        value={content.title}
        onChange={(e) => update('title', e.target.value)}
        placeholder="¿Listo para empezar?"
      />
      <Input
        label="Número de WhatsApp"
        value={content.whatsapp ?? ''}
        onChange={(e) => update('whatsapp', e.target.value)}
        placeholder="5491112345678"
        hint="Con código de país, sin + ni espacios"
      />
      <Input
        label="Email de contacto (opcional)"
        value={content.email ?? ''}
        onChange={(e) => update('email', e.target.value)}
        type="email"
        placeholder="hola@tunegocio.com"
      />
      <Input
        label="Texto del botón de WhatsApp"
        value={content.buttonText}
        onChange={(e) => update('buttonText', e.target.value)}
        placeholder="Contáctame por WhatsApp"
      />
    </div>
  )
}
