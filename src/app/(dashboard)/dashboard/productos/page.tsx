'use client'

import { useState, useEffect, useCallback } from 'react'
import {
  getProductsAction,
  createProductAction,
  updateProductAction,
  deleteProductAction,
} from '@/app/actions/store.actions'
import { getLandingsAction } from '@/app/actions/landing.actions'
import type { LandingPage } from '@/domain/landing/landing.types'
import type { Product } from '@/domain/store/store.types'

type ProductExt = Product & { landingTitle: string }

function fmtMoney(cents: number) {
  return new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'USD', minimumFractionDigits: 2 }).format(cents / 100)
}

type ProductForm = {
  landingId: string; name: string; description: string
  price: string; comparePrice: string; stock: string
  category: string; badge: string; active: boolean
}
function blankForm(landingId = ''): ProductForm {
  return { landingId, name: '', description: '', price: '', comparePrice: '', stock: '', category: '', badge: '', active: true }
}
function productToForm(p: ProductExt): ProductForm {
  return {
    landingId:    p.landingId,
    name:         p.name,
    description:  p.description ?? '',
    price:        String(p.price / 100),
    comparePrice: p.comparePrice != null ? String(p.comparePrice / 100) : '',
    stock:        p.stock === -1 ? '' : String(p.stock),
    category:     p.category ?? '',
    badge:        p.badge ?? '',
    active:       p.active,
  }
}

const IcoSpin  = () => <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 12a9 9 0 11-6.219-8.56"/></svg>
const IcoPlus  = () => <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
const IcoBack  = () => <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
const IcoEdit  = () => <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
const IcoTrash = () => <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2"/></svg>
const IcoEmpty = () => <svg viewBox="0 0 64 64" fill="none" className="w-14 h-14 mx-auto mb-3 opacity-40"><path d="M32 4L8 16v32l24 12 24-12V16L32 4z" stroke="#94a3b8" strokeWidth="2" strokeLinejoin="round"/><path d="M32 4v44M8 16l24 12 24-12" stroke="#94a3b8" strokeWidth="2"/></svg>

const inp = 'w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-300 bg-white'
const lbl = 'block text-xs font-semibold text-gray-500 mb-1.5'

type View = 'list' | 'create' | 'edit'

const ITEMS_PER_PAGE = 10

const IcoChevronLeft = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><polyline points="15 18 9 12 15 6"/></svg>
const IcoChevronRight = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><polyline points="9 18 15 12 9 6"/></svg>

export default function ProductosPage() {
  const [landings, setLandings]   = useState<LandingPage[]>([])
  const [products, setProducts]   = useState<ProductExt[]>([])
  const [loading, setLoading]     = useState(true)
  const [landingId, setLandingId] = useState('all')
  const [search, setSearch]       = useState('')
  const [view, setView]           = useState<View>('list')
  const [editing, setEditing]     = useState<ProductExt | null>(null)
  const [form, setForm]           = useState<ProductForm>(blankForm())
  const [saving, setSaving]       = useState(false)
  const [error, setError]         = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(1)

  const fetchAll = useCallback(async () => {
    setLoading(true)
    const lRes = await getLandingsAction()
    if (!lRes.success) { setLoading(false); return }
    const ls = lRes.data
    setLandings(ls)
    const results = await Promise.all(
      ls.map(l => getProductsAction(l.id).then(r =>
        r.success ? r.data.map(p => ({ ...p, landingTitle: l.title })) : []
      ))
    )
    setProducts(results.flat())
    setLoading(false)
  }, [])

  useEffect(() => { fetchAll() }, [fetchAll])

  const filtered = (() => {
    let list = products
    if (landingId !== 'all') list = list.filter(p => p.landingId === landingId)
    if (search.trim()) {
      const q = search.toLowerCase()
      list = list.filter(p => p.name.toLowerCase().includes(q) || p.category?.toLowerCase().includes(q))
    }
    return list
  })()

  // Paginación
  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE)
  const startIdx = (currentPage - 1) * ITEMS_PER_PAGE
  const paginatedProducts = filtered.slice(startIdx, startIdx + ITEMS_PER_PAGE)

  // Reset page cuando cambian filtros
  useEffect(() => { setCurrentPage(1) }, [landingId, search])

  function openCreate() {
    setEditing(null)
    setForm(blankForm(landingId !== 'all' ? landingId : landings[0]?.id ?? ''))
    setError(null)
    setView('create')
  }
  function openEdit(p: ProductExt) {
    setEditing(p)
    setForm(productToForm(p))
    setError(null)
    setView('edit')
  }
  function backToList() { setView('list'); setEditing(null); setError(null) }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    if (!form.landingId || !form.name || !form.price) { setError('Página, nombre y precio son obligatorios'); return }
    setSaving(true)
    const res = await createProductAction(form.landingId, {
      name: form.name, description: form.description || undefined,
      price: Math.round(parseFloat(form.price) * 100),
      comparePrice: form.comparePrice ? Math.round(parseFloat(form.comparePrice) * 100) : undefined,
      stock: form.stock ? parseInt(form.stock) : -1,
      category: form.category || undefined, badge: form.badge || undefined, active: form.active,
    })
    setSaving(false)
    if (!res.success) { setError(res.error); return }
    backToList(); fetchAll()
  }

  async function handleUpdate(e: React.FormEvent) {
    e.preventDefault()
    if (!editing) return
    setError(null)
    if (!form.name || !form.price) { setError('Nombre y precio son obligatorios'); return }
    setSaving(true)
    const res = await updateProductAction(editing.id, editing.landingId, {
      name: form.name, description: form.description || undefined,
      price: Math.round(parseFloat(form.price) * 100),
      comparePrice: form.comparePrice ? Math.round(parseFloat(form.comparePrice) * 100) : undefined,
      stock: form.stock ? parseInt(form.stock) : -1,
      category: form.category || undefined, badge: form.badge || undefined, active: form.active,
    })
    setSaving(false)
    if (!res.success) { setError(res.error); return }
    backToList(); fetchAll()
  }

  async function handleDelete() {
    if (!editing) return
    if (!confirm(`¿Eliminar "${editing.name}"? Esta acción no se puede deshacer.`)) return
    setSaving(true)
    await deleteProductAction(editing.id, editing.landingId)
    setSaving(false)
    backToList(); fetchAll()
  }

  // ── Form view (create / edit) ─────────────────────────────────────────────

  if (view !== 'list') {
    return (
      <div>
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <button onClick={backToList}
            className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors">
            <IcoBack /> Volver
          </button>
          <h1 className="text-2xl font-bold text-gray-900">
            {view === 'create' ? 'Nuevo producto' : `Editar: ${editing?.name}`}
          </h1>
          {view === 'edit' && (
            <button onClick={handleDelete} disabled={saving}
              className="ml-auto flex items-center gap-2 px-3 py-2 text-sm text-red-600 border border-red-200 rounded-xl hover:bg-red-50 transition-colors disabled:opacity-50">
              <IcoTrash /> Eliminar
            </button>
          )}
        </div>

        {/* Form card */}
        <div className="max-w-[80vw] max-h-[70vh]">
          <form onSubmit={view === 'create' ? handleCreate : handleUpdate} className="bg-white border border-gray-200 rounded-2xl p-6 space-y-5">

            {/* Página */}
            <div>
              <label className={lbl}>Asignar a página *</label>
              <select value={form.landingId} onChange={e => setForm(f => ({ ...f, landingId: e.target.value }))}
                className={inp} required>
                <option value="">Selecciona una página</option>
                {landings.map(l => <option key={l.id} value={l.id}>{l.title}{l.published ? '' : ' (borrador)'}</option>)}
              </select>
            </div>

            {/* Nombre */}
            <div>
              <label className={lbl}>Nombre *</label>
              <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                className={inp} placeholder="Nombre del producto" required />
            </div>

            {/* Descripción */}
            <div>
              <label className={lbl}>Descripción</label>
              <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                className={`${inp} resize-none`} rows={3} placeholder="Descripción del producto…" />
            </div>

            {/* Precios */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={lbl}>Precio (USD) *</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm font-medium">$</span>
                  <input type="number" min="0" step="0.01" value={form.price}
                    onChange={e => setForm(f => ({ ...f, price: e.target.value }))}
                    className={`${inp} pl-7`} placeholder="9.99" required />
                </div>
              </div>
              <div>
                <label className={lbl}>Precio original (tachado)</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm font-medium">$</span>
                  <input type="number" min="0" step="0.01" value={form.comparePrice}
                    onChange={e => setForm(f => ({ ...f, comparePrice: e.target.value }))}
                    className={`${inp} pl-7`} placeholder="14.99" />
                </div>
              </div>
            </div>

            {/* Stock, Badge, Categoría */}
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className={lbl}>Stock</label>
                <input type="number" value={form.stock}
                  onChange={e => setForm(f => ({ ...f, stock: e.target.value }))}
                  className={inp} placeholder="∞" />
                <p className="text-[11px] text-gray-400 mt-1">Vacío = ilimitado</p>
              </div>
              <div>
                <label className={lbl}>Badge</label>
                <select value={form.badge} onChange={e => setForm(f => ({ ...f, badge: e.target.value }))} className={inp}>
                  <option value="">Sin badge</option>
                  <option value="Nuevo">Nuevo</option>
                  <option value="Oferta">Oferta</option>
                  <option value="Popular">Popular</option>
                </select>
              </div>
              <div>
                <label className={lbl}>Categoría</label>
                <input value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
                  className={inp} placeholder="Ej: Ropa…" />
              </div>
            </div>

            {/* Activo toggle */}
            <div className="flex items-center justify-between py-3.5 px-4 bg-gray-50 rounded-xl border border-gray-100">
              <div>
                <p className="text-sm font-semibold text-gray-800">Producto activo</p>
                <p className="text-xs text-gray-400 mt-0.5">Visible en la tienda para compradores</p>
              </div>
              <button type="button" onClick={() => setForm(f => ({ ...f, active: !f.active }))}
                className={`relative w-12 h-6 rounded-full transition-colors ${form.active ? 'bg-indigo-600' : 'bg-gray-300'}`}>
                <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${form.active ? 'translate-x-6' : ''}`} />
              </button>
            </div>

            {error && (
              <p className="text-sm text-red-600 bg-red-50 border border-red-100 px-4 py-2.5 rounded-xl">{error}</p>
            )}

            {/* Actions */}
            <div className="flex gap-3 pt-2">
              <button type="button" onClick={backToList}
                className="flex-1 py-2.5 text-sm font-medium text-gray-600 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors">
                Cancelar
              </button>
              <button type="submit" disabled={saving}
                className="flex-1 py-2.5 text-sm font-bold bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl transition-colors disabled:opacity-60 flex items-center justify-center gap-2">
                {saving ? <><IcoSpin />{view === 'create' ? 'Creando…' : 'Guardando…'}</> : (view === 'create' ? 'Crear producto' : 'Guardar cambios')}
              </button>
            </div>
          </form>
        </div>
      </div>
    )
  }

  // ── List view ─────────────────────────────────────────────────────────────

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Productos</h1>
          <p className="text-sm text-gray-500 mt-1">Gestiona el catálogo de tus páginas</p>
        </div>
        <button onClick={openCreate}
          className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold rounded-xl transition-colors shadow-sm shadow-indigo-200">
          <IcoPlus /> Nuevo producto
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white border border-gray-200 rounded-2xl p-4 mb-6 flex flex-wrap gap-3 items-end">
        <div className="flex-1 min-w-48">
          <label className="text-xs font-semibold text-gray-500 block mb-1.5">Página</label>
          <select value={landingId} onChange={e => setLandingId(e.target.value)}
            className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-300 bg-white">
            <option value="all">Todas las páginas</option>
            {landings.map(l => <option key={l.id} value={l.id}>{l.title}</option>)}
          </select>
        </div>
        <div className="flex-1 min-w-48">
          <label className="text-xs font-semibold text-gray-500 block mb-1.5">Buscar</label>
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Nombre, categoría…"
            className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-300" />
        </div>
      </div>

      {/* Summary */}
      {!loading && (
        <div className="flex items-center gap-6 mb-4 px-1">
          <p className="text-sm text-gray-500"><span className="font-bold text-gray-900">{filtered.length}</span> producto{filtered.length !== 1 ? 's' : ''}</p>
          <p className="text-sm text-gray-500"><span className="font-bold text-emerald-600">{filtered.filter(p => p.active).length}</span> activos</p>
          <p className="text-sm text-gray-500"><span className="font-bold text-gray-400">{filtered.filter(p => !p.active).length}</span> inactivos</p>
        </div>
      )}

      {/* Table */}
      {loading ? (
        <div className="flex items-center justify-center py-32 text-gray-400 gap-3">
          <IcoSpin /><span>Cargando productos…</span>
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-2xl flex flex-col items-center justify-center py-20 text-gray-400">
          <IcoEmpty />
          <p className="text-sm font-medium mb-3">Sin productos</p>
          <button onClick={openCreate}
            className="px-4 py-2 bg-indigo-50 text-indigo-600 text-sm font-semibold rounded-xl hover:bg-indigo-100 transition-colors">
            Crear primer producto
          </button>
        </div>
      ) : (
        <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
          {/* Table head */}
          <div className="grid grid-cols-[auto_2fr_1.5fr_1fr_1fr_1fr_auto] gap-4 px-6 py-3 bg-gray-50 border-b border-gray-100 text-[11px] font-bold text-gray-400 uppercase tracking-wider items-center">
            <span></span>
            <span>Nombre</span>
            <span>Página</span>
            <span>Precio</span>
            <span>Stock</span>
            <span>Badge</span>
            <span></span>
          </div>
          <div className="divide-y divide-gray-50">
            {paginatedProducts.map(p => (
              <div key={p.id}
                className="grid grid-cols-[auto_2fr_1.5fr_1fr_1fr_1fr_auto] gap-4 px-6 py-4 items-center hover:bg-gray-50/50 transition-colors cursor-pointer"
                onClick={() => openEdit(p)}
              >
                {/* Status */}
                <span className={`w-2 h-2 rounded-full flex-shrink-0 ${p.active ? 'bg-emerald-400' : 'bg-gray-300'}`} />

                {/* Name */}
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-gray-900 truncate">{p.name}</p>
                  {p.description && <p className="text-[11px] text-gray-400 truncate">{p.description}</p>}
                </div>

                {/* Landing */}
                <p className="text-sm text-gray-500 truncate">{p.landingTitle}</p>

                {/* Price */}
                <div>
                  <p className="text-sm font-bold text-gray-900">{fmtMoney(p.price)}</p>
                  {p.comparePrice && (
                    <p className="text-[11px] text-gray-400 line-through">{fmtMoney(p.comparePrice)}</p>
                  )}
                </div>

                {/* Stock */}
                <p className="text-sm text-gray-600">{p.stock === -1 ? <span className="text-gray-400">∞</span> : `${p.stock} uds`}</p>

                {/* Badge */}
                <div>
                  {p.badge ? (
                    <span className="text-[11px] font-bold bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">
                      {p.badge}
                    </span>
                  ) : <span className="text-gray-300">—</span>}
                </div>

                {/* Edit button */}
                <button
                  onClick={e => { e.stopPropagation(); openEdit(p) }}
                  className="p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                >
                  <IcoEdit />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && filtered.length > 0 && (
        <div className="flex items-center justify-between mt-6 px-1">
          <p className="text-sm text-gray-500">
            Página <span className="font-bold text-gray-900">{currentPage}</span> de <span className="font-bold text-gray-900">{totalPages}</span>
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="flex items-center gap-1 px-3 py-2 text-sm font-medium border border-gray-200 rounded-xl hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <IcoChevronLeft /> Anterior
            </button>

            <div className="flex items-center gap-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`w-8 h-8 text-sm font-medium rounded-lg transition-colors ${
                    currentPage === page
                      ? 'bg-indigo-600 text-white'
                      : 'border border-gray-200 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  {page}
                </button>
              ))}
            </div>

            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="flex items-center gap-1 px-3 py-2 text-sm font-medium border border-gray-200 rounded-xl hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Siguiente <IcoChevronRight />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
