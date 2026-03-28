'use client'

import type { FloatingButtonsContent } from '@/domain/landing/block.types'
import { ChatWidget } from '@/components/chat/ChatWidget'

type Props = {
  content: FloatingButtonsContent
  previewMode?: boolean
  landingId?: string
}

const POSITION_CLASSES: Record<FloatingButtonsContent['position'], string> = {
  'bottom-right': 'bottom-6 right-6',
  'bottom-left':  'bottom-6 left-6',
  'top-right':    'top-20 right-6',
  'top-left':     'top-20 left-6',
}

const SIZE_CLASSES: Record<FloatingButtonsContent['size'], string> = {
  sm: 'w-11 h-11 text-xl',
  md: 'w-14 h-14 text-2xl',
  lg: 'w-16 h-16 text-3xl',
}

function getIcon(type: FloatingButtonsContent['buttons'][0]['type']) {
  switch (type) {
    case 'whatsapp': return (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
      </svg>
    )
    case 'phone': return (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-6 h-6">
        <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.9 10.72 19.79 19.79 0 01.86 4.1 2 2 0 012.85 2h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L7.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z"/>
      </svg>
    )
    case 'email': return (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-6 h-6">
        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/>
      </svg>
    )
    case 'chat': return (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-6 h-6">
        <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/>
      </svg>
    )
    default: return <span className="text-xl">💬</span>
  }
}

export function FloatingButtonsBlock({ content, previewMode = false, landingId = '' }: Props) {
  const visibleButtons = content.buttons.filter(b => b.visible)

  // Editor preview: render inline so the block has proper height and doesn't escape its container
  if (previewMode) {
    const posLabel: Record<FloatingButtonsContent['position'], string> = {
      'bottom-right': 'Abajo derecha',
      'bottom-left':  'Abajo izquierda',
      'top-right':    'Arriba derecha',
      'top-left':     'Arriba izquierda',
    }
    return (
      <div className="flex items-center justify-between px-6 py-4 bg-gray-50 border-y border-dashed border-gray-200">
        <div className="flex items-center gap-2.5">
          <div className="flex gap-2">
            {content.buttons.length === 0 ? (
              <span className="text-xs text-gray-400 italic">Sin botones configurados</span>
            ) : (
              (content.buttons ?? []).map(btn => (
                <div
                  key={btn.id}
                  className={`flex items-center justify-center rounded-full text-white shadow-md ${SIZE_CLASSES[content.size]}`}
                  style={{ backgroundColor: btn.color, opacity: btn.visible ? 1 : 0.35 }}
                  title={btn.label}
                >
                  {getIcon(btn.type)}
                </div>
              ))
            )}
          </div>
          {content.showLabels && content.buttons.length > 0 && (
            <span className="text-xs text-gray-500">Con etiquetas</span>
          )}
        </div>
        <span className="text-[11px] text-gray-400 bg-white border border-gray-200 px-2 py-1 rounded-full">
          📍 {posLabel[content.position]}
        </span>
      </div>
    )
  }

  if (visibleButtons.length === 0) return null

  const posClass = POSITION_CLASSES[content.position]

  return (
    <div className={`fixed ${posClass} z-50 flex flex-col gap-3 items-end`}>
      {visibleButtons.map(btn => {
        if (btn.type === 'chat') {
          return (
            <div key={btn.id} className="relative flex flex-col items-end">
              <ChatWidget landingId={landingId} color={btn.color} />
            </div>
          )
        }

        return (
          <div key={btn.id} className="relative group flex items-center justify-end">
            {content.showLabels && (
              <span className="absolute right-full mr-3 bg-gray-900 text-white text-xs font-semibold px-2.5 py-1 rounded-lg whitespace-nowrap pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity">
                {btn.label}
              </span>
            )}
            <a
              href={btn.url}
              target="_blank"
              rel="noopener noreferrer"
              className={`flex items-center justify-center rounded-full shadow-xl transition-all hover:scale-110 active:scale-95 cursor-pointer text-white flex-shrink-0 ${SIZE_CLASSES[content.size]}`}
              style={{ backgroundColor: btn.color }}
              title={btn.label}
            >
              {getIcon(btn.type)}
            </a>
          </div>
        )
      })}
    </div>
  )
}
