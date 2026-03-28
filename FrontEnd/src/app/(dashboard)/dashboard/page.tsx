import { redirect } from 'next/navigation'
import { safeGetSession } from '@/infrastructure/auth/auth-options'
import { getUserLandings } from '@/services/landing/get-landings'
import Link from 'next/link'
import { LandingCard } from '@/components/dashboard/LandingCard'

function IconPlus() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
      <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
    </svg>
  )
}

function IconEmptyState() {
  return (
    <svg viewBox="0 0 120 80" fill="none" className="w-36 h-auto mx-auto mb-6 opacity-80">
      <rect x="10" y="8" width="100" height="64" rx="6" fill="#F3F4F6" stroke="#E5E7EB" strokeWidth="1.5"/>
      <rect x="10" y="8" width="100" height="20" rx="6" fill="#E5E7EB"/>
      <rect x="10" y="20" width="100" height="8" fill="#E5E7EB"/>
      <circle cx="24" cy="18" r="3" fill="#D1D5DB"/>
      <circle cx="36" cy="18" r="3" fill="#D1D5DB"/>
      <circle cx="48" cy="18" r="3" fill="#D1D5DB"/>
      <rect x="24" y="36" width="72" height="6" rx="3" fill="#E5E7EB"/>
      <rect x="34" y="48" width="52" height="4" rx="2" fill="#EEF2FF"/>
      <rect x="44" y="58" width="32" height="6" rx="3" fill="#6366F1" opacity="0.5"/>
    </svg>
  )
}

export default async function DashboardPage() {
  const session = await safeGetSession()
  if (!session?.user?.id) {
    redirect('/login')
  }
  const userId = session.user.id as string
  const landings = await getUserLandings(userId)
  const publishedCount = landings.filter(l => l.published).length

  return (
    <div>
      {/* Page header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Mis páginas</h1>
          <p className="text-sm text-gray-500 mt-1">
            {landings.length === 0
              ? 'Crea tu primera página de ventas'
              : `${landings.length} página${landings.length !== 1 ? 's' : ''} · ${publishedCount} publicada${publishedCount !== 1 ? 's' : ''}`}
          </p>
        </div>
        <Link
          href="/dashboard/landings/nueva"
          className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2.5 rounded-xl hover:bg-indigo-700 transition-colors font-medium text-sm shadow-sm shadow-indigo-200"
        >
          <IconPlus />
          Nueva página
        </Link>
      </div>

      {/* Stats bar */}
      {landings.length > 0 && (
        <div className="grid grid-cols-3 gap-3 mb-8">
          {[
            { label: 'Total',      value: landings.length },
            { label: 'Publicadas', value: publishedCount },
            { label: 'Borradores', value: landings.length - publishedCount },
          ].map(stat => (
            <div key={stat.label} className="bg-white rounded-xl border border-gray-200 px-5 py-4">
              <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              <p className="text-xs text-gray-500 mt-0.5">{stat.label}</p>
            </div>
          ))}
        </div>
      )}

      {/* Grid */}
      {landings.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-gray-300">
          <IconEmptyState />
          <h2 className="text-lg font-semibold text-gray-900 mb-2">Todavía no tienes páginas</h2>
          <p className="text-sm text-gray-500 mb-6 max-w-xs mx-auto">
            Crea tu primera landing page en menos de 10 minutos y empieza a recibir pagos.
          </p>
          <Link href="/dashboard/landings/nueva"
            className="inline-flex items-center gap-2 bg-indigo-600 text-white px-5 py-2.5 rounded-xl hover:bg-indigo-700 transition-colors font-medium text-sm">
            <IconPlus /> Crear mi primera página
          </Link>
        </div>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {landings.map(landing => (
            <LandingCard key={landing.id} landing={landing} />
          ))}
          <Link href="/dashboard/landings/nueva"
            className="flex flex-col items-center justify-center min-h-[200px] rounded-2xl border-2 border-dashed border-gray-200 text-gray-400 hover:border-indigo-300 hover:text-indigo-500 hover:bg-indigo-50/30 transition-all group">
            <div className="w-10 h-10 rounded-full border-2 border-current flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
              <IconPlus />
            </div>
            <span className="text-sm font-medium">Nueva página</span>
          </Link>
        </div>
      )}
    </div>
  )
}
