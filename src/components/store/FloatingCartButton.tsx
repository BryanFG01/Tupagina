'use client'

import { useCartOptional } from './StoreProvider'

type CartPos = 'floating-br' | 'floating-bl' | 'floating-tr' | 'floating-tl'

const POS_CLASS: Record<CartPos, string> = {
  'floating-br': 'bottom-6 right-6',
  'floating-bl': 'bottom-6 left-6',
  'floating-tr': 'top-20 right-6',
  'floating-tl': 'top-20 left-6',
}

type Props = { landingId: string; currency: string; position?: CartPos }

export function FloatingCartButton({ landingId, currency, position = 'floating-br' }: Props) {
  const cart = useCartOptional()
  if (!cart) return null

  const { count, openCart, isOpen } = cart
  const posClass = POS_CLASS[position]

  return (
    <>
      {/* Floating button */}
      <button
        onClick={openCart}
        className={`fixed ${posClass} z-30 flex items-center gap-2.5 pl-4 pr-5 py-3.5 rounded-2xl shadow-xl transition-all duration-300 font-semibold text-sm ${
          count > 0
            ? 'bg-indigo-600 text-white shadow-indigo-300 hover:bg-indigo-700 scale-100'
            : 'bg-white text-gray-700 shadow-gray-200 hover:bg-gray-50 border border-gray-200'
        } ${isOpen ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}
      >
        <div className="relative">
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
            <path d="M1 1h4l2.68 13.39a2 2 0 002 1.61h9.72a2 2 0 001.96-1.61l1.54-7.39H6"/>
          </svg>
          {count > 0 && (
            <span className="absolute -top-2.5 -right-2.5 bg-white text-indigo-600 text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center shadow-sm animate-bounce">
              {count > 9 ? '9+' : count}
            </span>
          )}
        </div>
        <span>{count > 0 ? `Ver carrito (${count})` : 'Carrito'}</span>
      </button>

      {/* Cart drawer (lazy rendered inside the button component for co-location) */}
      {/* imported dynamically to avoid circular deps */}
      <CartDrawerLazy landingId={landingId} currency={currency} />
    </>
  )
}

// Lazy import para evitar circular dependency
function CartDrawerLazy({ landingId, currency }: Props) {
  const { CartDrawer } = require('./CartDrawer') as { CartDrawer: React.ComponentType<Props> }
  return <CartDrawer landingId={landingId} currency={currency} />
}
