'use client'

import { useState } from 'react'
import type { NavbarContent, NavItem, NavDropdownItem } from '@/domain/landing/block.types'
import { Input } from '@/components/ui/Input'

type Props = { content: NavbarContent; onChange: (c: NavbarContent) => void }

function nanoid6() { return Math.random().toString(36).slice(2, 8) }

export function NavbarBlockEditor({ content, onChange }: Props) {
  const [openIdx, setOpenIdx] = useState<number | null>(null)
  const [openDdIdx, setOpenDdIdx] = useState<number | null>(null)

  // ── Helpers ───────────────────────────────────────────────────────────────

  function updateItem(idx: number, patch: Partial<NavItem>) {
    const items = content.items.map((item, i) => i === idx ? { ...item, ...patch } : item)
    onChange({ ...content, items })
  }

  function updateDropdown(itemIdx: number, ddIdx: number, patch: Partial<NavDropdownItem>) {
    const items = content.items.map((item, i) => {
      if (i !== itemIdx) return item
      const dropdown = item.dropdown.map((dd, j) => j === ddIdx ? { ...dd, ...patch } : dd)
      return { ...item, dropdown }
    })
    onChange({ ...content, items })
  }

  function addItem() {
    const newItem: NavItem = {
      id: `nav-${nanoid6()}`,
      label: 'Enlace',
      url: '#',
      hasDropdown: false,
      dropdown: [],
    }
    onChange({ ...content, items: [...content.items, newItem] })
    setOpenIdx(content.items.length)
  }

  function removeItem(idx: number) {
    onChange({ ...content, items: content.items.filter((_, i) => i !== idx) })
    setOpenIdx(null)
  }

  function moveItem(idx: number, dir: -1 | 1) {
    const items = [...content.items]
    const target = idx + dir
    if (target < 0 || target >= items.length) return
    const a = items[idx]
    const b = items[target]
    if (!a || !b) return
    items[idx] = b
    items[target] = a
    onChange({ ...content, items })
  }

  function addDropdownItem(itemIdx: number) {
    const dd: NavDropdownItem = { id: `dd-${nanoid6()}`, label: 'Opción', url: '#' }
    const items = content.items.map((item, i) =>
      i === itemIdx ? { ...item, dropdown: [...item.dropdown, dd] } : item
    )
    onChange({ ...content, items })
    setOpenDdIdx(items[itemIdx]!.dropdown.length - 1)
  }

  function removeDropdownItem(itemIdx: number, ddIdx: number) {
    const items = content.items.map((item, i) =>
      i === itemIdx ? { ...item, dropdown: item.dropdown.filter((_, j) => j !== ddIdx) } : item
    )
    onChange({ ...content, items })
  }

  // ── Toggle component ──────────────────────────────────────────────────────

  function Toggle({ value, onToggle, label, hint }: { value: boolean; onToggle: () => void; label: string; hint?: string }) {
    return (
      <label className="flex items-center justify-between py-2 cursor-pointer">
        <div>
          <p className="text-sm font-medium text-gray-700">{label}</p>
          {hint && <p className="text-[11px] text-gray-400">{hint}</p>}
        </div>
        <button
          type="button"
          onClick={onToggle}
          className={`relative w-10 h-5 rounded-full transition-colors ${value ? 'bg-indigo-600' : 'bg-gray-300'}`}
        >
          <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow-sm transition-transform ${value ? 'translate-x-5' : 'translate-x-0.5'}`} />
        </button>
      </label>
    )
  }

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-4">

      {/* Brand */}
      <div className="space-y-3">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Marca</p>
        <Input
          label="Nombre"
          value={content.brandName}
          onChange={e => onChange({ ...content, brandName: e.target.value })}
          placeholder="Mi Negocio"
        />
        <Input
          label="URL del logo (opcional)"
          value={content.brandLogo ?? ''}
          onChange={e => onChange({ ...content, brandLogo: e.target.value })}
          placeholder="https://…"
        />
      </div>

      <hr className="border-gray-100" />

      {/* Apariencia */}
      <div className="space-y-3">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Apariencia</p>

        {/* Fondo */}
        <div className="flex items-center gap-3">
          <label className="text-sm font-medium text-gray-700 flex-1">Color de fondo</label>
          <div className="flex items-center gap-2">
            <input
              type="color"
              value={content.backgroundColor}
              onChange={e => onChange({ ...content, backgroundColor: e.target.value })}
              className="w-8 h-8 rounded-lg border border-gray-200 cursor-pointer"
            />
            <span className="text-xs text-gray-500 font-mono">{content.backgroundColor}</span>
          </div>
        </div>

        {/* Texto */}
        <div>
          <p className="text-sm font-medium text-gray-700 mb-2">Color del texto</p>
          <div className="flex gap-2">
            {(['dark', 'light'] as const).map(c => (
              <button
                key={c}
                type="button"
                onClick={() => onChange({ ...content, textColor: c })}
                className={`flex-1 py-2 text-sm font-medium rounded-lg border transition-all ${
                  content.textColor === c
                    ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                    : 'border-gray-200 text-gray-600 hover:border-gray-300'
                }`}
              >
                {c === 'dark' ? 'Oscuro' : 'Claro'}
              </button>
            ))}
          </div>
        </div>

        <Toggle
          value={content.sticky}
          onToggle={() => onChange({ ...content, sticky: !content.sticky })}
          label="Fijo al hacer scroll"
          hint="El navbar se queda visible al bajar"
        />
        <Toggle
          value={content.transparent}
          onToggle={() => onChange({ ...content, transparent: !content.transparent })}
          label="Transparente al inicio"
          hint="Se vuelve sólido al hacer scroll"
        />
      </div>

      <hr className="border-gray-100" />

      {/* Opciones */}
      <div className="space-y-2">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Opciones</p>
        <Toggle
          value={content.showSearch}
          onToggle={() => onChange({ ...content, showSearch: !content.showSearch })}
          label="Mostrar búsqueda"
        />
        <Toggle
          value={content.showCart ?? false}
          onToggle={() => onChange({ ...content, showCart: !(content.showCart ?? false) })}
          label="Mostrar carrito"
          hint="Muestra el ícono del carrito cuando hay una tienda activa"
        />

        {content.showCart && (
          <div className="space-y-2 pl-1">
            <p className="text-xs font-medium text-gray-700">Color del carrito y badge</p>
            <div className="flex items-center gap-3">
              <div className="flex flex-wrap gap-1.5">
                {[
                  { label: 'Rojo',    value: '#ef4444' },
                  { label: 'Índigo',  value: '#6366f1' },
                  { label: 'Verde',   value: '#22c55e' },
                  { label: 'Naranja', value: '#f97316' },
                  { label: 'Negro',   value: '#111827' },
                  { label: 'Blanco',  value: '#ffffff' },
                ].map(c => (
                  <button
                    key={c.value}
                    type="button"
                    title={c.label}
                    onClick={() => onChange({ ...content, cartColor: c.value })}
                    className={`w-6 h-6 rounded-full border-2 transition-transform hover:scale-110 ${
                      (content.cartColor ?? '#ef4444') === c.value ? 'border-indigo-500 scale-110' : 'border-gray-300'
                    }`}
                    style={{ backgroundColor: c.value }}
                  />
                ))}
              </div>
              <input
                type="color"
                value={content.cartColor ?? '#ef4444'}
                onChange={e => onChange({ ...content, cartColor: e.target.value })}
                className="w-7 h-7 rounded-lg border border-gray-200 cursor-pointer flex-shrink-0"
                title="Color personalizado"
              />
            </div>
            <p className="text-[10px] text-gray-400">El badge del contador usa el mismo color</p>
          </div>
        )}

        <div className="space-y-2 pt-1">
          <Input
            label="Texto del botón CTA"
            value={content.ctaText ?? ''}
            onChange={e => onChange({ ...content, ctaText: e.target.value })}
            placeholder="Contacto"
          />
          <Input
            label="URL del botón CTA"
            value={content.ctaUrl ?? ''}
            onChange={e => onChange({ ...content, ctaUrl: e.target.value })}
            placeholder="#contacto"
          />
        </div>
      </div>

      <hr className="border-gray-100" />

      {/* Menú */}
      <div className="space-y-2">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">{content.items.length} enlace{content.items.length !== 1 ? 's' : ''}</p>

        <div className="space-y-2">
          {content.items.map((item, idx) => {
            const isOpen = openIdx === idx
            return (
              <div key={item.id} className="rounded-xl border border-gray-200 overflow-hidden">

                {/* Header */}
                <button
                  type="button"
                  onClick={() => setOpenIdx(isOpen ? null : idx)}
                  className="w-full flex items-center gap-2 px-3 py-2.5 text-left hover:bg-gray-50 transition-colors"
                >
                  <span className="w-5 h-5 rounded-full bg-indigo-50 flex items-center justify-center text-[10px] font-black text-indigo-600 flex-shrink-0">
                    {idx + 1}
                  </span>
                  <span className="text-sm font-medium text-gray-700 flex-1 truncate">{item.label || 'Sin nombre'}</span>
                  {item.hasDropdown && (
                    <span className="text-[10px] bg-amber-50 text-amber-600 border border-amber-200 px-1.5 py-0.5 rounded-full font-medium">
                      dropdown
                    </span>
                  )}
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
                    className={`w-4 h-4 text-gray-400 flex-shrink-0 transition-transform ${isOpen ? 'rotate-180' : ''}`}>
                    <polyline points="6 9 12 15 18 9"/>
                  </svg>
                </button>

                {/* Edición */}
                {isOpen && (
                  <div className="px-3 pb-3 pt-2 space-y-3 border-t border-gray-100">

                    <div className="grid grid-cols-2 gap-2">
                      <div className="space-y-1">
                        <label className="text-xs font-medium text-gray-500">Texto</label>
                        <input
                          value={item.label}
                          onChange={e => updateItem(idx, { label: e.target.value })}
                          className="w-full px-2.5 py-1.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                          placeholder="Inicio"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-medium text-gray-500">URL</label>
                        <input
                          value={item.url}
                          onChange={e => updateItem(idx, { url: e.target.value })}
                          className="w-full px-2.5 py-1.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                          placeholder="#"
                        />
                      </div>
                    </div>

                    {/* Color personalizado */}
                    <div className="flex items-center gap-2">
                      <label className="text-xs font-medium text-gray-500 flex-1">Color (opcional)</label>
                      <input
                        type="color"
                        value={item.color ?? '#374151'}
                        onChange={e => updateItem(idx, { color: e.target.value })}
                        className="w-7 h-7 rounded-lg border border-gray-200 cursor-pointer"
                      />
                      {item.color && (
                        <button type="button" onClick={() => updateItem(idx, { color: undefined })}
                          className="text-xs text-gray-400 hover:text-red-500">borrar</button>
                      )}
                    </div>

                    {/* Dropdown toggle */}
                    <label className="flex items-center justify-between cursor-pointer">
                      <span className="text-xs font-medium text-gray-500">Tiene dropdown</span>
                      <button
                        type="button"
                        onClick={() => updateItem(idx, { hasDropdown: !item.hasDropdown })}
                        className={`relative w-9 h-5 rounded-full transition-colors ${item.hasDropdown ? 'bg-indigo-600' : 'bg-gray-300'}`}
                      >
                        <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow-sm transition-transform ${item.hasDropdown ? 'translate-x-4' : 'translate-x-0.5'}`} />
                      </button>
                    </label>

                    {/* Dropdown items */}
                    {item.hasDropdown && (
                      <div className="space-y-2 pl-2 border-l-2 border-indigo-100">
                        <p className="text-xs font-medium text-gray-500">Opciones del dropdown</p>
                        {item.dropdown.map((dd, ddIdx) => (
                          <div key={dd.id} className="rounded-lg border border-gray-100 overflow-hidden">
                            <button
                              type="button"
                              onClick={() => setOpenDdIdx(openDdIdx === ddIdx ? null : ddIdx)}
                              className="w-full flex items-center gap-2 px-2.5 py-1.5 text-left hover:bg-gray-50"
                            >
                              <span className="text-xs text-gray-600 flex-1 truncate">{dd.label || 'Sin nombre'}</span>
                              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={`w-3.5 h-3.5 text-gray-400 transition-transform ${openDdIdx === ddIdx ? 'rotate-180' : ''}`}>
                                <polyline points="6 9 12 15 18 9"/>
                              </svg>
                            </button>
                            {openDdIdx === ddIdx && (
                              <div className="px-2.5 pb-2.5 pt-1 space-y-2 border-t border-gray-100">
                                <div className="grid grid-cols-2 gap-1.5">
                                  <input
                                    value={dd.label}
                                    onChange={e => updateDropdown(idx, ddIdx, { label: e.target.value })}
                                    className="px-2 py-1 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                    placeholder="Texto"
                                  />
                                  <input
                                    value={dd.url}
                                    onChange={e => updateDropdown(idx, ddIdx, { url: e.target.value })}
                                    className="px-2 py-1 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                    placeholder="URL"
                                  />
                                </div>
                                <button type="button" onClick={() => removeDropdownItem(idx, ddIdx)}
                                  className="text-xs text-red-400 hover:text-red-600">
                                  Eliminar
                                </button>
                              </div>
                            )}
                          </div>
                        ))}
                        <button
                          type="button"
                          onClick={() => addDropdownItem(idx)}
                          className="w-full py-1.5 text-xs font-medium text-indigo-600 border border-dashed border-indigo-200 rounded-lg hover:bg-indigo-50 transition-colors"
                        >
                          + Agregar opción
                        </button>
                      </div>
                    )}

                    {/* Acciones */}
                    <div className="flex items-center justify-between pt-1">
                      <div className="flex gap-1">
                        <button type="button" onClick={() => moveItem(idx, -1)} disabled={idx === 0}
                          className="p-1.5 text-gray-400 hover:text-gray-700 disabled:opacity-30 rounded-lg hover:bg-gray-100 transition-colors">
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><polyline points="18 15 12 9 6 15"/></svg>
                        </button>
                        <button type="button" onClick={() => moveItem(idx, 1)} disabled={idx === content.items.length - 1}
                          className="p-1.5 text-gray-400 hover:text-gray-700 disabled:opacity-30 rounded-lg hover:bg-gray-100 transition-colors">
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><polyline points="6 9 12 15 18 9"/></svg>
                        </button>
                      </div>
                      {content.items.length > 1 && (
                        <button type="button" onClick={() => removeItem(idx)}
                          className="text-xs text-red-400 hover:text-red-600 font-medium px-2 py-1 rounded-lg hover:bg-red-50 transition-colors">
                          Eliminar
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>

        <button
          type="button"
          onClick={addItem}
          className="w-full py-2.5 text-sm font-semibold text-indigo-600 border-2 border-dashed border-indigo-200 rounded-xl hover:bg-indigo-50 hover:border-indigo-300 transition-all"
        >
          + Agregar enlace
        </button>
      </div>

      {/* Dropdown style — only show if any item has dropdown */}
      {content.items.some(i => i.hasDropdown && i.dropdown.length > 0) && (
        <>
          <hr className="border-gray-100" />
          <div className="space-y-3">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Estilo del menú</p>
            <div className="grid grid-cols-3 gap-2">
              {([
                {
                  value: 'minimal' as const,
                  label: 'Minimal',
                  desc: 'Limpio y compacto',
                  preview: (
                    <div className="w-full h-12 rounded border border-gray-200 bg-white p-1.5 flex flex-col gap-0.5">
                      {['', '', ''].map((_, i) => (
                        <div key={i} className="h-2.5 rounded-sm bg-gray-100" style={{ width: i === 1 ? '70%' : '88%' }} />
                      ))}
                    </div>
                  ),
                },
                {
                  value: 'card' as const,
                  label: 'Card',
                  desc: 'Con sombra suave',
                  preview: (
                    <div className="w-full h-12 rounded-xl border border-gray-200 bg-white shadow-md p-1.5 flex flex-col gap-0.5">
                      {['', '', ''].map((_, i) => (
                        <div key={i} className="h-2.5 rounded-sm bg-gray-100" style={{ width: i === 1 ? '70%' : '88%' }} />
                      ))}
                    </div>
                  ),
                },
                {
                  value: 'floating' as const,
                  label: 'Flotante',
                  desc: 'Con flecha',
                  preview: (
                    <div className="relative w-full h-12 rounded-2xl border border-gray-100 bg-white shadow-xl p-1.5 flex flex-col gap-0.5">
                      <div className="absolute -top-1.5 left-3 w-3 h-3 rotate-45 bg-white border-l border-t border-gray-100 rounded-sm" />
                      {['', '', ''].map((_, i) => (
                        <div key={i} className="h-2.5 rounded-sm bg-gray-100" style={{ width: i === 1 ? '70%' : '88%' }} />
                      ))}
                    </div>
                  ),
                },
              ]).map(opt => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => onChange({ ...content, dropdownStyle: opt.value })}
                  className={`flex flex-col gap-1.5 p-2 rounded-xl border-2 transition-all text-left ${
                    (content.dropdownStyle ?? 'minimal') === opt.value
                      ? 'border-indigo-500 bg-indigo-50'
                      : 'border-gray-200 hover:border-gray-300 bg-white'
                  }`}
                >
                  {opt.preview}
                  <div>
                    <p className={`text-[11px] font-semibold ${(content.dropdownStyle ?? 'minimal') === opt.value ? 'text-indigo-700' : 'text-gray-700'}`}>{opt.label}</p>
                    <p className="text-[10px] text-gray-400">{opt.desc}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
