'use client'

import Link from 'next/link'
import { useState, useRef, useEffect } from 'react'
import type { LandingPage } from '@/domain/landing/landing.types'
import { publishLandingAction, deleteLandingAction } from '@/app/actions/landing.actions'
import { useRouter } from 'next/navigation'

type Props = { landing: LandingPage }

const CARD_GRADIENTS = [
  'from-violet-500 to-indigo-600',
  'from-sky-500 to-cyan-600',
  'from-emerald-500 to-teal-600',
  'from-orange-500 to-rose-500',
  'from-fuchsia-500 to-pink-600',
  'from-amber-500 to-orange-600',
]

function getGradient(id: string) {
  const sum = id.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0)
  return CARD_GRADIENTS[sum % CARD_GRADIENTS.length]
}

function IconEdit() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
    </svg>
  )
}

function IconExternalLink() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
      <polyline points="15 3 21 3 21 9"/>
      <line x1="10" y1="14" x2="21" y2="3"/>
    </svg>
  )
}

function IconDots() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
      <circle cx="5" cy="12" r="2"/><circle cx="12" cy="12" r="2"/><circle cx="19" cy="12" r="2"/>
    </svg>
  )
}

function IconLayers() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5">
      <polygon points="12 2 2 7 12 12 22 7 12 2"/>
      <polyline points="2 17 12 22 22 17"/>
      <polyline points="2 12 12 17 22 12"/>
    </svg>
  )
}

function IconGlobe() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className="w-10 h-10 opacity-30">
      <circle cx="12" cy="12" r="10"/>
      <line x1="2" y1="12" x2="22" y2="12"/>
      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
    </svg>
  )
}

export function LandingCard({ landing }: Props) {
  const router = useRouter()
  const [publishing, setPublishing] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  // Close menu on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  async function handleTogglePublish() {
    setMenuOpen(false)
    setPublishing(true)
    await publishLandingAction(landing.id, !landing.published)
    setPublishing(false)
    router.refresh()
  }

  async function handleDelete() {
    setMenuOpen(false)
    if (!confirm('¿Seguro que quieres eliminar esta página? Esta acción no se puede deshacer.')) return
    setDeleting(true)
    await deleteLandingAction(landing.id)
    router.refresh()
  }

  const gradient = getGradient(landing.id)

  return (
    <div className="group bg-white rounded-2xl border border-gray-200 overflow-hidden hover:shadow-lg hover:border-gray-300 transition-all duration-200">

      {/* Card header — colored thumbnail */}
      <Link href={`/editor/${landing.id}`} className="block">
        <div className={`relative h-28 bg-gradient-to-br ${gradient} flex items-center justify-center`}>
          <IconGlobe />
          {/* Status pill */}
          <div className="absolute top-3 right-3">
            {landing.published ? (
              <span className="flex items-center gap-1.5 text-xs bg-white/20 backdrop-blur-sm text-white px-2.5 py-1 rounded-full font-medium">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-300 animate-pulse" />
                Publicada
              </span>
            ) : (
              <span className="text-xs bg-white/20 backdrop-blur-sm text-white/80 px-2.5 py-1 rounded-full font-medium">
                Borrador
              </span>
            )}
          </div>
        </div>
      </Link>

      {/* Card body */}
      <div className="p-4">
        <div className="mb-3">
          <h3 className="font-semibold text-gray-900 truncate leading-tight">{landing.title}</h3>
          <p className="text-xs text-gray-400 mt-0.5 truncate">tunegocio.app/p/{landing.slug}</p>
        </div>

        {/* Meta */}
        <div className="flex items-center gap-1.5 text-xs text-gray-400 mb-4">
          <IconLayers />
          <span>{landing.blocks.length} bloque{landing.blocks.length !== 1 ? 's' : ''}</span>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          {/* Primary: Editar */}
          <Link
            href={`/editor/${landing.id}`}
            className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors"
          >
            <IconEdit />
            Editar
          </Link>

          {/* Ver página */}
          <a
            href={`/p/${landing.slug}`}
            target="_blank"
            rel="noopener noreferrer"
            title={landing.published ? 'Ver página publicada' : 'Vista previa'}
            className="flex items-center justify-center w-9 h-9 text-gray-500 border border-gray-200 rounded-lg hover:bg-gray-50 hover:text-gray-700 hover:border-gray-300 transition-colors"
          >
            <IconExternalLink />
          </a>

          {/* More menu */}
          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setMenuOpen(v => !v)}
              title="Más opciones"
              className="flex items-center justify-center w-9 h-9 text-gray-500 border border-gray-200 rounded-lg hover:bg-gray-50 hover:text-gray-700 hover:border-gray-300 transition-colors"
            >
              <IconDots />
            </button>

            {menuOpen && (
              <div className="absolute right-0 bottom-full mb-1.5 w-44 bg-white border border-gray-200 rounded-xl shadow-lg z-20 py-1 overflow-hidden">
                <button
                  onClick={handleTogglePublish}
                  disabled={publishing}
                  className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
                >
                  {publishing ? 'Procesando…' : landing.published ? 'Despublicar' : 'Publicar'}
                </button>
                <div className="h-px bg-gray-100 my-1" />
                <button
                  onClick={handleDelete}
                  disabled={deleting}
                  className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50"
                >
                  {deleting ? 'Eliminando…' : 'Eliminar página'}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
