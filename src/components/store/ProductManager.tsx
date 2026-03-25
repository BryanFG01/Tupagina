'use client'

import { useState } from 'react'
import type { Product } from '@/domain/store/store.types'
import {
  createProductAction,
  updateProductAction,
  deleteProductAction,
} from '@/app/actions/store.actions'

type Props = { landingId: string; initialProducts: Product[] }

function IconBox() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-8 h-8 text-gray-300">
      <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
      <polyline points="3.27 6.96 12 12.01 20.73 6.96"/>
      <line x1="12" y1="22.08" x2="12" y2="12"/>
    </svg>
  )
}
function IconEye() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
      <circle cx="12" cy="12" r="3"/>
    </svg>
  )
}
function IconEyeOff() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
      <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
      <line x1="1" y1="1" x2="23" y2="23"/>
    </svg>
  )
}

type ActionResult = { success: true; data: Product } | { success: false; error: string }

type FormState = {
  name: string
  description: string
  imageUrl: string
  price: string
  comparePrice: string
  stock: string
  category: string
  badge: string
}

const EMPTY_FORM: FormState = {
  name: '', description: '', imageUrl: '',
  price: '', comparePrice: '', stock: '-1',
  category: '', badge: '',
}

const BADGE_OPTIONS = ['', 'Nuevo', 'Oferta', 'Popular', 'Destacado']
const STOCK_OPTIONS = [
  { value: '-1', label: 'Ilimitado' },
  { value: '0', label: 'Sin stock (agotado)' },
]

export function ProductManager({ landingId, initialProducts }: Props) {
  const [products, setProducts] = useState<Product[]>(initialProducts)
  const [form, setForm]         = useState<FormState>(EMPTY_FORM)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [loading, setLoading]           = useState(false)
  const [uploading, setUploading]       = useState(false)
  const [uploadingFor, setUploadingFor] = useState<string | null>(null)  // inline upload per product
  const [error, setError]               = useState<string | null>(null)

  const formatted = (cents: number) =>
    new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'USD' }).format(cents / 100)

  function field<K extends keyof FormState>(key: K) {
    return (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
      setForm(f => ({ ...f, [key]: e.target.value }))
    }
  }

  function startCreate() {
    setForm(EMPTY_FORM)
    setEditingId(null)
    setShowForm(true)
    setError(null)
  }

  function startEdit(p: Product) {
    setForm({
      name:         p.name,
      description:  p.description ?? '',
      imageUrl:     p.imageUrl ?? '',
      price:        String(p.price / 100),
      comparePrice: p.comparePrice ? String(p.comparePrice / 100) : '',
      stock:        String(p.stock),
      category:     p.category ?? '',
      badge:        p.badge ?? '',
    })
    setEditingId(p.id)
    setShowForm(true)
    setError(null)
  }

  function cancelForm() {
    setShowForm(false)
    setEditingId(null)
    setError(null)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const input = {
      name:         form.name,
      description:  form.description || undefined,
      imageUrl:     form.imageUrl || undefined,
      price:        Math.round(parseFloat(form.price) * 100),
      comparePrice: form.comparePrice ? Math.round(parseFloat(form.comparePrice) * 100) : undefined,
      stock:        parseInt(form.stock, 10),
      category:     form.category || undefined,
      badge:        form.badge || undefined,
    }

    let result: ActionResult
    if (editingId) {
      result = await updateProductAction(editingId, landingId, input)
      if (result.success) {
        const updated = result.data
        setProducts(prev => prev.map(p => p.id === editingId ? updated : p))
      }
    } else {
      result = await createProductAction(landingId, input)
      if (result.success) {
        const created = result.data
        setProducts(prev => [...prev, created])
      }
    }

    setLoading(false)
    if (!result.success) { setError(result.error); return }
    setShowForm(false)
    setEditingId(null)
  }

  async function handleDelete(productId: string) {
    if (!confirm('¿Eliminar este producto?')) return
    const result = await deleteProductAction(productId, landingId)
    if (result.success) {
      setProducts(prev => prev.filter(p => p.id !== productId))
    }
  }

  async function handleToggleActive(p: Product) {
    const result = await updateProductAction(p.id, landingId, { active: !p.active })
    if (result.success) {
      setProducts(prev => prev.map(x => x.id === p.id ? result.data : x))
    }
  }

  async function handleInlineImageUpload(productId: string, file: File) {
    setUploadingFor(productId)
    const fd = new FormData()
    fd.append('file', file)
    try {
      const res  = await fetch('/api/upload', { method: 'POST', body: fd })
      const json = await res.json() as { url?: string; error?: string }
      if (!json.url) { setError(json.error ?? 'Error al subir imagen'); return }
      const result = await updateProductAction(productId, landingId, { imageUrl: json.url })
      if (result.success) {
        setProducts(prev => prev.map(p => p.id === productId ? result.data : p))
      }
    } catch {
      setError('Error al subir imagen')
    } finally {
      setUploadingFor(null)
    }
  }

  // Categorías existentes para sugerencias
  const existingCategories = Array.from(new Set(
    products.map(p => p.category).filter((c): c is string => !!c)
  ))

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Productos</h2>
          <p className="text-sm text-gray-500 mt-0.5">
            {products.length} producto{products.length !== 1 ? 's' : ''} en tu catálogo
          </p>
        </div>
        {!showForm && (
          <button
            onClick={startCreate}
            className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold rounded-xl shadow-sm shadow-indigo-200 transition-all"
          >
            <span className="text-lg leading-none">+</span>
            Nuevo producto
          </button>
        )}
      </div>

      {/* ── Formulario ── */}
      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white border border-gray-200 rounded-2xl p-6 mb-6 shadow-sm space-y-5">
          <h3 className="font-bold text-gray-800 text-base">
            {editingId ? 'Editar producto' : 'Nuevo producto'}
          </h3>

          {/* Nombre + Precio */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-gray-700">Nombre *</label>
              <input
                required value={form.name} onChange={field('name')}
                placeholder="Ej: Camiseta básica blanca"
                className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-gray-700">Precio *</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">$</span>
                <input
                  required type="number" min="0.01" step="0.01"
                  value={form.price} onChange={field('price')}
                  placeholder="29.99"
                  className="w-full pl-7 pr-3 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>
          </div>

          {/* Precio comparación + Stock */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-gray-700">
                Precio original
                <span className="text-gray-400 font-normal ml-1.5 text-xs">(tachado, para ofertas)</span>
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">$</span>
                <input
                  type="number" min="0.01" step="0.01"
                  value={form.comparePrice} onChange={field('comparePrice')}
                  placeholder="49.99"
                  className="w-full pl-7 pr-3 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-gray-700">Stock</label>
              <div className="flex gap-2">
                <select
                  value={parseInt(form.stock) >= 0 ? '__custom__' : form.stock}
                  onChange={e => {
                    if (e.target.value !== '__custom__') setForm(f => ({ ...f, stock: e.target.value }))
                  }}
                  className="flex-1 px-3 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  {STOCK_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                  <option value="__custom__">Cantidad específica…</option>
                </select>
                {parseInt(form.stock) >= 0 && (
                  <input
                    type="number" min="0"
                    value={form.stock} onChange={field('stock')}
                    className="w-20 px-3 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                )}
              </div>
            </div>
          </div>

          {/* Categoría + Badge */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-gray-700">
                Categoría
                <span className="text-gray-400 font-normal ml-1.5 text-xs">(para filtrar por tabs)</span>
              </label>
              <input
                value={form.category} onChange={field('category')}
                placeholder="Ej: Ropa, Calzado, Accesorios"
                list="category-suggestions"
                className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <datalist id="category-suggestions">
                {existingCategories.map(c => <option key={c} value={c} />)}
              </datalist>
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-gray-700">
                Badge
                <span className="text-gray-400 font-normal ml-1.5 text-xs">(etiqueta visual)</span>
              </label>
              <select
                value={form.badge} onChange={field('badge')}
                className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                {BADGE_OPTIONS.map(b => (
                  <option key={b} value={b}>{b || '— Sin badge —'}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Descripción */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-gray-700">Descripción</label>
            <textarea
              rows={2} value={form.description} onChange={field('description')}
              placeholder="Describe brevemente este producto (materiales, tallas, etc.)"
              className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
            />
          </div>

          {/* Imagen */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Imagen del producto</label>

            {/* Preview */}
            {form.imageUrl && (
              <div className="relative w-full aspect-video max-h-40 rounded-xl overflow-hidden border border-gray-200 bg-gray-50">
                <img src={form.imageUrl} alt="" className="w-full h-full object-contain" />
                <button
                  type="button"
                  onClick={() => setForm(f => ({ ...f, imageUrl: '' }))}
                  className="absolute top-2 right-2 w-7 h-7 bg-white rounded-full shadow-md flex items-center justify-center text-gray-500 hover:text-red-500 transition-colors text-xs font-bold"
                >
                  ✕
                </button>
              </div>
            )}

            {/* Upload button */}
            <label className={`flex items-center justify-center gap-2 w-full py-3 rounded-xl border-2 border-dashed cursor-pointer transition-all text-sm font-medium ${
              uploading
                ? 'border-indigo-300 bg-indigo-50 text-indigo-500'
                : 'border-gray-300 hover:border-indigo-400 hover:bg-indigo-50 text-gray-500 hover:text-indigo-600'
            }`}>
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                className="hidden"
                onChange={async (e) => {
                  const file = e.target.files?.[0]
                  if (!file) return
                  setUploading(true)
                  const fd = new FormData()
                  fd.append('file', file)
                  try {
                    const res = await fetch('/api/upload', { method: 'POST', body: fd })
                    const json = await res.json()
                    if (json.url) setForm(f => ({ ...f, imageUrl: json.url }))
                    else setError(json.error ?? 'Error al subir imagen')
                  } catch {
                    setError('Error al subir imagen')
                  } finally {
                    setUploading(false)
                    e.target.value = ''
                  }
                }}
              />
              {uploading ? (
                <>
                  <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
                  Subiendo…
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/>
                    <polyline points="17,8 12,3 7,8"/>
                    <line x1="12" y1="3" x2="12" y2="15"/>
                  </svg>
                  {form.imageUrl ? 'Cambiar imagen' : 'Subir imagen'} (JPG, PNG, WebP · máx 5MB)
                </>
              )}
            </label>

            {/* O pegar URL */}
            <div className="flex items-center gap-2">
              <div className="flex-1 h-px bg-gray-200" />
              <span className="text-xs text-gray-400">o pegar URL</span>
              <div className="flex-1 h-px bg-gray-200" />
            </div>
            <input
              value={form.imageUrl} onChange={field('imageUrl')}
              placeholder="https://ejemplo.com/imagen.jpg"
              className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {error && (
            <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">{error}</p>
          )}

          <div className="flex gap-2 pt-1">
            <button
              type="submit" disabled={loading}
              className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold rounded-xl transition-colors disabled:opacity-60"
            >
              {loading ? 'Guardando…' : editingId ? 'Actualizar producto' : 'Crear producto'}
            </button>
            <button
              type="button" onClick={cancelForm}
              className="px-4 py-2.5 text-sm text-gray-600 hover:text-gray-900 font-medium rounded-xl hover:bg-gray-100 transition-colors"
            >
              Cancelar
            </button>
          </div>
        </form>
      )}

      {/* ── Lista de productos ── */}
      {products.length === 0 && !showForm ? (
        <div className="text-center py-16 bg-gray-50 rounded-2xl border border-dashed border-gray-300">
          <div className="flex justify-center mb-4"><IconBox /></div>
          <p className="font-semibold text-gray-600 mb-1">Sin productos aún</p>
          <p className="text-sm text-gray-400 mb-5">Agrega tu primer producto para empezar a vender</p>
          <button
            onClick={startCreate}
            className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold rounded-xl transition-colors shadow-sm shadow-indigo-200"
          >
            Crear primer producto
          </button>
        </div>
      ) : (
        <div className="space-y-2">
          {products.map(product => (
            <div
              key={product.id}
              className={`flex items-center gap-4 bg-white border rounded-2xl p-4 transition-all ${
                product.active ? 'border-gray-200 hover:border-gray-300' : 'border-gray-100 opacity-60'
              }`}
            >
              {/* Thumbnail — click para cambiar imagen */}
              <label
                className="relative w-16 h-16 rounded-xl bg-gray-100 flex-shrink-0 overflow-hidden cursor-pointer group/thumb"
                title="Haz click para subir imagen"
              >
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/gif"
                  className="hidden"
                  onChange={e => {
                    const file = e.target.files?.[0]
                    if (file) void handleInlineImageUpload(product.id, file)
                    e.target.value = ''
                  }}
                />
                {uploadingFor === product.id ? (
                  <div className="w-full h-full flex items-center justify-center bg-indigo-50">
                    <svg className="w-5 h-5 text-indigo-500 animate-spin" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                    </svg>
                  </div>
                ) : product.imageUrl ? (
                  <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center"><IconBox /></div>
                )}
                {/* Overlay cámara */}
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover/thumb:opacity-100 transition-opacity rounded-xl">
                  <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z"/>
                    <circle cx="12" cy="13" r="4"/>
                  </svg>
                </div>
              </label>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="font-semibold text-gray-900 truncate text-sm">{product.name}</p>
                  {product.badge && (
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-indigo-100 text-indigo-700">
                      {product.badge}
                    </span>
                  )}
                  {product.category && (
                    <span className="text-[10px] text-gray-400 border border-gray-200 px-1.5 py-0.5 rounded-full">
                      {product.category}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-3 mt-0.5">
                  <span className="text-sm font-bold text-indigo-600">${(product.price / 100).toFixed(2)}</span>
                  {product.comparePrice && (
                    <span className="text-xs text-gray-400 line-through">${(product.comparePrice / 100).toFixed(2)}</span>
                  )}
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                    product.stock === 0
                      ? 'bg-red-50 text-red-600'
                      : product.stock === -1
                      ? 'bg-green-50 text-green-600'
                      : product.stock <= 5
                      ? 'bg-amber-50 text-amber-600'
                      : 'bg-green-50 text-green-600'
                  }`}>
                    {product.stock === -1 ? '∞ Stock' : product.stock === 0 ? 'Agotado' : `${product.stock} en stock`}
                  </span>
                </div>
              </div>

              {/* Acciones */}
              <div className="flex gap-1 flex-shrink-0">
                <button
                  onClick={() => handleToggleActive(product)}
                  className={`w-9 h-9 rounded-xl flex items-center justify-center text-xs font-bold transition-colors ${
                    product.active
                      ? 'hover:bg-gray-100 text-gray-400 hover:text-gray-700'
                      : 'bg-green-50 text-green-600 hover:bg-green-100'
                  }`}
                  title={product.active ? 'Ocultar' : 'Activar'}
                >
                  {product.active ? <IconEye /> : <IconEyeOff />}
                </button>
                <button
                  onClick={() => startEdit(product)}
                  className="w-9 h-9 rounded-xl hover:bg-gray-100 flex items-center justify-center text-gray-400 hover:text-gray-700 transition-colors"
                  title="Editar"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/>
                    <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/>
                  </svg>
                </button>
                <button
                  onClick={() => handleDelete(product.id)}
                  className="w-9 h-9 rounded-xl hover:bg-red-50 flex items-center justify-center text-gray-300 hover:text-red-500 transition-colors"
                  title="Eliminar"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="3,6 5,6 21,6"/>
                    <path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/>
                  </svg>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
