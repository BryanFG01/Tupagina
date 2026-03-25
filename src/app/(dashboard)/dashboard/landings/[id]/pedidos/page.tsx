import { notFound } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/infrastructure/auth/auth-options'
import { getLandingForEditor } from '@/services/landing/get-landings'
import { getOrdersAction } from '@/app/actions/store.actions'
import type { Order } from '@/domain/store/store.types'
import Link from 'next/link'

type Props = { params: Promise<{ id: string }> }

const STATUS_MAP: Record<string, { label: string; dot: string; bg: string; text: string }> = {
  PENDING:   { label: 'Pendiente',   dot: 'bg-amber-400',  bg: 'bg-amber-50',  text: 'text-amber-700' },
  COMPLETED: { label: 'Pagado',      dot: 'bg-emerald-500', bg: 'bg-emerald-50', text: 'text-emerald-700' },
  FAILED:    { label: 'Fallido',     dot: 'bg-red-400',    bg: 'bg-red-50',    text: 'text-red-600'   },
  REFUNDED:  { label: 'Reembolsado', dot: 'bg-gray-400',   bg: 'bg-gray-100',  text: 'text-gray-500'  },
}

function fmt(cents: number, currency: string) {
  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: currency.toUpperCase(),
  }).format(cents / 100)
}

function fmtDate(date: Date) {
  return new Intl.DateTimeFormat('es-MX', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  }).format(new Date(date))
}

function IconOrders() {
  return (
    <svg viewBox="0 0 80 64" fill="none" className="w-20 h-auto mx-auto mb-5 opacity-70">
      <rect x="8" y="8" width="64" height="48" rx="6" fill="#F3F4F6" stroke="#E5E7EB" strokeWidth="1.5"/>
      <rect x="20" y="20" width="40" height="4" rx="2" fill="#E5E7EB"/>
      <rect x="20" y="30" width="28" height="4" rx="2" fill="#EEF2FF"/>
      <rect x="20" y="40" width="34" height="4" rx="2" fill="#E5E7EB"/>
    </svg>
  )
}

function StatCard({ label, value, sub, accent }: { label: string; value: string | number; sub?: string; accent?: string }) {
  return (
    <div className="bg-white border border-gray-200 rounded-2xl px-5 py-4">
      <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-1">{label}</p>
      <p className={`text-2xl font-bold ${accent ?? 'text-gray-900'}`}>{value}</p>
      {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
    </div>
  )
}

export default async function PedidosPage({ params }: Props) {
  const { id } = await params
  const session = await getServerSession(authOptions)
  const userId = session!.user!.id as string

  let landing
  try {
    landing = await getLandingForEditor(id, userId)
  } catch {
    notFound()
  }

  const result = await getOrdersAction(id)
  const orders: Order[] = result.success ? result.data : []

  const completedOrders = orders.filter(o => o.status === 'COMPLETED')
  const totalRevenue = completedOrders.reduce((sum, o) => sum + o.totalAmount, 0)
  const currency = orders[0]?.currency ?? 'usd'

  return (
    <div className="max-w-4xl mx-auto">

      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-gray-400 mb-6">
        <Link href="/dashboard" className="hover:text-gray-600 transition-colors">Mis páginas</Link>
        <span>/</span>
        <Link href={`/editor/${id}`} className="hover:text-gray-600 transition-colors truncate max-w-[160px]">{landing.title}</Link>
        <span>/</span>
        <span className="text-gray-700 font-medium">Pedidos</span>
      </nav>

      {/* Page header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Pedidos</h1>
        <p className="text-sm text-gray-500 mt-1">Historial de compras de tu tienda</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-8">
        <StatCard label="Total pedidos"   value={orders.length} />
        <StatCard label="Pagados"         value={completedOrders.length} accent="text-emerald-600" />
        <StatCard
          label="Ingresos totales"
          value={orders.length > 0 ? fmt(totalRevenue, currency) : '$0'}
          sub={completedOrders.length > 0 ? `${completedOrders.length} transacciones` : undefined}
          accent="text-indigo-600"
        />
      </div>

      {/* Orders */}
      {orders.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-gray-300">
          <IconOrders />
          <h2 className="text-base font-semibold text-gray-700 mb-1">Sin pedidos aún</h2>
          <p className="text-sm text-gray-400 max-w-xs mx-auto">
            Los pedidos aparecerán aquí cuando tus clientes compren en tu tienda
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {orders.map(order => {
            const s = STATUS_MAP[order.status] ?? { label: order.status, dot: 'bg-gray-400', bg: 'bg-gray-100', text: 'text-gray-500' }
            return (
              <div key={order.id} className="bg-white border border-gray-200 rounded-2xl overflow-hidden hover:border-gray-300 transition-colors">

                {/* Order header */}
                <div className="flex items-center justify-between gap-4 px-5 py-4">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-semibold text-gray-900 text-sm">
                        {order.buyerName ?? order.buyerEmail ?? 'Cliente anónimo'}
                      </p>
                      {order.buyerName && order.buyerEmail && (
                        <p className="text-xs text-gray-400">{order.buyerEmail}</p>
                      )}
                    </div>
                    <p className="text-xs text-gray-400 mt-0.5 font-mono">{fmtDate(order.createdAt)} · #{order.id.slice(0, 8).toUpperCase()}</p>
                  </div>
                  <div className="flex items-center gap-3 flex-shrink-0">
                    <span className={`flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full ${s.bg} ${s.text}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
                      {s.label}
                    </span>
                    <span className="text-base font-bold text-gray-900 tabular-nums">
                      {fmt(order.totalAmount, order.currency)}
                    </span>
                  </div>
                </div>

                {/* Order items */}
                <div className="border-t border-gray-100 px-5 py-3 bg-gray-50/50 space-y-1.5">
                  {order.items.map(item => (
                    <div key={item.id} className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="w-5 h-5 rounded bg-indigo-100 text-indigo-600 flex items-center justify-center text-xs font-bold flex-shrink-0">
                          {item.quantity}
                        </span>
                        <span className="text-gray-600 truncate">{item.name}</span>
                      </div>
                      <span className="text-gray-700 font-medium tabular-nums ml-4 flex-shrink-0">
                        {fmt(item.unitPrice * item.quantity, order.currency)}
                      </span>
                    </div>
                  ))}
                </div>

              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
