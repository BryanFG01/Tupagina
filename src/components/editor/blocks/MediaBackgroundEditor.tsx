'use client'

import { useState, useRef } from 'react'

export type MediaBackgroundValues = {
  backgroundImage?: string
  backgroundVideo?: string
  backgroundPosition?: string
  overlayColor?: string
  overlayOpacity?: number
}

type Props = {
  values: MediaBackgroundValues
  onChange: (values: MediaBackgroundValues) => void
  defaultOverlayOpacity?: number
}

type MediaMode = 'none' | 'image' | 'video'

const POSITIONS = [
  { value: 'center',       label: 'Centro' },
  { value: 'top',          label: 'Arriba' },
  { value: 'bottom',       label: 'Abajo' },
  { value: 'left center',  label: 'Izquierda' },
  { value: 'right center', label: 'Derecha' },
]

function initMode(values: MediaBackgroundValues): MediaMode {
  if (values.backgroundVideo) return 'video'
  if (values.backgroundImage) return 'image'
  return 'none'
}

export function MediaBackgroundEditor({ values, onChange, defaultOverlayOpacity = 40 }: Props) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [mode, setMode] = useState<MediaMode>(() => initMode(values))

  const update = (patch: Partial<MediaBackgroundValues>) => onChange({ ...values, ...patch })

  const opacity = values.overlayOpacity ?? defaultOverlayOpacity
  const overlayColor = values.overlayColor ?? '#000000'
  const bgPos = values.backgroundPosition ?? 'center'

  function switchMode(m: MediaMode) {
    setMode(m)
    if (m === 'none') {
      onChange({ ...values, backgroundImage: '', backgroundVideo: '' })
    } else if (m === 'image') {
      onChange({ ...values, backgroundVideo: '' })
    } else {
      onChange({ ...values, backgroundImage: '' })
    }
  }

  async function handleFileUpload(file: File) {
    const form = new FormData()
    form.append('file', file)
    const res = await fetch('/api/upload', { method: 'POST', body: form })
    if (res.ok) {
      const { url } = await res.json() as { url: string }
      update({ backgroundImage: url, backgroundVideo: '' })
    }
  }

  return (
    <div className="space-y-4">
      {/* Media type selector */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">Fondo de media</label>
        <div className="flex gap-2">
          {([
            { value: 'none' as MediaMode,  label: 'Sin fondo' },
            { value: 'image' as MediaMode, label: 'Imagen' },
            { value: 'video' as MediaMode, label: 'Video' },
          ]).map(opt => (
            <button
              key={opt.value}
              onClick={() => switchMode(opt.value)}
              className={`flex-1 py-1.5 px-2 text-xs font-semibold rounded-lg border transition-all ${
                mode === opt.value
                  ? 'bg-indigo-600 text-white border-indigo-600'
                  : 'bg-white text-gray-600 border-gray-200 hover:border-indigo-300'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Image input */}
      {mode === 'image' && (
        <div className="space-y-2">
          <label className="block text-xs font-medium text-gray-600">URL de la imagen</label>
          <div className="flex gap-2">
            <input
              type="text"
              value={values.backgroundImage ?? ''}
              onChange={e => update({ backgroundImage: e.target.value })}
              placeholder="https://..."
              className="flex-1 text-xs px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="px-3 py-2 text-xs font-semibold bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg border border-gray-200 transition-colors whitespace-nowrap"
            >
              Subir
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={e => { const f = e.target.files?.[0]; if (f) handleFileUpload(f) }}
            />
          </div>
          {values.backgroundImage && (
            <div className="h-20 rounded-xl overflow-hidden border border-gray-200">
              <img src={values.backgroundImage} alt="" className="w-full h-full object-cover" />
            </div>
          )}
        </div>
      )}

      {/* Video input */}
      {mode === 'video' && (
        <div className="space-y-1">
          <label className="block text-xs font-medium text-gray-600">URL del video (mp4, webm)</label>
          <input
            type="text"
            value={values.backgroundVideo ?? ''}
            onChange={e => update({ backgroundVideo: e.target.value })}
            placeholder="https://ejemplo.com/video.mp4"
            className="w-full text-xs px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
          <p className="text-[10px] text-gray-400">Autoplay en loop sin sonido</p>
        </div>
      )}

      {/* Position + overlay — only when media is active */}
      {mode !== 'none' && (
        <>
          <div className="space-y-2">
            <label className="block text-xs font-medium text-gray-600">Posición del fondo</label>
            <div className="grid grid-cols-3 gap-1.5">
              {POSITIONS.map(p => (
                <button
                  key={p.value}
                  onClick={() => update({ backgroundPosition: p.value })}
                  className={`py-1.5 px-2 text-xs rounded-lg border transition-all ${
                    bgPos === p.value
                      ? 'bg-indigo-50 border-indigo-500 text-indigo-700 font-semibold'
                      : 'bg-white border-gray-200 text-gray-600 hover:border-indigo-300'
                  }`}
                >
                  {p.label}
                </button>
              ))}
              <div className="col-span-2">
                <input
                  type="text"
                  value={bgPos}
                  onChange={e => update({ backgroundPosition: e.target.value })}
                  placeholder="ej: 50% 20%"
                  className="w-full text-xs px-2 py-1.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-xs font-medium text-gray-600">
              Capa de sombra — <span className="font-bold text-indigo-600">{opacity}%</span>
            </label>
            <div className="flex items-center gap-3">
              <input
                type="color"
                value={overlayColor}
                onChange={e => update({ overlayColor: e.target.value })}
                className="w-9 h-8 rounded cursor-pointer border border-gray-300 shrink-0"
                title="Color de la capa"
              />
              <input
                type="range"
                min={0} max={100} step={5}
                value={opacity}
                onChange={e => update({ overlayOpacity: Number(e.target.value) })}
                className="flex-1 h-2 rounded accent-indigo-600"
              />
            </div>
          </div>
        </>
      )}
    </div>
  )
}
