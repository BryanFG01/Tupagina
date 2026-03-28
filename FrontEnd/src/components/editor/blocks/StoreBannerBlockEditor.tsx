'use client'

import type { StoreBannerContent, BannerSlide } from '@/domain/landing/block.types'
import { Input } from '@/components/ui/Input'
import { MediaBackgroundEditor } from './MediaBackgroundEditor'

function nanoid6() { return Math.random().toString(36).slice(2, 8) }

type Props = {
  content: StoreBannerContent
  onChange: (content: StoreBannerContent) => void
}

const PRESET_COLORS = [
  { label: 'Negro',      value: '#111827' },
  { label: 'Índigo',     value: '#4338CA' },
  { label: 'Esmeralda',  value: '#065F46' },
  { label: 'Rojo',       value: '#991B1B' },
  { label: 'Azul marino',value: '#1E3A5F' },
  { label: 'Violeta',    value: '#4C1D95' },
  { label: 'Blanco',     value: '#FFFFFF' },
  { label: 'Gris claro', value: '#F3F4F6' },
]

const POSITION_OPTIONS = [
  { value: 'center',       label: 'Centro' },
  { value: 'top',          label: 'Arriba' },
  { value: 'bottom',       label: 'Abajo' },
  { value: 'center left',  label: 'Izquierda' },
  { value: 'center right', label: 'Derecha' },
]

export function StoreBannerBlockEditor({ content, onChange }: Props) {
  const slides = content.slides ?? []

  function update<K extends keyof StoreBannerContent>(field: K, value: StoreBannerContent[K]) {
    onChange({ ...content, [field]: value })
  }

  // ── Slides ──────────────────────────────────────────────────────────────────

  function addSlide() {
    if (slides.length >= 10) return
    const slide: BannerSlide = { id: nanoid6(), image: '', position: 'center' }
    onChange({ ...content, slides: [...slides, slide] })
  }

  function updateSlide(idx: number, patch: Partial<BannerSlide>) {
    const updated = slides.map((s, i) => i === idx ? { ...s, ...patch } : s)
    onChange({ ...content, slides: updated })
  }

  function removeSlide(idx: number) {
    onChange({ ...content, slides: slides.filter((_, i) => i !== idx) })
  }

  function moveSlide(idx: number, dir: -1 | 1) {
    const arr = [...slides]
    const target = idx + dir
    if (target < 0 || target >= arr.length) return
    ;[arr[idx], arr[target]] = [arr[target]!, arr[idx]!]
    onChange({ ...content, slides: arr })
  }

  return (
    <div className="space-y-4">

      {/* ── Texto hero ── */}
      <Input
        label="Nombre de la tienda"
        value={content.storeName}
        onChange={(e) => update('storeName', e.target.value)}
        placeholder="MI TIENDA"
      />
      <Input
        label="Tagline / Subtítulo"
        value={content.tagline}
        onChange={(e) => update('tagline', e.target.value)}
        placeholder="Calidad y estilo en cada producto"
      />
      <Input
        label="Texto del botón CTA"
        value={content.ctaText}
        onChange={(e) => update('ctaText', e.target.value)}
        placeholder="Ver colección"
      />
      <Input
        label="Destino del botón"
        value={content.ctaTarget}
        onChange={(e) => update('ctaTarget', e.target.value)}
        placeholder="#productos"
        hint="Usa #productos para bajar a la tienda, o escribe una URL"
      />
      <Input
        label="Barra de anuncio (opcional)"
        value={content.announcement ?? ''}
        onChange={(e) => update('announcement', e.target.value)}
        placeholder="🚚 Envío gratis en compras mayores a $50"
        hint="Aparece como franja en la parte superior del banner"
      />

      <hr className="border-gray-100" />

      {/* ── Imágenes / Slideshow ── */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-700">Imágenes del banner</p>
            <p className="text-[11px] text-gray-400">
              {slides.length <= 1
                ? 'Con 2 o más imágenes se activa el slideshow automático'
                : `${slides.length} imágenes — slideshow activo`}
            </p>
          </div>
          <span className="text-xs font-semibold text-gray-400">{slides.length}/10</span>
        </div>

        <div className="space-y-2">
          {slides.map((slide, idx) => (
            <div key={slide.id} className="rounded-xl border border-gray-200 overflow-hidden">
              <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 border-b border-gray-100">
                <span className="text-xs font-semibold text-gray-500 flex-1">Imagen {idx + 1}</span>
                <button type="button" onClick={() => moveSlide(idx, -1)} disabled={idx === 0}
                  className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30 rounded hover:bg-gray-200">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-3.5 h-3.5"><polyline points="18 15 12 9 6 15"/></svg>
                </button>
                <button type="button" onClick={() => moveSlide(idx, 1)} disabled={idx === slides.length - 1}
                  className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30 rounded hover:bg-gray-200">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-3.5 h-3.5"><polyline points="6 9 12 15 18 9"/></svg>
                </button>
                <button type="button" onClick={() => removeSlide(idx)}
                  className="p-1 text-red-400 hover:text-red-600 rounded hover:bg-red-50">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-3.5 h-3.5">
                    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                  </svg>
                </button>
              </div>
              <div className="p-3 space-y-2">
                <input
                  type="text"
                  value={slide.image}
                  onChange={(e) => updateSlide(idx, { image: e.target.value })}
                  className="w-full px-2.5 py-1.5 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  placeholder="https://tu-sitio.com/imagen.jpg"
                />
                {slide.image && (
                  <div
                    className="w-full h-16 rounded-lg border border-gray-200 bg-cover bg-center"
                    style={{ backgroundImage: `url(${slide.image})` }}
                  />
                )}
                <div>
                  <p className="text-[10px] font-medium text-gray-500 mb-1">Posición</p>
                  <div className="flex flex-wrap gap-1">
                    {POSITION_OPTIONS.map(opt => (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => updateSlide(idx, { position: opt.value })}
                        className={`px-2 py-0.5 text-[10px] rounded border font-medium transition-colors ${
                          (slide.position ?? 'center') === opt.value
                            ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                            : 'border-gray-200 text-gray-500 hover:border-gray-300'
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {slides.length < 10 && (
          <button
            type="button"
            onClick={addSlide}
            className="w-full py-2 text-xs font-semibold text-indigo-600 border-2 border-dashed border-indigo-200 rounded-xl hover:bg-indigo-50 hover:border-indigo-300 transition-all"
          >
            + Agregar imagen {slides.length === 0 ? '' : `(${slides.length}/10)`}
          </button>
        )}

        {/* Configuración del slideshow */}
        {slides.length > 1 && (
          <div className="space-y-3 bg-gray-50 rounded-xl p-3 border border-gray-100">
            <p className="text-xs font-semibold text-gray-600">Configuración del slideshow</p>

            <div>
              <label className="text-[11px] font-medium text-gray-500 block mb-1">
                Tiempo por imagen
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="range"
                  min={1000}
                  max={10000}
                  step={500}
                  value={content.slideInterval ?? 4000}
                  onChange={(e) => update('slideInterval', Number(e.target.value))}
                  className="flex-1 accent-indigo-600"
                />
                <span className="text-xs text-gray-600 w-12 text-right shrink-0">
                  {((content.slideInterval ?? 4000) / 1000).toFixed(1)}s
                </span>
              </div>
            </div>

            <div>
              <label className="text-[11px] font-medium text-gray-500 block mb-1">Transición</label>
              <div className="flex gap-2">
                {([
                  { value: 'fade',  label: 'Fade (suave)' },
                  { value: 'slide', label: 'Slide (deslizar)' },
                ] as const).map(opt => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => update('slideTransition', opt.value)}
                    className={`flex-1 py-1.5 text-xs font-semibold rounded-lg border transition-all ${
                      (content.slideTransition ?? 'fade') === opt.value
                        ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                        : 'border-gray-200 text-gray-600 hover:border-gray-300'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      <hr className="border-gray-100" />

      {/* ── Fondo (imagen única o video — solo si no hay slides) ── */}
      {slides.length === 0 && (
        <>
          <MediaBackgroundEditor
            values={{
              backgroundImage: content.backgroundImage,
              backgroundVideo: content.backgroundVideo,
              backgroundPosition: content.backgroundPosition,
              overlayColor: content.overlayColor,
              overlayOpacity: content.overlayOpacity,
            }}
            onChange={(media) => onChange({ ...content, ...media })}
            defaultOverlayOpacity={45}
          />
          <hr className="border-gray-100" />
        </>
      )}

      {/* Overlay — siempre visible cuando hay slides */}
      {slides.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-medium text-gray-700">Oscuridad del overlay</p>
          <div className="flex items-center gap-3">
            <input
              type="range"
              min={0}
              max={90}
              step={5}
              value={content.overlayOpacity ?? 45}
              onChange={(e) => update('overlayOpacity', Number(e.target.value))}
              className="flex-1 accent-indigo-600"
            />
            <span className="text-xs text-gray-600 w-10 text-right shrink-0">
              {content.overlayOpacity ?? 45}%
            </span>
          </div>
          <div className="flex items-center gap-2 mt-1">
            <label className="text-[11px] text-gray-500">Color del overlay</label>
            <input
              type="color"
              value={content.overlayColor ?? '#000000'}
              onChange={(e) => update('overlayColor', e.target.value)}
              className="w-7 h-7 rounded border border-gray-200 cursor-pointer"
            />
          </div>
          <hr className="border-gray-100" />
        </div>
      )}

      {/* ── Color de fondo (sólido, detrás de todo) ── */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">Color de fondo</label>
        <div className="flex flex-wrap gap-2">
          {PRESET_COLORS.map(c => (
            <button
              key={c.value}
              onClick={() => update('backgroundColor', c.value)}
              title={c.label}
              className={`w-8 h-8 rounded-lg border-2 transition-transform hover:scale-110 ${
                content.backgroundColor === c.value ? 'border-indigo-500 scale-110' : 'border-gray-200'
              }`}
              style={{ backgroundColor: c.value }}
            />
          ))}
        </div>
        <div className="flex items-center gap-2">
          <input
            type="color"
            value={content.backgroundColor}
            onChange={e => update('backgroundColor', e.target.value)}
            className="w-10 h-9 rounded cursor-pointer border border-gray-300"
          />
          <span className="text-xs text-gray-500">Color personalizado</span>
        </div>
      </div>

      {/* ── Color de texto ── */}
      <div className="space-y-1.5">
        <label className="block text-sm font-medium text-gray-700">Color de texto</label>
        <div className="flex gap-2">
          {[
            { value: 'light' as const, label: '☀️ Claro (blanco)', desc: 'Para fondos oscuros' },
            { value: 'dark'  as const, label: '🌙 Oscuro (negro)', desc: 'Para fondos claros' },
          ].map(opt => (
            <button
              key={opt.value}
              onClick={() => update('textColor', opt.value)}
              className={`flex-1 py-2 px-3 text-xs font-semibold rounded-lg border transition-all text-left ${
                content.textColor === opt.value
                  ? 'bg-indigo-600 text-white border-indigo-600'
                  : 'bg-white text-gray-600 border-gray-300 hover:border-indigo-300'
              }`}
            >
              {opt.label}
              <span className="block font-normal opacity-70">{opt.desc}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
