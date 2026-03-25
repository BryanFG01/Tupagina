'use client'

import { useState } from 'react'
import type { FeaturesContent, FeatureItem } from '@/domain/landing/block.types'

type Props = { content: FeaturesContent; onChange: (c: FeaturesContent) => void }

function nanoid6() { return Math.random().toString(36).slice(2, 8) }

const QUICK_EMOJIS = [
  '✨','🔥','⚡','🎯','🏆','💡','🌈','❤️','⭐','🚀',
  '🛒','🏪','🛍️','💳','🚚','📦','💰','🏷️','💎','🎁',
  '🔧','✂️','💇','🎨','🖥️','📱','🚗','🏋️','🎓','🏥',
  '🍕','🍔','🥗','☕','🍰','🌮','🍣','🥤','🍎','🌿',
  '🐾','🌺','🌙','☀️','🎵','📸','🏡','✈️','⚽','🎪',
]

const LAYOUTS: { value: FeaturesContent['layout']; label: string; desc: string }[] = [
  { value: 'card',       label: '🃏 Cards',      desc: 'Tarjetas con sombra' },
  { value: 'minimal',    label: '✦ Minimal',    desc: 'Sin fondo, limpio' },
  { value: 'centered',   label: '⊙ Centrado',   desc: 'Todo al centro' },
  { value: 'horizontal', label: '↔ Horizontal', desc: 'Img + texto alternos' },
]

export function FeaturesBlockEditor({ content, onChange }: Props) {
  const [openIdx, setOpenIdx]     = useState<number | null>(null)
  const [pickerIdx, setPickerIdx] = useState<number | null>(null)

  function set<K extends keyof FeaturesContent>(key: K, value: FeaturesContent[K]) {
    onChange({ ...content, [key]: value })
  }

  function addItem() {
    const item: FeatureItem = { id: `ft-${nanoid6()}`, title: 'Beneficio', description: 'Descripción del beneficio.', icon: '✨' }
    onChange({ ...content, items: [...content.items, item] })
    setOpenIdx(content.items.length)
  }

  function updateItem(idx: number, patch: Partial<FeatureItem>) {
    onChange({ ...content, items: content.items.map((it, i) => i === idx ? { ...it, ...patch } : it) })
  }

  function removeItem(idx: number) {
    onChange({ ...content, items: content.items.filter((_, i) => i !== idx) })
    setOpenIdx(null)
  }

  function moveItem(idx: number, dir: -1 | 1) {
    const items = [...content.items]
    const t = idx + dir
    if (t < 0 || t >= items.length) return
    const a = items[idx]!; const b = items[t]!
    items[idx] = b; items[t] = a
    onChange({ ...content, items })
  }

  return (
    <div className="space-y-4">

      {/* Heading */}
      <div className="space-y-2">
        <div>
          <label className="text-[11px] font-medium text-gray-500">Título (opcional)</label>
          <input value={content.title ?? ''} onChange={e => set('title', e.target.value || undefined)}
            className="w-full mt-0.5 px-2.5 py-1.5 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
            placeholder="Todo lo que necesitas" />
        </div>
        <div>
          <label className="text-[11px] font-medium text-gray-500">Subtítulo</label>
          <input value={content.subtitle ?? ''} onChange={e => set('subtitle', e.target.value || undefined)}
            className="w-full mt-0.5 px-2.5 py-1.5 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
            placeholder="Diseñado para hacer tu vida más fácil" />
        </div>
      </div>

      <hr className="border-gray-100" />

      {/* Items */}
      <div className="space-y-2">
        <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Features / Beneficios</p>
        <div className="space-y-1.5">
          {content.items.map((item, idx) => (
            <div key={item.id} className="rounded-xl border border-gray-200 overflow-hidden">
              <button type="button" onClick={() => setOpenIdx(openIdx === idx ? null : idx)}
                className="w-full flex items-center gap-2 px-3 py-2 text-left hover:bg-gray-50">
                {item.image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={item.image} alt={item.title} className="w-8 h-8 object-cover rounded-lg flex-shrink-0" />
                ) : (
                  <span className="text-xl flex-shrink-0">{item.icon ?? '✨'}</span>
                )}
                <span className="text-xs font-semibold text-gray-700 flex-1 truncate">{item.title}</span>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
                  className={`w-3.5 h-3.5 text-gray-400 flex-shrink-0 transition-transform ${openIdx === idx ? 'rotate-180' : ''}`}>
                  <polyline points="6 9 12 15 18 9"/>
                </svg>
              </button>

              {openIdx === idx && (
                <div className="px-3 pb-3 pt-2 space-y-2.5 border-t border-gray-100">
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[11px] font-medium text-gray-500">Ícono (emoji)</label>
                      <input value={item.icon ?? ''} onChange={e => updateItem(idx, { icon: e.target.value || undefined })}
                        className="w-full mt-0.5 px-2.5 py-1.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
                        placeholder="🛒" />
                      <button type="button" onClick={() => setPickerIdx(pickerIdx === idx ? null : idx)}
                        className="mt-0.5 text-[10px] text-indigo-500 hover:text-indigo-700 font-medium">
                        {pickerIdx === idx ? '▲ cerrar' : '▼ elegir emoji'}
                      </button>
                    </div>
                    <div>
                      <label className="text-[11px] font-medium text-gray-500">Título</label>
                      <input value={item.title} onChange={e => updateItem(idx, { title: e.target.value })}
                        className="w-full mt-0.5 px-2.5 py-1.5 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
                        placeholder="Título del feature" />
                    </div>
                  </div>
                  {pickerIdx === idx && (
                    <div className="flex flex-wrap gap-0.5 p-2 bg-gray-50 rounded-xl border border-gray-100 max-h-[88px] overflow-y-auto -mt-1">
                      {QUICK_EMOJIS.map(e => (
                        <button key={e} type="button"
                          onClick={() => { updateItem(idx, { icon: e }); setPickerIdx(null) }}
                          className="text-lg hover:bg-white rounded-lg w-8 h-8 flex items-center justify-center transition-colors">
                          {e}
                        </button>
                      ))}
                    </div>
                  )}
                  <div>
                    <label className="text-[11px] font-medium text-gray-500">Descripción</label>
                    <textarea value={item.description} onChange={e => updateItem(idx, { description: e.target.value })}
                      rows={2}
                      className="w-full mt-0.5 px-2.5 py-1.5 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500 resize-none"
                      placeholder="Breve descripción del beneficio..." />
                  </div>
                  <div>
                    <label className="text-[11px] font-medium text-gray-500">URL de imagen (opcional)</label>
                    <input value={item.image ?? ''} onChange={e => updateItem(idx, { image: e.target.value || undefined })}
                      className="w-full mt-0.5 px-2.5 py-1.5 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500 font-mono"
                      placeholder="https://..." />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[11px] font-medium text-gray-500">Botón (opcional)</label>
                      <input value={item.ctaText ?? ''} onChange={e => updateItem(idx, { ctaText: e.target.value || undefined })}
                        className="w-full mt-0.5 px-2.5 py-1.5 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
                        placeholder="Saber más" />
                    </div>
                    <div>
                      <label className="text-[11px] font-medium text-gray-500">URL botón</label>
                      <input value={item.ctaUrl ?? ''} onChange={e => updateItem(idx, { ctaUrl: e.target.value || undefined })}
                        className="w-full mt-0.5 px-2.5 py-1.5 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500 font-mono"
                        placeholder="#" />
                    </div>
                  </div>
                  <div className="flex items-center justify-between pt-1 border-t border-gray-100">
                    <div className="flex gap-1">
                      <button type="button" onClick={() => moveItem(idx, -1)} disabled={idx === 0}
                        className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30 rounded hover:bg-gray-100">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-3.5 h-3.5"><polyline points="18 15 12 9 6 15"/></svg>
                      </button>
                      <button type="button" onClick={() => moveItem(idx, 1)} disabled={idx === content.items.length - 1}
                        className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30 rounded hover:bg-gray-100">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-3.5 h-3.5"><polyline points="6 9 12 15 18 9"/></svg>
                      </button>
                    </div>
                    <button type="button" onClick={() => removeItem(idx)}
                      className="text-xs text-red-400 hover:text-red-600 font-medium px-2 py-0.5 rounded hover:bg-red-50">
                      Eliminar
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
        <button type="button" onClick={addItem}
          className="w-full py-2 text-xs font-semibold text-indigo-600 border-2 border-dashed border-indigo-200 rounded-xl hover:bg-indigo-50 transition-all">
          + Agregar feature
        </button>
      </div>

      <hr className="border-gray-100" />

      {/* Style */}
      <div className="space-y-3">
        <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Diseño</p>

        <div>
          <label className="text-[11px] font-medium text-gray-500 block mb-1.5">Layout</label>
          <div className="grid grid-cols-2 gap-1.5">
            {LAYOUTS.map(opt => (
              <button key={opt.value} type="button" onClick={() => set('layout', opt.value)}
                className={`py-2 px-3 text-left rounded-xl border transition-all ${
                  content.layout === opt.value ? 'bg-indigo-50 border-indigo-500 text-indigo-700' : 'bg-white border-gray-200 text-gray-600 hover:border-indigo-300'
                }`}>
                <p className="text-xs font-semibold">{opt.label}</p>
                <p className="text-[10px] opacity-60">{opt.desc}</p>
              </button>
            ))}
          </div>
        </div>

        {content.layout !== 'horizontal' && (
          <div>
            <label className="text-[11px] font-medium text-gray-500 block mb-1.5">Columnas</label>
            <div className="flex gap-1.5">
              {([2, 3, 4] as const).map(n => (
                <button key={n} type="button" onClick={() => set('columns', n)}
                  className={`flex-1 py-1.5 text-xs font-bold rounded-lg border transition-all ${
                    content.columns === n ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-gray-600 border-gray-200 hover:border-indigo-300'
                  }`}>{n} col</button>
              ))}
            </div>
          </div>
        )}

        <div>
          <label className="text-[11px] font-medium text-gray-500 block mb-1.5">Forma de imagen</label>
          <div className="flex gap-1.5 flex-wrap">
            {([
              { value: 'rounded',   label: '▭ Normal' },
              { value: 'landscape', label: '⬛ Paisaje' },
              { value: 'portrait',  label: '▮ Retrato' },
              { value: 'square',    label: '■ Cuadrado' },
              { value: 'circle',    label: '● Círculo' },
            ] as { value: FeaturesContent['imageStyle']; label: string }[]).map(opt => (
              <button key={opt.value} type="button" onClick={() => set('imageStyle', opt.value)}
                className={`flex-1 py-1.5 text-[10px] font-semibold rounded-lg border transition-all min-w-[60px] ${
                  content.imageStyle === opt.value ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-gray-600 border-gray-200 hover:border-indigo-300'
                }`}>{opt.label}</button>
            ))}
          </div>
        </div>

        <div>
          <label className="text-[11px] font-medium text-gray-500 block mb-1.5">Separación</label>
          <div className="flex gap-1.5">
            {(['sm', 'md', 'lg'] as const).map(g => (
              <button key={g} type="button" onClick={() => set('gap', g)}
                className={`flex-1 py-1.5 text-xs font-semibold rounded-lg border uppercase transition-all ${
                  content.gap === g ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-gray-600 border-gray-200 hover:border-indigo-300'
                }`}>{g}</button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2">
          {([
            { key: 'backgroundColor', label: 'Fondo' },
            { key: 'textColor',       label: 'Texto' },
            { key: 'accentColor',     label: 'Acento' },
          ] as { key: 'backgroundColor'|'textColor'|'accentColor'; label: string }[]).map(c => (
            <div key={c.key}>
              <label className="text-[10px] font-medium text-gray-500 block mb-1">{c.label}</label>
              <input type="color" value={content[c.key]}
                onChange={e => set(c.key, e.target.value)}
                className="w-full h-8 rounded-lg cursor-pointer border border-gray-200 p-0.5" />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
