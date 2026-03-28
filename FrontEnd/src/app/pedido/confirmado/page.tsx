import Link from 'next/link'
import { getOrderByStripeSession } from '@/infrastructure/repositories/order.repository'

type Props = { searchParams: Promise<{ orderId?: string; session_id?: string }> }

export default async function PedidoConfirmadoPage({ searchParams }: Props) {
  const { orderId, session_id } = await searchParams

  // Try to find order by orderId or stripeSessionId
  let order = null
  if (session_id) {
    try { order = await getOrderByStripeSession(session_id) } catch {}
  }

  const formatted = (cents: number, currency: string) =>
    new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: currency.toUpperCase(),
    }).format(cents / 100)

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-white flex items-center justify-center px-4">
      <div className="max-w-md w-full">

        {/* Success card */}
        <div className="bg-white rounded-3xl shadow-xl shadow-black/5 border border-gray-100 p-8 text-center">

          {/* Icon */}
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10 text-green-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <polyline points="20,6 9,17 4,12"/>
            </svg>
          </div>

          <h1 className="text-2xl font-bold text-gray-900 mb-2">¡Pedido confirmado!</h1>
          <p className="text-gray-500 mb-6">
            Tu pago fue procesado exitosamente. Recibirás un correo con los detalles de tu compra.
          </p>

          {order && (
            <div className="bg-gray-50 rounded-2xl p-4 mb-6 text-left space-y-3">
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-500">Nº de pedido</span>
                <span className="font-mono text-xs font-semibold text-gray-700">{order.id.slice(0, 16)}…</span>
              </div>

              {order.items.map(item => (
                <div key={item.id} className="flex justify-between items-center text-sm">
                  <span className="text-gray-700">
                    {item.name}
                    {item.quantity > 1 && <span className="text-gray-400 ml-1">× {item.quantity}</span>}
                  </span>
                  <span className="font-semibold text-gray-900">
                    {formatted(item.unitPrice * item.quantity, order!.currency)}
                  </span>
                </div>
              ))}

              <div className="pt-3 border-t border-gray-200 flex justify-between items-center">
                <span className="font-semibold text-gray-700">Total</span>
                <span className="text-lg font-bold text-indigo-600">{formatted(order.totalAmount, order.currency)}</span>
              </div>
            </div>
          )}

          {!order && orderId && (
            <div className="bg-gray-50 rounded-2xl p-4 mb-6 text-sm text-gray-500">
              <span className="font-mono">Pedido: {orderId.slice(0, 20)}…</span>
            </div>
          )}

          <div className="space-y-2">
            <Link
              href="/"
              className="block w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-2xl transition-colors text-sm"
            >
              Volver al inicio
            </Link>
          </div>
        </div>

        <p className="text-center text-xs text-gray-400 mt-6">
          Powered by TuNegocio · Pago procesado de forma segura por Stripe
        </p>
      </div>
    </div>
  )
}
