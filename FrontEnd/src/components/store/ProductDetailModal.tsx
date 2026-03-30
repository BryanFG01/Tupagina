'use client'

import { useEffect, useState } from 'react'
import { ProductReviews } from './ProductReviews'
import { useCart } from './StoreProvider'

export function ProductDetailModal({ currency }: { currency: string }) {
  const { selectedProduct: product, closeProduct, add, isWishlisted, toggleWishlist } = useCart()
  const [added, setAdded] = useState(false)
  const [qty,   setQty]   = useState(1)

  // Reset qty al abrir otro producto
  useEffect(() => { setQty(1); setAdded(false) }, [product?.id])

  // Cerrar con Escape
  useEffect(() => {
    if (!product) return
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') closeProduct() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [product, closeProduct])

  if (!product) return null

  const formatted = (cents: number) =>
    new Intl.NumberFormat('es-MX', { style: 'currency', currency: currency.toUpperCase() }).format(cents / 100)

  const outOfStock = product.stock === 0
  const discount   = product.comparePrice
    ? Math.round((1 - product.price / product.comparePrice) * 100)
    : null
  const wishlisted = isWishlisted(product.id)
  const maxQty     = product.stock === -1 ? 99 : product.stock

  function handleAdd() {
    if (outOfStock || !product) return
    for (let i = 0; i < qty; i++) add(product)
    setAdded(true)
    setTimeout(() => { setAdded(false); closeProduct() }, 1200)
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm transition-opacity"
      onClick={closeProduct}
    >
      <div
        className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl max-h-[80vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-200 relative text-left"
        onClick={e => e.stopPropagation()}
      >
        {/* Botón cerrar */}
        <button
          onClick={closeProduct}
          className="absolute top-4 right-4 z-10 w-9 h-9 rounded-2xl bg-white/90 backdrop-blur-sm shadow-sm border border-gray-100 flex items-center justify-center text-gray-400 hover:text-gray-700 hover:bg-gray-50 transition-all"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>

        <div className="flex flex-col sm:flex-row">
          {/* ── Imagen ─────────────────────────────────────────────────────── */}
          <div className="relative sm:w-5/12 bg-gray-50 rounded-t-3xl sm:rounded-l-3xl sm:rounded-tr-none overflow-hidden aspect-square sm:aspect-auto sm:min-h-[360px]">
            {product.imageUrl ? (
              <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center gap-3 p-8">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" className="w-20 h-20 text-gray-200">
                  <rect x="3" y="3" width="18" height="18" rx="2"/>
                  <circle cx="8.5" cy="8.5" r="1.5"/>
                  <polyline points="21 15 16 10 5 21"/>
                </svg>
                <p className="text-xs text-gray-300 text-center">Sin imagen</p>
              </div>
            )}

            {/* Badges */}
            {product.badge && (
              <span className={`absolute top-3 left-3 text-[10px] font-black px-2.5 py-1 rounded-lg uppercase tracking-wider shadow-sm ${
                product.badge === 'Oferta'   ? 'bg-red-500 text-white' :
                product.badge === 'Nuevo'    ? 'bg-indigo-600 text-white' :
                product.badge === 'Popular'  ? 'bg-amber-500 text-white' :
                                               'bg-gray-700 text-white'
              }`}>
                {product.badge}
              </span>
            )}
            {discount && (
              <span className="absolute top-3 right-3 bg-red-500 text-white text-[11px] font-black px-2.5 py-1 rounded-lg shadow-sm">
                -{discount}%
              </span>
            )}

            {/* Wishlist btn */}
            <button
              onClick={() => toggleWishlist(product.id)}
              className={`absolute bottom-3 right-3 w-9 h-9 rounded-xl flex items-center justify-center shadow-sm border transition-all ${
                wishlisted
                  ? 'bg-red-500 border-red-500 text-white'
                  : 'bg-white/90 border-gray-200 text-gray-400 hover:text-red-400'
              }`}
              title={wishlisted ? 'Quitar de favoritos' : 'Guardar en favoritos'}
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill={wishlisted ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2">
                <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/>
              </svg>
            </button>
          </div>

          {/* ── Info ──────────────────────────────────────────────────────── */}
          <div className="flex-1 p-6 sm:p-8 flex flex-col gap-4">
            {/* Categoría */}
            {product.category && (
              <span className="text-[11px] font-black text-indigo-500 uppercase tracking-widest">
                {product.category}
              </span>
            )}

            {/* Nombre */}
            <h2 className="text-2xl font-black text-gray-900 leading-tight">{product.name}</h2>

            {/* Precio */}
            <div className="flex items-baseline gap-3">
              <span className="text-3xl font-black text-gray-900">{formatted(product.price)}</span>
              {product.comparePrice && (
                <span className="text-base text-gray-400 line-through">{formatted(product.comparePrice)}</span>
              )}
              {discount && (
                <span className="text-sm font-bold bg-red-50 text-red-600 px-2 py-0.5 rounded-lg">
                  Ahorras {formatted(product.comparePrice! - product.price)}
                </span>
              )}
            </div>

            {/* Descripción */}
            {product.description && (
              <p className="text-gray-500 text-sm leading-relaxed border-t border-gray-100 pt-4">
                {product.description}
              </p>
            )}

            {/* Stock */}
            <div className="flex items-center gap-2 text-sm">
              {outOfStock ? (
                <span className="flex items-center gap-1.5 text-red-500 font-semibold">
                  <span className="w-2 h-2 rounded-full bg-red-500 inline-block"/>
                  Sin stock
                </span>
              ) : product.stock === -1 ? (
                <span className="flex items-center gap-1.5 text-emerald-600 font-semibold">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block"/>
                  Disponible
                </span>
              ) : (
                <span className={`flex items-center gap-1.5 font-semibold ${product.stock <= 5 ? 'text-amber-600' : 'text-emerald-600'}`}>
                  <span className={`w-2 h-2 rounded-full inline-block ${product.stock <= 5 ? 'bg-amber-500' : 'bg-emerald-500'}`}/>
                  {product.stock <= 5 ? `¡Solo ${product.stock} disponibles!` : `${product.stock} en stock`}
                </span>
              )}
            </div>

            {/* Cantidad */}
            {!outOfStock && (
              <div className="flex items-center gap-3">
                <span className="text-sm font-semibold text-gray-600">Cantidad:</span>
                <div className="flex items-center gap-1 bg-gray-100 rounded-xl p-1">
                  <button
                    onClick={() => setQty(q => Math.max(1, q - 1))}
                    className="w-8 h-8 rounded-lg bg-white shadow-sm text-gray-700 hover:text-red-500 font-bold text-lg flex items-center justify-center transition-colors"
                  >
                    −
                  </button>
                  <span className="w-8 text-center font-bold text-gray-800">{qty}</span>
                  <button
                    onClick={() => setQty(q => Math.min(maxQty, q + 1))}
                    className="w-8 h-8 rounded-lg bg-white shadow-sm text-gray-700 hover:text-indigo-600 font-bold text-lg flex items-center justify-center transition-colors"
                  >
                    +
                  </button>
                </div>
              </div>
            )}

            {/* Reviews */}
            <ProductReviews productId={product.id} />

            {/* CTA */}
            <div className="flex gap-3 mt-auto pt-2">
              <button
                onClick={handleAdd}
                disabled={outOfStock}
                className={`flex-1 py-3.5 rounded-2xl font-bold text-sm transition-all flex items-center justify-center gap-2 ${
                  added
                    ? 'bg-emerald-500 text-white'
                    : outOfStock
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-200'
                }`}
              >
                {added ? (
                  <><svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg> ¡Agregado!</>
                ) : outOfStock ? 'Sin stock' : (
                  <><svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 002 1.61h9.72a2 2 0 001.96-1.61l1.54-7.39H6"/></svg> Agregar al carrito</>
                )}
              </button>

              <button
                onClick={() => toggleWishlist(product.id)}
                className={`w-12 h-12 rounded-2xl border flex items-center justify-center transition-all ${
                  wishlisted
                    ? 'bg-red-50 border-red-200 text-red-500'
                    : 'bg-white border-gray-200 text-gray-400 hover:border-red-200 hover:text-red-400'
                }`}
                title={wishlisted ? 'Quitar de favoritos' : 'Guardar en favoritos'}
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill={wishlisted ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2">
                  <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/>
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
