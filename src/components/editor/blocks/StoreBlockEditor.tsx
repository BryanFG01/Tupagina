'use client'

import type { StoreContent } from '@/domain/landing/block.types'
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

      <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-3 text-xs text-indigo-700">
        <p className="font-semibold mb-0.5">Sin límite de productos</p>
        <p>Agrega y gestiona productos desde el dashboard → Productos.</p>
      </div>
    </div>
  )
}
