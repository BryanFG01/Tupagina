'use client'

import { useState, useEffect, useCallback } from 'react'
import { getOrdersAction } from '@/app/actions/store.actions'
import { getLandingsAction } from '@/app/actions/landing.actions'
import type { LandingPage } from '@/domain/landing/landing.types'
import type { Order } from '@/domain/store/store.types'

type OrderExt = Order & { landingTitle: string }
type DateFilter = 'today' | '7d' | '30d' | 'all'

function fmtMoney(cents: number, currency = 'usd') {
  return new Intl.NumberFormat('es-MX', {
    style: 'currency', currency: currency.toUpperCase(), minimumFractionDigits: 2,
  }).format(cents / 100)
}
function fmtDate(d: Date | string) {
  const date = typeof d === 'string' ? new Date(d) : d
  return date.toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
}
function filterByDate(orders: OrderExt[], filter: DateFilter) {
  if (filter === 'all') return orders
  const now = new Date(); const cutoff = new Date(now)
  if (filter === 'today') { cutoff.setHours(0, 0, 0, 0) }
  else if (filter === '7d')  { cutoff.setDate(now.getDate() - 7)  }
  else if (filter === '30d') { cutoff.setDate(now.getDate() - 30) }
  return orders.filter(o => new Date(o.createdAt) >= cutoff)
}

const STATUS_MAP: Record<string, { label: string; dot: string; cls: string }> = {
  PENDING:   { label: 'Pendiente',  dot: 'bg-amber-400',   cls: 'bg-amber-50   text-amber-700   border-amber-200'   },
  PAID:      { label: 'Pagado',     dot: 'bg-emerald-400', cls: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  COMPLETED: { label: 'Completado', dot: 'bg-emerald-400', cls: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  CANCELLED: { label: 'Cancelado',  dot: 'bg-gray-300',    cls: 'bg-gray-100   text-gray-500   border-gray-200'    },
  FAILED:    { label: 'Fallido',    dot: 'bg-red-400',     cls: 'bg-red-50     text-red-600    border-red-200'     },
  REFUNDED:  { label: 'Reembolso',  dot: 'bg-purple-400',  cls: 'bg-purple-50  text-purple-600 border-purple-200'  },
}

const IcoSpin = () => <svg className="w-5 h-5 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 12a9 9 0 11-6.219-8.56"/></svg>
const IcoEmpty = () => <svg viewBox="0 0 64 64" fill="none" className="w-14 h-14 mx-auto mb-3 opacity-40"><rect x="8" y="4" width="48" height="56" rx="4" stroke="#94a3b8" strokeWidth="2"/><line x1="20" y1="20" x2="44" y2="20" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round"/><line x1="20" y1="28" x2="44" y2="28" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round"/><line x1="20" y1="36" x2="36" y2="36" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round"/></svg>
const IcoChevronLeft = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><polyline points="15 18 9 12 15 6"/></svg>
const IcoChevronRight = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><polyline points="9 18 15 12 9 6"/></svg>

const ITEMS_PER_PAGE = 10

export default function PedidosPage() {
  const [landings, setLandings]   = useState<LandingPage[]>([])
  const [allOrders, setAllOrders] = useState<OrderExt[]>([])
  const [loading, setLoading]     = useState(true)
  const [landingId, setLandingId] = useState('all')
  const [dateFilter, setDateFilter] = useState<DateFilter>('30d')
  const [search, setSearch]       = useState('')
  const [currentPage, setCurrentPage] = useState(1)

  const fetchAll = useCallback(async () => {
    setLoading(true)
    const lRes = await getLandingsAction()
    if (!lRes.success) { setLoading(false); return }
    const ls = lRes.data
    setLandings(ls)
    const results = await Promise.all(
      ls.map(l => getOrdersAction(l.id).then(r =>
        r.success ? r.data.map(o => ({ ...o, landingTitle: l.title })) : []
      ))
    )
    setAllOrders(results.flat().sort((a, b) =>
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    ))
    setLoading(false)
  }, [])

  useEffect(() => { fetchAll() }, [fetchAll])

  const filtered = (() => {
    let list = allOrders
    if (landingId !== 'all') list = list.filter(o => o.landingId === landingId)
    list = filterByDate(list, dateFilter)
    if (search.trim()) {
      const q = search.toLowerCase()
      list = list.filter(o =>
        o.buyerName?.toLowerCase().includes(q) ||
        o.buyerEmail?.toLowerCase().includes(q) ||
        o.landingTitle.toLowerCase().includes(q)
      )
    }
    return list
  })()

  // Paginación
  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE)
  const startIdx = (currentPage - 1) * ITEMS_PER_PAGE
  const paginatedOrders = filtered.slice(startIdx, startIdx + ITEMS_PER_PAGE)

  // Reset page cuando cambian filtros
  useEffect(() => { setCurrentPage(1) }, [landingId, dateFilter, search])

  const paid    = filtered.filter(o => (o.status as string) === 'PAID' || (o.status as string) === 'COMPLETED')
  const revenue = paid.reduce((s, o) => s + o.totalAmount, 0)

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Pedidos</h1>
          <p className="text-sm text-gray-500 mt-1">Historial de órdenes de tus páginas</p>
        </div>
        <button onClick={fetchAll} className="flex items-center gap-2 px-4 py-2 text-sm text-gray-600 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4"><polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/><path d="M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15"/></svg>
          Actualizar
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
        <div>
          <label className="text-xs font-semibold text-gray-500 block mb-1.5">Período</label>
          <div className="flex gap-1">
            {([
              { v: 'today', label: 'Hoy'  },
              { v: '7d',   label: '7d'   },
              { v: '30d',  label: '30d'  },
              { v: 'all',  label: 'Todo' },
            ] as { v: DateFilter; label: string }[]).map(opt => (
              <button key={opt.v} onClick={() => setDateFilter(opt.v)}
                className={`px-3 py-2 text-sm font-semibold rounded-xl border transition-all ${
                  dateFilter === opt.v
                    ? 'bg-indigo-600 text-white border-indigo-600'
                    : 'text-gray-500 border-gray-200 hover:border-indigo-300'
                }`}>
                {opt.label}
              </button>
            ))}
          </div>
        </div>
        <div className="flex-1 min-w-48">
          <label className="text-xs font-semibold text-gray-500 block mb-1.5">Buscar</label>
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Nombre, email…"
            className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-300" />
        </div>
      </div>

      {/* Summary bar */}
      {!loading && (
        <div className="flex items-center gap-6 mb-4 px-1">
          <p className="text-sm text-gray-500"><span className="font-bold text-gray-900">{filtered.length}</span> pedido{filtered.length !== 1 ? 's' : ''}</p>
          <p className="text-sm text-gray-500"><span className="font-bold text-emerald-600">{fmtMoney(revenue)}</span> cobrado</p>
          <p className="text-sm text-gray-500"><span className="font-bold text-amber-600">{filtered.filter(o => o.status === 'PENDING').length}</span> pendiente{filtered.filter(o => o.status === 'PENDING').length !== 1 ? 's' : ''}</p>
        </div>
      )}

      {/* Table */}
      {loading ? (
        <div className="flex items-center justify-center py-32 text-gray-400 gap-3">
          <IcoSpin /><span>Cargando pedidos…</span>
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-2xl flex flex-col items-center justify-center py-20 text-gray-400">
          <IcoEmpty />
          <p className="text-sm font-medium">Sin pedidos en este período</p>
        </div>
      ) : (
        <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
          {/* Table head */}
          <div className="grid grid-cols-[2fr_1.5fr_1fr_1fr_auto] gap-4 px-6 py-3 bg-gray-50 border-b border-gray-100 text-[11px] font-bold text-gray-400 uppercase tracking-wider">
            <span>Cliente</span>
            <span>Página</span>
            <span>Fecha</span>
            <span>Estado</span>
            <span className="text-right">Total</span>
          </div>
          {/* Rows */}
          <div className="divide-y divide-gray-50">
            {paginatedOrders.map(order => {
              const s = STATUS_MAP[order.status] ?? STATUS_MAP['PENDING']!
              return (
                <div key={order.id} className="grid grid-cols-[2fr_1.5fr_1fr_1fr_auto] gap-4 px-6 py-4 items-center hover:bg-gray-50/50 transition-colors">
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-gray-900 truncate">{order.buyerName ?? '—'}</p>
                    <p className="text-[11px] text-gray-400 truncate">{order.buyerEmail ?? ''}</p>
                  </div>
                  <p className="text-sm text-gray-600 truncate">{order.landingTitle}</p>
                  <p className="text-[11px] text-gray-500">{fmtDate(order.createdAt)}</p>
                  <div>
                    <span className={`inline-flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-1 rounded-full border ${s.cls}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
                      {s.label}
                    </span>
                  </div>
                  <p className="text-sm font-bold text-gray-900 text-right">{fmtMoney(order.totalAmount, order.currency)}</p>
                </div>
              )
            })}
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
