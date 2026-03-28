'use client'

import { useState, useEffect, useCallback } from 'react'
import { getOrdersAction, getProductsAction } from '@/app/actions/store.actions'
import { getLandingsAction } from '@/app/actions/landing.actions'
import type { LandingPage } from '@/domain/landing/landing.types'
import type { Order, Product } from '@/domain/store/store.types'

type OrderExt   = Order   & { landingTitle: string }
type ProductExt = Product & { landingTitle: string }

function fmtMoney(cents: number, currency = 'usd') {
  return new Intl.NumberFormat('es-MX', {
    style: 'currency', currency: currency.toUpperCase(), minimumFractionDigits: 2,
  }).format(cents / 100)
}
function fmtDate(d: Date | string) {
  const date = typeof d === 'string' ? new Date(d) : d
  return date.toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' })
}

const IcoSpin = () => <svg className="w-5 h-5 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 12a9 9 0 11-6.219-8.56"/></svg>
const IcoTrend = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>
const IcoBox   = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"/></svg>
const IcoCart  = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
const IcoClock = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>

export default function MetricasPage() {
  const [landings, setLandings]     = useState<LandingPage[]>([])
  const [orders, setOrders]         = useState<OrderExt[]>([])
  const [products, setProducts]     = useState<ProductExt[]>([])
  const [loading, setLoading]       = useState(true)
  const [period, setPeriod]         = useState<'7d' | '30d' | '90d' | 'all'>('30d')

  const fetchAll = useCallback(async () => {
    setLoading(true)
    const lRes = await getLandingsAction()
    if (!lRes.success) { setLoading(false); return }
    const ls = lRes.data
    setLandings(ls)

    const [ordersRes, productsRes] = await Promise.all([
      Promise.all(ls.map(l => getOrdersAction(l.id).then(r =>
        r.success ? r.data.map(o => ({ ...o, landingTitle: l.title })) : []
      ))),
      Promise.all(ls.map(l => getProductsAction(l.id).then(r =>
        r.success ? r.data.map(p => ({ ...p, landingTitle: l.title })) : []
      ))),
    ])

    setOrders(ordersRes.flat().sort((a, b) =>
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    ))
    setProducts(productsRes.flat())
    setLoading(false)
  }, [])

  useEffect(() => { fetchAll() }, [fetchAll])

  // Filter by period
  const cutoff = (() => {
    const d = new Date()
    if (period === '7d')  { d.setDate(d.getDate() - 7);  return d }
    if (period === '30d') { d.setDate(d.getDate() - 30); return d }
    if (period === '90d') { d.setDate(d.getDate() - 90); return d }
    return null
  })()
  const filteredOrders = cutoff
    ? orders.filter(o => new Date(o.createdAt) >= cutoff)
    : orders

  const paid      = filteredOrders.filter(o => (o.status as string) === 'PAID' || (o.status as string) === 'COMPLETED')
  const pending   = filteredOrders.filter(o => o.status === 'PENDING')
  const revenue   = paid.reduce((s, o) => s + o.totalAmount, 0)
  const activeP   = products.filter(p => p.active).length

  // Per-landing breakdown
  const byLanding = landings.map(l => {
    const lPaid = paid.filter(o => o.landingId === l.id)
    return {
      id: l.id,
      title: l.title,
      orders: lPaid.length,
      revenue: lPaid.reduce((s, o) => s + o.totalAmount, 0),
    }
  }).sort((a, b) => b.revenue - a.revenue)

  const maxRevenue = Math.max(...byLanding.map(l => l.revenue), 1)

  // Best sellers
  const productSales: Record<string, { name: string; qty: number; revenue: number }> = {}
  paid.forEach(o => o.items.forEach(item => {
    if (!productSales[item.productId]) {
      productSales[item.productId] = { name: item.name, qty: 0, revenue: 0 }
    }
    productSales[item.productId]!.qty     += item.quantity
    productSales[item.productId]!.revenue += item.unitPrice * item.quantity
  }))
  const bestSellers = Object.values(productSales).sort((a, b) => b.revenue - a.revenue).slice(0, 5)

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Métricas</h1>
          <p className="text-sm text-gray-500 mt-1">Resumen de ventas y actividad</p>
        </div>
        <div className="flex gap-1 bg-white border border-gray-200 rounded-xl p-1">
          {(['7d', '30d', '90d', 'all'] as const).map(p => (
            <button key={p} onClick={() => setPeriod(p)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                period === p ? 'bg-indigo-600 text-white' : 'text-gray-500 hover:text-gray-700'
              }`}>
              {p === 'all' ? 'Todo' : p}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-32 text-gray-400 gap-3">
          <IcoSpin /><span>Cargando métricas…</span>
        </div>
      ) : (
        <div className="space-y-8">

          {/* KPI cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { icon: <IcoTrend />, label: 'Ingresos',         value: fmtMoney(revenue),         sub: `${paid.length} ventas`,             color: 'bg-emerald-50 text-emerald-600' },
              { icon: <IcoCart />,  label: 'Pedidos pagados',  value: String(paid.length),       sub: `de ${filteredOrders.length} totales`, color: 'bg-indigo-50 text-indigo-600'  },
              { icon: <IcoClock />, label: 'Pendientes',        value: String(pending.length),    sub: 'por cobrar',                         color: 'bg-amber-50 text-amber-600'    },
              { icon: <IcoBox />,   label: 'Productos activos', value: String(activeP),           sub: `de ${products.length} totales`,      color: 'bg-violet-50 text-violet-600'  },
            ].map(card => (
              <div key={card.label} className="bg-white rounded-2xl border border-gray-200 p-5">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${card.color}`}>
                  {card.icon}
                </div>
                <p className="text-2xl font-bold text-gray-900 leading-tight">{card.value}</p>
                <p className="text-xs text-gray-500 mt-1">{card.label}</p>
                <p className="text-[11px] text-gray-400 mt-0.5">{card.sub}</p>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

            {/* Revenue by landing */}
            <div className="bg-white rounded-2xl border border-gray-200 p-6">
              <h2 className="font-bold text-gray-900 mb-4">Ingresos por página</h2>
              {byLanding.length === 0 || byLanding.every(l => l.revenue === 0) ? (
                <p className="text-sm text-gray-400 text-center py-8">Sin ventas en este período</p>
              ) : (
                <div className="space-y-4">
                  {byLanding.filter(l => l.revenue > 0 || landings.length <= 3).map(l => (
                    <div key={l.id}>
                      <div className="flex items-center justify-between text-sm mb-1.5">
                        <span className="font-medium text-gray-700 truncate mr-2">{l.title}</span>
                        <span className="font-bold text-gray-900 flex-shrink-0">{fmtMoney(l.revenue)}</span>
                      </div>
                      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-indigo-500 rounded-full transition-all"
                          style={{ width: `${(l.revenue / maxRevenue) * 100}%` }}
                        />
                      </div>
                      <p className="text-[11px] text-gray-400 mt-1">{l.orders} venta{l.orders !== 1 ? 's' : ''}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Recent paid orders */}
            <div className="bg-white rounded-2xl border border-gray-200 p-6">
              <h2 className="font-bold text-gray-900 mb-4">Últimas ventas</h2>
              {paid.length === 0 ? (
                <p className="text-sm text-gray-400 text-center py-8">Sin ventas en este período</p>
              ) : (
                <div className="divide-y divide-gray-50">
                  {paid.slice(0, 8).map(o => (
                    <div key={o.id} className="flex items-center justify-between py-3">
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-gray-800 truncate">{o.buyerName ?? o.buyerEmail ?? 'Comprador'}</p>
                        <p className="text-[11px] text-gray-400">{o.landingTitle} · {fmtDate(o.createdAt)}</p>
                      </div>
                      <span className="text-sm font-bold text-emerald-600 ml-3 flex-shrink-0">
                        {fmtMoney(o.totalAmount, o.currency)}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Best sellers */}
            <div className="bg-white rounded-2xl border border-gray-200 p-6 lg:col-span-2">
              <h2 className="font-bold text-gray-900 mb-4">Productos más vendidos</h2>
              {bestSellers.length === 0 ? (
                <p className="text-sm text-gray-400 text-center py-8">Sin datos de ventas aún</p>
              ) : (
                <div className="divide-y divide-gray-50">
                  {bestSellers.map((p, i) => (
                    <div key={p.name} className="flex items-center gap-4 py-3">
                      <span className="text-lg font-black text-gray-200 w-6 text-center flex-shrink-0">{i + 1}</span>
                      <p className="flex-1 text-sm font-medium text-gray-800 truncate">{p.name}</p>
                      <span className="text-xs text-gray-400">{p.qty} vendido{p.qty !== 1 ? 's' : ''}</span>
                      <span className="text-sm font-bold text-gray-900">{fmtMoney(p.revenue)}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
