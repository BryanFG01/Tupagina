'use client'

import { useState } from 'react'
import type { TestimonialsContent, TestimonialItem } from '@/domain/landing/block.types'
import { Input } from '@/components/ui/Input'

type Props = {
  content: TestimonialsContent
  onChange: (content: TestimonialsContent) => void
}

function Toggle({ on, onToggle }: { on: boolean; onToggle: () => void }) {
  return (
    <button type="button" onClick={onToggle}
      className={`relative w-10 h-5 rounded-full transition-colors flex-shrink-0 ${on ? 'bg-indigo-600' : 'bg-gray-300'}`}
    >
      <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow-sm transition-transform ${on ? 'translate-x-5' : 'translate-x-0.5'}`} />
    </button>
  )
}

export function TestimonialsBlockEditor({ content, onChange }: Props) {
  const [uploading, setUploading] = useState<number | null>(null)

  const layout  = content.layout  ?? 'grid'
  const columns = content.columns ?? 2

  function updateItem(idx: number, field: keyof TestimonialItem, value: string | number) {
    const items = content.items.map((item, i) => i === idx ? { ...item, [field]: value } : item)
    onChange({ ...content, items })
  }

  function addItem() {
    onChange({
      ...content,
      items: [...content.items, { name: 'Cliente nuevo', role: '', text: 'Excelente servicio.', rating: 5 }],
    })
  }

  function removeItem(idx: number) {
    onChange({ ...content, items: content.items.filter((_, i) => i !== idx) })
  }

  async function handleImageUpload(idx: number, file: File) {
    setUploading(idx)
    const fd = new FormData()
    fd.append('file', file)
    try {
      const res  = await fetch('/api/upload', { method: 'POST', body: fd })
      const json = await res.json() as { url?: string }
      if (json.url) updateItem(idx, 'avatar', json.url)
    } finally {
      setUploading(null)
    }
  }

  return (
    <div className="space-y-5">
      <Input
        label="Título de la sección"
        value={content.title}
        onChange={e => onChange({ ...content, title: e.target.value })}
      />

      {/* Layout */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">Vista</label>
        <div className="flex gap-2">
          {(['grid', 'list'] as const).map(v => (
            <button key={v} onClick={() => onChange({ ...content, layout: v })}
              className={`flex-1 py-2 text-sm font-semibold rounded-lg border transition-all ${
                layout === v ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-gray-600 border-gray-300 hover:border-indigo-300'
              }`}
            >
              {v === 'grid' ? 'Cuadrícula' : 'Lista'}
            </button>
          ))}
        </div>
      </div>

      {/* Columnas (solo en grid) */}
      {layout === 'grid' && (
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">Columnas</label>
          <div className="flex gap-2">
            {([1, 2, 3] as const).map(n => (
              <button key={n} onClick={() => onChange({ ...content, columns: n })}
                className={`flex-1 py-2 text-sm font-semibold rounded-lg border transition-all ${
                  columns === n ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-gray-600 border-gray-300 hover:border-indigo-300'
                }`}
              >
                {n}
              </button>
            ))}
          </div>
        </div>
      )}

      <hr className="border-gray-100" />

      {/* Testimonios */}
      <div className="space-y-3">
        <p className="text-sm font-semibold text-gray-700">{content.items.length} testimonio{content.items.length !== 1 ? 's' : ''}</p>

        {content.items.map((item, idx) => (
          <div key={idx} className="bg-gray-50 rounded-xl p-4 space-y-3 border border-gray-100">
            {/* Header del testimonio */}
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-gray-500 uppercase tracking-wide">#{idx + 1}</span>
              {content.items.length > 1 && (
                <button onClick={() => removeItem(idx)} className="text-xs text-red-400 hover:text-red-600 font-medium">
                  Eliminar
                </button>
              )}
            </div>

            {/* Avatar */}
            <div className="flex items-center gap-3">
              <div className="relative w-14 h-14 rounded-full bg-gray-200 overflow-hidden flex-shrink-0">
                {item.avatar ? (
                  <img src={item.avatar} alt={item.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-6 h-6">
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                      <circle cx="12" cy="7" r="4"/>
                    </svg>
                  </div>
                )}
                {uploading === idx && (
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                    <svg className="w-4 h-4 text-white animate-spin" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                    </svg>
                  </div>
                )}
              </div>
              <div className="flex-1 space-y-1.5">
                <label className="flex items-center gap-2 text-xs font-medium text-gray-500 cursor-pointer hover:text-indigo-600 transition-colors">
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    className="hidden"
                    onChange={e => { const f = e.target.files?.[0]; if (f) void handleImageUpload(idx, f); e.target.value = '' }}
                  />
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-3.5 h-3.5">
                    <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="17,8 12,3 7,8"/><line x1="12" y1="3" x2="12" y2="15"/>
                  </svg>
                  {item.avatar ? 'Cambiar foto' : 'Subir foto'}
                </label>
                {item.avatar && (
                  <button onClick={() => updateItem(idx, 'avatar', '')} className="text-xs text-red-400 hover:text-red-600 block">
                    Quitar foto
                  </button>
                )}
              </div>
            </div>

            {/* Nombre y rol */}
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <label className="text-xs font-medium text-gray-600">Nombre</label>
                <input
                  value={item.name}
                  onChange={e => updateItem(idx, 'name', e.target.value)}
                  placeholder="María García"
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-gray-600">Cargo / rol</label>
                <input
                  value={item.role ?? ''}
                  onChange={e => updateItem(idx, 'role', e.target.value)}
                  placeholder="CEO, Cliente…"
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            {/* Calificación */}
            <div className="space-y-1">
              <label className="text-xs font-medium text-gray-600">Calificación</label>
              <div className="flex gap-1.5">
                {[1,2,3,4,5].map(star => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => updateItem(idx, 'rating', star)}
                    className="transition-transform hover:scale-110"
                  >
                    <svg viewBox="0 0 20 20" fill={(item.rating ?? 5) >= star ? '#FBBF24' : '#E5E7EB'} className="w-6 h-6">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                    </svg>
                  </button>
                ))}
              </div>
            </div>

            {/* Texto */}
            <div className="space-y-1">
              <label className="text-xs font-medium text-gray-600">Testimonio</label>
              <textarea
                value={item.text}
                onChange={e => updateItem(idx, 'text', e.target.value)}
                rows={3}
                placeholder="¿Qué dijo este cliente?"
                className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
              />
            </div>
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={addItem}
        className="w-full py-2.5 text-sm font-semibold text-indigo-600 border-2 border-dashed border-indigo-200 rounded-xl hover:bg-indigo-50 hover:border-indigo-300 transition-all"
      >
        + Agregar testimonio
      </button>
    </div>
  )
}
