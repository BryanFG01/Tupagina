'use client'

import type { ServicesContent, ServiceItem } from '@/domain/landing/block.types'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'

type Props = {
  content: ServicesContent
  onChange: (content: ServicesContent) => void
}

export function ServicesBlockEditor({ content, onChange }: Props) {
  function updateTitle(title: string) {
    onChange({ ...content, title })
  }

  function updateItem(idx: number, field: keyof ServiceItem, value: string) {
    const items = content.items.map((item, i) =>
      i === idx ? { ...item, [field]: value } : item
    )
    onChange({ ...content, items })
  }

  function addItem() {
    onChange({
      ...content,
      items: [...content.items, { title: 'Nuevo servicio', description: 'Descripción' }],
    })
  }

  function removeItem(idx: number) {
    onChange({ ...content, items: content.items.filter((_, i) => i !== idx) })
  }

  return (
    <div className="space-y-5">
      <Input
        label="Título de la sección"
        value={content.title}
        onChange={(e) => updateTitle(e.target.value)}
      />

      <div className="space-y-4">
        {content.items.map((item, idx) => (
          <div key={idx} className="bg-gray-50 rounded-lg p-4 space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-gray-600">Servicio {idx + 1}</span>
              {content.items.length > 1 && (
                <button
                  onClick={() => removeItem(idx)}
                  className="text-xs text-red-500 hover:text-red-700"
                >
                  Eliminar
                </button>
              )}
            </div>
            <Input
              label="Nombre"
              value={item.title}
              onChange={(e) => updateItem(idx, 'title', e.target.value)}
              placeholder="Diseño de logo"
            />
            <Input
              label="Descripción"
              value={item.description}
              onChange={(e) => updateItem(idx, 'description', e.target.value)}
              placeholder="Lo que incluye este servicio"
            />
            <Input
              label="Precio (opcional)"
              value={item.price ?? ''}
              onChange={(e) => updateItem(idx, 'price', e.target.value)}
              placeholder="$150"
            />
          </div>
        ))}
      </div>

      <Button type="button" variant="secondary" onClick={addItem} className="w-full">
        + Agregar servicio
      </Button>
    </div>
  )
}
