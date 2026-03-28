'use client'

import { useState } from 'react'
import { useCart } from './StoreProvider'
import { createStoreCheckoutAction } from '@/app/actions/store.actions'

type Props = { landingId: string; currency: string }

type Step = 'cart' | 'shipping'

type ShippingForm = {
  buyerName:  string
  buyerEmail: string
  buyerPhone: string
  street:  string
  city:    string
  state:   string
  zipCode: string
  country: string
}

const EMPTY_FORM: ShippingForm = {
  buyerName: '', buyerEmail: '', buyerPhone: '',
  street: '', city: '', state: '', zipCode: '', country: '',
}

export function CartDrawer({ landingId, currency }: Props) {
  const { items, remove, updateQty, clear, total, count, isOpen, closeCart } = useCart()
  const [step,     setStep]     = useState<Step>('cart')
  const [form,     setForm]     = useState<ShippingForm>(EMPTY_FORM)
  const [provider, setProvider] = useState<'stripe' | 'mercadopago'>('stripe')
  const [loading,  setLoading]  = useState(false)
  const [error,    setError]    = useState<string | null>(null)

  const formatted = (cents: number) =>
    new Intl.NumberFormat('es-MX', { style: 'currency', currency: currency.toUpperCase() }).format(cents / 100)

  function handleClose() {
    closeCart()
    setStep('cart')
    setError(null)
  }

  async function handleCheckout() {
    setError(null)
    setLoading(true)

    const shippingAddress = form.street.trim() ? {
      street:  form.street.trim(),
      city:    form.city.trim(),
      state:   form.state.trim(),
      zipCode: form.zipCode.trim(),
      country: form.country.trim(),
    } : undefined

    const result = await createStoreCheckoutAction({
      landingId,
      currency,
      paymentProvider: provider,
      buyerName:  form.buyerName.trim()  || undefined,
      buyerEmail: form.buyerEmail.trim() || undefined,
      buyerPhone: form.buyerPhone.trim() || undefined,
      shippingAddress,
      items: items.map(i => ({ productId: i.productId, quantity: i.quantity })),
    })

    setLoading(false)
    if (!result.success) { setError(result.error); return }
    window.location.href = result.data.checkoutUrl
  }

  if (!isOpen) return null

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 transition-opacity" onClick={handleClose} />

      {/* Drawer */}
      <div className="fixed right-0 top-0 h-full w-full max-w-sm bg-white shadow-2xl z-50 flex flex-col animate-in slide-in-from-right duration-300">

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b">
          <div className="flex items-center gap-2">
            {step === 'shipping' && (
              <button onClick={() => setStep('cart')} className="w-7 h-7 rounded-lg hover:bg-gray-100 flex items-center justify-center text-gray-400 hover:text-gray-700 transition-colors mr-1">
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="15 18 9 12 15 6"/></svg>
              </button>
            )}
            <span className="text-xl">{step === 'cart' ? '🛒' : '📦'}</span>
            <h2 className="font-bold text-gray-900 text-lg">
              {step === 'cart' ? 'Tu carrito' : 'Datos de envío'}
            </h2>
            {step === 'cart' && count > 0 && (
              <span className="bg-indigo-600 text-white text-xs font-bold px-2 py-0.5 rounded-full">{count}</span>
            )}
          </div>
          <button onClick={handleClose} className="w-8 h-8 rounded-xl hover:bg-gray-100 flex items-center justify-center text-gray-400 hover:text-gray-700 transition-colors">
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>

        {/* ── STEP 1: Carrito ── */}
        {step === 'cart' && (
          <>
            <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
              {items.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center py-12">
                  <span className="text-5xl mb-4">🛍️</span>
                  <p className="font-semibold text-gray-700 mb-1">Tu carrito está vacío</p>
                  <p className="text-sm text-gray-400">Agrega productos para continuar</p>
                </div>
              ) : (
                items.map(item => (
                  <div key={item.productId} className="flex items-center gap-3 py-3 border-b border-gray-100 last:border-0">
                    <div className="w-14 h-14 rounded-xl bg-gray-100 flex-shrink-0 overflow-hidden">
                      {item.imageUrl ? (
                        <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-2xl">📦</div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-800 text-sm truncate">{item.name}</p>
                      <p className="text-indigo-600 font-bold text-sm">{formatted(item.unitPrice)}</p>
                    </div>
                    <div className="flex items-center gap-1 bg-gray-100 rounded-xl p-1">
                      <button onClick={() => updateQty(item.productId, item.quantity - 1)} className="w-7 h-7 rounded-lg bg-white shadow-sm text-gray-700 hover:text-red-500 font-bold text-lg flex items-center justify-center transition-colors">−</button>
                      <span className="w-6 text-center text-sm font-bold text-gray-800">{item.quantity}</span>
                      <button onClick={() => updateQty(item.productId, item.quantity + 1)} className="w-7 h-7 rounded-lg bg-white shadow-sm text-gray-700 hover:text-indigo-600 font-bold text-lg flex items-center justify-center transition-colors">+</button>
                    </div>
                    <button onClick={() => remove(item.productId)} className="w-7 h-7 rounded-lg hover:bg-red-50 text-gray-300 hover:text-red-500 flex items-center justify-center transition-colors">
                      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3,6 5,6 21,6"/><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/></svg>
                    </button>
                  </div>
                ))
              )}
            </div>

            {items.length > 0 && (
              <div className="px-5 py-5 border-t bg-gray-50/80 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600 font-medium">Total</span>
                  <span className="text-2xl font-bold text-gray-900">{formatted(total)}</span>
                </div>
                <button
                  onClick={() => { setError(null); setStep('shipping') }}
                  className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-2xl shadow-lg shadow-indigo-200 transition-all text-sm flex items-center justify-center gap-2"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="9 18 15 12 9 6"/></svg>
                  Continuar al pago
                </button>
                <button onClick={clear} className="w-full text-xs text-gray-400 hover:text-gray-600 transition-colors py-1">Vaciar carrito</button>
              </div>
            )}
          </>
        )}

        {/* ── STEP 2: Datos + Pago ── */}
        {step === 'shipping' && (
          <>
            <div className="flex-1 overflow-y-auto px-5 py-4 space-y-5">

              {/* Datos del comprador */}
              <div className="space-y-3">
                <p className="text-xs font-black text-gray-500 uppercase tracking-widest">Tus datos</p>
                <input
                  value={form.buyerName}
                  onChange={e => setForm(f => ({ ...f, buyerName: e.target.value }))}
                  placeholder="Nombre completo *"
                  className="w-full px-4 py-3 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <input
                  value={form.buyerEmail}
                  onChange={e => setForm(f => ({ ...f, buyerEmail: e.target.value }))}
                  placeholder="Email"
                  type="email"
                  className="w-full px-4 py-3 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <input
                  value={form.buyerPhone}
                  onChange={e => setForm(f => ({ ...f, buyerPhone: e.target.value }))}
                  placeholder="Teléfono / WhatsApp"
                  type="tel"
                  className="w-full px-4 py-3 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              {/* Dirección de envío */}
              <div className="space-y-3">
                <p className="text-xs font-black text-gray-500 uppercase tracking-widest">Dirección de envío</p>
                <input
                  value={form.street}
                  onChange={e => setForm(f => ({ ...f, street: e.target.value }))}
                  placeholder="Calle y número"
                  className="w-full px-4 py-3 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <div className="grid grid-cols-2 gap-3">
                  <input
                    value={form.city}
                    onChange={e => setForm(f => ({ ...f, city: e.target.value }))}
                    placeholder="Ciudad"
                    className="px-4 py-3 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                  <input
                    value={form.state}
                    onChange={e => setForm(f => ({ ...f, state: e.target.value }))}
                    placeholder="Estado / Prov."
                    className="px-4 py-3 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <input
                    value={form.zipCode}
                    onChange={e => setForm(f => ({ ...f, zipCode: e.target.value }))}
                    placeholder="Código postal"
                    className="px-4 py-3 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                  <input
                    value={form.country}
                    onChange={e => setForm(f => ({ ...f, country: e.target.value }))}
                    placeholder="País"
                    className="px-4 py-3 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              {/* Método de pago */}
              <div className="space-y-2">
                <p className="text-xs font-black text-gray-500 uppercase tracking-widest">Método de pago</p>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setProvider('stripe')}
                    className={`flex flex-col items-center gap-1.5 p-3 rounded-2xl border-2 text-xs font-bold transition-all ${
                      provider === 'stripe'
                        ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                        : 'border-gray-200 bg-white text-gray-500 hover:border-gray-300'
                    }`}
                  >
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="2" y="5" width="20" height="14" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/></svg>
                    Tarjeta (Stripe)
                  </button>
                  <button
                    onClick={() => setProvider('mercadopago')}
                    className={`flex flex-col items-center gap-1.5 p-3 rounded-2xl border-2 text-xs font-bold transition-all ${
                      provider === 'mercadopago'
                        ? 'border-sky-500 bg-sky-50 text-sky-700'
                        : 'border-gray-200 bg-white text-gray-500 hover:border-gray-300'
                    }`}
                  >
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="12" cy="12" r="9"/><path d="M8 12h8M12 8v8"/></svg>
                    Mercado Pago
                  </button>
                </div>
              </div>

              {/* Resumen */}
              <div className="bg-gray-50 rounded-2xl p-4 space-y-2">
                <p className="text-xs font-black text-gray-500 uppercase tracking-widest mb-3">Resumen</p>
                {items.map(item => (
                  <div key={item.productId} className="flex justify-between text-sm">
                    <span className="text-gray-600">{item.name} × {item.quantity}</span>
                    <span className="font-semibold text-gray-800">{formatted(item.unitPrice * item.quantity)}</span>
                  </div>
                ))}
                <div className="pt-2 border-t border-gray-200 flex justify-between font-bold">
                  <span className="text-gray-700">Total</span>
                  <span className="text-indigo-600 text-base">{formatted(total)}</span>
                </div>
              </div>
            </div>

            <div className="px-5 py-5 border-t bg-gray-50/80 space-y-3">
              {error && <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">{error}</p>}
              <button
                onClick={handleCheckout}
                disabled={loading || !form.buyerName.trim()}
                className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-2xl shadow-lg shadow-indigo-200 transition-all disabled:opacity-60 flex items-center justify-center gap-2 text-sm"
              >
                {loading ? (
                  <svg className="w-5 h-5 animate-spin" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
                ) : (
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><rect x="2" y="5" width="20" height="14" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/></svg>
                )}
                {loading ? 'Procesando…' : `Pagar con ${provider === 'mercadopago' ? 'Mercado Pago' : 'Stripe'}`}
              </button>
              <p className="text-center text-[11px] text-gray-400">
                🔒 Pago seguro · Tu información está protegida
              </p>
            </div>
          </>
        )}
      </div>
    </>
  )
}
