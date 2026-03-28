import { notFound, redirect } from 'next/navigation'
import { safeGetSession } from '@/infrastructure/auth/auth-options'
import { getLandingForEditor } from '@/services/landing/get-landings'
import { getDashboardProducts } from '@/services/store/product.service'
import { ProductManager } from '@/components/store/ProductManager'
import Link from 'next/link'

type Props = { params: Promise<{ id: string }> }

export default async function ProductosPage({ params }: Props) {
  const { id } = await params
  const session = await safeGetSession()
  if (!session?.user?.id) redirect('/login')
  const userId = session.user.id as string

  let landing
  try {
    landing = await getLandingForEditor(id, userId)
  } catch {
    notFound()
  }

  let products: Awaited<ReturnType<typeof getDashboardProducts>> = []
  try {
    products = await getDashboardProducts(id, userId)
  } catch {}

  const activeCount = products.filter(p => p.active).length

  return (
    <div className="max-w-3xl mx-auto">

      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-gray-400 mb-6">
        <Link href="/dashboard" className="hover:text-gray-600 transition-colors">Mis páginas</Link>
        <span>/</span>
        <Link href={`/editor/${id}`} className="hover:text-gray-600 transition-colors truncate max-w-[160px]">{landing.title}</Link>
        <span>/</span>
        <span className="text-gray-700 font-medium">Productos</span>
      </nav>

      {/* Page header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Catálogo de productos</h1>
          <p className="text-sm text-gray-500 mt-1">
            {products.length === 0
              ? 'Agrega productos para empezar a vender'
              : `${products.length} producto${products.length !== 1 ? 's' : ''} · ${activeCount} activo${activeCount !== 1 ? 's' : ''}`}
          </p>
        </div>
        {products.length > 0 && (
          <div className="flex gap-3">
            <Link
              href={`/p/${landing.slug}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-3.5 py-2 text-sm text-gray-600 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors font-medium"
            >
              Ver tienda ↗
            </Link>
          </div>
        )}
      </div>

      <ProductManager landingId={id} initialProducts={products} />
    </div>
  )
}
