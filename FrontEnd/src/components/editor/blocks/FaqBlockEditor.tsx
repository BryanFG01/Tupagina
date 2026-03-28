'use client'

import { useState } from 'react'
import type { FaqContent, FaqItem } from '@/domain/landing/block.types'
import { Input } from '@/components/ui/Input'

type Props = { content: FaqContent; onChange: (c: FaqContent) => void }

const ACCENT_PRESETS = [
  '#6366f1', '#3b82f6', '#10b981', '#f59e0b',
  '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6',
]

function nanoid6() {
  return Math.random().toString(36).slice(2, 8)
}

export function FaqBlockEditor({ content, onChange }: Props) {
  const [openIdx, setOpenIdx] = useState<number | null>(null)

  function updateItem(idx: number, field: keyof FaqItem, value: string | boolean) {
    const items = content.items.map((item, i) => i === idx ? { ...item, [field]: value } : item)
    onChange({ ...content, items })
  }

  function addItem() {
    const newItem: FaqItem = {
      id:       `faq-${nanoid6()}`,
      question: '¿Nueva pregunta?',
      answer:   'Escribe aquí la respuesta.',
      color:    ACCENT_PRESETS[content.items.length % ACCENT_PRESETS.length],
    }
    onChange({ ...content, items: [...content.items, newItem] })
    setOpenIdx(content.items.length)
  }

  function removeItem(idx: number) {
    onChange({ ...content, items: content.items.filter((_, i) => i !== idx) })
    setOpenIdx(null)
  }

  function moveItem(idx: number, dir: -1 | 1) {
    const items = [...content.items]
    const target = idx + dir
    if (target < 0 || target >= items.length) return
    const a = items[idx]
    const b = items[target]
    if (!a || !b) return
    items[idx]     = b
    items[target]  = a
    onChange({ ...content, items })
  }

  return (
    <div className="space-y-4">
      <Input
        label="Título"
        value={content.title}
        onChange={e => onChange({ ...content, title: e.target.value })}
        placeholder="Preguntas frecuentes"
      />
      <Input
        label="Subtítulo"
        value={content.subtitle ?? ''}
        onChange={e => onChange({ ...content, subtitle: e.target.value })}
        placeholder="Todo lo que necesitas saber"
      />

      {/* Opción: abrir múltiples */}
      <label className="flex items-center justify-between py-2 cursor-pointer">
        <div>
          <p className="text-sm font-medium text-gray-700">Abrir varios a la vez</p>
          <p className="text-[11px] text-gray-400">Si está off, solo uno permanece abierto</p>
        </div>
        <button
          type="button"
          onClick={() => onChange({ ...content, allowMultiple: !(content.allowMultiple ?? false) })}
          className={`relative w-10 h-5 rounded-full transition-colors ${content.allowMultiple ? 'bg-indigo-600' : 'bg-gray-300'}`}
        >
          <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow-sm transition-transform ${content.allowMultiple ? 'translate-x-5' : 'translate-x-0.5'}`} />
        </button>
      </label>

      <hr className="border-gray-100" />
      <p className="text-sm font-semibold text-gray-700">{content.items.length} pregunta{content.items.length !== 1 ? 's' : ''}</p>

      {/* Lista de items */}
      <div className="space-y-2">
        {content.items.map((item, idx) => {
          const isOpen = openIdx === idx
          return (
            <div key={item.id} className="rounded-xl border overflow-hidden" style={{ borderLeftWidth: '3px', borderLeftColor: item.color ?? '#6366f1', borderColor: '#e5e7eb' }}>

              {/* Header del item */}
              <button
                type="button"
                onClick={() => setOpenIdx(isOpen ? null : idx)}
                className="w-full flex items-center gap-2 px-3 py-2.5 text-left hover:bg-gray-50 transition-colors"
              >
                <span
                  className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black flex-shrink-0"
                  style={{ backgroundColor: `${item.color ?? '#6366f1'}18`, color: item.color ?? '#6366f1' }}
                >
                  {idx + 1}
                </span>
                <span className="text-sm font-medium text-gray-700 flex-1 truncate">{item.question || 'Sin pregunta'}</span>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
                  className={`w-4 h-4 text-gray-400 flex-shrink-0 transition-transform ${isOpen ? 'rotate-180' : ''}`}>
                  <polyline points="6 9 12 15 18 9"/>
                </svg>
              </button>

              {/* Contenido editable */}
              {isOpen && (
                <div className="px-3 pb-3 space-y-3 border-t border-gray-100 pt-3">

                  {/* Pregunta */}
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-gray-500">Pregunta</label>
                    <input
                      value={item.question}
                      onChange={e => updateItem(idx, 'question', e.target.value)}
                      className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      placeholder="¿Cuánto tarda el envío?"
                    />
                  </div>

                  {/* Respuesta */}
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-gray-500">Respuesta</label>
                    <textarea
                      value={item.answer}
                      onChange={e => updateItem(idx, 'answer', e.target.value)}
                      rows={3}
                      className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                      placeholder="Escribe la respuesta aquí…"
                    />
                  </div>

                  {/* Color del acento */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-gray-500">Color</label>
                    <div className="flex items-center gap-2 flex-wrap">
                      {ACCENT_PRESETS.map(c => (
                        <button
                          key={c}
                          type="button"
                          onClick={() => updateItem(idx, 'color', c)}
                          className={`w-6 h-6 rounded-full border-2 transition-transform hover:scale-110 ${
                            (item.color ?? '#6366f1') === c ? 'border-gray-700 scale-110' : 'border-transparent'
                          }`}
                          style={{ backgroundColor: c }}
                        />
                      ))}
                      {/* Custom color */}
                      <label className="w-6 h-6 rounded-full border-2 border-dashed border-gray-300 flex items-center justify-center cursor-pointer hover:border-gray-400 overflow-hidden" title="Color personalizado">
                        <input type="color" value={item.color ?? '#6366f1'} onChange={e => updateItem(idx, 'color', e.target.value)} className="opacity-0 absolute w-0 h-0" />
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-3 h-3 text-gray-400">
                          <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/>
                        </svg>
                      </label>
                    </div>
                  </div>

                  {/* Acciones */}
                  <div className="flex items-center justify-between pt-1">
                    <div className="flex gap-1">
                      <button type="button" onClick={() => moveItem(idx, -1)} disabled={idx === 0}
                        className="p-1.5 text-gray-400 hover:text-gray-700 disabled:opacity-30 rounded-lg hover:bg-gray-100 transition-colors" title="Subir">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><polyline points="18 15 12 9 6 15"/></svg>
                      </button>
                      <button type="button" onClick={() => moveItem(idx, 1)} disabled={idx === content.items.length - 1}
                        className="p-1.5 text-gray-400 hover:text-gray-700 disabled:opacity-30 rounded-lg hover:bg-gray-100 transition-colors" title="Bajar">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><polyline points="6 9 12 15 18 9"/></svg>
                      </button>
                    </div>
                    {content.items.length > 1 && (
                      <button type="button" onClick={() => removeItem(idx)} className="text-xs text-red-400 hover:text-red-600 font-medium px-2 py-1 rounded-lg hover:bg-red-50 transition-colors">
                        Eliminar
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>

      <button
        type="button"
        onClick={addItem}
        className="w-full py-2.5 text-sm font-semibold text-indigo-600 border-2 border-dashed border-indigo-200 rounded-xl hover:bg-indigo-50 hover:border-indigo-300 transition-all"
      >
        + Agregar pregunta
      </button>
    </div>
  )
}
