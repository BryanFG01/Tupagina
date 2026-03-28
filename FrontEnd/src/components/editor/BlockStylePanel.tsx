'use client'

import type { BlockStyle, BlockAnimation, BlockFont } from '@/domain/landing/block.types'
import { DEFAULT_BLOCK_STYLE } from '@/domain/landing/block.types'

type Props = {
  style: BlockStyle
  onChange: (style: BlockStyle) => void
}

// ─── Colores predefinidos ──────────────────────────────────────────────────────

const BG_PRESETS = [
  { label: 'Por defecto', value: 'default', display: 'bg-white border-2 border-dashed border-gray-300' },
  { label: 'Blanco',      value: '#FFFFFF',  display: 'bg-white border border-gray-300' },
  { label: 'Gris claro',  value: '#F9FAFB',  display: 'bg-gray-50 border border-gray-200' },
  { label: 'Gris',        value: '#F3F4F6',  display: 'bg-gray-100 border border-gray-200' },
  { label: 'Índigo',      value: '#4F46E5',  display: 'bg-indigo-600 border border-indigo-700' },
  { label: 'Índigo claro',value: '#EEF2FF',  display: 'bg-indigo-50 border border-indigo-100' },
  { label: 'Negro',       value: '#111827',  display: 'bg-gray-900 border border-gray-800' },
  { label: 'Azul marino', value: '#1E3A5F',  display: 'bg-[#1E3A5F] border border-[#1a3356]' },
  { label: 'Verde',       value: '#065F46',  display: 'bg-emerald-900 border border-emerald-800' },
  { label: 'Verde claro', value: '#ECFDF5',  display: 'bg-emerald-50 border border-emerald-100' },
  { label: 'Rojo',        value: '#991B1B',  display: 'bg-red-800 border border-red-900' },
  { label: 'Rosa',        value: '#FDF2F8',  display: 'bg-pink-50 border border-pink-100' },
  { label: 'Ámbar',       value: '#FFFBEB',  display: 'bg-amber-50 border border-amber-100' },
  { label: 'Violeta',     value: '#4C1D95',  display: 'bg-violet-900 border border-violet-800' },
]

const TEXT_PRESETS = [
  { label: 'Default',      value: 'default' },
  { label: 'Oscuro',       value: '#111827' },
  { label: 'Gris',         value: '#6B7280' },
  { label: 'Blanco',       value: '#FFFFFF' },
  { label: 'Índigo',       value: '#4F46E5' },
  { label: 'Verde',        value: '#065F46' },
  { label: 'Rojo',         value: '#991B1B' },
]

const BTN_PRESETS = [
  { label: 'Default',   value: 'default',   display: 'bg-brand-600 border-brand-700' },
  { label: 'Negro',     value: '#111827',   display: 'bg-gray-900 border-gray-800' },
  { label: 'Índigo',    value: '#4F46E5',   display: 'bg-indigo-600 border-indigo-700' },
  { label: 'Verde',     value: '#059669',   display: 'bg-emerald-600 border-emerald-700' },
  { label: 'Rojo',      value: '#DC2626',   display: 'bg-red-600 border-red-700' },
  { label: 'Naranja',   value: '#EA580C',   display: 'bg-orange-600 border-orange-700' },
  { label: 'Rosa',      value: '#DB2777',   display: 'bg-pink-600 border-pink-700' },
  { label: 'Violeta',   value: '#7C3AED',   display: 'bg-violet-600 border-violet-700' },
  { label: 'Celeste',   value: '#0284C7',   display: 'bg-sky-600 border-sky-700' },
  { label: 'Ámbar',     value: '#D97706',   display: 'bg-amber-600 border-amber-700' },
  { label: 'Blanco',    value: '#FFFFFF',   display: 'bg-white border-gray-300' },
]

const ANIMATIONS: { value: BlockAnimation; label: string; icon: string }[] = [
  { value: 'none',        label: 'Sin animación',   icon: '⊘' },
  { value: 'fade-up',     label: 'Subir (fade)',     icon: '↑' },
  { value: 'fade-in',     label: 'Aparecer',         icon: '◎' },
  { value: 'zoom-in',     label: 'Zoom',             icon: '⊕' },
  { value: 'slide-left',  label: 'Desde izquierda',  icon: '←' },
  { value: 'slide-right', label: 'Desde derecha',    icon: '→' },
]

const FONTS: { value: BlockFont; label: string; preview: string }[] = [
  { value: 'inter',     label: 'Inter',          preview: 'font-inter'    },
  { value: 'grotesk',   label: 'Space Grotesk',  preview: 'font-grotesk'  },
  { value: 'playfair',  label: 'Playfair',        preview: 'font-playfair' },
  { value: 'nunito',    label: 'Nunito',          preview: 'font-nunito'   },
]

const PADDING_OPTIONS = [
  { value: 'sm', label: 'S', desc: 'Pequeño' },
  { value: 'md', label: 'M', desc: 'Normal' },
  { value: 'lg', label: 'L', desc: 'Grande' },
  { value: 'xl', label: 'XL', desc: 'Extra grande' },
] as const

// ─── Component ────────────────────────────────────────────────────────────────

export function BlockStylePanel({ style, onChange }: Props) {
  const s = { ...DEFAULT_BLOCK_STYLE, ...style }

  function update<K extends keyof BlockStyle>(key: K, value: BlockStyle[K]) {
    onChange({ ...s, [key]: value })
  }

  return (
    <div className="space-y-6">

      {/* Fondo */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">🎨 Color de fondo</label>
        <div className="grid grid-cols-7 gap-1.5 mb-2">
          {BG_PRESETS.map(preset => (
            <button
              key={preset.value}
              onClick={() => update('backgroundColor', preset.value)}
              title={preset.label}
              className={`w-8 h-8 rounded-lg transition-transform hover:scale-110 ${preset.display} ${
                s.backgroundColor === preset.value ? 'ring-2 ring-indigo-500 ring-offset-1 scale-110' : ''
              }`}
              style={preset.value !== 'default' ? { backgroundColor: preset.value } : undefined}
            />
          ))}
        </div>
        <div className="flex items-center gap-2 mt-1">
          <input
            type="color"
            value={s.backgroundColor === 'default' ? '#ffffff' : s.backgroundColor}
            onChange={e => update('backgroundColor', e.target.value)}
            className="w-9 h-9 rounded-lg cursor-pointer border border-gray-300 p-0.5"
          />
          <span className="text-xs text-gray-400">Color personalizado</span>
          {s.backgroundColor !== 'default' && (
            <button
              onClick={() => update('backgroundColor', 'default')}
              className="text-xs text-red-400 hover:text-red-600 ml-auto"
            >
              Restablecer
            </button>
          )}
        </div>
      </div>

      {/* Color de texto */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">✏️ Color de texto</label>
        <div className="flex flex-wrap gap-2">
          {TEXT_PRESETS.map(preset => (
            <button
              key={preset.value}
              onClick={() => update('textColor', preset.value)}
              title={preset.label}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold border transition-all ${
                s.textColor === preset.value
                  ? 'ring-2 ring-indigo-500 border-indigo-400'
                  : 'border-gray-200 hover:border-gray-400'
              }`}
              style={preset.value !== 'default' ? {
                backgroundColor: preset.value === '#FFFFFF' ? '#111' : preset.value + '15',
                color: preset.value === 'default' ? '#374151' : preset.value,
              } : undefined}
            >
              {preset.label}
            </button>
          ))}
          <input
            type="color"
            value={s.textColor === 'default' ? '#111827' : s.textColor}
            onChange={e => update('textColor', e.target.value)}
            className="w-9 h-9 rounded-lg cursor-pointer border border-gray-300 p-0.5"
            title="Color personalizado"
          />
        </div>
      </div>

      {/* Tipografía */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">🔤 Tipografía</label>
        <div className="grid grid-cols-2 gap-2">
          {FONTS.map(f => (
            <button
              key={f.value}
              onClick={() => update('fontFamily', f.value)}
              className={`px-3 py-2.5 rounded-xl border text-sm transition-all text-left ${f.preview} ${
                s.fontFamily === f.value
                  ? 'bg-indigo-600 text-white border-indigo-600'
                  : 'bg-white text-gray-700 border-gray-200 hover:border-indigo-300'
              }`}
            >
              <span className="font-bold">{f.label}</span>
              <span className={`block text-xs opacity-70 mt-0.5 ${f.preview}`}>Aa Bb Cc 123</span>
            </button>
          ))}
        </div>
      </div>

      {/* Espaciado */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">↕️ Espaciado vertical</label>
        <div className="flex gap-2">
          {PADDING_OPTIONS.map(opt => (
            <button
              key={opt.value}
              onClick={() => update('paddingY', opt.value)}
              title={opt.desc}
              className={`flex-1 py-2 rounded-xl text-sm font-bold border transition-all ${
                s.paddingY === opt.value
                  ? 'bg-indigo-600 text-white border-indigo-600'
                  : 'bg-white text-gray-600 border-gray-200 hover:border-indigo-300'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Color de botones */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">🔘 Color de botones</label>
        <div className="grid grid-cols-6 gap-1.5 mb-2">
          {BTN_PRESETS.map(preset => (
            <button
              key={preset.value}
              onClick={() => update('buttonColor', preset.value)}
              title={preset.label}
              className={`w-8 h-8 rounded-lg transition-transform hover:scale-110 border ${preset.display} ${
                s.buttonColor === preset.value ? 'ring-2 ring-indigo-500 ring-offset-1 scale-110' : ''
              }`}
              style={preset.value !== 'default' ? { backgroundColor: preset.value } : undefined}
            />
          ))}
        </div>
        <div className="flex items-center gap-2">
          <input
            type="color"
            value={s.buttonColor === 'default' ? '#4F46E5' : s.buttonColor}
            onChange={e => update('buttonColor', e.target.value)}
            className="w-9 h-9 rounded-lg cursor-pointer border border-gray-300 p-0.5"
          />
          <span className="text-xs text-gray-400">Color personalizado</span>
          {s.buttonColor !== 'default' && (
            <button onClick={() => update('buttonColor', 'default')} className="text-xs text-red-400 hover:text-red-600 ml-auto">
              Restablecer
            </button>
          )}
        </div>
        {s.buttonColor !== 'default' && (
          <div className="mt-2">
            <label className="block text-xs font-semibold text-gray-600 mb-1">Texto del botón</label>
            <div className="flex flex-wrap gap-2">
              {[
                { label: 'Default', value: 'default' },
                { label: 'Blanco',  value: '#FFFFFF' },
                { label: 'Oscuro',  value: '#111827' },
              ].map(p => (
                <button
                  key={p.value}
                  onClick={() => update('buttonTextColor', p.value)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold border transition-all ${
                    s.buttonTextColor === p.value ? 'ring-2 ring-indigo-500 border-indigo-400' : 'border-gray-200 hover:border-gray-400'
                  }`}
                  style={p.value !== 'default' ? { backgroundColor: p.value + '20', color: p.value === '#FFFFFF' ? '#555' : p.value } : undefined}
                >
                  {p.label}
                </button>
              ))}
              <input
                type="color"
                value={s.buttonTextColor === 'default' ? '#FFFFFF' : s.buttonTextColor}
                onChange={e => update('buttonTextColor', e.target.value)}
                className="w-8 h-8 rounded-lg cursor-pointer border border-gray-300 p-0.5"
                title="Color personalizado"
              />
            </div>
          </div>
        )}
      </div>

      {/* Animación */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">✨ Animación de entrada</label>
        <div className="grid grid-cols-2 gap-2">
          {ANIMATIONS.map(a => (
            <button
              key={a.value}
              onClick={() => update('animation', a.value)}
              className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-xs font-semibold transition-all ${
                s.animation === a.value
                  ? 'bg-indigo-600 text-white border-indigo-600'
                  : 'bg-white text-gray-600 border-gray-200 hover:border-indigo-300'
              }`}
            >
              <span className="text-base">{a.icon}</span>
              {a.label}
            </button>
          ))}
        </div>
        {s.animation !== 'none' && (
          <p className="text-xs text-gray-400 mt-1.5">
            El bloque aparecerá con animación cuando el visitante llegue a esa sección.
          </p>
        )}
      </div>

    </div>
  )
}
