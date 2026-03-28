'use client'

import { useState } from 'react'
import type { Block } from '@/domain/landing/block.types'
import { HeroBlockEditor } from './blocks/HeroBlockEditor'
import { ServicesBlockEditor } from './blocks/ServicesBlockEditor'
import { PaymentBlockEditor } from './blocks/PaymentBlockEditor'
import { TestimonialsBlockEditor } from './blocks/TestimonialsBlockEditor'
import { ContactBlockEditor } from './blocks/ContactBlockEditor'

const BLOCK_LABELS: Record<Block['type'], string> = {
  hero: 'Portada',
  services: 'Servicios',
  testimonials: 'Testimonios',
  payment: 'Botón de pago',
  contact: 'Contacto',
  store: 'Tienda',
  'store-banner': 'Banner de tienda',
  'floating-buttons': 'Botones flotantes',
  footer: 'Pie de página',
  faq: 'FAQ / Acordeón',
  navbar: 'Navegación',
  'brands-banner': 'Ticker de marcas',
  gallery: 'Galería de fotos',
  stats: 'Estadísticas',
  features: 'Features / Beneficios',
  'icons-ticker': 'Banner de íconos',
  'loading-spinner': 'Spinner de carga',
}

type Props = {
  block: Block
  isFirst: boolean
  isLast: boolean
  onUpdate: (content: Block['content']) => void
  onRemove: () => void
  onMove: (dir: 'up' | 'down') => void
}

export function BlockEditorItem({ block, isFirst, isLast, onUpdate, onRemove, onMove }: Props) {
  const [open, setOpen] = useState(true)

  return (
    <div className="bg-white rounded-xl border overflow-hidden">
      {/* Header del bloque */}
      <div className="flex items-center justify-between px-4 py-3 bg-gray-50 border-b">
        <button
          onClick={() => setOpen(!open)}
          className="flex items-center gap-2 text-sm font-medium text-gray-700 hover:text-gray-900"
        >
          <span>{open ? '▼' : '▶'}</span>
          {BLOCK_LABELS[block.type]}
        </button>
        <div className="flex items-center gap-1">
          <button
            onClick={() => onMove('up')}
            disabled={isFirst}
            className="p-1.5 rounded hover:bg-gray-200 disabled:opacity-30 text-gray-500"
            title="Subir"
          >
            ↑
          </button>
          <button
            onClick={() => onMove('down')}
            disabled={isLast}
            className="p-1.5 rounded hover:bg-gray-200 disabled:opacity-30 text-gray-500"
            title="Bajar"
          >
            ↓
          </button>
          <button
            onClick={onRemove}
            className="p-1.5 rounded hover:bg-red-100 text-red-500"
            title="Eliminar bloque"
          >
            ✕
          </button>
        </div>
      </div>

      {/* Formulario del bloque */}
      {open && (
        <div className="p-4">
          {block.type === 'hero' && (
            <HeroBlockEditor content={block.content} onChange={onUpdate} />
          )}
          {block.type === 'services' && (
            <ServicesBlockEditor content={block.content} onChange={onUpdate} />
          )}
          {block.type === 'testimonials' && (
            <TestimonialsBlockEditor content={block.content} onChange={onUpdate} />
          )}
          {block.type === 'payment' && (
            <PaymentBlockEditor content={block.content} onChange={onUpdate} />
          )}
          {block.type === 'contact' && (
            <ContactBlockEditor content={block.content} onChange={onUpdate} />
          )}
        </div>
      )}
    </div>
  )
}
