'use client'

import { useState, useMemo, useEffect } from 'react'
import type { StoreContent, BlockStyle, StoreBadgePreset } from '@/domain/landing/block.types'
import type { Product } from '@/domain/store/store.types'
import { useCartOptional } from '@/components/store/StoreProvider'
import { bsCls, bsStyle } from './blockStyle'

// ─── Demo productos ───────────────────────────────────────────────────────────

const DEMO_PRODUCTS: Product[] = [
  { id: 'd1', landingId: 'demo', name: 'Camiseta Clásica',   category: 'Ropa',        description: 'Algodón 100%, corte regular. Disponible en varios colores.',               imageUrl: null, price: 2900,  comparePrice: null, stock: -1, badge: 'Nuevo',     badgeShape: 'pill',       badgeSize: 'md', active: true, createdAt: new Date(), updatedAt: new Date() },
  { id: 'd2', landingId: 'demo', name: 'Pantalón Cargo',     category: 'Ropa',        description: 'Diseño moderno con múltiples bolsillos. Comodidad todo el día.',            imageUrl: null, price: 4900,  comparePrice: 6900, stock:  8, badge: 'Oferta',    badgeShape: 'starburst',  badgeSize: 'lg', active: true, createdAt: new Date(), updatedAt: new Date() },
  { id: 'd3', landingId: 'demo', name: 'Zapatillas Urban',   category: 'Calzado',     description: 'Suela de goma antideslizante. Estilo urbano para cualquier ocasión.',       imageUrl: null, price: 9900,  comparePrice: null, stock:  3, badge: 'Popular',   badgeShape: 'square',     badgeSize: 'md', active: true, createdAt: new Date(), updatedAt: new Date() },
  { id: 'd4', landingId: 'demo', name: 'Gorra Streetwear',   category: 'Accesorios',  description: 'Cap ajustable. Diseño exclusivo con bordado en relieve.',                   imageUrl: null, price: 1900,  comparePrice: null, stock: -1, badge: null,        badgeShape: null,         badgeSize: null, active: true, createdAt: new Date(), updatedAt: new Date() },
  { id: 'd5', landingId: 'demo', name: 'Hoodie Oversized',   category: 'Ropa',        description: 'Sudadera con capucha. Tela pesada premium. Fit oversized.',                 imageUrl: null, price: 6900,  comparePrice: 8500, stock: 12, badge: 'Oferta',    badgeShape: 'pill',       badgeSize: 'sm', active: true, createdAt: new Date(), updatedAt: new Date() },
  { id: 'd6', landingId: 'demo', name: 'Bolso Tote',         category: 'Accesorios',  description: 'Lona resistente, asas reforzadas. Ideal para el día a día.',                imageUrl: null, price: 3500,  comparePrice: null, stock:  0, badge: null,        badgeShape: null,         badgeSize: null, active: true, createdAt: new Date(), updatedAt: new Date() },
]

// ─── Iconos SVG ───────────────────────────────────────────────────────────────

function IconSearch()  { return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg> }
function IconX()       { return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" className="w-3.5 h-3.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg> }
function IconGrid()    { return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg> }
function IconList()    { return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg> }
function IconCart()    { return <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 002 1.61h9.72a2 2 0 001.96-1.61l1.54-7.39H6"/></svg> }
function IconFilter()  { return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/></svg> }
function IconSort()    { return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><line x1="3" y1="6" x2="21" y2="6"/><line x1="6" y1="12" x2="18" y2="12"/><line x1="9" y1="18" x2="15" y2="18"/></svg> }
function IconChevron({ open }: { open: boolean }) { return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={`w-3.5 h-3.5 transition-transform ${open ? 'rotate-180' : ''}`}><polyline points="6 9 12 15 18 9"/></svg> }
function IconImageOff(){ return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-8 h-8 text-gray-200"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg> }
function IconChevronLeft() { return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><polyline points="15 18 9 12 15 6"/></svg> }
function IconChevronRight() { return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><polyline points="9 18 15 12 9 6"/></svg> }

// ─── Constantes ───────────────────────────────────────────────────────────────

// Fallback colors when no badgePresets configured
const BADGE_FALLBACK: Record<string, { bg: string; color: string }> = {
  'Nuevo':     { bg: '#4f46e5', color: '#ffffff' },
  'Oferta':    { bg: '#ef4444', color: '#ffffff' },
  'Popular':   { bg: '#f59e0b', color: '#ffffff' },
  'Destacado': { bg: '#10b981', color: '#ffffff' },
}

function resolveBadge(text: string, presets?: StoreBadgePreset[]): { bg: string; color: string } {
  const preset = presets?.find(p => p.text === text)
  if (preset) return { bg: preset.bg, color: preset.color }
  return BADGE_FALLBACK[text] ?? { bg: '#6b7280', color: '#ffffff' }
}

const SORT_OPTIONS = [
  { value: 'default',    label: 'Relevancia' },
  { value: 'price-asc',  label: 'Precio: menor a mayor' },
  { value: 'price-desc', label: 'Precio: mayor a menor' },
  { value: 'name-asc',   label: 'Nombre A–Z' },
  { value: 'name-desc',  label: 'Nombre Z–A' },
]

type SortValue = 'default' | 'price-asc' | 'price-desc' | 'name-asc' | 'name-desc'

// ─── Tipos ────────────────────────────────────────────────────────────────────

type Props = {
  content: StoreContent
  previewMode?: boolean
  style?: BlockStyle
}

// ─── StoreBlock ───────────────────────────────────────────────────────────────

export function StoreBlock({ content, previewMode = false, style }: Props) {
  const cart = useCartOptional()
  const products = cart?.products ?? (previewMode ? DEMO_PRODUCTS : [])

  // Defaults para campos opcionales (retrocompatibilidad con bloques guardados antes de añadirlos)
  const filterStyle     = content.filterStyle     ?? 'tabs'
  const showSort        = content.showSort        ?? true
  const showPriceFilter = content.showPriceFilter ?? false
  const showProductCount= content.showProductCount?? true

  const [search,       setSearch]       = useState('')
  const [activeTab,    setActiveTab]    = useState('Todos')

  // ── Deep-link por hash: #frutas-y-verduras → filtra esa categoría ──────────
  useEffect(() => {
    function slugify(str: string) {
      return str.toLowerCase()
        .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
    }
    function applyHash() {
      const hash = window.location.hash.slice(1)
      if (!hash || hash === 'productos') return
      if (hash === 'todos') { setActiveTab('Todos'); return }
      const cats = [...new Set(products.map(p => p.category).filter(Boolean))] as string[]
      const match = cats.find(cat => slugify(cat) === hash)
      if (match) {
        setActiveTab(match)
        document.getElementById('productos')?.scrollIntoView({ behavior: 'smooth' })
      }
    }
    applyHash()
    window.addEventListener('hashchange', applyHash)
    return () => window.removeEventListener('hashchange', applyHash)
  }, [products])
  const [sortBy,       setSortBy]       = useState<SortValue>('default')
  const [layout,       setLayout]       = useState<'grid' | 'list'>(content.layout ?? 'grid')
  const [priceMin,     setPriceMin]     = useState('')
  const [priceMax,     setPriceMax]     = useState('')
  const [sidebarOpen,  setSidebarOpen]  = useState(true)
  const [mobileFOpen,  setMobileFOpen]  = useState(false)
  const [currentPage,  setCurrentPage]  = useState(1)

  // Secciones colapsables del sidebar
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    categories: true, price: true, availability: false,
  })
  function toggleSection(key: string) {
    setOpenSections(s => ({ ...s, [key]: !s[key] }))
  }

  // Derived
  const categories = useMemo(() => {
    const cats = products.map(p => p.category).filter((c): c is string => !!c)
    return ['Todos', ...Array.from(new Set(cats))]
  }, [products])

  const maxProductPrice = useMemo(() =>
    products.reduce((m, p) => Math.max(m, p.price), 0), [products])

  const filtered = useMemo(() => {
    let list = [...products]

    // Categoría
    if (activeTab !== 'Todos') list = list.filter(p => p.category === activeTab)

    // Búsqueda
    if (search.trim()) {
      const q = search.toLowerCase()
      list = list.filter(p =>
        p.name.toLowerCase().includes(q) ||
        (p.description ?? '').toLowerCase().includes(q) ||
        (p.category ?? '').toLowerCase().includes(q)
      )
    }

    // Precio
    const minCents = priceMin ? parseFloat(priceMin) * 100 : 0
    const maxCents = priceMax ? parseFloat(priceMax) * 100 : Infinity
    if (priceMin || priceMax) list = list.filter(p => p.price >= minCents && p.price <= maxCents)

    // Ordenar
    if (sortBy === 'price-asc')  list.sort((a, b) => a.price - b.price)
    if (sortBy === 'price-desc') list.sort((a, b) => b.price - a.price)
    if (sortBy === 'name-asc')   list.sort((a, b) => a.name.localeCompare(b.name))
    if (sortBy === 'name-desc')  list.sort((a, b) => b.name.localeCompare(a.name))

    return list
  }, [products, activeTab, search, sortBy, priceMin, priceMax])

  const formatted = (cents: number) =>
    new Intl.NumberFormat('es-MX', { style: 'currency', currency: (content.currency ?? 'usd').toUpperCase() }).format(cents / 100)

  const colClass =
    content.columns === 2 ? 'grid-cols-1 sm:grid-cols-2' :
    content.columns === 4 ? 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-4' :
                            'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'

  // Cálculo de productos por página (3 filas × columnas)
  const productsPerPage = 3 * (content.columns ?? 3)
  const totalPages = Math.ceil(filtered.length / productsPerPage)
  const startIdx = (currentPage - 1) * productsPerPage
  const paginatedProducts = filtered.slice(startIdx, startIdx + productsPerPage)

  const hasFilters = activeTab !== 'Todos' || search || priceMin || priceMax

  function clearFilters() { setActiveTab('Todos'); setSearch(''); setPriceMin(''); setPriceMax(''); setCurrentPage(1) }

  // Reset page when filters change
  useMemo(() => setCurrentPage(1), [activeTab, search, sortBy, priceMin, priceMax])

  // ── Barra de controles (search + sort + layout) ───────────────────────────
  const ControlBar = (
    <div className="flex flex-wrap items-center gap-3 mb-6">
      {/* Search */}
      {content.showSearch && (
        <div className="relative flex-1 min-w-[180px]">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"><IconSearch /></span>
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Buscar productos…"
            className="w-full pl-9 pr-8 py-2.5 text-sm border border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
          />
          {search && (
            <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
              <IconX />
            </button>
          )}
        </div>
      )}

      {/* Sort */}
      {showSort && (
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"><IconSort /></span>
          <select
            value={sortBy}
            onChange={e => setSortBy(e.target.value as SortValue)}
            className="pl-9 pr-8 py-2.5 text-sm border border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 appearance-none cursor-pointer min-w-[180px]"
          >
            {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </div>
      )}

      {/* Mobile filter toggle (sidebar mode) */}
      {filterStyle === 'sidebar' && (
        <button
          onClick={() => setMobileFOpen(v => !v)}
          className="lg:hidden flex items-center gap-2 px-3.5 py-2.5 text-sm font-medium border border-gray-200 rounded-xl bg-white hover:bg-gray-50 transition-colors"
        >
          <IconFilter />
          Filtros
          {hasFilters && <span className="w-2 h-2 rounded-full bg-indigo-500" />}
        </button>
      )}

      {/* Layout toggle */}
      <div className="flex items-center border border-gray-200 rounded-xl overflow-hidden ml-auto">
        <button
          onClick={() => setLayout('grid')}
          className={`p-2.5 transition-colors ${layout === 'grid' ? 'bg-indigo-600 text-white' : 'bg-white text-gray-500 hover:bg-gray-50'}`}
          title="Vista cuadrícula"
        >
          <IconGrid />
        </button>
        <button
          onClick={() => setLayout('list')}
          className={`p-2.5 transition-colors ${layout === 'list' ? 'bg-indigo-600 text-white' : 'bg-white text-gray-500 hover:bg-gray-50'}`}
          title="Vista lista"
        >
          <IconList />
        </button>
      </div>
    </div>
  )

  // ── Sidebar de filtros ────────────────────────────────────────────────────
  const SidebarFilters = (forMobile = false) => (
    <aside className={`${forMobile ? '' : 'hidden lg:block'} w-full lg:w-56 flex-shrink-0`}>
      {/* Sidebar header */}
      <div className="flex items-center justify-between mb-4">
        <span className="text-sm font-bold text-gray-800 flex items-center gap-2">
          <IconFilter /> Filtros
        </span>
        <div className="flex items-center gap-2">
          {hasFilters && (
            <button onClick={clearFilters} className="text-xs text-indigo-600 hover:underline font-medium">
              Limpiar
            </button>
          )}
          <button
            onClick={() => setSidebarOpen(v => !v)}
            className="hidden lg:block text-gray-400 hover:text-gray-600"
          >
            <IconChevron open={sidebarOpen} />
          </button>
        </div>
      </div>

      <div className="space-y-1">
        {/* Categorías */}
        {content.showCategories && categories.length > 1 && (
          <div className="border border-gray-100 rounded-xl overflow-hidden">
            <button
              onClick={() => toggleSection('categories')}
              className="w-full flex items-center justify-between px-4 py-3 text-sm font-semibold text-gray-700 bg-gray-50 hover:bg-gray-100 transition-colors"
            >
              Categorías
              <IconChevron open={openSections.categories ?? false} />
            </button>
            {openSections.categories && (
              <div className="px-4 py-3 space-y-2 bg-white">
                {categories.map(cat => (
                  <label key={cat} className="flex items-center gap-2.5 cursor-pointer group">
                    <input
                      type="radio"
                      name="category"
                      checked={activeTab === cat}
                      onChange={() => setActiveTab(cat)}
                      className="accent-indigo-600"
                    />
                    <span className={`text-sm transition-colors ${activeTab === cat ? 'text-indigo-700 font-semibold' : 'text-gray-600 group-hover:text-gray-900'}`}>
                      {cat}
                    </span>
                    <span className="ml-auto text-xs text-gray-400">
                      {cat === 'Todos' ? products.length : products.filter(p => p.category === cat).length}
                    </span>
                  </label>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Rango de precio */}
        {showPriceFilter && (
          <div className="border border-gray-100 rounded-xl overflow-hidden">
            <button
              onClick={() => toggleSection('price')}
              className="w-full flex items-center justify-between px-4 py-3 text-sm font-semibold text-gray-700 bg-gray-50 hover:bg-gray-100 transition-colors"
            >
              Precio
              <IconChevron open={openSections.price ?? false} />
            </button>
            {openSections.price && (
              <div className="px-4 py-3 bg-white space-y-3">
                <div className="flex items-center gap-2">
                  <div className="flex-1">
                    <p className="text-[10px] text-gray-400 mb-1 font-medium uppercase tracking-wide">Mínimo</p>
                    <div className="relative">
                      <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 text-xs">$</span>
                      <input
                        type="number" min="0" value={priceMin}
                        onChange={e => setPriceMin(e.target.value)}
                        placeholder="0"
                        className="w-full pl-6 pr-2 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                  </div>
                  <span className="text-gray-300 mt-5">—</span>
                  <div className="flex-1">
                    <p className="text-[10px] text-gray-400 mb-1 font-medium uppercase tracking-wide">Máximo</p>
                    <div className="relative">
                      <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 text-xs">$</span>
                      <input
                        type="number" min="0" value={priceMax}
                        onChange={e => setPriceMax(e.target.value)}
                        placeholder={maxProductPrice > 0 ? String(Math.ceil(maxProductPrice / 100)) : '∞'}
                        className="w-full pl-6 pr-2 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                  </div>
                </div>
                {(priceMin || priceMax) && (
                  <button onClick={() => { setPriceMin(''); setPriceMax('') }} className="text-xs text-indigo-600 hover:underline">
                    Limpiar precio
                  </button>
                )}
              </div>
            )}
          </div>
        )}

        {/* Disponibilidad */}
        <div className="border border-gray-100 rounded-xl overflow-hidden">
          <button
            onClick={() => toggleSection('availability')}
            className="w-full flex items-center justify-between px-4 py-3 text-sm font-semibold text-gray-700 bg-gray-50 hover:bg-gray-100 transition-colors"
          >
            Disponibilidad
            <IconChevron open={openSections.availability ?? false} />
          </button>
          {openSections.availability && (
            <div className="px-4 py-3 bg-white space-y-2">
              <p className="text-xs text-gray-400">{products.filter(p => p.stock !== 0).length} en stock</p>
              <p className="text-xs text-gray-400">{products.filter(p => p.stock === 0).length} agotados</p>
            </div>
          )}
        </div>
      </div>
    </aside>
  )

  // ── Tabs de categorías ────────────────────────────────────────────────────
  const CategoryTabs = (
    <div className="flex flex-wrap gap-2 mb-6">
      {categories.map(cat => (
        <button
          key={cat}
          onClick={() => setActiveTab(cat)}
          className={`px-4 py-1.5 rounded-full text-sm font-semibold transition-all border ${
            activeTab === cat
              ? 'bg-gray-900 text-white border-gray-900 shadow-sm'
              : 'bg-white text-gray-600 border-gray-200 hover:border-gray-400 hover:text-gray-900'
          }`}
        >
          {cat}
          <span className="ml-1.5 text-[11px] opacity-60">
            {cat === 'Todos' ? products.length : products.filter(p => p.category === cat).length}
          </span>
        </button>
      ))}
    </div>
  )

  // ── Dropdowns de filtros ──────────────────────────────────────────────────
  const DropdownFilters = (
    <div className="flex flex-wrap items-center gap-2 mb-6">
      {content.showCategories && categories.length > 1 && (
        <select
          value={activeTab}
          onChange={e => setActiveTab(e.target.value)}
          className="px-3 py-2 text-sm border border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 appearance-none cursor-pointer"
        >
          {categories.map(c => (
            <option key={c} value={c}>{c} ({c === 'Todos' ? products.length : products.filter(p => p.category === c).length})</option>
          ))}
        </select>
      )}
      {showPriceFilter && (
        <div className="flex items-center gap-1.5">
          <div className="relative">
            <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 text-xs">$</span>
            <input type="number" min="0" value={priceMin} onChange={e => setPriceMin(e.target.value)} placeholder="Mín"
              className="w-24 pl-6 pr-2 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500" />
          </div>
          <span className="text-gray-300 text-sm">—</span>
          <div className="relative">
            <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 text-xs">$</span>
            <input type="number" min="0" value={priceMax} onChange={e => setPriceMax(e.target.value)} placeholder="Máx"
              className="w-24 pl-6 pr-2 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500" />
          </div>
        </div>
      )}
      {hasFilters && (
        <button onClick={clearFilters} className="flex items-center gap-1.5 px-3 py-2 text-sm text-gray-500 hover:text-red-600 border border-gray-200 rounded-xl hover:border-red-200 hover:bg-red-50 transition-colors">
          <IconX /> Limpiar
        </button>
      )}
    </div>
  )

  // ── Grid de productos ─────────────────────────────────────────────────────
  const ProductGrid = (
    <>
      {showProductCount && (
        <p className="text-xs text-gray-400 mb-4">
          {filtered.length === products.length
            ? `${products.length} producto${products.length !== 1 ? 's' : ''}`
            : `${filtered.length} de ${products.length} productos`}
          {hasFilters && <button onClick={clearFilters} className="ml-2 text-indigo-500 hover:underline">Limpiar filtros</button>}
        </p>
      )}

      {filtered.length === 0 && products.length > 0 && (
        <div className="text-center py-12 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
          <div className="flex justify-center mb-3"><IconSearch /></div>
          <p className="text-gray-500 font-medium text-sm">Sin resultados para tu búsqueda</p>
          <button onClick={clearFilters} className="mt-2 text-sm text-indigo-600 hover:underline">Limpiar filtros</button>
        </div>
      )}

      {products.length === 0 && (
        <div className="text-center py-16 bg-gray-50 rounded-2xl border border-dashed border-gray-300">
          <div className="flex justify-center mb-4"><IconImageOff /></div>
          <p className="font-semibold text-gray-600 text-sm">Aún no hay productos disponibles</p>
        </div>
      )}

      {filtered.length > 0 && layout === 'list' ? (
        <div className="space-y-3">
          {paginatedProducts.map(product => (
            <ProductListRow
              key={product.id} product={product}
              buttonText={content.buttonText} formatted={formatted}
              onAdd={cart ? () => cart.add(product) : null}
              onRemoveOne={cart ? () => {
                const item = cart.items.find(i => i.productId === product.id)
                if (!item) return
                if (item.quantity <= 1) cart.remove(product.id)
                else cart.updateQty(product.id, item.quantity - 1)
              } : null}
              onViewDetail={cart ? () => cart.openProduct(product) : null}
              previewMode={previewMode}
              cartQty={cart ? (cart.items.find(i => i.productId === product.id)?.quantity ?? 0) : 0}
              badgePresets={content.badgePresets}
            />
          ))}
        </div>
      ) : filtered.length > 0 ? (
        <div className={`grid ${colClass} gap-5`}>
          {paginatedProducts.map(product => (
            <ProductCard
              key={product.id} product={product}
              buttonText={content.buttonText} formatted={formatted}
              onAdd={cart ? () => cart.add(product) : null}
              onRemoveOne={cart ? () => {
                const item = cart.items.find(i => i.productId === product.id)
                if (!item) return
                if (item.quantity <= 1) cart.remove(product.id)
                else cart.updateQty(product.id, item.quantity - 1)
              } : null}
              onViewDetail={cart ? () => cart.openProduct(product) : null}
              previewMode={previewMode}
              cartQty={cart ? (cart.items.find(i => i.productId === product.id)?.quantity ?? 0) : 0}
              badgePresets={content.badgePresets}
            />
          ))}
        </div>
      ) : null}

      {previewMode && (
        <p className="text-center text-xs text-gray-300 mt-8">
          Vista previa · {DEMO_PRODUCTS.length} productos demo
        </p>
      )}

      {/* Pagination controls */}
      {totalPages > 1 && filtered.length > 0 && (
        <div className="flex items-center justify-center gap-2 mt-8">
          <button
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="flex items-center gap-1 px-3 py-2 text-sm font-medium border border-gray-200 rounded-xl hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white transition-colors"
          >
            <IconChevronLeft /> Anterior
          </button>

          <div className="flex items-center gap-1">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`w-8 h-8 text-sm font-medium rounded-lg transition-colors ${
                  currentPage === page
                    ? 'bg-indigo-600 text-white'
                    : 'border border-gray-200 text-gray-700 hover:bg-gray-50'
                }`}
              >
                {page}
              </button>
            ))}
          </div>

          <button
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="flex items-center gap-1 px-3 py-2 text-sm font-medium border border-gray-200 rounded-xl hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white transition-colors"
          >
            Siguiente <IconChevronRight />
          </button>
        </div>
      )}
    </>
  )

  return (
    <section id="productos" className={bsCls(style, 'bg-white', 'py-16', 'px-4')} style={bsStyle(style)}>
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <div className="text-center mb-10">
          <h2 className="text-3xl sm:text-4xl font-black tracking-tight">{content.title}</h2>
          {content.subtitle && (
            <p className="mt-3 text-base max-w-xl mx-auto leading-relaxed opacity-60">{content.subtitle}</p>
          )}
        </div>

        {/* ── Modo SIDEBAR ── */}
        {filterStyle === 'sidebar' ? (
          <>
            {ControlBar}

            {/* Mobile filter drawer */}
            {mobileFOpen && (
              <div className="lg:hidden mb-6 bg-gray-50 border border-gray-200 rounded-2xl p-4">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-bold text-gray-700">Filtros</span>
                  <button onClick={() => setMobileFOpen(false)} className="text-gray-400 hover:text-gray-600"><IconX /></button>
                </div>
                {SidebarFilters(true)}
              </div>
            )}

            <div className="flex gap-8 items-start">
              {/* Desktop sidebar */}
              {sidebarOpen && SidebarFilters(false)}
              {/* Main content */}
              <div className="flex-1 min-w-0">{ProductGrid}</div>
            </div>
          </>
        ) : (
          <>
            {ControlBar}
            {filterStyle === 'tabs' && content.showCategories && categories.length > 1 && CategoryTabs}
            {filterStyle === 'dropdown' && DropdownFilters}
            {ProductGrid}
          </>
        )}
      </div>
    </section>
  )
}

// ─── Badge ────────────────────────────────────────────────────────────────────

const _STARBURST_PTS = (() => {
  const pts: string[] = []
  for (let i = 0; i < 20; i++) {
    const angle = (Math.PI * i) / 10 - Math.PI / 2
    const r = i % 2 === 0 ? 48 : 34
    pts.push(`${50 + r * Math.cos(angle)},${50 + r * Math.sin(angle)}`)
  }
  return pts.join(' ')
})()

const BADGE_SIZE_PX = { sm: 32, md: 44, lg: 58 }

function Badge({ text, presets, shape, size }: {
  text: string
  presets?: StoreBadgePreset[]
  shape?: string | null
  size?: string | null
}) {
  const { bg, color } = resolveBadge(text, presets)
  const resolvedShape = shape ?? 'pill'
  const px = BADGE_SIZE_PX[(size ?? 'md') as keyof typeof BADGE_SIZE_PX] ?? BADGE_SIZE_PX.md
  const textLen = text.length
  const fontPx = Math.max(7, Math.round(px * (textLen <= 4 ? 0.24 : textLen <= 7 ? 0.19 : 0.15)))

  if (resolvedShape === 'starburst') {
    return (
      <div className="absolute top-2 left-2 z-10" style={{ width: px, height: px }}>
        <svg viewBox="0 0 100 100" width={px} height={px} style={{ position: 'absolute', inset: 0, overflow: 'visible' }}>
          <polygon points={_STARBURST_PTS} fill={bg} filter="drop-shadow(0 1px 4px rgba(0,0,0,0.28))" />
        </svg>
        <div style={{
          position: 'absolute', inset: 0,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color, fontWeight: 900, fontSize: fontPx, lineHeight: 1.1,
          textAlign: 'center', padding: 4, userSelect: 'none', textTransform: 'uppercase',
        }}>
          {text}
        </div>
      </div>
    )
  }

  return (
    <span
      className="absolute top-2.5 left-2.5 font-black uppercase tracking-wider shadow-sm z-10"
      style={{
        backgroundColor: bg,
        color,
        fontSize: fontPx,
        padding: resolvedShape === 'square' ? `${Math.round(px * 0.12)}px ${Math.round(px * 0.22)}px` : `${Math.round(px * 0.1)}px ${Math.round(px * 0.28)}px`,
        borderRadius: resolvedShape === 'square' ? 5 : 999,
        whiteSpace: 'nowrap',
      }}
    >
      {text}
    </span>
  )
}

// ─── ProductCard (grid view) ──────────────────────────────────────────────────

function ProductCard({ product, buttonText, formatted, onAdd, onRemoveOne, onViewDetail, previewMode, cartQty, badgePresets }: {
  product: Product
  buttonText: string
  formatted: (cents: number) => string
  onAdd: (() => void) | null
  onRemoveOne: (() => void) | null
  onViewDetail: (() => void) | null
  previewMode: boolean
  cartQty: number
  badgePresets?: StoreBadgePreset[]
}) {
  const outOfStock = product.stock === 0

  function handleAdd() {
    if (!onAdd || outOfStock) return
    onAdd()
  }

  const discount = product.comparePrice
    ? Math.round((1 - product.price / product.comparePrice) * 100)
    : null

  return (
    <div className="group bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-xl hover:shadow-gray-200/80 hover:-translate-y-0.5 transition-all duration-300 flex flex-col">

      {/* Imagen */}
      <div className="relative aspect-[4/3] bg-gray-50 overflow-hidden">
        {product.imageUrl ? (
          <img
            src={product.imageUrl} alt={product.name}
            className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center gap-2">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="w-12 h-12 text-gray-200">
              <rect x="3" y="3" width="18" height="18" rx="2"/>
              <circle cx="8.5" cy="8.5" r="1.5"/>
              <polyline points="21 15 16 10 5 21"/>
            </svg>
          </div>
        )}

        {product.badge && <Badge text={product.badge} presets={badgePresets} shape={product.badgeShape} size={product.badgeSize} />}

        {discount && (
          <span className="absolute top-2.5 right-2.5 bg-red-500 text-white text-[10px] font-black px-2 py-0.5 rounded-md shadow-sm">
            -{discount}%
          </span>
        )}

        {product.stock > 0 && product.stock <= 5 && (
          <span className="absolute bottom-2.5 left-2.5 bg-amber-50 text-amber-600 border border-amber-200 text-[10px] font-bold px-2 py-0.5 rounded-md">
            ¡Solo {product.stock} disponibles!
          </span>
        )}

        {outOfStock && (
          <div className="absolute inset-0 bg-white/80 backdrop-blur-[1px] flex items-center justify-center">
            <span className="bg-gray-100 border border-gray-200 text-gray-500 text-xs font-bold px-3 py-1.5 rounded-xl">Sin stock</span>
          </div>
        )}

        {/* Hover overlay con botón ver detalle */}
        {onViewDetail && !outOfStock && (
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
            <button
              onClick={e => { e.stopPropagation(); onViewDetail() }}
              className="bg-white/90 backdrop-blur-sm text-gray-800 text-xs font-bold px-4 py-2 rounded-xl shadow-lg hover:bg-white transition-all translate-y-2 group-hover:translate-y-0 duration-300"
            >
              Ver detalles
            </button>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-4 flex flex-col flex-1">
        {product.category && (
          <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-1">{product.category}</span>
        )}
        <button
          onClick={() => onViewDetail?.()}
          className="font-bold text-gray-900 text-sm leading-tight text-left hover:text-indigo-600 transition-colors"
        >
          {product.name}
        </button>
        {product.description && (
          <p className="text-gray-400 text-xs line-clamp-2 mt-1 mb-3 flex-1 leading-relaxed">{product.description}</p>
        )}

        <div className="flex items-end justify-between mt-auto pt-3 border-t border-gray-50">
          <div className="leading-none">
            <span className="text-xl font-black text-gray-900 tracking-tight">{formatted(product.price)}</span>
            {product.comparePrice && (
              <span className="block text-xs text-gray-400 line-through mt-0.5">{formatted(product.comparePrice)}</span>
            )}
          </div>
          {cartQty > 0 ? (
            // Controles de cantidad cuando ya está en el carrito
            <div className="flex items-center rounded-xl border-2 border-indigo-600 overflow-hidden h-9">
              <button
                type="button"
                onClick={onRemoveOne ?? undefined}
                className="w-9 flex items-center justify-center text-indigo-600 hover:bg-indigo-50 font-black text-lg transition-colors"
              >
                −
              </button>
              <span className="w-8 text-center text-sm font-black text-indigo-700 select-none tabular-nums">
                {cartQty}
              </span>
              <button
                type="button"
                onClick={handleAdd}
                disabled={outOfStock}
                className="w-9 flex items-center justify-center text-indigo-600 hover:bg-indigo-50 font-black text-lg transition-colors disabled:opacity-40"
              >
                +
              </button>
            </div>
          ) : (
            // Botón agregar normal
            <button
              onClick={handleAdd}
              disabled={outOfStock || previewMode}
              className={`flex items-center gap-1.5 px-3 py-2.5 rounded-xl text-xs font-bold transition-all ${
                outOfStock
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm shadow-indigo-200/80 hover:scale-105 active:scale-95'
              } disabled:opacity-60`}
            >
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 002 1.61h9.72a2 2 0 001.96-1.61l1.54-7.39H6"/></svg>
              <span>{buttonText}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

// ─── ProductListRow (list view) ───────────────────────────────────────────────

function ProductListRow({ product, buttonText, formatted, onAdd, onRemoveOne, onViewDetail, previewMode, cartQty, badgePresets }: {
  product: Product
  buttonText: string
  formatted: (cents: number) => string
  onAdd: (() => void) | null
  onRemoveOne: (() => void) | null
  onViewDetail: (() => void) | null
  previewMode: boolean
  cartQty: number
  badgePresets?: StoreBadgePreset[]
}) {
  const outOfStock = product.stock === 0
  const discount = product.comparePrice
    ? Math.round((1 - product.price / product.comparePrice) * 100)
    : null

  function handleAdd() {
    if (!onAdd || outOfStock) return
    onAdd()
  }

  return (
    <div className="flex items-center gap-4 bg-white border border-gray-100 rounded-2xl p-4 hover:shadow-md hover:border-gray-200 hover:-translate-y-px transition-all duration-200">

      {/* Thumbnail */}
      <div className="relative w-20 h-20 flex-shrink-0 rounded-xl bg-gray-50 overflow-hidden">
        {product.imageUrl ? (
          <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="w-8 h-8 text-gray-200">
              <rect x="3" y="3" width="18" height="18" rx="2"/>
              <circle cx="8.5" cy="8.5" r="1.5"/>
              <polyline points="21 15 16 10 5 21"/>
            </svg>
          </div>
        )}
        {product.badge && <Badge text={product.badge} presets={badgePresets} shape={product.badgeShape} size={product.badgeSize ?? 'sm'} />}
        {outOfStock && (
          <div className="absolute inset-0 bg-white/70 flex items-center justify-center">
            <span className="text-[10px] font-bold text-gray-500">Agotado</span>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        {product.category && (
          <span className="text-[10px] font-bold text-indigo-500 uppercase tracking-wider">{product.category}</span>
        )}
        <button
          onClick={() => onViewDetail?.()}
          className="font-bold text-gray-900 text-sm leading-tight truncate text-left hover:text-indigo-600 transition-colors"
        >
          {product.name}
        </button>
        {product.description && (
          <p className="text-xs text-gray-400 line-clamp-1 mt-0.5">{product.description}</p>
        )}
        <div className="flex items-center gap-2 mt-1.5">
          <span className="font-black text-gray-900 text-base">{formatted(product.price)}</span>
          {product.comparePrice && (
            <span className="text-xs text-gray-400 line-through">{formatted(product.comparePrice)}</span>
          )}
          {discount && (
            <span className="text-[10px] font-bold bg-red-50 text-red-500 px-1.5 py-0.5 rounded-md">-{discount}%</span>
          )}
        </div>
        {product.stock > 0 && product.stock <= 5 && (
          <p className="text-[10px] text-amber-600 font-medium mt-0.5">¡Solo {product.stock} disponibles!</p>
        )}
      </div>

      {/* Botón / Controles de cantidad */}
      {cartQty > 0 ? (
        <div className="flex-shrink-0 flex items-center rounded-xl border-2 border-indigo-600 overflow-hidden h-10">
          <button type="button" onClick={onRemoveOne ?? undefined}
            className="w-10 flex items-center justify-center text-indigo-600 hover:bg-indigo-50 font-black text-xl transition-colors">
            −
          </button>
          <span className="w-9 text-center text-sm font-black text-indigo-700 select-none tabular-nums">
            {cartQty}
          </span>
          <button type="button" onClick={handleAdd} disabled={outOfStock}
            className="w-10 flex items-center justify-center text-indigo-600 hover:bg-indigo-50 font-black text-xl transition-colors disabled:opacity-40">
            +
          </button>
        </div>
      ) : (
        <button
          onClick={handleAdd}
          disabled={outOfStock || previewMode}
          className={`flex-shrink-0 flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-bold transition-all ${
            outOfStock
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
              : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm shadow-indigo-200'
          } disabled:opacity-60`}
        >
          {outOfStock ? 'Sin stock' : (
            <><svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 002 1.61h9.72a2 2 0 001.96-1.61l1.54-7.39H6"/></svg>{buttonText}</>
          )}
        </button>
      )}
    </div>
  )
}
