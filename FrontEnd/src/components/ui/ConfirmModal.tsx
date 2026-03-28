'use client'

import { useEffect } from 'react'
import { createPortal } from 'react-dom'

type Props = {
  open: boolean
  title: string
  description: string
  confirmLabel: string
  confirmVariant?: 'danger' | 'neutral'
  loading?: boolean
  onConfirm: () => void
  onCancel: () => void
}

export function ConfirmModal({
  open,
  title,
  description,
  confirmLabel,
  confirmVariant = 'danger',
  loading = false,
  onConfirm,
  onCancel,
}: Props) {
  // Close on Escape
  useEffect(() => {
    if (!open) return
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onCancel()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open, onCancel])

  // Lock scroll
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [open])

  if (!open) return null

  const confirmCls = confirmVariant === 'danger'
    ? 'bg-red-600 hover:bg-red-700 text-white shadow-sm shadow-red-200 disabled:opacity-60'
    : 'bg-gray-800 hover:bg-gray-900 text-white shadow-sm disabled:opacity-60'

  return createPortal(
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onCancel}
        style={{ animation: 'fadeIn 0.15s ease' }}
      />

      {/* Panel */}
      <div
        className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 flex flex-col gap-5"
        style={{ animation: 'scaleIn 0.15s ease' }}
      >
        {/* Icon */}
        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mx-auto ${
          confirmVariant === 'danger' ? 'bg-red-50' : 'bg-gray-100'
        }`}>
          {confirmVariant === 'danger' ? (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
              className="w-6 h-6 text-red-600">
              <polyline points="3 6 5 6 21 6"/>
              <path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/>
              <path d="M10 11v6M14 11v6"/>
              <path d="M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2"/>
            </svg>
          ) : (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
              className="w-6 h-6 text-gray-600">
              <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/>
              <polyline points="16 17 21 12 16 7"/>
              <line x1="21" y1="12" x2="9" y2="12"/>
            </svg>
          )}
        </div>

        {/* Text */}
        <div className="text-center">
          <p className="font-bold text-gray-900 text-base mb-1">{title}</p>
          <p className="text-sm text-gray-500 leading-relaxed">{description}</p>
        </div>

        {/* Buttons */}
        <div className="flex flex-col-reverse sm:flex-row gap-2.5">
          <button
            onClick={onCancel}
            disabled={loading}
            className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-60"
          >
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className={`flex-1 px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors ${confirmCls}`}
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
                </svg>
                Procesando…
              </span>
            ) : confirmLabel}
          </button>
        </div>
      </div>

      <style>{`
        @keyframes fadeIn  { from { opacity: 0 } to { opacity: 1 } }
        @keyframes scaleIn { from { opacity: 0; transform: scale(0.95) } to { opacity: 1; transform: scale(1) } }
      `}</style>
    </div>,
    document.body,
  )
}
