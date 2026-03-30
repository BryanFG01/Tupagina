'use client'

import type { PageNavContent, LandingPageDef } from '@/domain/landing/block.types'

type Props = {
  content: PageNavContent
  onChange: (content: PageNavContent) => void
}

const ICONS = ['🏠', '🛒', '📖', '📞', 'ℹ️', '📸', '⭐', '🗓️', '💳', '🔧', '🎁', '📍']

export function PageNavBlockEditor({ content, onChange }: Props) {
  const pages: LandingPageDef[] = content.pages ?? [
    { id: 'home', label: 'Inicio', path: '', icon: '🏠', isHome: true },
  ]

  function addPage() {
    const ts = Date.now().toString(36)
    onChange({
      ...content,
      pages: [
        ...pages,
        { id: `page-${ts}`, label: 'Nueva vista', path: `vista-${ts}`, icon: '📄' },
      ],
    })
  }

  function removePage(id: string) {
    onChange({ ...content, pages: pages.filter((p) => p.id !== id) })
  }

  function updatePage(id: string, updates: Partial<LandingPageDef>) {
    onChange({
      ...content,
      pages: pages.map((p) => (p.id === id ? { ...p, ...updates } : p)),
    })
  }

  return (
    <div className="space-y-3">
      <p className="text-xs text-gray-500 leading-relaxed">
        Define las vistas de tu landing. Cada vista puede tener sus propios bloques.
        Los bloques sin vista asignada aparecen en <strong>todas las vistas</strong>.
      </p>

      {pages.map((page, i) => (
        <div key={page.id} className="border border-gray-200 rounded-xl overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-3 py-2 bg-gray-50 border-b border-gray-100">
            <div className="flex items-center gap-1.5">
              <span className="text-base">{page.icon ?? '📄'}</span>
              <span className="text-xs font-bold text-gray-700">
                {page.isHome ? 'Vista principal' : `Vista ${i}`}
              </span>
              {page.isHome && (
                <span className="text-[10px] bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded-full font-semibold">
                  DEFAULT
                </span>
              )}
            </div>
            {!page.isHome && (
              <button
                onClick={() => removePage(page.id)}
                className="text-[11px] text-red-400 hover:text-red-600 font-medium transition-colors"
              >
                Eliminar
              </button>
            )}
          </div>

          {/* Fields */}
          <div className="px-3 py-3 space-y-2.5">
            {/* Icon picker */}
            <div>
              <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Ícono</label>
              <div className="flex flex-wrap gap-1 mt-1">
                {ICONS.map((ic) => (
                  <button
                    key={ic}
                    onClick={() => updatePage(page.id, { icon: ic })}
                    className={`w-7 h-7 rounded-lg text-sm flex items-center justify-center transition-all ${
                      page.icon === ic
                        ? 'bg-indigo-100 ring-2 ring-indigo-400'
                        : 'hover:bg-gray-100'
                    }`}
                  >
                    {ic}
                  </button>
                ))}
              </div>
            </div>

            {/* Label */}
            <div>
              <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Nombre</label>
              <input
                type="text"
                value={page.label}
                onChange={(e) => updatePage(page.id, { label: e.target.value })}
                placeholder="Nombre de la vista"
                className="mt-1 w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-300 bg-white"
              />
            </div>

            {/* Path (not for home) */}
            {!page.isHome && (
              <div>
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                  Ruta URL
                </label>
                <div className="relative mt-1">
                  <input
                    type="text"
                    value={page.path}
                    onChange={(e) =>
                      updatePage(page.id, {
                        path: e.target.value
                          .toLowerCase()
                          .replace(/\s+/g, '-')
                          .replace(/[^a-z0-9-]/g, ''),
                      })
                    }
                    placeholder="ej: tienda"
                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-200 font-mono pr-24 bg-white"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-gray-400 font-mono">
                    ?p={page.path || '…'}
                  </span>
                </div>
                <p className="text-[10px] text-gray-400 mt-1">
                  URL pública: /p/slug?p={page.path || '…'}
                </p>
              </div>
            )}
          </div>
        </div>
      ))}

      <button
        onClick={addPage}
        className="w-full py-2.5 border-2 border-dashed border-gray-200 rounded-xl text-sm text-gray-400 hover:border-indigo-300 hover:text-indigo-600 hover:bg-indigo-50/40 transition-all font-medium"
      >
        + Agregar vista
      </button>

      <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl">
        <p className="text-[11px] text-amber-700 font-medium leading-relaxed">
          💡 <strong>Cómo funciona:</strong> Agrega bloques a tu landing y asígnales una vista desde el panel derecho. El Navbar y Footer son globales (sin vista) y aparecen en todas.
        </p>
      </div>
    </div>
  )
}
