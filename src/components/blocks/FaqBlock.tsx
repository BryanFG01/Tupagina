'use client'

import { useState } from 'react'
import type { FaqContent, BlockStyle } from '@/domain/landing/block.types'
import { bsCls, bsStyle } from './blockStyle'

type Props = { content: FaqContent; style?: BlockStyle }

function ChevronIcon({ open }: { open: boolean }) {
  return (
    <svg
      viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
      strokeLinecap="round" strokeLinejoin="round"
      className={`w-5 h-5 flex-shrink-0 transition-transform duration-300 ${open ? 'rotate-180' : ''}`}
    >
      <polyline points="6 9 12 15 18 9"/>
    </svg>
  )
}

export function FaqBlock({ content, style }: Props) {
  const allowMultiple = content.allowMultiple ?? false
  const [openIds, setOpenIds] = useState<Set<string>>(new Set())

  function toggle(id: string) {
    setOpenIds(prev => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        if (!allowMultiple) next.clear()
        next.add(id)
      }
      return next
    })
  }

  return (
    <section className={bsCls(style, 'bg-white', 'py-16', 'px-4')} style={bsStyle(style)}>
      <div className="max-w-3xl mx-auto">

        {/* Header */}
        <div className="text-center mb-10">
          <h2 className="text-3xl sm:text-4xl font-black text-gray-900 tracking-tight">
            {content.title}
          </h2>
          {content.subtitle && (
            <p className="text-gray-500 mt-3 text-base max-w-xl mx-auto">{content.subtitle}</p>
          )}
        </div>

        {/* Items */}
        <div className="space-y-3">
          {content.items.map((item, idx) => {
            const isOpen   = openIds.has(item.id)
            const accent   = item.color ?? '#6366f1'

            return (
              <div
                key={item.id}
                className={`rounded-2xl border overflow-hidden transition-shadow duration-200 ${
                  isOpen ? 'shadow-md' : 'shadow-sm hover:shadow-md'
                }`}
                style={{
                  borderColor: isOpen ? accent : '#e5e7eb',
                  borderLeftWidth: '4px',
                  borderLeftColor: accent,
                }}
              >
                {/* Pregunta */}
                <button
                  onClick={() => toggle(item.id)}
                  className="w-full flex items-center justify-between gap-4 px-5 py-4 text-left transition-colors"
                  style={{ backgroundColor: isOpen ? `${accent}08` : 'transparent' }}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    {/* Número */}
                    <span
                      className="flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-xs font-black"
                      style={{ backgroundColor: `${accent}18`, color: accent }}
                    >
                      {idx + 1}
                    </span>
                    <span className="font-semibold text-gray-900 text-sm sm:text-base leading-snug">
                      {item.question}
                    </span>
                  </div>
                  <span style={{ color: accent }}>
                    <ChevronIcon open={isOpen} />
                  </span>
                </button>

                {/* Respuesta — animada con max-height */}
                <div
                  className="overflow-hidden transition-all duration-300 ease-in-out"
                  style={{ maxHeight: isOpen ? '500px' : '0px' }}
                >
                  <div className="px-5 pb-5 pt-1">
                    <div className="pl-10">
                      <p className="text-gray-600 text-sm leading-relaxed">{item.answer}</p>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

      </div>
    </section>
  )
}
