'use client'

import type { SpinnerContent, SpinnerType } from '@/domain/landing/block.types'
import { Input } from '@/components/ui/Input'

type Props = {
  content: SpinnerContent
  onChange: (content: SpinnerContent) => void
}

const SPINNER_OPTIONS: { value: SpinnerType; label: string; preview: string }[] = [
  { value: 'circle', label: 'Círculo',  preview: '◌' },
  { value: 'dots',   label: 'Puntos',   preview: '···' },
  { value: 'pulse',  label: 'Pulso',    preview: '◉' },
  { value: 'bars',   label: 'Barras',   preview: '|||' },
]

const ANIMATION_OPTIONS = [
  { value: 'spin',   label: 'Girar' },
  { value: 'pulse',  label: 'Pulso' },
  { value: 'bounce', label: 'Rebotar' },
  { value: 'none',   label: 'Sin animación' },
] as const

export function SpinnerBlockEditor({ content, onChange }: Props) {
  function update<K extends keyof SpinnerContent>(field: K, value: SpinnerContent[K]) {
    onChange({ ...content, [field]: value })
  }

  const hasCustomImage = !!content.customImage

  return (
    <div className="space-y-5">

      {/* ── Duración ── */}
      <div>
        <label className="block text-xs font-medium text-gray-700 mb-1">
          Duración de la pantalla de carga
        </label>
        <div className="flex items-center gap-3">
          <input
            type="range"
            min={500}
            max={8000}
            step={500}
            value={content.duration}
            onChange={(e) => update('duration', Number(e.target.value))}
            className="flex-1 accent-indigo-600"
          />
          <span className="text-sm text-gray-600 w-16 text-right shrink-0">
            {(content.duration / 1000).toFixed(1)}s
          </span>
        </div>
        <p className="text-xs text-gray-400 mt-1">
          Tiempo que el spinner se muestra al cargar la página
        </p>
      </div>

      {/* ── Tipo de spinner ── */}
      {!hasCustomImage && (
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-2">
            Estilo del spinner
          </label>
          <div className="grid grid-cols-4 gap-2">
            {SPINNER_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => update('spinnerType', opt.value)}
                className={`flex flex-col items-center gap-1 p-2 rounded-lg border text-xs font-medium transition-colors ${
                  content.spinnerType === opt.value
                    ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                    : 'border-gray-200 hover:border-gray-300 text-gray-600'
                }`}
              >
                <span className="text-lg leading-none">{opt.preview}</span>
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ── Imagen personalizada ── */}
      <div>
        <label className="block text-xs font-medium text-gray-700 mb-1">
          Imagen o logo personalizado (opcional)
        </label>
        <Input
          value={content.customImage ?? ''}
          onChange={(e) => update('customImage', e.target.value || undefined)}
          placeholder="https://tu-sitio.com/logo.png o .gif animado"
          hint="Si colocas una imagen, reemplaza el spinner integrado. Funciona con GIFs animados."
        />
      </div>

      {/* ── Tamaño de imagen / spinner ── */}
      <div>
        <label className="block text-xs font-medium text-gray-700 mb-1">
          Tamaño {hasCustomImage ? 'de la imagen' : 'del spinner'}
        </label>
        <div className="flex items-center gap-3">
          <input
            type="range"
            min={30}
            max={250}
            step={10}
            value={content.imageSize}
            onChange={(e) => update('imageSize', Number(e.target.value))}
            className="flex-1 accent-indigo-600"
          />
          <span className="text-sm text-gray-600 w-14 text-right shrink-0">
            {content.imageSize}px
          </span>
        </div>
      </div>

      {/* ── Animación de imagen custom ── */}
      {hasCustomImage && (
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-2">
            Animación de la imagen
          </label>
          <div className="grid grid-cols-2 gap-2">
            {ANIMATION_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => update('imageAnimation', opt.value)}
                className={`px-3 py-2 rounded-lg border text-xs font-medium transition-colors ${
                  content.imageAnimation === opt.value
                    ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                    : 'border-gray-200 hover:border-gray-300 text-gray-600'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ── Colores ── */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">
            Color de fondo
          </label>
          <div className="flex items-center gap-2">
            <input
              type="color"
              value={content.backgroundColor}
              onChange={(e) => update('backgroundColor', e.target.value)}
              className="w-8 h-8 rounded cursor-pointer border border-gray-300"
            />
            <span className="text-xs text-gray-500 font-mono">{content.backgroundColor}</span>
          </div>
        </div>

        {!hasCustomImage && (
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Color del spinner
            </label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={content.accentColor}
                onChange={(e) => update('accentColor', e.target.value)}
                className="w-8 h-8 rounded cursor-pointer border border-gray-300"
              />
              <span className="text-xs text-gray-500 font-mono">{content.accentColor}</span>
            </div>
          </div>
        )}
      </div>

      {/* ── Texto opcional ── */}
      <Input
        label="Texto de carga (opcional)"
        value={content.text ?? ''}
        onChange={(e) => update('text', e.target.value || undefined)}
        placeholder="Cargando…"
        hint="Aparece debajo del spinner mientras carga"
      />

      {content.text && (
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">
            Color del texto
          </label>
          <div className="flex items-center gap-2">
            <input
              type="color"
              value={content.textColor}
              onChange={(e) => update('textColor', e.target.value)}
              className="w-8 h-8 rounded cursor-pointer border border-gray-300"
            />
            <span className="text-xs text-gray-500 font-mono">{content.textColor}</span>
          </div>
        </div>
      )}

      <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-xs text-amber-700">
        <strong>Consejo:</strong> Puedes usar el logo o un GIF animado de tu negocio.
        Por ejemplo, una tienda de ropa puede colocar un ícono de percha girando.
      </div>
    </div>
  )
}
