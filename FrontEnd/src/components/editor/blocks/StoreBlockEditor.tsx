'use client'

import { useState } from 'react'
import type { StoreContent, StoreBadgePreset } from '@/domain/landing/block.types'
import { Input } from '@/components/ui/Input'

type Props = {
  content: StoreContent
  onChange: (content: StoreContent) => void
}

const CURRENCIES = [
  { value: 'usd', label: 'USD — Dólar' },
  { value: 'ars', label: 'ARS — Peso argentino' },
  { value: 'mxn', label: 'MXN — Peso mexicano' },
  { value: 'cop', label: 'COP — Peso colombiano' },
  { value: 'clp', label: 'CLP — Peso chileno' },
]

const DEFAULT_PRESETS: StoreBadgePreset[] = [
  { id: 'bp-1', text: 'Nuevo',     bg: '#4f46e5', color: '#ffffff' },
  { id: 'bp-2', text: 'Oferta',    bg: '#ef4444', color: '#ffffff' },
  { id: 'bp-3', text: 'Popular',   bg: '#f59e0b', color: '#ffffff' },
  { id: 'bp-4', text: 'Destacado', bg: '#10b981', color: '#ffffff' },
]

function Toggle({ on, onToggle }: { on: boolean; onToggle: () => void }) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className={`relative w-10 h-5 rounded-full transition-colors flex-shrink-0 ${on ? 'bg-indigo-600' : 'bg-gray-300'}`}
    >
      <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow-sm transition-transform ${on ? 'translate-x-5' : 'translate-x-0.5'}`} />
    </button>
  )
}

function ToggleRow({ label, hint, on, onToggle }: { label: string; hint?: string; on: boolean; onToggle: () => void }) {
  return (
    <label className="flex items-center justify-between py-2.5 cursor-pointer group">
      <div>
        <p className="text-sm font-medium text-gray-700 group-hover:text-gray-900 transition-colors">{label}</p>
        {hint && <p className="text-[11px] text-gray-400">{hint}</p>}
      </div>
      <Toggle on={on} onToggle={onToggle} />
    </label>
  )
}

export function StoreBlockEditor({ content, onChange }: Props) {
  function update<K extends keyof StoreContent>(field: K, value: StoreContent[K]) {
    onChange({ ...content, [field]: value })
  }

  const filterStyle = content.filterStyle ?? 'tabs'
  const presets = content.badgePresets ?? DEFAULT_PRESETS

  function updatePreset(id: string, field: keyof StoreBadgePreset, value: string) {
    const updated = presets.map(p => p.id === id ? { ...p, [field]: value } : p)
    update('badgePresets', updated)
  }

  function addPreset() {
    const newPreset: StoreBadgePreset = {
      id: `bp-${Date.now()}`,
      text: 'Nueva',
      bg: '#6b7280',
      color: '#ffffff',
    }
    update('badgePresets', [...presets, newPreset])
  }

  function removePreset(id: string) {
    update('badgePresets', presets.filter(p => p.id !== id))
  }

  return (
    <div className="space-y-5">

      {/* Textos */}
      <div className="space-y-3">
        <Input
          label="Título de la sección"
          value={content.title}
          onChange={e => update('title', e.target.value)}
          placeholder="Nuestros productos"
        />
        <Input
          label="Subtítulo"
          value={content.subtitle}
          onChange={e => update('subtitle', e.target.value)}
          placeholder="Elige y compra en segundos"
        />
        <Input
          label="Texto del botón agregar"
          value={content.buttonText}
          onChange={e => update('buttonText', e.target.value)}
          placeholder="Agregar al carrito"
        />
      </div>

      <hr className="border-gray-100" />

      {/* Columnas */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">Columnas del catálogo</label>
        <div className="flex gap-2">
          {([2, 3, 4] as const).map(n => (
            <button
              key={n}
              onClick={() => update('columns', n)}
              className={`flex-1 py-2 text-sm font-semibold rounded-lg border transition-all ${
                content.columns === n
                  ? 'bg-indigo-600 text-white border-indigo-600'
                  : 'bg-white text-gray-600 border-gray-300 hover:border-indigo-300'
              }`}
            >
              {n}
            </button>
          ))}
        </div>
      </div>

      {/* Vista por defecto */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">Vista por defecto</label>
        <div className="flex gap-2">
          {[
            { value: 'grid', label: 'Cuadrícula' },
            { value: 'list', label: 'Lista' },
          ].map(opt => (
            <button
              key={opt.value}
              onClick={() => update('layout', opt.value as StoreContent['layout'])}
              className={`flex-1 py-2 text-sm font-semibold rounded-lg border transition-all ${
                content.layout === opt.value
                  ? 'bg-indigo-600 text-white border-indigo-600'
                  : 'bg-white text-gray-600 border-gray-300 hover:border-indigo-300'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
        <p className="text-[11px] text-gray-400">El usuario puede cambiar entre grid y lista desde la tienda</p>
      </div>

      {/* Moneda */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">Moneda</label>
        <select
          value={content.currency}
          onChange={e => update('currency', e.target.value)}
          className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          {CURRENCIES.map(c => (
            <option key={c.value} value={c.value}>{c.label}</option>
          ))}
        </select>
      </div>

      <hr className="border-gray-100" />

      {/* Estilo de filtros */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">Estilo de filtros</label>
        <div className="space-y-1.5">
          {([
            { value: 'tabs',    label: 'Tabs',    desc: 'Botones horizontales bajo el buscador' },
            { value: 'sidebar', label: 'Sidebar', desc: 'Panel lateral colapsable (estilo e-commerce)' },
            { value: 'dropdown', label: 'Dropdown', desc: 'Selectores compactos en la barra de herramientas' },
          ] as const).map(opt => (
            <label key={opt.value} className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
              filterStyle === opt.value
                ? 'border-indigo-300 bg-indigo-50'
                : 'border-gray-200 bg-white hover:bg-gray-50'
            }`}>
              <input
                type="radio"
                name="filterStyle"
                checked={filterStyle === opt.value}
                onChange={() => update('filterStyle', opt.value)}
                className="mt-0.5 accent-indigo-600"
              />
              <div>
                <p className={`text-sm font-semibold ${filterStyle === opt.value ? 'text-indigo-700' : 'text-gray-700'}`}>{opt.label}</p>
                <p className="text-[11px] text-gray-400">{opt.desc}</p>
              </div>
            </label>
          ))}
        </div>
      </div>

      <hr className="border-gray-100" />

      {/* Opciones */}
      <div className="space-y-0 divide-y divide-gray-100">
        <p className="text-sm font-semibold text-gray-700 pb-2">Opciones visibles</p>
        <ToggleRow
          label="Barra de búsqueda"
          on={content.showSearch}
          onToggle={() => update('showSearch', !content.showSearch)}
        />
        <ToggleRow
          label="Filtro de categorías"
          on={content.showCategories}
          onToggle={() => update('showCategories', !content.showCategories)}
        />
        <ToggleRow
          label="Ordenar productos"
          hint="Dropdown: precio, nombre, relevancia"
          on={content.showSort ?? true}
          onToggle={() => update('showSort', !(content.showSort ?? true))}
        />
        <ToggleRow
          label="Filtro de precio"
          hint="Rango mín / máx"
          on={content.showPriceFilter ?? false}
          onToggle={() => update('showPriceFilter', !(content.showPriceFilter ?? false))}
        />
        <ToggleRow
          label="Contador de resultados"
          hint="«X de Y productos»"
          on={content.showProductCount ?? true}
          onToggle={() => update('showProductCount', !(content.showProductCount ?? true))}
        />
      </div>

      <hr className="border-gray-100" />

      {/* Etiquetas del catálogo */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-gray-700">🏷️ Etiquetas del catálogo</p>
            <p className="text-[11px] text-gray-400 mt-0.5">Personaliza colores y textos de los badges</p>
          </div>
          <button
            type="button"
            onClick={addPreset}
            className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 border border-indigo-200 hover:border-indigo-400 px-2.5 py-1 rounded-lg transition-all"
          >
            + Agregar
          </button>
        </div>

        <div className="space-y-2">
          {presets.map(preset => (
            <div key={preset.id} className="flex items-center gap-2 bg-gray-50 rounded-xl p-2.5">
              {/* Preview */}
              <span
                className="flex-shrink-0 px-2.5 py-1 rounded-full text-[10px] font-black whitespace-nowrap"
                style={{ backgroundColor: preset.bg, color: preset.color }}
              >
                {preset.text || '…'}
              </span>

              {/* Text */}
              <input
                value={preset.text}
                onChange={e => updatePreset(preset.id, 'text', e.target.value)}
                maxLength={15}
                placeholder="Texto"
                className="flex-1 min-w-0 px-2 py-1 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-400 bg-white"
              />

              {/* BG color */}
              <div className="flex items-center gap-1 flex-shrink-0">
                <span className="text-[10px] text-gray-400">Fondo</span>
                <input
                  type="color"
                  value={preset.bg}
                  onChange={e => updatePreset(preset.id, 'bg', e.target.value)}
                  className="w-7 h-7 rounded-lg border border-gray-200 cursor-pointer p-0.5 bg-white"
                />
              </div>

              {/* Text color */}
              <div className="flex items-center gap-1 flex-shrink-0">
                <span className="text-[10px] text-gray-400">Texto</span>
                <input
                  type="color"
                  value={preset.color}
                  onChange={e => updatePreset(preset.id, 'color', e.target.value)}
                  className="w-7 h-7 rounded-lg border border-gray-200 cursor-pointer p-0.5 bg-white"
                />
              </div>

              {/* Delete */}
              <button
                type="button"
                onClick={() => removePreset(preset.id)}
                className="flex-shrink-0 w-6 h-6 flex items-center justify-center text-gray-300 hover:text-red-500 transition-colors rounded-lg hover:bg-red-50"
                title="Eliminar"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" className="w-3.5 h-3.5">
                  <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </div>
          ))}
        </div>
        <p className="text-[11px] text-gray-400">Estos presets aparecen al crear productos para esta tienda</p>
      </div>

      <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-3 text-xs text-indigo-700">
        <p className="font-semibold mb-0.5">Sin límite de productos</p>
        <p>Agrega y gestiona productos desde el dashboard → Productos.</p>
      </div>
    </div>
  )
}
