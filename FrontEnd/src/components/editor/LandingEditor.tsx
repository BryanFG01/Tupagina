'use client'

import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors
} from '@dnd-kit/core'
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { useRouter } from 'next/navigation'
import type { ReactNode } from 'react'
import { useState } from 'react'

import { publishLandingAction, updateLandingAction } from '@/app/actions/landing.actions'
import { BlockRenderer } from '@/components/blocks/BlockRenderer'
import type { Block, BlockStyle, BlockType } from '@/domain/landing/block.types'
import { BLOCK_DEFAULTS, DEFAULT_BLOCK_STYLE } from '@/domain/landing/block.types'
import type { LandingPage } from '@/domain/landing/landing.types'
import { BlockStylePanel } from './BlockStylePanel'
import { BrandsBannerBlockEditor } from './blocks/BrandsBannerBlockEditor'
import { ContactBlockEditor } from './blocks/ContactBlockEditor'
import { FaqBlockEditor } from './blocks/FaqBlockEditor'
import { FeaturesBlockEditor } from './blocks/FeaturesBlockEditor'
import { FloatingButtonsBlockEditor } from './blocks/FloatingButtonsBlockEditor'
import { FooterBlockEditor } from './blocks/FooterBlockEditor'
import { GalleryBlockEditor } from './blocks/GalleryBlockEditor'
import { HeroBlockEditor } from './blocks/HeroBlockEditor'
import { IconsTickerBlockEditor } from './blocks/IconsTickerBlockEditor'
import { NavbarBlockEditor } from './blocks/NavbarBlockEditor'
import { PaymentBlockEditor } from './blocks/PaymentBlockEditor'
import { ServicesBlockEditor } from './blocks/ServicesBlockEditor'
import { SpinnerBlockEditor } from './blocks/SpinnerBlockEditor'
import { StatsBlockEditor } from './blocks/StatsBlockEditor'
import { StoreBannerBlockEditor } from './blocks/StoreBannerBlockEditor'
import { StoreBlockEditor } from './blocks/StoreBlockEditor'
import { TestimonialsBlockEditor } from './blocks/TestimonialsBlockEditor'
import { nanoid } from './nanoid'
import type { LandingPageDef, NavbarContent } from '@/domain/landing/block.types'

// ─── Metadata de bloques ──────────────────────────────────────────────────────

type BlockMeta = { label: string; icon: ReactNode; desc: string; color: string; hidden?: boolean }

const IconPortada = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.75"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="w-5 h-5"
  >
    <rect x="3" y="3" width="18" height="18" rx="2" />
    <path d="M3 9h18" />
    <path d="M9 21V9" />
  </svg>
)
const IconServicios = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.75"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="w-5 h-5"
  >
    <rect x="3" y="3" width="7" height="7" rx="1" />
    <rect x="14" y="3" width="7" height="7" rx="1" />
    <rect x="3" y="14" width="7" height="7" rx="1" />
    <rect x="14" y="14" width="7" height="7" rx="1" />
  </svg>
)
const IconTestimonios = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.75"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="w-5 h-5"
  >
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    <circle cx="9" cy="10" r="1" fill="currentColor" stroke="none" />
    <circle cx="12" cy="10" r="1" fill="currentColor" stroke="none" />
    <circle cx="15" cy="10" r="1" fill="currentColor" stroke="none" />
  </svg>
)
const IconPago = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.75"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="w-5 h-5"
  >
    <rect x="2" y="5" width="20" height="14" rx="2" />
    <path d="M2 10h20" />
    <path d="M6 15h4" />
  </svg>
)
const IconContacto = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.75"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="w-5 h-5"
  >
    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
  </svg>
)
const IconTienda = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.75"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="w-5 h-5"
  >
    <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
    <line x1="3" y1="6" x2="21" y2="6" />
    <path d="M16 10a4 4 0 0 1-8 0" />
  </svg>
)
const IconBannerTienda = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.75"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="w-5 h-5"
  >
    <rect x="3" y="3" width="18" height="18" rx="2" />
    <circle cx="8.5" cy="8.5" r="1.5" />
    <path d="m21 15-5-5L5 21" />
  </svg>
)
const IconBotonesFlotantes = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.75"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="w-5 h-5"
  >
    <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
  </svg>
)
const IconFooter = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.75"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="w-5 h-5"
  >
    <rect x="3" y="3" width="18" height="18" rx="2" />
    <path d="M3 15h18" />
    <path d="M7 19v-4" />
    <path d="M12 19v-4" />
    <path d="M17 19v-4" />
  </svg>
)
const IconFaq = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.75"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="w-5 h-5"
  >
    <circle cx="12" cy="12" r="10" />
    <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
    <line x1="12" y1="17" x2="12.01" y2="17" />
  </svg>
)
const IconNavbar = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.75"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="w-5 h-5"
  >
    <rect x="3" y="5" width="18" height="14" rx="2" />
    <line x1="3" y1="10" x2="21" y2="10" />
    <line x1="7" y1="7" x2="7" y2="7.01" />
    <line x1="11" y1="7" x2="17" y2="7" />
  </svg>
)
const IconStats = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.75"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="w-5 h-5"
  >
    <line x1="18" y1="20" x2="18" y2="10" />
    <line x1="12" y1="20" x2="12" y2="4" />
    <line x1="6" y1="20" x2="6" y2="14" />
  </svg>
)
const IconFeatures = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.75"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="w-5 h-5"
  >
    <rect x="3" y="3" width="7" height="5" rx="1" />
    <rect x="14" y="3" width="7" height="5" rx="1" />
    <rect x="3" y="13" width="7" height="5" rx="1" />
    <rect x="14" y="13" width="7" height="5" rx="1" />
  </svg>
)
const IconGaleria = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.75"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="w-5 h-5"
  >
    <rect x="3" y="3" width="8" height="11" rx="1" />
    <rect x="13" y="3" width="8" height="5" rx="1" />
    <rect x="13" y="11" width="8" height="5" rx="1" />
  </svg>
)
const IconIconTicker = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.75"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="w-5 h-5"
  >
    <rect x="2" y="6" width="5" height="5" rx="1.5" />
    <rect x="9.5" y="6" width="5" height="5" rx="1.5" />
    <rect x="17" y="6" width="5" height="5" rx="1.5" />
    <line x1="3" y1="14" x2="7" y2="14" />
    <line x1="10.5" y1="14" x2="13.5" y2="14" />
    <line x1="18" y1="14" x2="21" y2="14" />
  </svg>
)
const IconMarcas = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.75"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="w-5 h-5"
  >
    <path d="M3 12h18" />
    <circle cx="6" cy="12" r="2" fill="currentColor" stroke="none" />
    <circle cx="12" cy="12" r="2" fill="currentColor" stroke="none" />
    <circle cx="18" cy="12" r="2" fill="currentColor" stroke="none" />
    <path d="M3 7h3M9 7h6M17 7h4" />
    <path d="M3 17h4M10 17h4M17 17h4" />
  </svg>
)
const IconSpinner = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.75"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="w-5 h-5"
  >
    <circle cx="12" cy="12" r="9" strokeOpacity="0.3" />
    <path d="M12 3 A9 9 0 0 1 21 12" strokeLinecap="round" />
  </svg>
)

// ─── Grupos de bloques ────────────────────────────────────────────────────────

const BLOCK_GROUPS: { label: string; types: BlockType[] }[] = [
  { label: 'Estructura', types: ['navbar', 'footer'] },
  { label: 'Contenido', types: ['hero', 'services', 'features', 'testimonials', 'faq', 'contact'] },
  { label: 'Tienda', types: ['store-banner', 'store', 'floating-buttons', 'payment'] },
  {
    label: 'Visual',
    types: ['gallery', 'stats', 'brands-banner', 'icons-ticker', 'loading-spinner']
  }
]

const BLOCK_META: Record<BlockType, BlockMeta> = {
  hero: {
    label: 'Portada',
    icon: <IconPortada />,
    desc: 'Título + CTA',
    color: 'bg-violet-50 text-violet-600 border-violet-200'
  },
  services: {
    label: 'Servicios',
    icon: <IconServicios />,
    desc: 'Grid de servicios',
    color: 'bg-amber-50  text-amber-600  border-amber-200'
  },
  testimonials: {
    label: 'Testimonios',
    icon: <IconTestimonios />,
    desc: 'Reseñas de clientes',
    color: 'bg-sky-50    text-sky-600    border-sky-200'
  },
  payment: {
    label: 'Botón de pago',
    icon: <IconPago />,
    desc: 'Checkout integrado',
    color: 'bg-green-50  text-green-600  border-green-200'
  },
  contact: {
    label: 'Contacto',
    icon: <IconContacto />,
    desc: 'WhatsApp y email',
    color: 'bg-rose-50   text-rose-600   border-rose-200'
  },
  store: {
    label: 'Tienda',
    icon: <IconTienda />,
    desc: 'Catálogo + carrito',
    color: 'bg-indigo-50 text-indigo-600 border-indigo-200'
  },
  'store-banner': {
    label: 'Banner tienda',
    icon: <IconBannerTienda />,
    desc: 'Hero + botón carrito',
    color: 'bg-fuchsia-50 text-fuchsia-600 border-fuchsia-200'
  },
  'floating-buttons': {
    label: 'Botones flotantes',
    icon: <IconBotonesFlotantes />,
    desc: 'WhatsApp, chat, teléfono',
    color: 'bg-teal-50   text-teal-600   border-teal-200'
  },
  footer: {
    label: 'Pie de página',
    icon: <IconFooter />,
    desc: 'Redes sociales + links',
    color: 'bg-slate-50  text-slate-600  border-slate-200'
  },
  faq: {
    label: 'FAQ / Acordeón',
    icon: <IconFaq />,
    desc: 'Preguntas frecuentes',
    color: 'bg-orange-50 text-orange-600 border-orange-200'
  },
  navbar: {
    label: 'Navegación',
    icon: <IconNavbar />,
    desc: 'Menú con dropdowns',
    color: 'bg-cyan-50   text-cyan-600   border-cyan-200'
  },
  'brands-banner': {
    label: 'Ticker de marcas',
    icon: <IconMarcas />,
    desc: 'Logos animados / brands',
    color: 'bg-pink-50   text-pink-600   border-pink-200'
  },
  gallery: {
    label: 'Galería de fotos',
    icon: <IconGaleria />,
    desc: 'Grid, mosaico, editorial',
    color: 'bg-rose-50   text-rose-600   border-rose-200'
  },
  stats: {
    label: 'Estadísticas',
    icon: <IconStats />,
    desc: 'Contadores animados',
    color: 'bg-emerald-50 text-emerald-600 border-emerald-200'
  },
  features: {
    label: 'Features/Beneficios',
    icon: <IconFeatures />,
    desc: 'Cards con imagen o ícono',
    color: 'bg-blue-50   text-blue-600   border-blue-200'
  },
  'icons-ticker': {
    label: 'Banner de íconos',
    icon: <IconIconTicker />,
    desc: 'Íconos animados + links',
    color: 'bg-yellow-50 text-yellow-600 border-yellow-200'
  },
  'loading-spinner': {
    label: 'Spinner de carga',
    icon: <IconSpinner />,
    desc: 'Pantalla de carga custom',
    color: 'bg-purple-50 text-purple-600 border-purple-200'
  },
}

// ─── Block Library Card ───────────────────────────────────────────────────────

function BlockLibraryCard({
  type,
  meta,
  onAdd
}: {
  type: BlockType
  meta: BlockMeta
  onAdd: (t: BlockType) => void
}) {
  return (
    <button
      onClick={() => onAdd(type)}
      className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl border border-transparent hover:border-indigo-200 hover:bg-indigo-50/60 transition-all group text-left"
    >
      <span
        className={`w-8 h-8 rounded-lg border flex items-center justify-center flex-shrink-0 transition-transform group-hover:scale-110 ${meta.color}`}
      >
        {meta.icon}
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-[12px] font-semibold text-gray-700 group-hover:text-indigo-700 leading-tight truncate">
          {meta.label}
        </p>
        <p className="text-[10px] text-gray-400 truncate leading-tight mt-0.5">{meta.desc}</p>
      </div>
      <span className="w-5 h-5 rounded-full bg-gray-100 group-hover:bg-indigo-500 flex items-center justify-center flex-shrink-0 transition-all">
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="3"
          strokeLinecap="round"
          className="w-2.5 h-2.5 text-gray-400 group-hover:text-white transition-colors"
        >
          <line x1="12" y1="5" x2="12" y2="19" />
          <line x1="5" y1="12" x2="19" y2="12" />
        </svg>
      </span>
    </button>
  )
}

// ─── Editor principal ─────────────────────────────────────────────────────────

type Props = { landing: LandingPage }

export function LandingEditor({ landing }: Props) {
  const router = useRouter()
  const [blocks, setBlocks] = useState<Block[]>(landing.blocks)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [dragActiveId, setDragActive] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [publishing, setPublishing] = useState(false)
  const [isPublished, setIsPublished] = useState(landing.published)
  const [saveMsg, setSaveMsg] = useState<string | null>(null)
  const [rightTab, setRightTab] = useState<'content' | 'style'>('content')
  const [previewOpen, setPreviewOpen] = useState(false)
  const [previewDevice, setPreviewDevice] = useState<'desktop' | 'mobile'>('desktop')
  const [blockSearch, setBlockSearch] = useState('')
  const [leftTab, setLeftTab] = useState<'bloques' | 'vistas'>('bloques')
  const [activePage, setActivePage] = useState<string>('')

  const selectedBlock = blocks.find((b) => b.id === selectedId) ?? null
  const dragActiveBlock = blocks.find((b) => b.id === dragActiveId) ?? null

  // ── Multi-page (derivado del Navbar) ─────────────────────────────────────
  // Las vistas se definen a partir de los links del Navbar que usan ?p=
  const GLOBAL_TYPES = new Set(['navbar', 'footer', 'floating-buttons', 'loading-spinner'])

  const pages: LandingPageDef[] = (() => {
    const navbar = blocks.find((b) => b.type === 'navbar')
    if (!navbar) return []
    const items = (navbar.content as NavbarContent).items ?? []
    const seen = new Set<string>()
    const result: LandingPageDef[] = [
      { id: 'home', label: 'Inicio', path: '', icon: '🏠', isHome: true },
    ]
    const extract = (url: string, label: string, id: string) => {
      const m = url.match(/[?&]p=([^&\s#]+)/)
      if (m && m[1] && !seen.has(m[1])) {
        seen.add(m[1])
        result.push({ id, label, path: m[1], icon: '📄' })
      }
    }
    for (const item of items) {
      extract(item.url, item.label, item.id)
      for (const dd of item.dropdown ?? []) extract(dd.url, dd.label, dd.id)
    }
    return result.length > 1 ? result : []
  })()

  const hasMultiPage = pages.length > 0

  // Bloques del canvas (filtrados por vista activa en el panel "Vistas")
  const canvasBlocks = (hasMultiPage && leftTab === 'vistas')
    ? blocks.filter((b) => {
        if (!(b.type in BLOCK_META)) return false   // skip unknown types
        if (GLOBAL_TYPES.has(b.type)) return true
        const bpId = b.pageId
        return !bpId || bpId === activePage
      })
    : blocks.filter((b) => b.type in BLOCK_META)   // skip unknown types

  // ── Drag & Drop ───────────────────────────────────────────────────────────

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  )

  function onDragStart({ active }: DragStartEvent) {
    setDragActive(active.id as string)
    setSelectedId(null)
  }

  function onDragEnd({ active, over }: DragEndEvent) {
    if (over && active.id !== over.id) {
      setBlocks((prev) => {
        const from = prev.findIndex((b) => b.id === active.id)
        const to = prev.findIndex((b) => b.id === over.id)
        return arrayMove(prev, from, to).map((b, i) => ({ ...b, order: i }))
      })
    }
    setDragActive(null)
  }

  // ── Acciones de bloques ───────────────────────────────────────────────────

  function addBlock(type: BlockType) {
    // Solo se permite un spinner por landing
    if (type === 'loading-spinner' && blocks.some((b) => b.type === 'loading-spinner')) {
      const existing = blocks.find((b) => b.type === 'loading-spinner')
      if (existing) setSelectedId(existing.id)
      return
    }
    const block = {
      id: nanoid(),
      type,
      order: blocks.length,
      content: JSON.parse(JSON.stringify(BLOCK_DEFAULTS[type])),
      ...(hasMultiPage && activePage && !GLOBAL_TYPES.has(type) ? { pageId: activePage } : {}),
    } as Block
    setBlocks((prev) => [...prev, block])
    setSelectedId(block.id)
  }

  function updateSelected(content: Block['content']) {
    setBlocks((prev) => prev.map((b) => (b.id === selectedId ? ({ ...b, content } as Block) : b)))
  }

  function updateSelectedStyle(style: BlockStyle) {
    setBlocks((prev) => prev.map((b) => (b.id === selectedId ? ({ ...b, style } as Block) : b)))
  }

  function removeBlock(id: string) {
    setBlocks((prev) => prev.filter((b) => b.id !== id))
    if (selectedId === id) setSelectedId(null)
  }

  function duplicateBlock(id: string) {
    const src = blocks.find((b) => b.id === id)
    if (!src) return
    const clone = { ...src, id: nanoid(), order: blocks.length } as unknown as Block
    setBlocks((prev) => [...prev, clone])
    setSelectedId(clone.id)
  }

  // ── Guardar / publicar ────────────────────────────────────────────────────

  async function handleSave() {
    setSaving(true)
    const result = await updateLandingAction(landing.id, { blocks })
    setSaving(false)
    if (result.success) {
      setSaveMsg('Guardado ✓')
      setTimeout(() => setSaveMsg(null), 2500)
    } else {
      setSaveMsg(`Error: ${result.error}`)
      setTimeout(() => setSaveMsg(null), 6000) // más tiempo para errores
    }
  }

  async function handlePublish() {
    setPublishing(true)
    const result = await publishLandingAction(landing.id, !isPublished)
    setPublishing(false)
    if (result.success) {
      setIsPublished(result.data.published)
      router.refresh()
    }
  }

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="flex flex-col h-screen bg-[#F0F2F5] overflow-hidden font-sans">
      {/* ═══════════════════════ TOP BAR ═══════════════════════ */}
      <header className="flex items-center justify-between px-5 h-14 bg-white border-b border-gray-200/80 shadow-sm z-30 flex-shrink-0">
        {/* Left */}
        <div className="flex items-center gap-4 min-w-0">
          <button
            onClick={() => router.push('/dashboard')}
            className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 transition-colors"
          >
            <ArrowLeftIcon />
            <span className="hidden sm:inline">Páginas</span>
          </button>
          <div className="w-px h-5 bg-gray-200" />
          <div className="min-w-0">
            <p className="text-sm font-semibold text-gray-800 truncate leading-tight">
              {landing.title}
            </p>
            <p className="text-[11px] text-gray-400 leading-tight">
              tunegocio.app/p/{landing.slug}
            </p>
          </div>
          {isPublished && (
            <span className="hidden sm:flex items-center gap-1.5 text-xs bg-emerald-50 text-emerald-700 border border-emerald-200 px-2.5 py-1 rounded-full font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              En vivo
            </span>
          )}
        </div>

        {/* Right */}
        <div className="flex items-center gap-2 flex-shrink-0">
          {saveMsg && (
            <span
              className={`text-xs font-semibold hidden sm:block px-2.5 py-1 rounded-lg ${
                saveMsg.includes('✓')
                  ? 'text-emerald-700 bg-emerald-50 border border-emerald-200'
                  : 'text-red-700 bg-red-50 border border-red-200'
              }`}
            >
              {saveMsg}
            </span>
          )}

          {/* PREVIEW BUTTON */}
          <button
            onClick={() => setPreviewOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 text-sm text-gray-600 bg-gray-50 border border-gray-200 rounded-lg hover:bg-indigo-50 hover:text-indigo-700 hover:border-indigo-300 transition-all font-medium"
          >
            <EyeIcon />
            <span className="hidden sm:inline">Previsualizar</span>
          </button>

          <button
            onClick={handleSave}
            disabled={saving}
            className="hidden sm:flex items-center gap-1.5 px-3.5 py-2 text-sm text-gray-600 bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100 transition-colors disabled:opacity-50 font-medium"
          >
            {saving ? <SpinnerIcon /> : <SaveIcon />}
            {saving ? 'Guardando…' : 'Guardar'}
          </button>
          <button
            onClick={handlePublish}
            disabled={publishing}
            className={`flex items-center gap-1.5 px-4 py-2 text-sm font-semibold rounded-lg shadow-sm transition-all disabled:opacity-50 ${
              isPublished
                ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-indigo-200'
            }`}
          >
            {publishing ? <SpinnerIcon /> : <PublishIcon />}
            {publishing ? '…' : isPublished ? 'Despublicar' : 'Publicar'}
          </button>
          {isPublished && (
            <a
              href={`/p/${landing.slug}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 px-3 py-2 text-sm text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors font-medium"
            >
              <ExternalLinkIcon />
              <span className="hidden sm:inline">Ver</span>
            </a>
          )}
        </div>
      </header>

      {/* ═══════════════════════ PREVIEW OVERLAY ═══════════════════════ */}
      {previewOpen && (
        <PreviewOverlay
          blocks={blocks}
          landing={landing}
          device={previewDevice}
          onDeviceChange={setPreviewDevice}
          onClose={() => setPreviewOpen(false)}
        />
      )}

      {/* ═══════════════════════ MAIN PANELS ═══════════════════════ */}
      <div className="flex flex-1 min-h-0">
        {/* ── LEFT SIDEBAR ── */}
        <aside
          className="w-[220px] bg-white border-r border-gray-200/60 flex flex-col flex-shrink-0"
          style={{ boxShadow: '2px 0 12px rgba(0,0,0,0.04)' }}
        >
          {/* Header — Tabs Bloques / Vistas */}
          <div className="px-3 pt-3 pb-3 border-b border-gray-100">
            <div className="flex bg-gray-100 rounded-xl p-1 gap-1 mb-2">
              <button
                onClick={() => setLeftTab('bloques')}
                className={`flex-1 py-1.5 text-[11px] font-bold rounded-lg transition-all ${leftTab === 'bloques' ? 'bg-white text-gray-800 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
              >
                Bloques
              </button>
              <button
                onClick={() => setLeftTab('vistas')}
                className={`flex-1 py-1.5 text-[11px] font-bold rounded-lg transition-all relative ${leftTab === 'vistas' ? 'bg-white text-gray-800 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
              >
                Vistas
                {hasMultiPage && (
                  <span className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 bg-indigo-500 rounded-full text-[8px] text-white flex items-center justify-center font-bold">
                    {pages.length}
                  </span>
                )}
              </button>
            </div>
            {leftTab === 'bloques' && (
            <>
              <div className="flex items-center justify-between mb-2">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                  Bloques
                </p>
                <span className="text-[10px] bg-indigo-100 text-indigo-600 font-bold px-2 py-0.5 rounded-full">
                  {blocks.length} en página
                </span>
              </div>
              {/* Search */}
              <div className="relative">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none"
                >
                  <circle cx="11" cy="11" r="8" />
                  <line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
                <input
                  type="text"
                  value={blockSearch}
                  onChange={(e) => setBlockSearch(e.target.value)}
                  placeholder="Buscar bloque…"
                  className="w-full pl-8 pr-7 py-2 text-xs rounded-lg border border-gray-200 bg-gray-50/80 text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-300 focus:bg-white transition-all"
                />
                {blockSearch && (
                  <button
                    onClick={() => setBlockSearch('')}
                    className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 flex items-center justify-center rounded-full bg-gray-300 hover:bg-gray-400 text-white transition-colors"
                  >
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="3"
                      strokeLinecap="round"
                      className="w-2.5 h-2.5"
                    >
                      <line x1="18" y1="6" x2="6" y2="18" />
                      <line x1="6" y1="6" x2="18" y2="18" />
                    </svg>
                  </button>
                )}
              </div>
            </>
            )}
          </div>

          {/* Block list OR Vistas panel */}
          {leftTab === 'vistas' ? (
            <div className="flex-1 overflow-y-auto pb-2 px-3 pt-3" style={{ scrollbarWidth: 'thin', scrollbarColor: '#e5e7eb transparent' }}>
              {!hasMultiPage ? (
                <div className="space-y-3">
                  <div className="p-3 bg-indigo-50 border border-indigo-200 rounded-xl">
                    <p className="text-xs font-bold text-indigo-700 mb-1">¿Cómo crear vistas?</p>
                    <p className="text-[11px] text-indigo-600 leading-relaxed">
                      Agrega links en el bloque <strong>Navegación</strong> con el formato <code className="bg-indigo-100 px-1 rounded font-mono">?p=nombre</code>. Cada link define una vista.
                    </p>
                  </div>
                  <div className="p-3 bg-gray-50 border border-gray-200 rounded-xl space-y-1.5">
                    <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Ejemplo</p>
                    {[
                      { label: 'Inicio', url: '/', note: 'vista principal' },
                      { label: 'Tienda', url: '?p=tienda', note: 'segunda vista' },
                      { label: 'Nosotros', url: '?p=nosotros', note: 'tercera vista' },
                    ].map((ex) => (
                      <div key={ex.url} className="flex items-center gap-2">
                        <span className="text-[10px] font-semibold text-gray-600 w-16 truncate">{ex.label}</span>
                        <code className="text-[10px] bg-gray-100 text-gray-700 px-1.5 py-0.5 rounded font-mono flex-1 truncate">{ex.url}</code>
                        <span className="text-[10px] text-gray-400">{ex.note}</span>
                      </div>
                    ))}
                  </div>
                  <button
                    onClick={() => {
                      const navbarId = blocks.find(b => b.type === 'navbar')?.id
                      if (navbarId) setSelectedId(navbarId)
                      setLeftTab('bloques')
                    }}
                    className="w-full py-2 border border-indigo-200 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-semibold rounded-xl transition-colors"
                  >
                    {blocks.find(b => b.type === 'navbar') ? '→ Ir al bloque Navegación' : '+ Agregar bloque Navegación primero'}
                  </button>
                </div>
              ) : (
                <div className="space-y-2">
                  <p className="text-[10px] text-gray-400 font-medium">Vista activa en el editor:</p>
                  {pages.map((page) => (
                    <button
                      key={page.id}
                      onClick={() => setActivePage(page.isHome ? '' : page.path)}
                      className={`w-full flex items-center gap-2 px-3 py-2.5 rounded-xl border text-left transition-all ${
                        (page.isHome ? '' : page.path) === activePage
                          ? 'border-indigo-300 bg-indigo-50 text-indigo-700'
                          : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50 text-gray-700'
                      }`}
                    >
                      <span className="text-base">{page.icon ?? '📄'}</span>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-semibold truncate">{page.label}</p>
                        <p className="text-[10px] text-gray-400 font-mono truncate">
                          {page.isHome ? '(principal)' : `?p=${page.path}`}
                        </p>
                      </div>
                      {(page.isHome ? '' : page.path) === activePage && (
                        <span className="w-2 h-2 rounded-full bg-indigo-500 flex-shrink-0" />
                      )}
                    </button>
                  ))}
                  <p className="text-[10px] text-gray-400 leading-relaxed pt-1">
                    Vistas detectadas desde los links del Navbar. Para agregar más, edita el bloque Navegación.
                  </p>
                </div>
              )}
            </div>
          ) : (
          <div
            className="flex-1 overflow-y-auto pb-2"
            style={{ scrollbarWidth: 'thin', scrollbarColor: '#e5e7eb transparent' }}
          >
            {(() => {
              const q = blockSearch.toLowerCase().trim()

              // ── Búsqueda activa: mostrar todos planos sin grupos ──
              if (q) {
                const filtered = (Object.entries(BLOCK_META) as [BlockType, BlockMeta][])
                  .filter(([, m]) => !m.hidden)
                  .filter(
                    ([, m]) => m.label.toLowerCase().includes(q) || m.desc.toLowerCase().includes(q)
                  )
                if (filtered.length === 0)
                  return (
                    <div className="flex flex-col items-center justify-center py-10 text-gray-400 gap-2">
                      <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        className="w-8 h-8 opacity-40"
                      >
                        <circle cx="11" cy="11" r="8" />
                        <line x1="21" y1="21" x2="16.65" y2="16.65" />
                      </svg>
                      <p className="text-xs text-center">
                        Sin resultados para
                        <br />
                        <span className="font-semibold">"{blockSearch}"</span>
                      </p>
                    </div>
                  )
                return (
                  <div className="px-3 pt-3 space-y-1">
                    {filtered.map(([type, meta]) => (
                      <BlockLibraryCard key={type} type={type} meta={meta} onAdd={addBlock} />
                    ))}
                  </div>
                )
              }

              // ── Vista agrupada ──
              return BLOCK_GROUPS.map((group) => {
                const items = group.types
                  .map((t) => [t, BLOCK_META[t]] as [BlockType, BlockMeta])
                  .filter(([, m]) => !m.hidden)
                return (
                  <div key={group.label} className="mb-1">
                    <div className="flex items-center gap-1.5 px-4 pt-3 pb-1.5">
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                        {group.label}
                      </p>
                    </div>
                    <div className="px-3 space-y-1">
                      {items.map(([type, meta]) => (
                        <BlockLibraryCard key={type} type={type} meta={meta} onAdd={addBlock} />
                      ))}
                    </div>
                  </div>
                )
              })
            })()}
          </div>
          )}

          {/* Bottom actions */}
          <div
            className="px-3 py-3 border-t border-gray-100 space-y-2"
            style={{ background: 'linear-gradient(to bottom, #fff 0%, #f9fafb 100%)' }}
          >
            {/* <button
              onClick={handleSave}
              disabled={saving}
              className="w-full flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-semibold border border-gray-200 text-gray-600 bg-white hover:bg-gray-50 hover:border-gray-300 transition-all disabled:opacity-50 shadow-sm"
            >
              {saving ? <SpinnerIcon /> : <SaveIcon />}
              {saving ? 'Guardando…' : 'Guardar cambios'}
            </button> */}
            <button
              onClick={handlePublish}
              disabled={publishing}
              className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-xl font-bold text-sm transition-all disabled:opacity-60 shadow-sm ${
                isPublished
                  ? 'bg-emerald-500 hover:bg-emerald-600 text-white shadow-emerald-200'
                  : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-200'
              }`}
            >
              {publishing ? (
                <SpinnerIcon />
              ) : isPublished ? (
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="w-3.5 h-3.5"
                >
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              ) : (
                <PublishIcon />
              )}
              {publishing ? 'Publicando…' : isPublished ? 'Publicada' : 'Publicar página'}
            </button>
            {saveMsg && (
              <p
                className={`text-center text-[11px] font-medium ${saveMsg.includes('✓') ? 'text-emerald-600' : 'text-red-500'}`}
              >
                {saveMsg}
              </p>
            )}
          </div>
        </aside>

        {/* ── CENTER CANVAS ── */}
        <main className="flex-1 overflow-y-auto bg-[#E8EAED]">
          {/* Page frame */}
          <div className="min-h-full flex flex-col">
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragStart={onDragStart}
              onDragEnd={onDragEnd}
            >
              <SortableContext
                items={canvasBlocks.map((b) => b.id)}
                strategy={verticalListSortingStrategy}
              >
                {/* White page surface */}
                <div className="bg-white shadow-xl mx-auto w-full max-w-[1100px] min-h-screen my-0">
                  {canvasBlocks.length === 0 && <EmptyCanvas onAdd={addBlock} />}

                  {canvasBlocks.map((block) => (
                    <SortableBlock
                      key={block.id}
                      block={block}
                      selected={selectedId === block.id}
                      isDragging={dragActiveId === block.id}
                      meta={BLOCK_META[block.type] ?? BLOCK_META['hero']}
                      onClick={() => setSelectedId((prev) => (prev === block.id ? null : block.id))}
                      onRemove={() => removeBlock(block.id)}
                      onDuplicate={() => duplicateBlock(block.id)}
                    />
                  ))}

                  {/* Add block strip at bottom */}
                  {blocks.length > 0 && (
                    <div className="group flex items-center gap-3 py-5 px-8 opacity-0 hover:opacity-100 transition-opacity">
                      <div className="flex-1 h-px bg-gray-200" />
                      <button
                        onClick={() => addBlock('contact')}
                        className="text-xs text-gray-400 hover:text-indigo-600 font-medium transition-colors px-3 py-1.5 rounded-full border border-gray-200 hover:border-indigo-300 bg-white"
                      >
                        + agregar bloque
                      </button>
                      <div className="flex-1 h-px bg-gray-200" />
                    </div>
                  )}
                </div>
              </SortableContext>

              {/* Drag overlay */}
              <DragOverlay
                dropAnimation={{ duration: 200, easing: 'cubic-bezier(0.18,0.67,0.6,1.22)' }}
              >
                {dragActiveBlock && (
                  <div className="bg-white rounded-2xl shadow-2xl shadow-black/20 border border-indigo-300 px-4 py-3 flex items-center gap-3 rotate-1 scale-105">
                    <span className="text-2xl">{BLOCK_META[dragActiveBlock.type].icon}</span>
                    <div>
                      <p className="text-sm font-semibold text-gray-800">
                        {BLOCK_META[dragActiveBlock.type].label}
                      </p>
                      <p className="text-xs text-gray-400">Suelta para reordenar</p>
                    </div>
                  </div>
                )}
              </DragOverlay>
            </DndContext>
          </div>
        </main>

        {/* ── RIGHT PANEL ── */}
        <aside
          className={`bg-white border-l border-gray-200/80 flex flex-col flex-shrink-0 shadow-sm transition-all duration-300 ${
            selectedBlock ? 'w-80 opacity-100' : 'w-0 opacity-0 overflow-hidden'
          }`}
        >
          {selectedBlock && (
            <>
              {/* Panel header */}
              <div className="px-4 py-4 border-b border-gray-100">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2.5">
                    <span
                      className={`w-9 h-9 rounded-xl border flex items-center justify-center text-base flex-shrink-0 ${BLOCK_META[selectedBlock.type].color}`}
                    >
                      {BLOCK_META[selectedBlock.type].icon}
                    </span>
                    <div>
                      <p className="text-sm font-bold text-gray-800 leading-tight">
                        {BLOCK_META[selectedBlock.type].label}
                      </p>
                      <p className="text-[11px] text-gray-400 font-mono">
                        #{selectedBlock.id.slice(0, 8)}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedId(null)}
                    className="w-8 h-8 rounded-xl hover:bg-gray-100 flex items-center justify-center text-gray-400 hover:text-gray-700 transition-colors"
                  >
                    <CloseIcon />
                  </button>
                </div>

                {/* Tabs */}
                <div className="flex bg-gray-100 rounded-xl p-1 gap-1">
                  {(['content', 'style'] as const).map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setRightTab(tab)}
                      className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all capitalize ${
                        rightTab === tab
                          ? 'bg-white text-gray-800 shadow-sm'
                          : 'text-gray-500 hover:text-gray-700'
                      }`}
                    >
                      {tab === 'content' ? 'Contenido' : '🎨 Estilo'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Panel content */}
              <div className="flex-1 overflow-y-auto p-4">
                {rightTab === 'content' ? (
                  <>
                    {selectedBlock.type === 'hero' && (
                      <HeroBlockEditor content={selectedBlock.content} onChange={updateSelected} />
                    )}
                    {selectedBlock.type === 'services' && (
                      <ServicesBlockEditor
                        content={selectedBlock.content}
                        onChange={updateSelected}
                      />
                    )}
                    {selectedBlock.type === 'testimonials' && (
                      <TestimonialsBlockEditor
                        content={selectedBlock.content}
                        onChange={updateSelected}
                      />
                    )}
                    {selectedBlock.type === 'payment' && (
                      <PaymentBlockEditor
                        content={selectedBlock.content}
                        onChange={updateSelected}
                      />
                    )}
                    {selectedBlock.type === 'contact' && (
                      <ContactBlockEditor
                        content={selectedBlock.content}
                        onChange={updateSelected}
                      />
                    )}
                    {selectedBlock.type === 'store' && (
                      <StoreBlockEditor content={selectedBlock.content} onChange={updateSelected} />
                    )}
                    {selectedBlock.type === 'store-banner' && (
                      <StoreBannerBlockEditor
                        content={selectedBlock.content}
                        onChange={updateSelected}
                      />
                    )}
                    {selectedBlock.type === 'floating-buttons' && (
                      <FloatingButtonsBlockEditor
                        content={selectedBlock.content}
                        onChange={updateSelected}
                      />
                    )}
                    {selectedBlock.type === 'footer' && (
                      <FooterBlockEditor
                        content={selectedBlock.content}
                        onChange={updateSelected}
                      />
                    )}
                    {selectedBlock.type === 'faq' && (
                      <FaqBlockEditor content={selectedBlock.content} onChange={updateSelected} />
                    )}
                    {selectedBlock.type === 'navbar' && (
                      <NavbarBlockEditor
                        content={selectedBlock.content}
                        onChange={updateSelected}
                      />
                    )}
                    {selectedBlock.type === 'brands-banner' && (
                      <BrandsBannerBlockEditor
                        content={selectedBlock.content}
                        onChange={updateSelected}
                      />
                    )}
                    {selectedBlock.type === 'gallery' && (
                      <GalleryBlockEditor
                        content={selectedBlock.content}
                        onChange={updateSelected}
                      />
                    )}
                    {selectedBlock.type === 'stats' && (
                      <StatsBlockEditor content={selectedBlock.content} onChange={updateSelected} />
                    )}
                    {selectedBlock.type === 'features' && (
                      <FeaturesBlockEditor
                        content={selectedBlock.content}
                        onChange={updateSelected}
                      />
                    )}
                    {selectedBlock.type === 'icons-ticker' && (
                      <IconsTickerBlockEditor
                        content={selectedBlock.content}
                        onChange={updateSelected}
                      />
                    )}
                    {selectedBlock.type === 'loading-spinner' && (
                      <SpinnerBlockEditor
                        content={selectedBlock.content}
                        onChange={updateSelected}
                      />
                    )}
                    {/* Vista selector — shown for non-global blocks when multi-page is active */}
                    {hasMultiPage && !GLOBAL_TYPES.has(selectedBlock.type) && (
                      <div className="mt-4 pt-4 border-t border-gray-100">
                        <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1.5">
                          Vista asignada
                        </p>
                        <select
                          value={(selectedBlock as Block & { pageId?: string }).pageId ?? ''}
                          onChange={(e) => {
                            const pageId = e.target.value || undefined
                            setBlocks((prev) =>
                              prev.map((b) =>
                                b.id === selectedId ? ({ ...b, pageId } as Block) : b
                              )
                            )
                          }}
                          className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-200 bg-white"
                        >
                          <option value="">🌐 Global (todas las vistas)</option>
                          {pages.map((p) => (
                            <option key={p.id} value={p.isHome ? '' : p.path}>
                              {p.icon ?? '📄'} {p.label}
                            </option>
                          ))}
                        </select>
                        <p className="text-[10px] text-gray-400 mt-1">
                          {!(selectedBlock as Block & { pageId?: string }).pageId
                            ? 'Este bloque aparece en todas las vistas'
                            : `Solo aparece en la vista "${pages.find(p => (p.isHome ? '' : p.path) === (selectedBlock as Block & { pageId?: string }).pageId)?.label ?? ''}"`}
                        </p>
                      </div>
                    )}
                  </>
                ) : (
                  <BlockStylePanel
                    style={{ ...DEFAULT_BLOCK_STYLE, ...selectedBlock.style }}
                    onChange={updateSelectedStyle}
                  />
                )}
              </div>

              {/* Panel footer */}
              <div className="p-4 border-t border-gray-100 space-y-2">
                <button
                  onClick={async () => {
                    setSelectedId(null)
                    await handleSave()
                  }}
                  disabled={saving}
                  className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold rounded-xl transition-colors shadow-sm shadow-indigo-200 disabled:opacity-60"
                >
                  {saving ? 'Guardando…' : 'Aplicar y guardar'}
                </button>
                <button
                  onClick={() => removeBlock(selectedBlock.id)}
                  className="w-full py-2 text-xs text-red-400 hover:text-red-600 font-medium transition-colors rounded-lg hover:bg-red-50"
                >
                  Eliminar este bloque
                </button>
              </div>
            </>
          )}
        </aside>
      </div>
    </div>
  )
}

// ─── SortableBlock ────────────────────────────────────────────────────────────

type SortableBlockProps = {
  block: Block
  selected: boolean
  isDragging: boolean
  meta: BlockMeta
  onClick: () => void
  onRemove: () => void
  onDuplicate: () => void
}

function SortableBlock({
  block,
  selected,
  isDragging,
  meta,
  onClick,
  onRemove,
  onDuplicate
}: SortableBlockProps) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: block.id })

  const dndStyle = {
    transform: CSS.Transform.toString(transform),
    transition
  }

  return (
    <div
      ref={setNodeRef}
      style={dndStyle}
      className={`relative group/block ${isDragging ? 'opacity-20' : ''}`}
    >
      {/* Full-width block preview — pointer-events-none passes clicks to overlay */}
      <div className="pointer-events-none select-none">
        <BlockRenderer block={block} previewMode />
      </div>

      {/* Hover / selected overlay */}
      <div
        onClick={onClick}
        className={`absolute inset-0 cursor-pointer transition-all duration-150 ${
          selected
            ? 'outline outline-2 outline-indigo-500 outline-offset-[-2px] bg-indigo-500/[0.03]'
            : 'outline outline-2 outline-transparent hover:outline-indigo-300/70 hover:bg-indigo-500/[0.02]'
        }`}
      >
        {/* Top-left label pill */}
        <div
          className={`absolute top-2 left-3 flex items-center gap-1.5 transition-opacity duration-150 ${
            selected ? 'opacity-100' : 'opacity-0 group-hover/block:opacity-100'
          }`}
        >
          <span
            className={`inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full shadow-md border ${meta.color} bg-white`}
          >
            {meta.icon} {meta.label}
          </span>
          {selected && (
            <span className="text-[10px] font-semibold text-indigo-600 bg-indigo-50 border border-indigo-200 px-2 py-0.5 rounded-full">
              Editando →
            </span>
          )}
        </div>

        {/* Top-right actions */}
        <div
          className={`absolute top-2 right-3 flex items-center gap-1 transition-opacity duration-150 ${
            selected ? 'opacity-100' : 'opacity-0 group-hover/block:opacity-100'
          }`}
        >
          {/* Drag handle */}
          <div
            {...attributes}
            {...listeners}
            onClick={(e) => e.stopPropagation()}
            className="w-7 h-7 rounded-lg bg-white/90 border border-gray-200 shadow-sm flex items-center justify-center text-gray-400 hover:text-gray-700 hover:bg-white cursor-grab active:cursor-grabbing transition-colors"
            title="Arrastrar"
          >
            <GripIcon />
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation()
              onDuplicate()
            }}
            className="w-7 h-7 rounded-lg bg-white/90 border border-gray-200 shadow-sm flex items-center justify-center text-gray-400 hover:text-gray-700 hover:bg-white transition-colors"
            title="Duplicar"
          >
            <DuplicateIcon />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation()
              onRemove()
            }}
            className="w-7 h-7 rounded-lg bg-white/90 border border-gray-200 shadow-sm flex items-center justify-center text-gray-400 hover:text-red-500 hover:bg-red-50 hover:border-red-200 transition-colors"
            title="Eliminar"
          >
            <TrashIcon />
          </button>
        </div>
      </div>

      {/* Bottom separator / add-between hint */}
      <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-400/0 group-hover/block:bg-indigo-400/20 transition-colors" />
    </div>
  )
}

// ─── EmptyCanvas ──────────────────────────────────────────────────────────────

function EmptyCanvas({ onAdd }: { onAdd: (t: BlockType) => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-24 px-8 text-center">
      <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-indigo-100 to-violet-100 flex items-center justify-center text-5xl mb-6 shadow-inner">
        ✨
      </div>
      <h3 className="text-xl font-bold text-gray-800 mb-2">Tu página está vacía</h3>
      <p className="text-gray-500 text-sm mb-8 max-w-xs leading-relaxed">
        Empieza agregando un bloque desde el panel izquierdo, o prueba estos populares:
      </p>
      <div className="flex flex-wrap gap-2 justify-center">
        {(['hero', 'services', 'payment', 'contact'] as BlockType[]).map((type) => (
          <button
            key={type}
            onClick={() => onAdd(type)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-semibold transition-all hover:shadow-sm ${BLOCK_META[type].color}`}
          >
            <span>{BLOCK_META[type].icon}</span>
            {BLOCK_META[type].label}
          </button>
        ))}
      </div>
    </div>
  )
}

// ─── Micro-componentes ────────────────────────────────────────────────────────

function ActionBtn({
  children,
  onClick,
  danger,
  title
}: {
  children: React.ReactNode
  onClick: (e: React.MouseEvent) => void
  danger?: boolean
  title?: string
}) {
  return (
    <button
      onClick={onClick}
      title={title}
      className={`w-7 h-7 rounded-lg flex items-center justify-center transition-colors ${
        danger
          ? 'text-gray-400 hover:bg-red-500 hover:text-white'
          : 'text-gray-400 hover:bg-gray-200 hover:text-gray-700'
      }`}
    >
      {children}
    </button>
  )
}

// ─── Icons ────────────────────────────────────────────────────────────────────

function GripIcon() {
  return (
    <svg width="12" height="18" viewBox="0 0 12 18" fill="none" className="flex-shrink-0">
      {[2, 7, 12].map((y) =>
        [2, 8].map((x) => <circle key={`${x}-${y}`} cx={x} cy={y} r="1.5" fill="currentColor" />)
      )}
    </svg>
  )
}

function ArrowLeftIcon() {
  return (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M19 12H5M12 5l-7 7 7 7" />
    </svg>
  )
}

function SaveIcon() {
  return (
    <svg
      className="w-3.5 h-3.5"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z" />
      <polyline points="17,21 17,13 7,13 7,21" />
      <polyline points="7,3 7,8 15,8" />
    </svg>
  )
}

function PublishIcon() {
  return (
    <svg
      className="w-3.5 h-3.5"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
    >
      <path d="M12 19V5M5 12l7-7 7 7" />
    </svg>
  )
}

function ExternalLinkIcon() {
  return (
    <svg
      className="w-3.5 h-3.5"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6" />
      <polyline points="15,3 21,3 21,9" />
      <line x1="10" y1="14" x2="21" y2="3" />
    </svg>
  )
}

function CloseIcon() {
  return (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  )
}

function DuplicateIcon() {
  return (
    <svg
      className="w-3.5 h-3.5"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <rect x="9" y="9" width="13" height="13" rx="2" />
      <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
    </svg>
  )
}

function TrashIcon() {
  return (
    <svg
      className="w-3.5 h-3.5"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <polyline points="3,6 5,6 21,6" />
      <path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6" />
      <path d="M10 11v6M14 11v6" />
      <path d="M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2" />
    </svg>
  )
}

function SpinnerIcon() {
  return (
    <svg className="w-3.5 h-3.5 animate-spin" viewBox="0 0 24 24" fill="none">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
      />
    </svg>
  )
}

function EyeIcon() {
  return (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  )
}

function DesktopIcon() {
  return (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="2" y="3" width="20" height="14" rx="2" />
      <line x1="8" y1="21" x2="16" y2="21" />
      <line x1="12" y1="17" x2="12" y2="21" />
    </svg>
  )
}

function MobileIcon() {
  return (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="5" y="2" width="14" height="20" rx="2" />
      <circle cx="12" cy="18" r="1" fill="currentColor" />
    </svg>
  )
}

// ─── PreviewOverlay ───────────────────────────────────────────────────────────

type PreviewOverlayProps = {
  blocks: Block[]
  landing: LandingPage
  device: 'desktop' | 'mobile'
  onDeviceChange: (d: 'desktop' | 'mobile') => void
  onClose: () => void
}

function PreviewOverlay({ blocks, landing, device, onDeviceChange, onClose }: PreviewOverlayProps) {
  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-[#1a1a2e] animate-in fade-in duration-200">
      {/* Preview topbar */}
      <div className="flex items-center justify-between px-5 h-14 bg-[#12121f] border-b border-white/10 flex-shrink-0">
        {/* Left — title */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-white/60 text-sm">
            <EyeIcon />
            <span className="font-medium text-white">Vista previa</span>
          </div>
          <div className="w-px h-4 bg-white/20" />
          <span className="text-white/50 text-xs">tunegocio.app/p/{landing.slug}</span>
        </div>

        {/* Center — device switcher */}
        <div className="flex items-center gap-1 bg-white/10 rounded-xl p-1">
          <button
            onClick={() => onDeviceChange('desktop')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              device === 'desktop'
                ? 'bg-white text-gray-800 shadow-sm'
                : 'text-white/60 hover:text-white'
            }`}
          >
            <DesktopIcon />
            <span className="hidden sm:inline">Escritorio</span>
          </button>
          <button
            onClick={() => onDeviceChange('mobile')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              device === 'mobile'
                ? 'bg-white text-gray-800 shadow-sm'
                : 'text-white/60 hover:text-white'
            }`}
          >
            <MobileIcon />
            <span className="hidden sm:inline">Móvil</span>
          </button>
        </div>

        {/* Right — close */}
        <button
          onClick={onClose}
          className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 text-white text-sm font-medium rounded-lg transition-colors"
        >
          <CloseIcon />
          <span className="hidden sm:inline">Cerrar vista previa</span>
        </button>
      </div>

      {/* Preview canvas */}
      <div className="flex-1 overflow-auto py-8 px-4">
        {blocks.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-white/40 gap-3">
            <span className="text-5xl">📄</span>
            <p className="text-sm">No hay bloques para previsualizar</p>
          </div>
        ) : (
          <div
            className={`mx-auto bg-white overflow-hidden transition-all duration-500 ${
              device === 'mobile'
                ? 'w-[390px] rounded-[2.5rem] shadow-2xl shadow-black/50 ring-4 ring-white/20'
                : 'w-full max-w-5xl rounded-2xl shadow-2xl shadow-black/40'
            }`}
            style={device === 'mobile' ? { minHeight: '844px' } : {}}
          >
            {/* Mobile notch */}
            {device === 'mobile' && (
              <div className="flex justify-center pt-4 pb-2 bg-white">
                <div className="w-28 h-6 bg-gray-900 rounded-full" />
              </div>
            )}

            {/* Rendered blocks */}
            {blocks.map((block) => (
              <BlockRenderer key={block.id} block={block} previewMode />
            ))}

            {/* Mobile home indicator */}
            {device === 'mobile' && (
              <div className="flex justify-center py-4 bg-white">
                <div className="w-28 h-1.5 bg-gray-900 rounded-full opacity-30" />
              </div>
            )}
          </div>
        )}
      </div>

      {/* Bottom hint */}
      <div className="flex items-center justify-center pb-4">
        <p className="text-white/30 text-xs">
          Esta es una vista previa — los cambios no guardados también se reflejan aquí
        </p>
      </div>
    </div>
  )
}
