'use client'

import { useState } from 'react'
import type { IconsTickerContent, IconTickerItem, IconTickerBadge, IconTickerBadgePosition } from '@/domain/landing/block.types'

type Props = { content: IconsTickerContent; onChange: (c: IconsTickerContent) => void }

function nanoid6() { return Math.random().toString(36).slice(2, 8) }

const BADGE_PRESETS: { text: string; bg: string; color: string }[] = [
  { text: '$10 OFF', bg: '#FACC15', color: '#1a1a1a' },
  { text: '20% DESC', bg: '#EF4444', color: '#ffffff' },
  { text: 'NUEVO',    bg: '#10B981', color: '#ffffff' },
  { text: 'HOT 🔥',  bg: '#F97316', color: '#ffffff' },
  { text: 'GRATIS',  bg: '#8B5CF6', color: '#ffffff' },
  { text: 'PROMO',   bg: '#3B82F6', color: '#ffffff' },
  { text: '2×1',     bg: '#EC4899', color: '#ffffff' },
  { text: 'AGOTADO', bg: '#6B7280', color: '#ffffff' },
]

const DEFAULT_BADGE: IconTickerBadge = {
  text: '$10 OFF',
  position: 'top-right',
  bg: '#FACC15',
  color: '#1a1a1a',
  shape: 'starburst',
}

const QUICK_EMOJIS = [
  '🏪','🛒','🛍️','💳','🚚','📦','💰','🏷️','💎','🎁',
  '🔧','✂️','💇','🎨','🖥️','📱','🚗','🏋️','🎓','🏥',
  '🍕','🍔','🥗','☕','🍰','🌮','🍣','🥤','🍎','🌿',
  '✨','🔥','⚡','🎯','🏆','💡','🌈','❤️','⭐','🚀',
  '🐾','🐶','🌺','🌙','☀️','🎵','📸','🏡','✈️','⚽',
]

export function IconsTickerBlockEditor({ content, onChange }: Props) {
  const [openIdx, setOpenIdx]     = useState<number | null>(null)
  const [pickerIdx, setPickerIdx] = useState<number | null>(null)

  function set<K extends keyof IconsTickerContent>(key: K, value: IconsTickerContent[K]) {
    onChange({ ...content, [key]: value })
  }

  function addItem() {
    const item: IconTickerItem = { id: `it-${nanoid6()}`, icon: '⭐', iconType: 'emoji', label: 'Categoría', url: '#' }
    onChange({ ...content, items: [...content.items, item] })
    setOpenIdx(content.items.length)
  }

  function updateItem(idx: number, patch: Partial<IconTickerItem>) {
    onChange({ ...content, items: content.items.map((it, i) => i === idx ? { ...it, ...patch } : it) })
  }

  function removeItem(idx: number) {
    onChange({ ...content, items: content.items.filter((_, i) => i !== idx) })
    setOpenIdx(null)
  }

  function moveItem(idx: number, dir: -1 | 1) {
    const arr = [...content.items]
    const t = idx + dir
    if (t < 0 || t >= arr.length) return
    const a = arr[idx]!; const b = arr[t]!
    arr[idx] = b; arr[t] = a
    onChange({ ...content, items: arr })
  }

  return (
    <div className="space-y-4">

      {/* Title */}
      <div>
        <label className="text-[11px] font-medium text-gray-500">Título (opcional)</label>
        <input value={content.title ?? ''} onChange={e => set('title', e.target.value || undefined)}
          className="w-full mt-0.5 px-2.5 py-1.5 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
          placeholder="Nuestras categorías" />
      </div>

      <hr className="border-gray-100" />

      {/* Items */}
      <div className="space-y-2">
        <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Íconos</p>
        <div className="space-y-1.5">
          {content.items.map((item, idx) => (
            <div key={item.id} className="rounded-xl border border-gray-200 overflow-hidden">
              <button type="button" onClick={() => setOpenIdx(openIdx === idx ? null : idx)}
                className="w-full flex items-center gap-2 px-3 py-2 text-left hover:bg-gray-50">
                {item.iconType === 'image' && item.icon.startsWith('http') ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={item.icon} alt={item.label}
                    className="w-7 h-7 object-contain rounded-lg flex-shrink-0 bg-gray-100"
                    onError={e => { (e.currentTarget as HTMLImageElement).style.display = 'none' }} />
                ) : (
                  <span className="text-xl flex-shrink-0">{item.iconType === 'emoji' ? item.icon : '🖼️'}</span>
                )}
                <span className="text-xs font-semibold text-gray-700 flex-1 truncate">{item.label}</span>
                {item.url && <span className="text-[10px] text-gray-400 font-mono truncate max-w-[80px]">{item.url}</span>}
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
                  className={`w-3.5 h-3.5 text-gray-400 flex-shrink-0 transition-transform ${openIdx === idx ? 'rotate-180' : ''}`}>
                  <polyline points="6 9 12 15 18 9"/>
                </svg>
              </button>

              {openIdx === idx && (
                <div className="px-3 pb-3 pt-2 space-y-2.5 border-t border-gray-100">

                  {/* Icon type tabs */}
                  <div className="flex gap-1.5">
                    {(['emoji', 'image'] as const).map(t => (
                      <button key={t} type="button"
                        onClick={() => {
                          if (t === 'image') {
                            // Al pasar a imagen: limpiar si tiene emoji, conservar si ya era URL
                            const newIcon = item.icon.startsWith('http') ? item.icon : ''
                            updateItem(idx, { iconType: 'image', icon: newIcon })
                          } else {
                            // Al pasar a emoji: restaurar emoji si tenía URL
                            const newIcon = !item.icon.startsWith('http') ? item.icon : '⭐'
                            updateItem(idx, { iconType: 'emoji', icon: newIcon })
                          }
                        }}
                        className={`flex-1 py-1 text-[11px] font-semibold rounded-lg border transition-all ${
                          item.iconType === t ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-gray-600 border-gray-200 hover:border-indigo-300'
                        }`}>
                        {t === 'emoji' ? '😀 Emoji' : '🖼️ Imagen URL'}
                      </button>
                    ))}
                  </div>

                  {/* Icon input */}
                  <div>
                    <label className="text-[11px] font-medium text-gray-500">
                      {item.iconType === 'emoji' ? 'Emoji' : 'URL directa de la imagen'}
                    </label>
                    <input
                      value={item.icon}
                      onChange={e => updateItem(idx, { icon: e.target.value })}
                      className="w-full mt-0.5 px-2.5 py-1.5 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500 font-mono"
                      placeholder={item.iconType === 'emoji' ? '🛒' : 'https://ejemplo.com/icono.png'}
                    />

                    {/* Preview de imagen cuando es URL válida */}
                    {item.iconType === 'image' && item.icon.startsWith('http') && (
                      <div className="mt-2 flex items-center gap-3 p-2.5 bg-gray-50 rounded-xl border border-gray-100">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={item.icon}
                          alt={item.label}
                          className="w-12 h-12 object-contain rounded-xl bg-white border border-gray-200 flex-shrink-0"
                          onError={e => {
                            e.currentTarget.style.display = 'none'
                            e.currentTarget.nextElementSibling?.classList.remove('hidden')
                          }}
                        />
                        <div className="hidden flex-shrink-0 w-12 h-12 rounded-xl bg-red-50 border border-red-200 flex items-center justify-center">
                          <span className="text-red-400 text-xs text-center leading-tight px-1">Error al cargar</span>
                        </div>
                        <p className="text-[10px] text-gray-400 leading-relaxed">
                          Vista previa · Usa URLs directas a imágenes (.png, .jpg, .svg)
                        </p>
                      </div>
                    )}

                    {/* Hint cuando está vacío en modo imagen */}
                    {item.iconType === 'image' && !item.icon && (
                      <p className="mt-1 text-[10px] text-amber-600">
                        ⚠ Pega la URL directa a la imagen (no la página web)
                      </p>
                    )}

                    {item.iconType === 'emoji' && (
                      <div className="mt-1">
                        <button type="button"
                          onClick={() => setPickerIdx(pickerIdx === idx ? null : idx)}
                          className="text-[10px] text-indigo-500 hover:text-indigo-700 font-medium">
                          {pickerIdx === idx ? '▲ Cerrar selector' : '▼ Elegir emoji'}
                        </button>
                        {pickerIdx === idx && (
                          <div className="mt-1 flex flex-wrap gap-0.5 p-2 bg-gray-50 rounded-xl border border-gray-100 max-h-[88px] overflow-y-auto">
                            {QUICK_EMOJIS.map(e => (
                              <button key={e} type="button"
                                onClick={() => { updateItem(idx, { icon: e }); setPickerIdx(null) }}
                                className="text-lg hover:bg-white rounded-lg w-8 h-8 flex items-center justify-center transition-colors">
                                {e}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Label */}
                  <div>
                    <label className="text-[11px] font-medium text-gray-500">Etiqueta</label>
                    <input value={item.label} onChange={e => updateItem(idx, { label: e.target.value })}
                      className="w-full mt-0.5 px-2.5 py-1.5 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      placeholder="Nombre de categoría" />
                  </div>

                  {/* URL */}
                  <div>
                    <label className="text-[11px] font-medium text-gray-500">Link (URL)</label>
                    <input value={item.url ?? ''} onChange={e => updateItem(idx, { url: e.target.value || undefined })}
                      className="w-full mt-0.5 px-2.5 py-1.5 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500 font-mono"
                      placeholder="#categoria" />
                  </div>

                  {/* Badge / Oferta */}
                  <div className="border-t border-gray-100 pt-2.5 space-y-2">
                    {/* Toggle badge */}
                    <label className="flex items-center justify-between cursor-pointer">
                      <span className="text-xs font-semibold text-gray-700">🏷️ Etiqueta / Oferta</span>
                      <button type="button"
                        onClick={() => updateItem(idx, { badge: item.badge ? undefined : { ...DEFAULT_BADGE } })}
                        className={`relative w-10 h-5 rounded-full transition-colors ${item.badge ? 'bg-indigo-600' : 'bg-gray-300'}`}>
                        <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow-sm transition-transform ${item.badge ? 'translate-x-5' : 'translate-x-0.5'}`} />
                      </button>
                    </label>

                    {item.badge && (
                      <div className="space-y-2 pl-1">

                        {/* Presets rápidos */}
                        <div>
                          <label className="text-[10px] font-medium text-gray-400 block mb-1">Presets rápidos</label>
                          <div className="flex flex-wrap gap-1">
                            {BADGE_PRESETS.map(p => (
                              <button key={p.text} type="button"
                                onClick={() => updateItem(idx, { badge: { ...item.badge!, text: p.text, bg: p.bg, color: p.color } })}
                                className="px-2 py-0.5 rounded-full text-[10px] font-bold border transition-all hover:scale-105"
                                style={{ backgroundColor: p.bg, color: p.color, borderColor: p.bg }}>
                                {p.text}
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Texto */}
                        <div>
                          <label className="text-[10px] font-medium text-gray-400">Texto del badge</label>
                          <input value={item.badge.text}
                            onChange={e => updateItem(idx, { badge: { ...item.badge!, text: e.target.value } })}
                            className="w-full mt-0.5 px-2.5 py-1.5 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500 font-bold"
                            placeholder="$10 OFF" />
                        </div>

                        {/* Forma */}
                        <div>
                          <label className="text-[10px] font-medium text-gray-400 block mb-1">Forma</label>
                          <div className="flex gap-1">
                            {([
                              { value: 'starburst', label: '★ Estrella' },
                              { value: 'pill',      label: '● Píldora'  },
                              { value: 'square',    label: '■ Cuadro'   },
                            ] as { value: IconTickerBadge['shape']; label: string }[]).map(s => (
                              <button key={s.value} type="button"
                                onClick={() => updateItem(idx, { badge: { ...item.badge!, shape: s.value } })}
                                className={`flex-1 py-1 text-[10px] font-semibold rounded-lg border transition-all ${
                                  item.badge!.shape === s.value
                                    ? 'bg-indigo-600 text-white border-indigo-600'
                                    : 'bg-white text-gray-600 border-gray-200 hover:border-indigo-300'
                                }`}>{s.label}</button>
                            ))}
                          </div>
                        </div>

                        {/* Posición */}
                        <div>
                          <label className="text-[10px] font-medium text-gray-400 block mb-1">Posición</label>
                          <div className="grid grid-cols-2 gap-1">
                            {([
                              { value: 'top-left',     label: '↖ Sup. izq.' },
                              { value: 'top-right',    label: '↗ Sup. der.' },
                              { value: 'bottom-left',  label: '↙ Inf. izq.' },
                              { value: 'bottom-right', label: '↘ Inf. der.' },
                            ] as { value: IconTickerBadgePosition; label: string }[]).map(p => (
                              <button key={p.value} type="button"
                                onClick={() => updateItem(idx, { badge: { ...item.badge!, position: p.value } })}
                                className={`py-1 text-[10px] font-semibold rounded-lg border transition-all ${
                                  item.badge!.position === p.value
                                    ? 'bg-indigo-600 text-white border-indigo-600'
                                    : 'bg-white text-gray-600 border-gray-200 hover:border-indigo-300'
                                }`}>{p.label}</button>
                            ))}
                          </div>
                        </div>

                        {/* Tamaño */}
                        <div>
                          <label className="text-[10px] font-medium text-gray-400 block mb-1">
                            Tamaño — <span className="font-bold text-gray-600">{item.badge.size ?? 48}%</span>
                          </label>
                          <input
                            type="range" min={20} max={80} step={2}
                            value={item.badge.size ?? 48}
                            onChange={e => updateItem(idx, { badge: { ...item.badge!, size: Number(e.target.value) } })}
                            className="w-full h-1.5 accent-indigo-600 cursor-pointer"
                          />
                          <div className="flex justify-between text-[9px] text-gray-300 mt-0.5">
                            <span>Pequeño</span><span>Grande</span>
                          </div>
                        </div>

                        {/* Colores */}
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="text-[10px] font-medium text-gray-400 block mb-1">Fondo badge</label>
                            <input type="color" value={item.badge.bg}
                              onChange={e => updateItem(idx, { badge: { ...item.badge!, bg: e.target.value } })}
                              className="w-full h-8 rounded-lg cursor-pointer border border-gray-200 p-0.5" />
                          </div>
                          <div>
                            <label className="text-[10px] font-medium text-gray-400 block mb-1">Texto badge</label>
                            <input type="color" value={item.badge.color}
                              onChange={e => updateItem(idx, { badge: { ...item.badge!, color: e.target.value } })}
                              className="w-full h-8 rounded-lg cursor-pointer border border-gray-200 p-0.5" />
                          </div>
                        </div>

                      </div>
                    )}
                  </div>

                  {/* Actions */}
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
          + Agregar ícono
        </button>
      </div>

      <hr className="border-gray-100" />

      {/* Style */}
      <div className="space-y-3">
        <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Diseño</p>

        {/* Modo de visualización */}
        <div>
          <label className="text-[11px] font-medium text-gray-500 block mb-1.5">Modo</label>
          <div className="grid grid-cols-3 gap-1.5">
            {([
              { value: 'ticker', label: '▶ Animado',  desc: 'Desplazamiento' },
              { value: 'row',    label: '⬛ Fila',     desc: 'Estático' },
              { value: 'grid',   label: '⊞ Cuadrícula', desc: 'Estático' },
            ] as { value: IconsTickerContent['displayMode']; label: string; desc: string }[]).map(opt => (
              <button key={opt.value} type="button" onClick={() => set('displayMode', opt.value)}
                className={`flex flex-col items-center py-2 px-1 rounded-xl border text-center transition-all ${
                  (content.displayMode ?? 'ticker') === opt.value
                    ? 'bg-indigo-600 text-white border-indigo-600'
                    : 'bg-white text-gray-600 border-gray-200 hover:border-indigo-300'
                }`}>
                <span className="text-xs font-bold">{opt.label}</span>
                <span className="text-[9px] opacity-70 mt-0.5">{opt.desc}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Columnas (solo grid) */}
        {(content.displayMode ?? 'ticker') === 'grid' && (
          <div>
            <label className="text-[11px] font-medium text-gray-500 block mb-1.5">Columnas</label>
            <div className="flex gap-1.5">
              {([2, 3, 4, 5, 6] as const).map(n => (
                <button key={n} type="button" onClick={() => set('gridColumns', n)}
                  className={`flex-1 py-1.5 text-xs font-bold rounded-lg border transition-all ${
                    (content.gridColumns ?? 4) === n
                      ? 'bg-indigo-600 text-white border-indigo-600'
                      : 'bg-white text-gray-600 border-gray-200 hover:border-indigo-300'
                  }`}>{n}</button>
              ))}
            </div>
          </div>
        )}

        {/* Tamaño de ícono */}
        <div>
          <label className="text-[11px] font-medium text-gray-500 block mb-1.5">Tamaño de ícono</label>
          <div className="flex gap-1.5">
            {([
              { value: 'sm', label: 'Pequeño' },
              { value: 'md', label: 'Mediano' },
              { value: 'lg', label: 'Grande'  },
            ] as { value: IconsTickerContent['iconSize']; label: string }[]).map(opt => (
              <button key={opt.value} type="button" onClick={() => set('iconSize', opt.value)}
                className={`flex-1 py-1.5 text-[11px] font-semibold rounded-lg border transition-all ${
                  content.iconSize === opt.value ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-gray-600 border-gray-200 hover:border-indigo-300'
                }`}>{opt.label}</button>
            ))}
          </div>
        </div>

        {/* Rounded */}
        <div>
          <label className="text-[11px] font-medium text-gray-500 block mb-1.5">Forma de tarjeta</label>
          <div className="flex gap-1.5">
            {([
              { value: 'sm',   label: '▭ Normal' },
              { value: 'md',   label: '⬛ Redon.' },
              { value: 'full', label: '⬤ Círculo' },
            ] as { value: IconsTickerContent['rounded']; label: string }[]).map(opt => (
              <button key={opt.value} type="button" onClick={() => set('rounded', opt.value)}
                className={`flex-1 py-1.5 text-[11px] font-semibold rounded-lg border transition-all ${
                  content.rounded === opt.value ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-gray-600 border-gray-200 hover:border-indigo-300'
                }`}>{opt.label}</button>
            ))}
          </div>
        </div>

        {/* Separación */}
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

        {/* Velocidad + Dirección + Pausa — solo en modo ticker */}
        {(content.displayMode ?? 'ticker') === 'ticker' && (
          <>
            <div>
              <label className="text-[11px] font-medium text-gray-500 block mb-1.5">Velocidad</label>
              <div className="flex gap-1.5">
                {([
                  { value: 'slow',   label: '🐢 Lento'  },
                  { value: 'normal', label: '▶ Normal' },
                  { value: 'fast',   label: '⚡ Rápido' },
                ] as { value: IconsTickerContent['speed']; label: string }[]).map(opt => (
                  <button key={opt.value} type="button" onClick={() => set('speed', opt.value)}
                    className={`flex-1 py-1.5 text-[11px] font-semibold rounded-lg border transition-all ${
                      content.speed === opt.value ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-gray-600 border-gray-200 hover:border-indigo-300'
                    }`}>{opt.label}</button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-[11px] font-medium text-gray-500 block mb-1.5">Dirección</label>
              <div className="flex gap-1.5">
                {([
                  { value: 'left',  label: '← Izquierda' },
                  { value: 'right', label: '→ Derecha'   },
                ] as { value: IconsTickerContent['direction']; label: string }[]).map(opt => (
                  <button key={opt.value} type="button" onClick={() => set('direction', opt.value)}
                    className={`flex-1 py-1.5 text-[11px] font-semibold rounded-lg border transition-all ${
                      content.direction === opt.value ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-gray-600 border-gray-200 hover:border-indigo-300'
                    }`}>{opt.label}</button>
                ))}
              </div>
            </div>
          </>
        )}

        {/* Toggles */}
        <div className="space-y-2">
          <label className="flex items-center justify-between cursor-pointer">
            <span className="text-xs font-medium text-gray-700">Mostrar etiquetas</span>
            <button type="button" onClick={() => set('showLabels', !content.showLabels)}
              className={`relative w-10 h-5 rounded-full transition-colors ${content.showLabels ? 'bg-indigo-600' : 'bg-gray-300'}`}>
              <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow-sm transition-transform ${content.showLabels ? 'translate-x-5' : 'translate-x-0.5'}`} />
            </button>
          </label>
          {(content.displayMode ?? 'ticker') === 'ticker' && (
            <label className="flex items-center justify-between cursor-pointer">
              <span className="text-xs font-medium text-gray-700">Pausar al pasar el cursor</span>
              <button type="button" onClick={() => set('pauseOnHover', !content.pauseOnHover)}
                className={`relative w-10 h-5 rounded-full transition-colors ${content.pauseOnHover ? 'bg-indigo-600' : 'bg-gray-300'}`}>
                <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow-sm transition-transform ${content.pauseOnHover ? 'translate-x-5' : 'translate-x-0.5'}`} />
              </button>
            </label>
          )}
        </div>

        {/* Colors */}
        <div className="grid grid-cols-2 gap-2">
          {([
            { key: 'backgroundColor', label: 'Fondo sección' },
            { key: 'cardBg',          label: 'Fondo tarjeta' },
            { key: 'textColor',       label: 'Texto' },
            { key: 'accentColor',     label: 'Acento' },
          ] as { key: 'backgroundColor'|'cardBg'|'textColor'|'accentColor'; label: string }[]).map(c => (
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
