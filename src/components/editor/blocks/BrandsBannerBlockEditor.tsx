'use client'

import { useState } from 'react'
import type { BrandsBannerContent, BrandItem } from '@/domain/landing/block.types'

type Props = {
  content: BrandsBannerContent
  onChange: (c: BrandsBannerContent) => void
}

function nanoid6() { return Math.random().toString(36).slice(2, 8) }

export function BrandsBannerBlockEditor({ content, onChange }: Props) {
  const [openIdx, setOpenIdx] = useState<number | null>(null)

  function set<K extends keyof BrandsBannerContent>(key: K, value: BrandsBannerContent[K]) {
    onChange({ ...content, [key]: value })
  }

  function addItem(type: BrandItem['type']) {
    const item: BrandItem = {
      id: `br-${nanoid6()}`,
      type,
      text: type === 'text' ? 'MI MARCA' : 'Logo',
    }
    onChange({ ...content, items: [...content.items, item] })
    setOpenIdx(content.items.length)
  }

  function updateItem(idx: number, patch: Partial<BrandItem>) {
    const items = content.items.map((it, i) => i === idx ? { ...it, ...patch } : it)
    onChange({ ...content, items })
  }

  function removeItem(idx: number) {
    onChange({ ...content, items: content.items.filter((_, i) => i !== idx) })
    setOpenIdx(null)
  }

  function moveItem(idx: number, dir: -1 | 1) {
    const items = [...content.items]
    const target = idx + dir
    if (target < 0 || target >= items.length) return
    const a = items[idx]!
    const b = items[target]!
    items[idx] = b; items[target] = a
    onChange({ ...content, items })
  }

  return (
    <div className="space-y-5">

      {/* ── Items ── */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Marcas / Logos</p>
          <span className="text-[10px] text-gray-400">{content.items.length} items</span>
        </div>

        <div className="space-y-1.5">
          {content.items.map((item, idx) => (
            <div key={item.id} className="rounded-xl border border-gray-200 overflow-hidden">
              <button
                type="button"
                onClick={() => setOpenIdx(openIdx === idx ? null : idx)}
                className="w-full flex items-center gap-2 px-3 py-2 text-left hover:bg-gray-50 transition-colors"
              >
                {/* Mini preview */}
                {item.type === 'image' && item.imageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={item.imageUrl} alt={item.text} className="h-5 w-auto object-contain flex-shrink-0" />
                ) : (
                  <span
                    className="text-xs font-black tracking-widest uppercase flex-shrink-0"
                    style={{ color: item.color ?? content.textColor }}
                  >
                    {item.text || 'Sin texto'}
                  </span>
                )}
                <span className="flex-1" />
                <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${
                  item.type === 'image' ? 'bg-blue-50 text-blue-600' : 'bg-gray-100 text-gray-500'
                }`}>
                  {item.type === 'image' ? 'img' : 'texto'}
                </span>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
                  className={`w-3.5 h-3.5 text-gray-400 transition-transform flex-shrink-0 ${openIdx === idx ? 'rotate-180' : ''}`}>
                  <polyline points="6 9 12 15 18 9"/>
                </svg>
              </button>

              {openIdx === idx && (
                <div className="px-3 pb-3 pt-2 space-y-2.5 border-t border-gray-100">

                  {/* Type toggle */}
                  <div className="flex gap-1.5">
                    {(['text', 'image'] as const).map(t => (
                      <button
                        key={t}
                        type="button"
                        onClick={() => updateItem(idx, { type: t })}
                        className={`flex-1 py-1.5 text-xs font-semibold rounded-lg border transition-all ${
                          item.type === t
                            ? 'bg-indigo-600 text-white border-indigo-600'
                            : 'bg-white text-gray-600 border-gray-200 hover:border-indigo-300'
                        }`}
                      >
                        {t === 'text' ? '🔤 Texto' : '🖼 Imagen'}
                      </button>
                    ))}
                  </div>

                  {item.type === 'text' ? (
                    <div>
                      <label className="text-[11px] font-medium text-gray-500">Nombre de la marca</label>
                      <input
                        value={item.text}
                        onChange={e => updateItem(idx, { text: e.target.value })}
                        className="w-full mt-0.5 px-2.5 py-1.5 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500 uppercase font-bold tracking-widest"
                        placeholder="MI MARCA"
                      />
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <div>
                        <label className="text-[11px] font-medium text-gray-500">URL de la imagen / logo</label>
                        <input
                          value={item.imageUrl ?? ''}
                          onChange={e => updateItem(idx, { imageUrl: e.target.value })}
                          className="w-full mt-0.5 px-2.5 py-1.5 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500 font-mono"
                          placeholder="https://..."
                        />
                      </div>
                      <div>
                        <label className="text-[11px] font-medium text-gray-500">Texto alternativo</label>
                        <input
                          value={item.text}
                          onChange={e => updateItem(idx, { text: e.target.value })}
                          className="w-full mt-0.5 px-2.5 py-1.5 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
                          placeholder="Nombre del logo"
                        />
                      </div>
                    </div>
                  )}

                  {/* Color override */}
                  {item.type === 'text' && (
                    <div className="flex items-center gap-2">
                      <label className="text-[11px] font-medium text-gray-500 flex-1">Color personalizado</label>
                      <input
                        type="color"
                        value={item.color ?? content.textColor}
                        onChange={e => updateItem(idx, { color: e.target.value })}
                        className="w-7 h-7 rounded-lg border border-gray-200 cursor-pointer"
                      />
                      {item.color && (
                        <button type="button" onClick={() => updateItem(idx, { color: undefined })}
                          className="text-[10px] text-gray-400 hover:text-red-500">quitar</button>
                      )}
                    </div>
                  )}

                  {/* Move / delete */}
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

        <div className="flex gap-2">
          <button type="button" onClick={() => addItem('text')}
            className="flex-1 py-2 text-xs font-semibold text-indigo-600 border-2 border-dashed border-indigo-200 rounded-xl hover:bg-indigo-50 transition-all">
            + Texto / Marca
          </button>
          <button type="button" onClick={() => addItem('image')}
            className="flex-1 py-2 text-xs font-semibold text-blue-600 border-2 border-dashed border-blue-200 rounded-xl hover:bg-blue-50 transition-all">
            + Logo (imagen)
          </button>
        </div>
      </div>

      <hr className="border-gray-100" />

      {/* ── Animación ── */}
      <div className="space-y-3">
        <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Animación</p>

        {/* Speed */}
        <div>
          <label className="text-[11px] font-medium text-gray-500 block mb-1.5">Velocidad</label>
          <div className="flex gap-1.5">
            {([
              { value: 'slow', label: '🐢 Lento' },
              { value: 'normal', label: '🚶 Normal' },
              { value: 'fast', label: '🏃 Rápido' },
            ] as { value: BrandsBannerContent['speed']; label: string }[]).map(opt => (
              <button key={opt.value} type="button" onClick={() => set('speed', opt.value)}
                className={`flex-1 py-1.5 text-xs font-semibold rounded-lg border transition-all ${
                  content.speed === opt.value
                    ? 'bg-indigo-600 text-white border-indigo-600'
                    : 'bg-white text-gray-600 border-gray-200 hover:border-indigo-300'
                }`}>
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Direction */}
        <div>
          <label className="text-[11px] font-medium text-gray-500 block mb-1.5">Dirección</label>
          <div className="flex gap-1.5">
            <button type="button" onClick={() => set('direction', 'left')}
              className={`flex-1 py-1.5 text-xs font-semibold rounded-lg border transition-all flex items-center justify-center gap-1 ${
                content.direction === 'left'
                  ? 'bg-indigo-600 text-white border-indigo-600'
                  : 'bg-white text-gray-600 border-gray-200 hover:border-indigo-300'
              }`}>
              ← Izquierda
            </button>
            <button type="button" onClick={() => set('direction', 'right')}
              className={`flex-1 py-1.5 text-xs font-semibold rounded-lg border transition-all flex items-center justify-center gap-1 ${
                content.direction === 'right'
                  ? 'bg-indigo-600 text-white border-indigo-600'
                  : 'bg-white text-gray-600 border-gray-200 hover:border-indigo-300'
              }`}>
              → Derecha
            </button>
          </div>
        </div>

        {/* Pause on hover */}
        <label className="flex items-center justify-between cursor-pointer">
          <span className="text-xs font-medium text-gray-700">Pausar al pasar el cursor</span>
          <button type="button" onClick={() => set('pauseOnHover', !content.pauseOnHover)}
            className={`relative w-10 h-5 rounded-full transition-colors ${content.pauseOnHover ? 'bg-indigo-600' : 'bg-gray-300'}`}>
            <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow-sm transition-transform ${content.pauseOnHover ? 'translate-x-5' : 'translate-x-0.5'}`} />
          </button>
        </label>
      </div>

      <hr className="border-gray-100" />

      {/* ── Estilo ── */}
      <div className="space-y-3">
        <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Estilo</p>

        {/* Colors */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-[11px] font-medium text-gray-500 block mb-1.5">Fondo</label>
            <div className="flex items-center gap-2">
              <input type="color" value={content.backgroundColor}
                onChange={e => set('backgroundColor', e.target.value)}
                className="w-9 h-9 rounded-lg cursor-pointer border border-gray-300 p-0.5" />
              <span className="text-[10px] text-gray-400 font-mono">{content.backgroundColor}</span>
            </div>
          </div>
          <div>
            <label className="text-[11px] font-medium text-gray-500 block mb-1.5">Texto</label>
            <div className="flex items-center gap-2">
              <input type="color" value={content.textColor}
                onChange={e => set('textColor', e.target.value)}
                className="w-9 h-9 rounded-lg cursor-pointer border border-gray-300 p-0.5" />
              <span className="text-[10px] text-gray-400 font-mono">{content.textColor}</span>
            </div>
          </div>
        </div>

        {/* Preset combos */}
        <div className="flex flex-wrap gap-1.5">
          {[
            { label: 'Blanco', bg: '#ffffff', text: '#111827' },
            { label: 'Negro',  bg: '#111827', text: '#ffffff' },
            { label: 'Gris',   bg: '#f3f4f6', text: '#374151' },
            { label: 'Índigo', bg: '#4338CA', text: '#ffffff' },
            { label: 'Crema',  bg: '#fef9f0', text: '#78350f' },
          ].map(p => (
            <button key={p.label} type="button"
              onClick={() => onChange({ ...content, backgroundColor: p.bg, textColor: p.text })}
              className="px-2.5 py-1 text-[10px] font-semibold rounded-lg border border-gray-200 hover:border-indigo-300 transition-colors"
              style={{ backgroundColor: p.bg, color: p.text, borderColor: p.bg === '#ffffff' ? '#e5e7eb' : p.bg }}>
              {p.label}
            </button>
          ))}
        </div>

        {/* Font size */}
        <div>
          <label className="text-[11px] font-medium text-gray-500 block mb-1.5">Tamaño de texto</label>
          <div className="flex gap-1.5">
            {(['xs', 'sm', 'md', 'lg'] as const).map(s => (
              <button key={s} type="button" onClick={() => set('fontSize', s)}
                className={`flex-1 py-1.5 text-xs font-bold rounded-lg border uppercase transition-all ${
                  content.fontSize === s
                    ? 'bg-indigo-600 text-white border-indigo-600'
                    : 'bg-white text-gray-600 border-gray-200 hover:border-indigo-300'
                }`}>{s}</button>
            ))}
          </div>
        </div>

        {/* Font weight */}
        <div>
          <label className="text-[11px] font-medium text-gray-500 block mb-1.5">Grosor</label>
          <div className="flex gap-1.5">
            {([
              { value: 'normal', label: 'Normal' },
              { value: 'bold', label: 'Bold' },
              { value: 'black', label: 'Black' },
            ] as { value: BrandsBannerContent['fontWeight']; label: string }[]).map(opt => (
              <button key={opt.value} type="button" onClick={() => set('fontWeight', opt.value)}
                className={`flex-1 py-1.5 text-xs rounded-lg border transition-all ${
                  content.fontWeight === opt.value
                    ? 'bg-indigo-600 text-white border-indigo-600'
                    : 'bg-white text-gray-600 border-gray-200 hover:border-indigo-300'
                }`} style={{ fontWeight: opt.value === 'black' ? 900 : opt.value }}>
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Separator */}
        <div>
          <label className="text-[11px] font-medium text-gray-500 block mb-1.5">Separador entre items</label>
          <div className="flex gap-1.5">
            {([
              { value: 'none',  label: 'Ninguno' },
              { value: 'dot',   label: '●' },
              { value: 'line',  label: '|' },
              { value: 'slash', label: '/' },
            ] as { value: BrandsBannerContent['separator']; label: string }[]).map(opt => (
              <button key={opt.value} type="button" onClick={() => set('separator', opt.value)}
                className={`flex-1 py-1.5 text-xs font-semibold rounded-lg border transition-all ${
                  content.separator === opt.value
                    ? 'bg-indigo-600 text-white border-indigo-600'
                    : 'bg-white text-gray-600 border-gray-200 hover:border-indigo-300'
                }`}>{opt.label}</button>
            ))}
          </div>
        </div>

        {/* Toggles */}
        <div className="space-y-2">
          <label className="flex items-center justify-between cursor-pointer">
            <span className="text-xs font-medium text-gray-700">Texto en mayúsculas</span>
            <button type="button" onClick={() => set('uppercase', !content.uppercase)}
              className={`relative w-10 h-5 rounded-full transition-colors ${content.uppercase ? 'bg-indigo-600' : 'bg-gray-300'}`}>
              <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow-sm transition-transform ${content.uppercase ? 'translate-x-5' : 'translate-x-0.5'}`} />
            </button>
          </label>
          <label className="flex items-center justify-between cursor-pointer">
            <span className="text-xs font-medium text-gray-700">Espaciado amplio (tracking)</span>
            <button type="button" onClick={() => set('letterSpacing', !content.letterSpacing)}
              className={`relative w-10 h-5 rounded-full transition-colors ${content.letterSpacing ? 'bg-indigo-600' : 'bg-gray-300'}`}>
              <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow-sm transition-transform ${content.letterSpacing ? 'translate-x-5' : 'translate-x-0.5'}`} />
            </button>
          </label>
        </div>

        {/* Optional label */}
        <div>
          <label className="text-[11px] font-medium text-gray-500 block mb-1">Etiqueta superior (opcional)</label>
          <input
            value={content.label ?? ''}
            onChange={e => set('label', e.target.value || undefined)}
            className="w-full px-2.5 py-1.5 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
            placeholder="Ej: Nuestras marcas · Trusted by · Partners"
          />
        </div>
      </div>

    </div>
  )
}
