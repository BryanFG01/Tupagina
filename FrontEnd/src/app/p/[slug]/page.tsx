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

type Props = {
  params: Promise<{ slug: string }>
  searchParams?: Promise<{ p?: string }>
}

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

export default async function PublicLandingPage({ params, searchParams }: Props) {
  const { slug } = await params
  const sp = searchParams ? await searchParams : {}
  const currentPagePath = sp?.p ?? ''

  const landing = await getLanding(slug)
  if (!landing) notFound()

  // ── Multi-page filtering ────────────────────────────────────────────────────
  // Si algún bloque tiene pageId asignado, el modo multi-vista está activo.
  // Bloques sin pageId son globales (navbar, footer, etc.) — aparecen siempre.
  const hasMultiPage = landing.blocks.some(b => b.pageId)

  const visibleBlocks = hasMultiPage
    ? landing.blocks.filter(block => {
        const blockPageId = block.pageId
        if (!blockPageId) return true           // bloque global
        return blockPageId === currentPagePath  // bloque de esta vista
      })
    : landing.blocks

  // ── Store detection ─────────────────────────────────────────────────────────
  const hasStore = visibleBlocks.some(b => b.type === 'store')
  const storeCurrency = visibleBlocks.find(b => b.type === 'store')?.content?.currency ?? 'usd'
  const products = hasStore ? await getProducts(landing.id) : []

  // ── Cart button placement ───────────────────────────────────────────────────
  const bannerBlock = visibleBlocks.find(b => b.type === 'store-banner')
  const bannerCartPlacement = bannerBlock?.type === 'store-banner' ? bannerBlock.content.cartButton : null
  const floatingCartPos = (
    bannerCartPlacement === 'floating-br' ? 'floating-br' :
    bannerCartPlacement === 'floating-bl' ? 'floating-bl' :
    bannerCartPlacement === 'floating-tr' ? 'floating-tr' :
    bannerCartPlacement === 'floating-tl' ? 'floating-tl' : null
  ) as 'floating-br' | 'floating-bl' | 'floating-tr' | 'floating-tl' | null

  const showFloatingCart = hasStore && (!bannerBlock || floatingCartPos !== null)

  // ── Render ──────────────────────────────────────────────────────────────────
  let spinnerRendered = false

  const content = (
    <main className="min-h-screen bg-white">
      {visibleBlocks.map((block) => {
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
        <ProductDetailModal currency={storeCurrency as string} />
        {content}
      </StoreProvider>
    )
  }

  return content
}
