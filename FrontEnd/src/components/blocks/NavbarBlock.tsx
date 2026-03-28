'use client'

import { useState, useEffect, useRef } from 'react'
import type { NavbarContent, BlockStyle } from '@/domain/landing/block.types'
import { useCartOptional } from '@/components/store/StoreProvider'
import { CartDrawer } from '@/components/store/CartDrawer'
import { bsBtn } from './blockStyle'

type Props = {
  content: NavbarContent
  style?: BlockStyle
  landingId?: string
  currency?: string
  previewMode?: boolean
}

export function NavbarBlock({ content, style, landingId = '', currency = 'usd', previewMode = false }: Props) {
  const cart   = useCartOptional()
  const count  = cart?.count ?? 0
  const openCart = cart?.openCart
  const [scrolled, setScrolled]       = useState(false)
  const [mobileOpen, setMobileOpen]   = useState(false)
  const [searchOpen, setSearchOpen]   = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [openDropdown, setOpenDropdown] = useState<string | null>(null)
  const navRef = useRef<HTMLElement>(null)
  const searchRef = useRef<HTMLInputElement>(null)

  const isDark = content.textColor === 'dark'
  const textCls   = isDark ? 'text-gray-800'   : 'text-white'
  const mutedCls  = isDark ? 'text-gray-500'   : 'text-white/70'
  const hoverCls  = isDark ? 'hover:text-indigo-600' : 'hover:text-white/80'
  const borderCls = isDark ? 'border-gray-200' : 'border-white/20'

  const ddDropStyle = content.dropdownStyle ?? 'minimal'
  const ddPanelClass = ddDropStyle === 'floating'
    ? 'rounded-2xl py-1.5 min-w-[200px]'
    : ddDropStyle === 'card'
    ? 'rounded-xl py-1 min-w-[180px]'
    : 'rounded-lg py-1 min-w-[160px]'
  const ddPanelStyleObj: React.CSSProperties = ddDropStyle === 'floating'
    ? { backgroundColor: '#fff', border: '1px solid #f0f0f0', filter: 'drop-shadow(0 8px 24px rgba(0,0,0,0.18))' }
    : ddDropStyle === 'card'
    ? { backgroundColor: '#fff', border: '1px solid #e5e7eb', boxShadow: '0 4px 16px rgba(0,0,0,0.10)' }
    : { backgroundColor: '#fff', border: '1px solid #e5e7eb', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }
  const ddItemPad = ddDropStyle === 'floating' ? 'px-4 py-2.5' : ddDropStyle === 'card' ? 'px-4 py-2' : 'px-3 py-2'
  // style prop overrides content.backgroundColor (from the Style panel in the editor)
  const resolvedBg = (style?.backgroundColor && style.backgroundColor !== 'default')
    ? style.backgroundColor
    : content.backgroundColor

  const bgStyle: React.CSSProperties = {
    backgroundColor: content.transparent && !scrolled ? 'transparent' : resolvedBg,
    transition: 'background-color 0.3s ease, box-shadow 0.3s ease',
    boxShadow: scrolled ? '0 1px 12px rgba(0,0,0,.12)' : 'none',
  }

  useEffect(() => {
    if (!content.sticky) return
    const onScroll = () => setScrolled(window.scrollY > 30)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [content.sticky])

  // Close dropdown on outside click
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (navRef.current && !navRef.current.contains(e.target as Node)) {
        setOpenDropdown(null)
        setMobileOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  // Focus search input when opened
  useEffect(() => {
    if (searchOpen) searchRef.current?.focus()
  }, [searchOpen])

  const positionCls = content.sticky ? 'sticky top-0 z-50' : 'relative z-10'

  return (
    <nav
      ref={navRef}
      className={`${positionCls} w-full`}
      style={bgStyle}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* Brand */}
          <a href="#" className={`flex items-center gap-2.5 font-bold text-lg ${textCls} flex-shrink-0`}>
            {content.brandLogo ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={content.brandLogo} alt={content.brandName} className="h-8 w-auto object-contain" />
            ) : (
              <span>{content.brandName}</span>
            )}
          </a>

          {/* Desktop Nav Links */}
          <div className="hidden md:flex items-center gap-1">
            {(content.items ?? []).map(item => (
              <div key={item.id} className="relative">
                {item.hasDropdown ? (
                  <>
                    <button
                      type="button"
                      onClick={() => setOpenDropdown(openDropdown === item.id ? null : item.id)}
                      className={`flex items-center gap-1 px-3 py-2 text-sm font-medium rounded-lg transition-colors ${textCls} ${hoverCls} hover:bg-black/5`}
                      style={item.color ? { color: item.color } : undefined}
                    >
                      {item.label}
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
                        className={`w-3.5 h-3.5 transition-transform ${openDropdown === item.id ? 'rotate-180' : ''}`}>
                        <polyline points="6 9 12 15 18 9"/>
                      </svg>
                    </button>

                    {openDropdown === item.id && (
                      <div
                        className={`absolute top-full left-0 mt-1.5 z-50 ${ddPanelClass}`}
                        style={ddPanelStyleObj}
                      >
                        {ddDropStyle === 'floating' && (
                          <div className="absolute -top-[7px] left-5 w-3.5 h-3.5 rotate-45 rounded-sm bg-white border-l border-t border-gray-100" />
                        )}
                        {item.dropdown.map((dd, di) => (
                          <a
                            key={dd.id}
                            href={dd.url}
                            className={`flex items-center text-sm text-gray-700 font-medium transition-colors hover:bg-gray-50 hover:text-gray-900 ${ddItemPad} ${
                              di === 0 && ddDropStyle !== 'minimal' ? 'rounded-t-lg' : ''
                            } ${di === item.dropdown.length - 1 && ddDropStyle !== 'minimal' ? 'rounded-b-lg' : ''}`}
                            onClick={() => setOpenDropdown(null)}
                          >
                            {dd.label}
                          </a>
                        ))}
                      </div>
                    )}
                  </>
                ) : (
                  <a
                    href={item.url}
                    className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors ${textCls} ${hoverCls} hover:bg-black/5`}
                    style={item.color ? { color: item.color } : undefined}
                  >
                    {item.label}
                  </a>
                )}
              </div>
            ))}
          </div>

          {/* Right side: search + CTA + cart + hamburger */}
          <div className="flex items-center gap-2">

            {/* Search */}
            {content.showSearch && (
              <div className="relative">
                {searchOpen ? (
                  <div
                    className="flex items-center gap-2 rounded-lg px-3 py-1.5 border"
                    style={{
                      backgroundColor: isDark ? 'rgba(0,0,0,0.06)' : 'rgba(255,255,255,0.15)',
                      borderColor:     isDark ? 'rgba(0,0,0,0.12)' : 'rgba(255,255,255,0.25)',
                    }}
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                      className={`w-4 h-4 flex-shrink-0 ${mutedCls}`}>
                      <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
                    </svg>
                    <input
                      ref={searchRef}
                      type="text"
                      value={searchQuery}
                      onChange={e => setSearchQuery(e.target.value)}
                      placeholder="Buscar…"
                      className={`bg-transparent text-sm outline-none w-32 ${textCls}`}
                      onBlur={() => { if (!searchQuery) setSearchOpen(false) }}
                      onKeyDown={e => { if (e.key === 'Escape') { setSearchOpen(false); setSearchQuery('') } }}
                    />
                    {searchQuery && (
                      <button type="button" onClick={() => { setSearchQuery(''); setSearchOpen(false) }}
                        className={`${mutedCls}`}>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
                          <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                        </svg>
                      </button>
                    )}
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => setSearchOpen(true)}
                    className={`p-2 rounded-lg transition-colors ${textCls} ${hoverCls} hover:bg-black/5`}
                    title="Buscar"
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
                      <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
                    </svg>
                  </button>
                )}
              </div>
            )}

            {/* CTA button */}
            {content.ctaText && (
              <a
                href={content.ctaUrl ?? '#'}
                className="hidden md:inline-flex items-center px-4 py-1.5 text-sm font-semibold rounded-lg bg-indigo-600 text-white hover:opacity-90 transition-opacity shadow-sm"
                style={bsBtn(style)}
              >
                {content.ctaText}
              </a>
            )}

            {/* Cart button */}
            {content.showCart && (cart || previewMode) && (
              <>
                <style>{`
                  @keyframes cart-badge-pop {
                    0%   { transform: scale(1); }
                    30%  { transform: scale(1.5); }
                    55%  { transform: scale(0.85); }
                    75%  { transform: scale(1.2); }
                    100% { transform: scale(1); }
                  }
                  .cart-badge-pop { animation: cart-badge-pop 0.45s cubic-bezier(.36,.07,.19,.97) both; }
                `}</style>
                <button
                  type="button"
                  onClick={previewMode ? undefined : openCart}
                  className="relative p-2 rounded-lg transition-colors hover:bg-black/5"
                  style={{ color: content.cartColor ?? undefined }}
                  aria-label="Carrito"
                >
                  <svg
                    className="w-5 h-5"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke={content.cartColor ?? 'currentColor'}
                    strokeWidth="2"
                  >
                    <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
                    <path d="M1 1h4l2.68 13.39a2 2 0 002 1.61h9.72a2 2 0 001.96-1.61l1.54-7.39H6"/>
                  </svg>
                  {(count > 0 || previewMode) && (
                    <span
                      key={previewMode ? 'preview' : count}
                      className="cart-badge-pop absolute -top-1 -right-1 text-white text-[10px] font-black min-w-[18px] min-h-[18px] rounded-full flex items-center justify-center leading-none px-0.5"
                      style={{ backgroundColor: content.cartColor ?? '#ef4444' }}
                    >
                      {previewMode && count === 0 ? '3' : count > 99 ? '99+' : count}
                    </span>
                  )}
                </button>
              </>
            )}

            {/* Mobile hamburger */}
            <button
              type="button"
              className={`md:hidden p-2 rounded-lg transition-colors ${textCls} hover:bg-black/5`}
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label="Menu"
            >
              {mobileOpen ? (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
                  <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              ) : (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
                  <line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/>
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* CartDrawer — solo cuando showCart está activo y hay contexto de tienda */}
      {content.showCart && cart && !previewMode && (
        <CartDrawer landingId={landingId} currency={currency} />
      )}

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden border-t" style={{ borderColor: isDark ? '#e5e7eb' : 'rgba(255,255,255,0.2)', backgroundColor: resolvedBg }}>
          <div className="px-4 py-3 space-y-1">

            {content.showSearch && (
              <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-black/5 mb-2">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                  className={`w-4 h-4 flex-shrink-0 ${mutedCls}`}>
                  <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
                </svg>
                <input
                  type="text"
                  placeholder="Buscar…"
                  className={`bg-transparent text-sm outline-none w-full ${textCls}`}
                />
              </div>
            )}

            {(content.items ?? []).map(item => (
              <div key={item.id}>
                <a
                  href={item.url}
                  className={`block px-3 py-2 text-sm font-medium rounded-lg transition-colors ${textCls} ${hoverCls} hover:bg-black/5`}
                  style={item.color ? { color: item.color } : undefined}
                  onClick={() => setMobileOpen(false)}
                >
                  {item.label}
                </a>
                {item.hasDropdown && item.dropdown.length > 0 && (
                  <div className="pl-4 mt-0.5 space-y-0.5">
                    {item.dropdown.map(dd => (
                      <a
                        key={dd.id}
                        href={dd.url}
                        className={`block px-3 py-1.5 text-sm rounded-lg transition-colors ${mutedCls} ${hoverCls} hover:bg-black/5`}
                        onClick={() => setMobileOpen(false)}
                      >
                        {dd.label}
                      </a>
                    ))}
                  </div>
                )}
              </div>
            ))}

            {content.ctaText && (
              <div className="pt-2">
                <a
                  href={content.ctaUrl ?? '#'}
                  className="block w-full text-center px-4 py-2 text-sm font-semibold rounded-lg bg-indigo-600 text-white hover:opacity-90 transition-opacity"
                  style={bsBtn(style)}
                  onClick={() => setMobileOpen(false)}
                >
                  {content.ctaText}
                </a>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  )
}
