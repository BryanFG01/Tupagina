'use client'

import { useState } from 'react'
import type { GalleryContent, GalleryImage, GalleryLayout } from '@/domain/landing/block.types'
import { Input } from '@/components/ui/Input'

type Props = {
  content: GalleryContent
  onChange: (c: GalleryContent) => void
}

function nanoid6() { return Math.random().toString(36).slice(2, 8) }

const LAYOUTS: { value: GalleryLayout; label: string; desc: string; preview: React.ReactNode }[] = [
  {
    value: 'feature-left',
    label: 'Destacada izq.',
    desc: '1 grande + 4 pequeñas',
    preview: (
      <div className="grid grid-cols-2 gap-0.5 w-full h-12">
        <div className="bg-gray-400 rounded-sm row-span-2" />
        <div className="grid grid-cols-2 gap-0.5">
          <div className="bg-gray-300 rounded-sm" />
          <div className="bg-gray-300 rounded-sm" />
          <div className="bg-gray-300 rounded-sm" />
          <div className="bg-gray-300 rounded-sm" />
        </div>
      </div>
    ),
  },
  {
    value: 'feature-right',
    label: 'Destacada der.',
    desc: '4 pequeñas + 1 grande',
    preview: (
      <div className="grid grid-cols-2 gap-0.5 w-full h-12">
        <div className="grid grid-cols-2 gap-0.5">
          <div className="bg-gray-300 rounded-sm" />
          <div className="bg-gray-300 rounded-sm" />
          <div className="bg-gray-300 rounded-sm" />
          <div className="bg-gray-300 rounded-sm" />
        </div>
        <div className="bg-gray-400 rounded-sm" />
      </div>
    ),
  },
  {
    value: 'feature-top',
    label: 'Destacada arriba',
    desc: '1 ancha + fila abajo',
    preview: (
      <div className="flex flex-col gap-0.5 w-full h-12">
        <div className="bg-gray-400 rounded-sm flex-1" />
        <div className="grid grid-cols-3 gap-0.5 h-4">
          <div className="bg-gray-300 rounded-sm" />
          <div className="bg-gray-300 rounded-sm" />
          <div className="bg-gray-300 rounded-sm" />
        </div>
      </div>
    ),
  },
  {
    value: 'mosaic',
    label: 'Mosaico',
    desc: '1 tall + 2×2',
    preview: (
      <div className="grid grid-cols-3 grid-rows-2 gap-0.5 w-full h-12">
        <div className="bg-gray-400 rounded-sm row-span-2" />
        <div className="bg-gray-300 rounded-sm" />
        <div className="bg-gray-300 rounded-sm" />
        <div className="bg-gray-300 rounded-sm" />
        <div className="bg-gray-300 rounded-sm" />
      </div>
    ),
  },
  {
    value: 'grid-2',
    label: 'Grid 2',
    desc: '2 columnas iguales',
    preview: (
      <div className="grid grid-cols-2 gap-0.5 w-full h-12">
        <div className="bg-gray-300 rounded-sm" />
        <div className="bg-gray-300 rounded-sm" />
      </div>
    ),
  },
  {
    value: 'grid-3',
    label: 'Grid 3',
    desc: '3 columnas iguales',
    preview: (
      <div className="grid grid-cols-3 gap-0.5 w-full h-12">
        <div className="bg-gray-300 rounded-sm" />
        <div className="bg-gray-300 rounded-sm" />
        <div className="bg-gray-300 rounded-sm" />
      </div>
    ),
  },
  {
    value: 'grid-4',
    label: 'Grid 4',
    desc: '4 columnas iguales',
    preview: (
      <div className="grid grid-cols-4 gap-0.5 w-full h-12">
        <div className="bg-gray-300 rounded-sm" />
        <div className="bg-gray-300 rounded-sm" />
        <div className="bg-gray-300 rounded-sm" />
        <div className="bg-gray-300 rounded-sm" />
      </div>
    ),
  },
]

export function GalleryBlockEditor({ content, onChange }: Props) {
  const [openIdx, setOpenIdx] = useState<number | null>(null)

  function set<K extends keyof GalleryContent>(key: K, value: GalleryContent[K]) {
    onChange({ ...content, [key]: value })
  }

  function addImage() {
    const img: GalleryImage = { id: `g-${nanoid6()}`, url: '', alt: '' }
    onChange({ ...content, images: [...content.images, img] })
    setOpenIdx(content.images.length)
  }

  function updateImage(idx: number, patch: Partial<GalleryImage>) {
    const images = content.images.map((img, i) => i === idx ? { ...img, ...patch } : img)
    onChange({ ...content, images })
  }

  function removeImage(idx: number) {
    onChange({ ...content, images: content.images.filter((_, i) => i !== idx) })
    setOpenIdx(null)
  }

  function moveImage(idx: number, dir: -1 | 1) {
    const images = [...content.images]
    const target = idx + dir
    if (target < 0 || target >= images.length) return
    const a = images[idx]!; const b = images[target]!
    images[idx] = b; images[target] = a
    onChange({ ...content, images })
  }

  return (
    <div className="space-y-5">

      {/* ── Layout picker ── */}
      <div className="space-y-2">
        <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Disposición</p>
        <div className="grid grid-cols-2 gap-2">
          {LAYOUTS.map(opt => (
            <button
              key={opt.value}
              type="button"
              onClick={() => set('layout', opt.value)}
              className={`flex flex-col gap-1.5 p-2 rounded-xl border-2 transition-all text-left ${
                content.layout === opt.value
                  ? 'border-indigo-500 bg-indigo-50'
                  : 'border-gray-200 hover:border-gray-300 bg-white'
              }`}
            >
              {opt.preview}
              <div>
                <p className={`text-[11px] font-semibold leading-tight ${content.layout === opt.value ? 'text-indigo-700' : 'text-gray-700'}`}>
                  {opt.label}
                </p>
                <p className="text-[10px] text-gray-400">{opt.desc}</p>
              </div>
            </button>
          ))}
        </div>
      </div>

      <hr className="border-gray-100" />

      {/* ── Images ── */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Fotos</p>
          <span className="text-[10px] text-gray-400">{content.images.length} imágenes</span>
        </div>

        <div className="text-[11px] text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
          💡 El layout <strong>Destacada</strong> usa la primera foto como imagen principal.
        </div>

        <div className="space-y-1.5">
          {content.images.map((img, idx) => (
            <div key={img.id} className="rounded-xl border border-gray-200 overflow-hidden">
              {/* Header */}
              <button
                type="button"
                onClick={() => setOpenIdx(openIdx === idx ? null : idx)}
                className="w-full flex items-center gap-2 px-3 py-2 text-left hover:bg-gray-50 transition-colors"
              >
                {img.url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={img.url} alt={img.alt} className="w-9 h-9 object-cover rounded-lg flex-shrink-0" />
                ) : (
                  <div className="w-9 h-9 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0 text-gray-400 text-xs">📷</div>
                )}
                <span className="text-xs font-medium text-gray-700 flex-1 truncate">
                  {idx === 0 && ['feature-left', 'feature-right', 'feature-top', 'mosaic'].includes(content.layout)
                    ? '⭐ ' : ''}
                  {img.alt || img.url || 'Sin URL'}
                </span>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
                  className={`w-3.5 h-3.5 text-gray-400 flex-shrink-0 transition-transform ${openIdx === idx ? 'rotate-180' : ''}`}>
                  <polyline points="6 9 12 15 18 9"/>
                </svg>
              </button>

              {openIdx === idx && (
                <div className="px-3 pb-3 pt-2 space-y-2.5 border-t border-gray-100">
                  <div>
                    <label className="text-[11px] font-medium text-gray-500">URL de la imagen</label>
                    <input
                      value={img.url}
                      onChange={e => updateImage(idx, { url: e.target.value })}
                      className="w-full mt-0.5 px-2.5 py-1.5 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500 font-mono"
                      placeholder="https://..."
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-medium text-gray-500">Texto alternativo (accesibilidad)</label>
                    <input
                      value={img.alt}
                      onChange={e => updateImage(idx, { alt: e.target.value })}
                      className="w-full mt-0.5 px-2.5 py-1.5 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      placeholder="Descripción de la foto"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[11px] font-medium text-gray-500">Botón (opcional)</label>
                      <input
                        value={img.ctaText ?? ''}
                        onChange={e => updateImage(idx, { ctaText: e.target.value || undefined })}
                        className="w-full mt-0.5 px-2.5 py-1.5 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
                        placeholder="Ver Colección"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-medium text-gray-500">URL del botón</label>
                      <input
                        value={img.ctaUrl ?? ''}
                        onChange={e => updateImage(idx, { ctaUrl: e.target.value || undefined })}
                        className="w-full mt-0.5 px-2.5 py-1.5 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500 font-mono"
                        placeholder="#coleccion"
                      />
                    </div>
                  </div>

                  {/* Move / delete */}
                  <div className="flex items-center justify-between pt-1 border-t border-gray-100">
                    <div className="flex gap-1">
                      <button type="button" onClick={() => moveImage(idx, -1)} disabled={idx === 0}
                        className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30 rounded hover:bg-gray-100">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-3.5 h-3.5"><polyline points="18 15 12 9 6 15"/></svg>
                      </button>
                      <button type="button" onClick={() => moveImage(idx, 1)} disabled={idx === content.images.length - 1}
                        className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30 rounded hover:bg-gray-100">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-3.5 h-3.5"><polyline points="6 9 12 15 18 9"/></svg>
                      </button>
                    </div>
                    <button type="button" onClick={() => removeImage(idx)}
                      className="text-xs text-red-400 hover:text-red-600 font-medium px-2 py-0.5 rounded hover:bg-red-50">
                      Eliminar
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        <button type="button" onClick={addImage}
          className="w-full py-2 text-xs font-semibold text-indigo-600 border-2 border-dashed border-indigo-200 rounded-xl hover:bg-indigo-50 transition-all">
          + Agregar foto
        </button>
      </div>

      <hr className="border-gray-100" />

      {/* ── Estilo ── */}
      <div className="space-y-3">
        <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Estilo</p>

        {/* Gap */}
        <div>
          <label className="text-[11px] font-medium text-gray-500 block mb-1.5">Separación entre fotos</label>
          <div className="flex gap-1.5">
            {([
              { value: 'none', label: 'Sin esp.' },
              { value: 'sm',   label: 'Pequeño' },
              { value: 'md',   label: 'Mediano' },
              { value: 'lg',   label: 'Grande' },
            ] as { value: GalleryContent['gap']; label: string }[]).map(opt => (
              <button key={opt.value} type="button" onClick={() => set('gap', opt.value)}
                className={`flex-1 py-1.5 text-xs font-semibold rounded-lg border transition-all ${
                  content.gap === opt.value
                    ? 'bg-indigo-600 text-white border-indigo-600'
                    : 'bg-white text-gray-600 border-gray-200 hover:border-indigo-300'
                }`}>{opt.label}</button>
            ))}
          </div>
        </div>

        {/* Rounded */}
        <div>
          <label className="text-[11px] font-medium text-gray-500 block mb-1.5">Bordes redondeados</label>
          <div className="flex gap-1.5">
            {([
              { value: 'none', label: 'Recto' },
              { value: 'sm',   label: 'Suave' },
              { value: 'md',   label: 'Medio' },
              { value: 'xl',   label: 'Máximo' },
            ] as { value: GalleryContent['rounded']; label: string }[]).map(opt => (
              <button key={opt.value} type="button" onClick={() => set('rounded', opt.value)}
                className={`flex-1 py-1.5 text-xs font-semibold rounded-lg border transition-all ${
                  content.rounded === opt.value
                    ? 'bg-indigo-600 text-white border-indigo-600'
                    : 'bg-white text-gray-600 border-gray-200 hover:border-indigo-300'
                }`}>{opt.label}</button>
            ))}
          </div>
        </div>

        {/* Hover effect */}
        <div>
          <label className="text-[11px] font-medium text-gray-500 block mb-1.5">Efecto al pasar el cursor</label>
          <div className="grid grid-cols-2 gap-1.5">
            {([
              { value: 'none',    label: 'Ninguno',   desc: 'Sin efecto' },
              { value: 'zoom',    label: '🔍 Zoom',    desc: 'Amplía la foto' },
              { value: 'darken',  label: '🌑 Oscurecer', desc: 'Fondo oscuro' },
              { value: 'overlay', label: '📝 Overlay', desc: 'Muestra texto' },
            ] as { value: GalleryContent['hoverEffect']; label: string; desc: string }[]).map(opt => (
              <button key={opt.value} type="button" onClick={() => set('hoverEffect', opt.value)}
                className={`py-2 px-3 text-left rounded-xl border transition-all ${
                  content.hoverEffect === opt.value
                    ? 'bg-indigo-50 border-indigo-500 text-indigo-700'
                    : 'bg-white border-gray-200 text-gray-600 hover:border-indigo-300'
                }`}>
                <p className="text-xs font-semibold">{opt.label}</p>
                <p className="text-[10px] opacity-70">{opt.desc}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Aspect ratio (for grid layouts) */}
        <div>
          <label className="text-[11px] font-medium text-gray-500 block mb-1.5">
            Proporción de imagen <span className="opacity-60">(grids)</span>
          </label>
          <div className="flex gap-1.5">
            {([
              { value: 'auto',      label: 'Auto' },
              { value: 'square',    label: '1:1' },
              { value: 'portrait',  label: '3:4' },
              { value: 'landscape', label: '4:3' },
            ] as { value: GalleryContent['aspectRatio']; label: string }[]).map(opt => (
              <button key={opt.value} type="button" onClick={() => set('aspectRatio', opt.value)}
                className={`flex-1 py-1.5 text-xs font-semibold rounded-lg border transition-all ${
                  content.aspectRatio === opt.value
                    ? 'bg-indigo-600 text-white border-indigo-600'
                    : 'bg-white text-gray-600 border-gray-200 hover:border-indigo-300'
                }`}>{opt.label}</button>
            ))}
          </div>
        </div>

        {/* Max width */}
        <div>
          <label className="text-[11px] font-medium text-gray-500 block mb-1.5">Ancho máximo</label>
          <div className="flex gap-1.5">
            {([
              { value: 'full', label: 'Completo' },
              { value: '6xl',  label: 'Grande' },
              { value: '2xl',  label: 'Mediano' },
              { value: 'xl',   label: 'Pequeño' },
            ] as { value: GalleryContent['maxWidth']; label: string }[]).map(opt => (
              <button key={opt.value} type="button" onClick={() => set('maxWidth', opt.value)}
                className={`flex-1 py-1.5 text-xs font-semibold rounded-lg border transition-all ${
                  content.maxWidth === opt.value
                    ? 'bg-indigo-600 text-white border-indigo-600'
                    : 'bg-white text-gray-600 border-gray-200 hover:border-indigo-300'
                }`}>{opt.label}</button>
            ))}
          </div>
        </div>

        {/* Background color */}
        <div className="flex items-center gap-3">
          <label className="text-[11px] font-medium text-gray-500 flex-1">Color de fondo</label>
          <div className="flex items-center gap-2">
            <input type="color" value={content.backgroundColor}
              onChange={e => set('backgroundColor', e.target.value)}
              className="w-8 h-8 rounded-lg border border-gray-200 cursor-pointer p-0.5" />
            <span className="text-[10px] text-gray-400 font-mono">{content.backgroundColor}</span>
          </div>
        </div>
      </div>

    </div>
  )
}
