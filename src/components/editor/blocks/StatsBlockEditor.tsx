'use client'

import { useState } from 'react'
import type { StatsContent, StatItem } from '@/domain/landing/block.types'

type Props = { content: StatsContent; onChange: (c: StatsContent) => void }

function nanoid6() { return Math.random().toString(36).slice(2, 8) }

export function StatsBlockEditor({ content, onChange }: Props) {
  const [openIdx, setOpenIdx] = useState<number | null>(null)

  function set<K extends keyof StatsContent>(key: K, value: StatsContent[K]) {
    onChange({ ...content, [key]: value })
  }

  function addItem() {
    const item: StatItem = { id: `st-${nanoid6()}`, value: '100+', label: 'Descripción' }
    onChange({ ...content, items: [...content.items, item] })
    setOpenIdx(content.items.length)
  }

  function updateItem(idx: number, patch: Partial<StatItem>) {
    onChange({ ...content, items: content.items.map((it, i) => i === idx ? { ...it, ...patch } : it) })
  }

  function removeItem(idx: number) {
    onChange({ ...content, items: content.items.filter((_, i) => i !== idx) })
    setOpenIdx(null)
  }

  return (
    <div className="space-y-4">
      {/* Heading */}
      <div className="space-y-2">
        <div>
          <label className="text-[11px] font-medium text-gray-500">Título (opcional)</label>
          <input value={content.title ?? ''} onChange={e => set('title', e.target.value || undefined)}
            className="w-full mt-0.5 px-2.5 py-1.5 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
            placeholder="Números que nos respaldan" />
        </div>
        <div>
          <label className="text-[11px] font-medium text-gray-500">Subtítulo (opcional)</label>
          <input value={content.subtitle ?? ''} onChange={e => set('subtitle', e.target.value || undefined)}
            className="w-full mt-0.5 px-2.5 py-1.5 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
            placeholder="Confían en nosotros..." />
        </div>
      </div>

      <hr className="border-gray-100" />

      {/* Items */}
      <div className="space-y-2">
        <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Estadísticas</p>
        <div className="space-y-1.5">
          {content.items.map((item, idx) => (
            <div key={item.id} className="rounded-xl border border-gray-200 overflow-hidden">
              <button type="button" onClick={() => setOpenIdx(openIdx === idx ? null : idx)}
                className="w-full flex items-center gap-3 px-3 py-2 text-left hover:bg-gray-50">
                <span className="text-lg leading-none">{item.icon ?? '📊'}</span>
                <div className="flex-1 min-w-0">
                  <span className="text-sm font-black" style={{ color: item.color ?? content.accentColor }}>{item.value}</span>
                  <span className="text-xs text-gray-500 ml-2 truncate">{item.label}</span>
                </div>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
                  className={`w-3.5 h-3.5 text-gray-400 flex-shrink-0 transition-transform ${openIdx === idx ? 'rotate-180' : ''}`}>
                  <polyline points="6 9 12 15 18 9"/>
                </svg>
              </button>

              {openIdx === idx && (
                <div className="px-3 pb-3 pt-2 space-y-2 border-t border-gray-100">
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[11px] font-medium text-gray-500">Valor</label>
                      <input value={item.value} onChange={e => updateItem(idx, { value: e.target.value })}
                        className="w-full mt-0.5 px-2.5 py-1.5 text-sm font-black border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
                        placeholder="+10,000" />
                    </div>
                    <div>
                      <label className="text-[11px] font-medium text-gray-500">Ícono (emoji)</label>
                      <input value={item.icon ?? ''} onChange={e => updateItem(idx, { icon: e.target.value || undefined })}
                        className="w-full mt-0.5 px-2.5 py-1.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
                        placeholder="⭐" />
                    </div>
                  </div>
                  <div>
                    <label className="text-[11px] font-medium text-gray-500">Descripción</label>
                    <input value={item.label} onChange={e => updateItem(idx, { label: e.target.value })}
                      className="w-full mt-0.5 px-2.5 py-1.5 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      placeholder="clientes satisfechos" />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <label className="text-[11px] font-medium text-gray-500">Color acento</label>
                      <input type="color" value={item.color ?? content.accentColor}
                        onChange={e => updateItem(idx, { color: e.target.value })}
                        className="w-7 h-7 rounded-lg cursor-pointer border border-gray-200" />
                      {item.color && (
                        <button type="button" onClick={() => updateItem(idx, { color: undefined })}
                          className="text-[10px] text-gray-400 hover:text-red-500">quitar</button>
                      )}
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
          + Agregar estadística
        </button>
      </div>

      <hr className="border-gray-100" />

      {/* Layout */}
      <div className="space-y-3">
        <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Estilo</p>

        <div>
          <label className="text-[11px] font-medium text-gray-500 block mb-1.5">Disposición</label>
          <div className="flex gap-1.5">
            {([
              { value: 'row',    label: 'Fila' },
              { value: 'grid-2', label: 'Grid 2×2' },
              { value: 'grid-4', label: 'Grid 1×4' },
            ] as { value: StatsContent['layout']; label: string }[]).map(opt => (
              <button key={opt.value} type="button" onClick={() => set('layout', opt.value)}
                className={`flex-1 py-1.5 text-xs font-semibold rounded-lg border transition-all ${
                  content.layout === opt.value ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-gray-600 border-gray-200 hover:border-indigo-300'
                }`}>{opt.label}</button>
            ))}
          </div>
        </div>

        <div>
          <label className="text-[11px] font-medium text-gray-500 block mb-1.5">Estilo de tarjeta</label>
          <div className="grid grid-cols-2 gap-1.5">
            {([
              { value: 'minimal',  label: 'Minimal',   desc: 'Solo texto' },
              { value: 'card',     label: 'Card',      desc: 'Fondo blanco' },
              { value: 'bordered', label: 'Borde',     desc: 'Con borde color' },
              { value: 'colored',  label: 'Colorido',  desc: 'Fondo de color' },
            ] as { value: StatsContent['cardStyle']; label: string; desc: string }[]).map(opt => (
              <button key={opt.value} type="button" onClick={() => set('cardStyle', opt.value)}
                className={`py-2 px-3 text-left rounded-xl border transition-all ${
                  content.cardStyle === opt.value ? 'bg-indigo-50 border-indigo-500 text-indigo-700' : 'bg-white border-gray-200 text-gray-600 hover:border-indigo-300'
                }`}>
                <p className="text-xs font-semibold">{opt.label}</p>
                <p className="text-[10px] opacity-60">{opt.desc}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Colors */}
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

        <label className="flex items-center justify-between cursor-pointer">
          <span className="text-xs font-medium text-gray-700">Animación al entrar (count-up)</span>
          <button type="button" onClick={() => set('animate', !content.animate)}
            className={`relative w-10 h-5 rounded-full transition-colors ${content.animate ? 'bg-indigo-600' : 'bg-gray-300'}`}>
            <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow-sm transition-transform ${content.animate ? 'translate-x-5' : 'translate-x-0.5'}`} />
          </button>
        </label>
      </div>
    </div>
  )
}
