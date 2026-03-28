// RUTA TEMPORAL — validar vista del dashboard sin auth ni DB
import Link from 'next/link'

const DEMO_LANDINGS = [
  { id: '1', title: 'Mis servicios de diseño', slug: 'mis-servicios', published: true, blocks: 4 },
  { id: '2', title: 'Consultoría freelance', slug: 'consultoria', published: false, blocks: 2 },
]

export default function DemoDashboardPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b px-6 py-4 flex items-center justify-between">
        <span className="text-xl font-bold text-brand-600">TuNegocio</span>
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-600">demo@tunegocio.com</span>
          <span className="text-sm px-3 py-1.5 border border-gray-300 rounded-lg text-gray-600">Salir</span>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Mis páginas</h1>
            <p className="text-gray-600 mt-1">2 páginas creadas</p>
          </div>
          <Link
            href="/demo/editor"
            className="bg-brand-600 text-white px-5 py-2.5 rounded-lg hover:bg-brand-700 transition-colors font-medium"
          >
            + Nueva página
          </Link>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {DEMO_LANDINGS.map((landing) => (
            <div key={landing.id} className="bg-white rounded-xl border p-5 hover:shadow-sm transition-shadow">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-900 truncate">{landing.title}</h3>
                  <p className="text-xs text-gray-500 mt-0.5">/{landing.slug}</p>
                </div>
                <span className={`ml-2 text-xs px-2 py-1 rounded-full font-medium flex-shrink-0 ${
                  landing.published ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                }`}>
                  {landing.published ? 'Publicada' : 'Borrador'}
                </span>
              </div>
              <p className="text-sm text-gray-500 mb-4">{landing.blocks} bloques</p>
              <div className="flex gap-2 flex-wrap">
                <Link
                  href="/demo/editor"
                  className="text-sm px-3 py-1.5 bg-brand-50 text-brand-700 rounded-lg hover:bg-brand-100 transition-colors"
                >
                  Editar
                </Link>
                {landing.published && (
                  <Link
                    href="/p/demo-landing"
                    target="_blank"
                    className="text-sm px-3 py-1.5 bg-gray-50 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    Ver página ↗
                  </Link>
                )}
                <button className="text-sm px-3 py-1.5 bg-gray-50 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors">
                  {landing.published ? 'Despublicar' : 'Publicar'}
                </button>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  )
}
