'use client'

import { createContext, useContext, useState, useCallback, type ReactNode } from 'react'
import type { Product, CartItem } from '@/domain/store/store.types'

// ─── Context ──────────────────────────────────────────────────────────────────

type CartContextType = {
  products: Product[]
  items: CartItem[]
  add: (product: Product) => void
  remove: (productId: string) => void
  updateQty: (productId: string, qty: number) => void
  clear: () => void
  total: number      // en centavos
  count: number      // unidades totales
  isOpen: boolean
  openCart: () => void
  closeCart: () => void
  // ── Detalle de producto ───────────────────────────────────────────────────
  selectedProduct: Product | null
  openProduct: (product: Product) => void
  closeProduct: () => void
  // ── Wishlist ─────────────────────────────────────────────────────────────
  wishlist: string[]          // productIds
  toggleWishlist: (productId: string) => void
  isWishlisted: (productId: string) => boolean
}

const CartContext = createContext<CartContextType | null>(null)

// ─── Provider ─────────────────────────────────────────────────────────────────

type Props = { children: ReactNode; initialProducts: Product[]; landingId: string }

export function StoreProvider({ children, initialProducts }: Props) {
  const [items, setItems] = useState<CartItem[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [wishlist, setWishlist] = useState<string[]>(() => {
    if (typeof window === 'undefined') return []
    try { return JSON.parse(localStorage.getItem('wl') ?? '[]') } catch { return [] }
  })

  const add = useCallback((product: Product) => {
    setItems(prev => {
      const existing = prev.find(i => i.productId === product.id)
      if (existing) {
        return prev.map(i =>
          i.productId === product.id ? { ...i, quantity: i.quantity + 1 } : i
        )
      }
      return [...prev, {
        productId: product.id,
        name: product.name,
        imageUrl: product.imageUrl,
        unitPrice: product.price,
        quantity: 1,
      }]
    })
  }, [])

  const remove = useCallback((productId: string) => {
    setItems(prev => prev.filter(i => i.productId !== productId))
  }, [])

  const updateQty = useCallback((productId: string, qty: number) => {
    if (qty <= 0) {
      setItems(prev => prev.filter(i => i.productId !== productId))
    } else {
      setItems(prev => prev.map(i => i.productId === productId ? { ...i, quantity: qty } : i))
    }
  }, [])

  const clear = useCallback(() => setItems([]), [])

  const total = items.reduce((sum, i) => sum + i.unitPrice * i.quantity, 0)
  const count = items.reduce((sum, i) => sum + i.quantity, 0)

  const openProduct  = useCallback((p: Product) => setSelectedProduct(p), [])
  const closeProduct = useCallback(() => setSelectedProduct(null), [])

  const toggleWishlist = useCallback((productId: string) => {
    setWishlist(prev => {
      const next = prev.includes(productId) ? prev.filter(id => id !== productId) : [...prev, productId]
      try { localStorage.setItem('wl', JSON.stringify(next)) } catch {}
      return next
    })
  }, [])

  const isWishlisted = useCallback((productId: string) => wishlist.includes(productId), [wishlist])

  return (
    <CartContext.Provider value={{
      products: initialProducts,
      items, add, remove, updateQty, clear,
      total, count,
      isOpen, openCart: () => setIsOpen(true), closeCart: () => setIsOpen(false),
      selectedProduct, openProduct, closeProduct,
      wishlist, toggleWishlist, isWishlisted,
    }}>
      {children}
    </CartContext.Provider>
  )
}

// ─── Hooks ────────────────────────────────────────────────────────────────────

export function useCart(): CartContextType {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart debe usarse dentro de <StoreProvider>')
  return ctx
}

// Versión segura para usar fuera del contexto (editor preview)
export function useCartOptional(): CartContextType | null {
  return useContext(CartContext)
}
