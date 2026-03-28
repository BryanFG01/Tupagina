'use client'

import { useState, useEffect, useCallback } from 'react'
import type { LandingPage } from '@/domain/landing/landing.types'
import type { Order, Product } from '@/domain/store/store.types'
import {
  getOrdersAction,
  getProductsAction,
  createProductAction,
  updateProductAction,
  deleteProductAction,
} from '@/app/actions/store.actions'

type Tab = 'metricas' | 'pedidos' | 'productos'
type DateFilter = 'today' | '7d' | '30d' | 'all'
type ProductWithLanding = Product & { landingTitle: string }
type OrderWithLanding  = Order  & { landingTitle: string }

// ── Helpers ──────────────────────────────────────────────────────────────────

function fmtMoney(cents: number, currency = 'usd') {
  return new Intl.NumberFormat('es-MX', {
    style: 'currency', currency: currency.toUpperCase(), minimumFractionDigits: 2,
  }).format(cents / 100)
}
function fmtDate(d: Date | string) {
  const date = typeof d === 'string' ? new Date(d) : d
  return date.toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' })
}
function filterByDate(orders: OrderWithLanding[], filter: DateFilter) {
  if (filter === 'all') return orders
  const now = new Date(); const cutoff = new Date(now)
  if (filter === 'today') { cutoff.setHours(0, 0, 0, 0) }
  else if (filter === '7d')  { cutoff.setDate(now.getDate() - 7)  }
  else if (filter === '30d') { cutoff.setDate(now.getDate() - 30) }
  return orders.filter(o => new Date(o.createdAt) >= cutoff)
}

const STATUS_MAP: Record<string, { label: string; cls: string }> = {
  PENDING:   { label: 'Pendiente',  cls: 'bg-amber-50  text-amber-700  border-amber-200'  },
  PAID:      { label: 'Pagado',     cls: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  COMPLETED: { label: 'Completado', cls: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  CANCELLED: { label: 'Cancelado',  cls: 'bg-gray-100   text-gray-500   border-gray-200'   },
  FAILED:    { label: 'Fallido',    cls: 'bg-red-50     text-red-600    border-red-200'    },
  REFUNDED:  { label: 'Reembolso',  cls: 'bg-purple-50  text-purple-600 border-purple-200' },
}

// ── Icons ─────────────────────────────────────────────────────────────────────

const IcoTrend    = () => <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>
const IcoBox      = () => <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"/></svg>
const IcoReceipt  = () => <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>
const IcoSpin     = () => <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 12a9 9 0 11-6.219-8.56"/></svg>
const IcoPlus     = () => <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
const IcoEdit     = () => <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
const IcoTrash    = () => <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2"/></svg>
const IcoBack     = () => <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
const IcoCheck    = () => <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>

// ── Blank product form ────────────────────────────────────────────────────────

type ProductForm = {
  landingId: string; name: string; description: string
  price: string; comparePrice: string; stock: string
  category: string; badge: string; active: boolean
}
function blankForm(landingId = ''): ProductForm {
  return { landingId, name: '', description: '', price: '', comparePrice: '', stock: '', category: '', badge: '', active: true }
}
function productToForm(p: ProductWithLanding): ProductForm {
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

// ── Shared input classes ──────────────────────────────────────────────────────

const inp  = 'w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-300 bg-white'
const sel  = 'w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-300 bg-white'
const lbl  = 'block text-xs font-medium text-gray-500 mb-1'

// ── ProductForm component ─────────────────────────────────────────────────────

type ProductFormMode = 'create' | 'edit'

function ProductFormPanel({
  mode, form, setForm, landings, saving, error,
  onSubmit, onCancel, onDelete,
}: {
  mode: ProductFormMode
  form: ProductForm
  setForm: (fn: (f: ProductForm) => ProductForm) => void
  landings: LandingPage[]
  saving: boolean
  error: string | null
  onSubmit: (e: React.FormEvent) => void
  onCancel: () => void
  onDelete?: () => void
}) {
  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-100 flex-shrink-0">
        <button onClick={onCancel} className="p-1 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors">
          <IcoBack />
        </button>
        <h3 className="text-sm font-bold text-gray-900">
          {mode === 'create' ? 'Nuevo producto' : 'Editar producto'}
        </h3>
        {mode === 'edit' && onDelete && (
          <button
            type="button"
            onClick={onDelete}
            className="ml-auto p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            title="Eliminar producto"
          >
            <IcoTrash />
          </button>
        )}
      </div>

      {/* Form body */}
      <form onSubmit={onSubmit} className="flex-1 overflow-y-auto p-4 space-y-4">

        {/* Página asignada */}
        <div>
          <label className={lbl}>Página *</label>
          <select value={form.landingId} onChange={e => setForm(f => ({ ...f, landingId: e.target.value }))}
            className={sel} required>
            <option value="">Selecciona una página</option>
            {landings.map(l => (
              <option key={l.id} value={l.id}>
                {l.title}{l.published ? '' : ' (borrador)'}
              </option>
            ))}
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
            className={`${inp} resize-none`} rows={3} placeholder="Descripción breve del producto…" />
        </div>

        {/* Precios */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={lbl}>Precio (USD) *</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">$</span>
              <input type="number" min="0" step="0.01" value={form.price}
                onChange={e => setForm(f => ({ ...f, price: e.target.value }))}
                className={`${inp} pl-7`} placeholder="9.99" required />
            </div>
          </div>
          <div>
            <label className={lbl}>Precio original</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">$</span>
              <input type="number" min="0" step="0.01" value={form.comparePrice}
                onChange={e => setForm(f => ({ ...f, comparePrice: e.target.value }))}
                className={`${inp} pl-7`} placeholder="14.99" />
            </div>
          </div>
        </div>

        {/* Stock y Badge */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={lbl}>Stock</label>
            <input type="number" value={form.stock}
              onChange={e => setForm(f => ({ ...f, stock: e.target.value }))}
              className={inp} placeholder="∞ ilimitado" />
            <p className="text-[10px] text-gray-400 mt-1">Dejar vacío = ilimitado</p>
          </div>
          <div>
            <label className={lbl}>Badge</label>
            <select value={form.badge} onChange={e => setForm(f => ({ ...f, badge: e.target.value }))} className={sel}>
              <option value="">Sin badge</option>
              <option value="Nuevo">Nuevo</option>
              <option value="Oferta">Oferta</option>
              <option value="Popular">Popular</option>
            </select>
          </div>
        </div>

        {/* Categoría */}
        <div>
          <label className={lbl}>Categoría</label>
          <input value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
            className={inp} placeholder="Ej: Ropa, Calzado, Servicios…" />
        </div>

        {/* Activo */}
        <div className="flex items-center justify-between py-3 px-4 bg-gray-50 rounded-xl border border-gray-100">
          <div>
            <p className="text-sm font-medium text-gray-700">Producto activo</p>
            <p className="text-xs text-gray-400">Visible en la tienda</p>
          </div>
          <button
            type="button"
            onClick={() => setForm(f => ({ ...f, active: !f.active }))}
            className={`relative w-11 h-6 rounded-full transition-colors ${form.active ? 'bg-indigo-600' : 'bg-gray-300'}`}
          >
            <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${form.active ? 'translate-x-5' : ''}`} />
          </button>
        </div>

        {error && (
          <p className="text-xs text-red-600 bg-red-50 border border-red-100 px-3 py-2 rounded-lg">{error}</p>
        )}

        {/* Actions */}
        <div className="flex gap-2 pt-1 pb-2">
          <button type="button" onClick={onCancel}
            className="flex-1 py-2.5 text-sm font-medium text-gray-600 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors">
            Cancelar
          </button>
          <button type="submit" disabled={saving}
            className="flex-1 py-2.5 text-sm font-bold bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl transition-colors disabled:opacity-60 flex items-center justify-center gap-1.5">
            {saving ? <><IcoSpin />{mode === 'create' ? 'Creando…' : 'Guardando…'}</> : <><IcoCheck />{mode === 'create' ? 'Crear' : 'Guardar'}</>}
          </button>
        </div>
      </form>
    </div>
  )
}

// ── Main component ────────────────────────────────────────────────────────────

type Props = { landings: LandingPage[] }
type ProdView = 'list' | 'create' | 'edit'

export function DashboardSidebar({ landings }: Props) {
  const [tab, setTab] = useState<Tab>('metricas')
  const [loading, setLoading] = useState(false)

  // Data
  const [allOrders, setAllOrders]     = useState<OrderWithLanding[]>([])
  const [allProducts, setAllProducts] = useState<ProductWithLanding[]>([])

  // Orders filters
  const [orderLandingId, setOrderLandingId] = useState('all')
  const [dateFilter, setDateFilter]         = useState<DateFilter>('30d')

  // Products filters & view
  const [prodLandingId, setProdLandingId] = useState('all')
  const [prodView, setProdView]           = useState<ProdView>('list')
  const [editProduct, setEditProduct]     = useState<ProductWithLanding | null>(null)

  // Form state (shared by create & edit)
  const [form, setForm]         = useState<ProductForm>(blankForm(landings[0]?.id))
  const [saving, setSaving]     = useState(false)
  const [formError, setFormError] = useState<string | null>(null)

  // ── Fetch ─────────────────────────────────────────────────────────────────

  const fetchOrders = useCallback(async () => {
    if (landings.length === 0) return
    setLoading(true)
    const results = await Promise.all(
      landings.map(l => getOrdersAction(l.id).then(r =>
        r.success ? r.data.map(o => ({ ...o, landingTitle: l.title })) : []
      ))
    )
    setAllOrders(results.flat().sort((a, b) =>
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    ))
    setLoading(false)
  }, [landings])

  const fetchProducts = useCallback(async () => {
    if (landings.length === 0) return
    setLoading(true)
    const results = await Promise.all(
      landings.map(l => getProductsAction(l.id).then(r =>
        r.success ? r.data.map(p => ({ ...p, landingTitle: l.title })) : []
      ))
    )
    setAllProducts(results.flat())
    setLoading(false)
  }, [landings])

  useEffect(() => {
    if (tab === 'metricas' || tab === 'pedidos')  fetchOrders()
    if (tab === 'metricas' || tab === 'productos') fetchProducts()
  }, [tab, fetchOrders, fetchProducts])

  // ── Derived ───────────────────────────────────────────────────────────────

  const filteredOrders = (() => {
    let list = allOrders
    if (orderLandingId !== 'all') list = list.filter(o => o.landingId === orderLandingId)
    return filterByDate(list, dateFilter)
  })()

  const filteredProducts = prodLandingId === 'all'
    ? allProducts
    : allProducts.filter(p => p.landingId === prodLandingId)

  const paidOrders   = allOrders.filter(o => (o.status as string) === 'PAID' || (o.status as string) === 'COMPLETED')
  const totalRevenue = paidOrders.reduce((s, o) => s + o.totalAmount, 0)
  const pendingCount = allOrders.filter(o => o.status === 'PENDING').length
  const activeProds  = allProducts.filter(p => p.active).length

  // ── Create product ────────────────────────────────────────────────────────

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    setFormError(null)
    if (!form.landingId || !form.name || !form.price) {
      setFormError('Página, nombre y precio son obligatorios')
      return
    }
    setSaving(true)
    const result = await createProductAction(form.landingId, {
      name:         form.name,
      description:  form.description || undefined,
      price:        Math.round(parseFloat(form.price) * 100),
      comparePrice: form.comparePrice ? Math.round(parseFloat(form.comparePrice) * 100) : undefined,
      stock:        form.stock ? parseInt(form.stock) : -1,
      category:     form.category || undefined,
      badge:        form.badge || undefined,
      active:       form.active,
    })
    setSaving(false)
    if (!result.success) { setFormError(result.error); return }
    setProdView('list')
    setForm(blankForm(landings[0]?.id))
    fetchProducts()
  }

  // ── Update product ────────────────────────────────────────────────────────

  async function handleUpdate(e: React.FormEvent) {
    e.preventDefault()
    if (!editProduct) return
    setFormError(null)
    if (!form.name || !form.price) { setFormError('Nombre y precio son obligatorios'); return }
    setSaving(true)
    const result = await updateProductAction(editProduct.id, editProduct.landingId, {
      name:         form.name,
      description:  form.description || undefined,
      price:        Math.round(parseFloat(form.price) * 100),
      comparePrice: form.comparePrice ? Math.round(parseFloat(form.comparePrice) * 100) : undefined,
      stock:        form.stock ? parseInt(form.stock) : -1,
      category:     form.category || undefined,
      badge:        form.badge || undefined,
      active:       form.active,
    })
    setSaving(false)
    if (!result.success) { setFormError(result.error); return }
    setProdView('list')
    setEditProduct(null)
    fetchProducts()
  }

  // ── Delete product ────────────────────────────────────────────────────────

  async function handleDelete() {
    if (!editProduct) return
    if (!confirm(`¿Eliminar "${editProduct.name}"? Esta acción no se puede deshacer.`)) return
    setSaving(true)
    await deleteProductAction(editProduct.id, editProduct.landingId)
    setSaving(false)
    setProdView('list')
    setEditProduct(null)
    fetchProducts()
  }

  // ── Open edit ─────────────────────────────────────────────────────────────

  function openEdit(p: ProductWithLanding) {
    setEditProduct(p)
    setForm(productToForm(p))
    setFormError(null)
    setProdView('edit')
  }

  function openCreate() {
    setEditProduct(null)
    setForm(blankForm(prodLandingId !== 'all' ? prodLandingId : landings[0]?.id ?? ''))
    setFormError(null)
    setProdView('create')
  }

  function backToList() {
    setProdView('list')
    setEditProduct(null)
    setFormError(null)
  }

  // ── Tab class ─────────────────────────────────────────────────────────────

  const tabCls = (t: Tab) => `flex-1 py-2 text-xs font-semibold rounded-lg transition-all ${
    tab === t ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
  }`

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <aside className="w-80 flex-shrink-0 self-start sticky top-6">
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden flex flex-col" style={{ maxHeight: 'calc(100vh - 120px)' }}>

        {/* Tab bar — hide when inside product form */}
        {(tab !== 'productos' || prodView === 'list') && (
          <div className="flex gap-1 bg-gray-50 p-1.5 border-b border-gray-100 flex-shrink-0">
            <button onClick={() => setTab('metricas')}  className={tabCls('metricas')}>Métricas</button>
            <button onClick={() => setTab('pedidos')}   className={tabCls('pedidos')}>Pedidos</button>
            <button onClick={() => setTab('productos')} className={tabCls('productos')}>Productos</button>
          </div>
        )}

        {/* ─── MÉTRICAS ─────────────────────────────────────────────────── */}
        {tab === 'metricas' && (
          <div className="overflow-y-auto flex-1 p-4 space-y-5">
            {loading ? (
              <div className="flex items-center justify-center py-10 text-gray-400 gap-2">
                <IcoSpin /><span className="text-xs">Cargando...</span>
              </div>
            ) : (
              <>
                {/* Stat cards */}
                <div className="grid grid-cols-2 gap-2.5">
                  {[
                    { icon: <IcoTrend />,   label: 'Ingresos totales', value: fmtMoney(totalRevenue), color: 'text-emerald-600 bg-emerald-50' },
                    { icon: <IcoReceipt />, label: 'Pedidos pagados',  value: String(paidOrders.length),  color: 'text-indigo-600 bg-indigo-50'  },
                    { icon: <IcoReceipt />, label: 'Pendientes',        value: String(pendingCount),        color: 'text-amber-600  bg-amber-50'   },
                    { icon: <IcoBox />,     label: 'Productos activos', value: String(activeProds),         color: 'text-violet-600 bg-violet-50'  },
                  ].map(s => (
                    <div key={s.label} className="rounded-xl border border-gray-100 bg-gray-50 p-3">
                      <span className={`inline-flex w-7 h-7 rounded-lg items-center justify-center mb-2 ${s.color}`}>{s.icon}</span>
                      <p className="text-lg font-bold text-gray-900 leading-tight">{s.value}</p>
                      <p className="text-[10px] text-gray-500 mt-0.5 leading-tight">{s.label}</p>
                    </div>
                  ))}
                </div>

                {/* Últimas ventas */}
                <section>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Últimas ventas</p>
                  {paidOrders.length === 0 ? (
                    <p className="text-xs text-gray-400 text-center py-4 bg-gray-50 rounded-xl">Sin ventas registradas aún</p>
                  ) : (
                    <div className="divide-y divide-gray-50">
                      {paidOrders.slice(0, 5).map(o => (
                        <div key={o.id} className="flex items-center justify-between py-2.5">
                          <div className="min-w-0">
                            <p className="text-xs font-semibold text-gray-800 truncate">{o.buyerName ?? o.buyerEmail ?? 'Comprador'}</p>
                            <p className="text-[10px] text-gray-400 truncate">{o.landingTitle}</p>
                          </div>
                          <span className="text-xs font-bold text-emerald-600 ml-2 flex-shrink-0">{fmtMoney(o.totalAmount, o.currency)}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </section>

                {/* Por página */}
                {landings.length > 0 && (
                  <section>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Por página</p>
                    <div className="divide-y divide-gray-50">
                      {landings.map(l => {
                        const lOrders  = paidOrders.filter(o => o.landingId === l.id)
                        const revenue  = lOrders.reduce((s, o) => s + o.totalAmount, 0)
                        const pct      = totalRevenue > 0 ? Math.round(revenue / totalRevenue * 100) : 0
                        return (
                          <div key={l.id} className="py-2.5">
                            <div className="flex items-center justify-between text-xs mb-1">
                              <span className="text-gray-700 font-medium truncate mr-2">{l.title}</span>
                              <span className="text-gray-900 font-bold flex-shrink-0">{fmtMoney(revenue)}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${pct}%` }} />
                              </div>
                              <span className="text-[10px] text-gray-400 flex-shrink-0">{lOrders.length} venta{lOrders.length !== 1 ? 's' : ''}</span>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </section>
                )}
              </>
            )}
          </div>
        )}

        {/* ─── PEDIDOS ──────────────────────────────────────────────────── */}
        {tab === 'pedidos' && (
          <div className="flex flex-col flex-1 overflow-hidden">
            {/* Filters */}
            <div className="px-4 pt-4 pb-3 border-b border-gray-100 space-y-3 flex-shrink-0">
              <div>
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1.5">Página</label>
                <select value={orderLandingId} onChange={e => setOrderLandingId(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-300 bg-white">
                  <option value="all">Todas las páginas</option>
                  {landings.map(l => <option key={l.id} value={l.id}>{l.title}</option>)}
                </select>
              </div>
              <div>
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1.5">Período</label>
                <div className="grid grid-cols-4 gap-1">
                  {(['today', '7d', '30d', 'all'] as DateFilter[]).map(v => (
                    <button key={v} onClick={() => setDateFilter(v)}
                      className={`py-1.5 text-xs font-semibold rounded-lg border transition-all ${
                        dateFilter === v ? 'bg-indigo-600 text-white border-indigo-600' : 'text-gray-500 border-gray-200 hover:border-indigo-300'
                      }`}>
                      {v === 'today' ? 'Hoy' : v === 'all' ? 'Todo' : v}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Count */}
            <div className="px-4 py-2 flex items-center justify-between border-b border-gray-50 flex-shrink-0">
              <p className="text-xs text-gray-400">{filteredOrders.length} pedido{filteredOrders.length !== 1 ? 's' : ''}</p>
              {loading && <IcoSpin />}
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto p-3 space-y-2">
              {filteredOrders.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-gray-400">
                  <IcoReceipt />
                  <p className="text-xs mt-2">Sin pedidos en este período</p>
                </div>
              ) : filteredOrders.map(order => {
                const s = STATUS_MAP[order.status] ?? STATUS_MAP['PENDING']!
                return (
                  <div key={order.id} className="bg-white border border-gray-100 rounded-xl p-3.5 space-y-2.5 hover:border-indigo-100 transition-colors">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-gray-900 truncate">
                          {order.buyerName ?? order.buyerEmail ?? 'Sin nombre'}
                        </p>
                        {order.buyerEmail && order.buyerName && (
                          <p className="text-[11px] text-gray-400 truncate">{order.buyerEmail}</p>
                        )}
                      </div>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border flex-shrink-0 ${s.cls}`}>
                        {s.label}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-xs text-gray-400">
                      <span className="truncate mr-2">{order.landingTitle}</span>
                      <span className="flex-shrink-0">{fmtDate(order.createdAt)}</span>
                    </div>
                    <div className="flex items-center justify-between pt-0.5 border-t border-gray-50">
                      <span className="text-xs text-gray-400">{order.items.length} producto{order.items.length !== 1 ? 's' : ''}</span>
                      <span className="text-base font-bold text-gray-900">{fmtMoney(order.totalAmount, order.currency)}</span>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* ─── PRODUCTOS ────────────────────────────────────────────────── */}
        {tab === 'productos' && (

          /* List view */
          prodView === 'list' ? (
            <div className="flex flex-col flex-1 overflow-hidden">
              {/* Toolbar */}
              <div className="px-4 pt-4 pb-3 border-b border-gray-100 space-y-3 flex-shrink-0">
                <div className="flex items-center gap-2">
                  <select value={prodLandingId} onChange={e => setProdLandingId(e.target.value)}
                    className="flex-1 px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-300 bg-white">
                    <option value="all">Todas las páginas</option>
                    {landings.map(l => <option key={l.id} value={l.id}>{l.title}</option>)}
                  </select>
                  <button onClick={openCreate}
                    className="flex items-center gap-1.5 px-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg transition-colors whitespace-nowrap">
                    <IcoPlus /> Nuevo
                  </button>
                </div>
              </div>

              {/* Count */}
              <div className="px-4 py-2 flex items-center justify-between flex-shrink-0">
                <p className="text-xs text-gray-400">{filteredProducts.length} producto{filteredProducts.length !== 1 ? 's' : ''}</p>
                {loading && <IcoSpin />}
              </div>

              {/* Product list */}
              <div className="flex-1 overflow-y-auto px-3 pb-3 space-y-1.5">
                {filteredProducts.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-gray-400">
                    <IcoBox />
                    <p className="text-xs mt-2">Sin productos{prodLandingId !== 'all' ? ' en esta página' : ''}</p>
                    <button onClick={openCreate}
                      className="mt-3 px-3 py-1.5 bg-indigo-50 text-indigo-600 text-xs font-semibold rounded-lg hover:bg-indigo-100 transition-colors">
                      Crear primer producto
                    </button>
                  </div>
                ) : filteredProducts.map(p => (
                  <button
                    key={p.id}
                    onClick={() => openEdit(p)}
                    className="w-full text-left flex items-center gap-3 px-3 py-3 rounded-xl border border-gray-100 bg-white hover:border-indigo-200 hover:bg-indigo-50/30 transition-all group"
                  >
                    {/* Status dot */}
                    <span className={`w-2 h-2 rounded-full flex-shrink-0 ${p.active ? 'bg-emerald-400' : 'bg-gray-300'}`} />

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <p className="text-sm font-semibold text-gray-800 truncate">{p.name}</p>
                        {p.badge && (
                          <span className="text-[9px] font-bold bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded-full flex-shrink-0">
                            {p.badge}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span className="text-[11px] text-gray-400 truncate">{p.landingTitle}</span>
                        {p.category && <span className="text-[11px] text-indigo-400">· {p.category}</span>}
                      </div>
                    </div>

                    <div className="flex-shrink-0 text-right">
                      <p className="text-sm font-bold text-gray-900">{fmtMoney(p.price)}</p>
                      {p.comparePrice && (
                        <p className="text-[10px] text-gray-400 line-through">{fmtMoney(p.comparePrice)}</p>
                      )}
                      <p className="text-[10px] text-gray-400">{p.stock === -1 ? '∞' : `${p.stock} uds`}</p>
                    </div>

                    <span className="text-gray-300 group-hover:text-indigo-400 transition-colors flex-shrink-0">
                      <IcoEdit />
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )

          /* Create / Edit views */
          : (
            <div className="flex flex-col flex-1 overflow-hidden">
              <ProductFormPanel
                mode={prodView}
                form={form}
                setForm={setForm}
                landings={landings}
                saving={saving}
                error={formError}
                onSubmit={prodView === 'create' ? handleCreate : handleUpdate}
                onCancel={backToList}
                onDelete={prodView === 'edit' ? handleDelete : undefined}
              />
            </div>
          )
        )}
      </div>
    </aside>
  )
}
