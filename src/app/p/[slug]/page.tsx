import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { getPublicLanding } from '@/services/landing/get-landings'
import { getPublicProducts } from '@/services/store/product.service'
import { BlockRenderer } from '@/components/blocks/BlockRenderer'
import { StoreProvider } from '@/components/store/StoreProvider'
import { FloatingCartButton } from '@/components/store/FloatingCartButton'
import type { LandingPage } from '@/domain/landing/landing.types'
import type { Product } from '@/domain/store/store.types'
import { ProductDetailModal } from '@/components/store/ProductDetailModal'

type Props = { params: Promise<{ slug: string }> }


async function getLanding(slug: string): Promise<LandingPage | null> {
  try {
    return await getPublicLanding(slug)
  } catch {
    return null
  }
}

async function getProducts(landingId: string): Promise<Product[]> {
  try {
    return await getPublicProducts(landingId)
  } catch {
    return []
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const landing = await getLanding(slug)
  if (!landing) return { title: 'Página no encontrada' }
  return {
    title: landing.title,
    description: landing.description ?? undefined,
  }
}

export default async function PublicLandingPage({ params }: Props) {
  const { slug } = await params
  const landing = await getLanding(slug)

  if (!landing) notFound()

  const hasStore = landing.blocks.some(b => b.type === 'store')
  const storeCurrency = landing.blocks.find(b => b.type === 'store')?.content?.currency ?? 'usd'
  const products = hasStore ? await getProducts(landing.id) : []

  // Determinar si y dónde mostrar el carrito flotante
  const bannerBlock = landing.blocks.find(b => b.type === 'store-banner')
  const bannerCartPlacement = bannerBlock?.type === 'store-banner' ? bannerBlock.content.cartButton : null
  const floatingCartPos = (
    bannerCartPlacement === 'floating-br' ? 'floating-br' :
    bannerCartPlacement === 'floating-bl' ? 'floating-bl' :
    bannerCartPlacement === 'floating-tr' ? 'floating-tr' :
    bannerCartPlacement === 'floating-tl' ? 'floating-tl' : null
  ) as 'floating-br' | 'floating-bl' | 'floating-tr' | 'floating-tl' | null

  // Mostrar carrito flotante solo si: hay tienda + (no hay banner, o banner tiene opción floating)
  const showFloatingCart = hasStore && (
    !bannerBlock || floatingCartPos !== null
  )

  // Solo se permite un spinner por landing — se usa el primero que aparezca
  let spinnerRendered = false

  const content = (
    <main className="min-h-screen bg-white">
      {landing.blocks.map((block) => {
        if (block.type === 'loading-spinner') {
          if (spinnerRendered) return null
          spinnerRendered = true
        }
        return <BlockRenderer key={block.id} block={block} landingId={landing.id} currency={storeCurrency} />
      })}
      {showFloatingCart && (
        <FloatingCartButton
          landingId={landing.id}
          currency={storeCurrency}
          position={floatingCartPos ?? 'floating-br'}
        />
      )}
    </main>
  )

  if (hasStore) {
    return (
      <StoreProvider initialProducts={products} landingId={landing.id}>
        {/* Modal de detalle de producto — al nivel de página para evitar conflictos de z-index */}
        <ProductDetailModal currency={storeCurrency as string} />
        {content}
      </StoreProvider>
    )
  }

  return content
}
