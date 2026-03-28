'use client'

import { useState } from 'react'
import { getMyOrdersAction } from '@/app/actions/buyer.actions'
import type { Order } from '@/domain/store/store.types'

const STATUS_LABEL: Record<string, { label: string; color: string }> = {
  PENDING:   { label: 'Pendiente',  color: 'bg-yellow-100 text-yellow-700' },
  PAID:      { label: 'Pagado',     color: 'bg-emerald-100 text-emerald-700' },
  COMPLETED: { label: 'Completado', color: 'bg-emerald-100 text-emerald-700' },
  CANCELLED: { label: 'Cancelado',  color: 'bg-red-100 text-red-600' },
  FAILED:    { label: 'Fallido',    color: 'bg-red-100 text-red-600' },
  REFUNDED:  { label: 'Reembolsado',color: 'bg-gray-100 text-gray-600' },
}

export function MyOrdersClient() {
  const [email,   setEmail]   = useState('')
  const [orders,  setOrders]  = useState<Order[] | null>(null)
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState<string | null>(null)
  const [searched,setSearched]= useState(false)

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    const result = await getMyOrdersAction(email.trim())
    setLoading(false)
    setSearched(true)
    if (!result.success) { setError(result.error); return }
    setOrders(result.data)
  }

  const formatted = (cents: number, currency: string) =>
    new Intl.NumberFormat('es-MX', { style: 'currency', currency: currency.toUpperCase() }).format(cents / 100)

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50/40 to-white px-4 py-12">
      <div className="max-w-2xl mx-auto">

        {/* Header */}
        <div className="text-center mb-10">
          <div className="w-16 h-16 bg-indigo-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-indigo-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/>
            </svg>
          </div>
          <h1 className="text-3xl font-black text-gray-900 mb-2">Mis pedidos</h1>
          <p className="text-gray-500 text-sm">Ingresa tu email para ver el historial de tus compras</p>
        </div>

        {/* Formulario de búsqueda */}
        <form onSubmit={handleSearch} className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 mb-8">
          <label className="block text-sm font-semibold text-gray-700 mb-2">Email de compra</label>
          <div className="flex gap-3">
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              placeholder="tu@email.com"
              className="flex-1 px-4 py-3 text-sm border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
            />
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-2xl text-sm transition-all disabled:opacity-60 flex items-center gap-2"
            >
              {loading ? (
                <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
              ) : (
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
              )}
              Buscar
            </button>
          </div>
          {error && <p className="mt-3 text-sm text-red-600 bg-red-50 px-3 py-2 rounded-xl">{error}</p>}
        </form>

        {/* Resultados */}
        {searched && orders !== null && (
          <>
            {orders.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-3xl border border-gray-100 shadow-sm">
                <span className="text-5xl mb-4 block">📭</span>
                <p className="font-semibold text-gray-700 mb-1">No encontramos pedidos</p>
                <p className="text-sm text-gray-400">No hay compras asociadas a <strong>{email}</strong></p>
              </div>
            ) : (
              <div className="space-y-4">
                <p className="text-xs text-gray-400 text-center mb-6">
                  {orders.length} pedido{orders.length !== 1 ? 's' : ''} encontrado{orders.length !== 1 ? 's' : ''}
                </p>
                {orders.map(order => {
                  const st = STATUS_LABEL[order.status] ?? { label: order.status, color: 'bg-gray-100 text-gray-600' }
                  return (
                    <div key={order.id} className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
                      {/* Order header */}
                      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-50">
                        <div>
                          <p className="text-xs text-gray-400 font-mono">
                            #{order.id.slice(0, 16).toUpperCase()}
                          </p>
                          <p className="text-xs text-gray-400 mt-0.5">
                            {new Date(order.createdAt).toLocaleDateString('es-MX', {
                              day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit'
                            })}
                          </p>
                        </div>
                        <span className={`text-xs font-bold px-3 py-1 rounded-full ${st.color}`}>
                          {st.label}
                        </span>
                      </div>

                      {/* Items */}
                      <div className="px-6 py-4 space-y-3">
                        {order.items.map(item => (
                          <div key={item.id} className="flex justify-between items-center text-sm">
                            <div className="flex items-center gap-2">
                              <span className="w-6 h-6 bg-gray-100 rounded-lg flex items-center justify-center text-xs font-bold text-gray-500">
                                {item.quantity}
                              </span>
                              <span className="text-gray-700">{item.name}</span>
                            </div>
                            <span className="font-semibold text-gray-900">
                              {formatted(item.unitPrice * item.quantity, order.currency)}
                            </span>
                          </div>
                        ))}
                      </div>

                      {/* Footer */}
                      <div className="px-6 py-4 bg-gray-50/50 flex items-center justify-between">
                        {order.shippingAddress && (
                          <div className="text-xs text-gray-500">
                            <svg className="w-3 h-3 inline mr-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>
                            {order.shippingAddress.city}, {order.shippingAddress.country}
                          </div>
                        )}
                        <div className="ml-auto text-right">
                          <p className="text-xs text-gray-400">Total</p>
                          <p className="font-black text-indigo-600 text-lg">{formatted(order.totalAmount, order.currency)}</p>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
