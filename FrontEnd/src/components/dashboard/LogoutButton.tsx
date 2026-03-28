'use client'

import { useState } from 'react'
import { signOut } from 'next-auth/react'
import { ConfirmModal } from '@/components/ui/ConfirmModal'

export function LogoutButton() {
  const [modal, setModal] = useState(false)
  const [loading, setLoading] = useState(false)

  async function handleLogout() {
    setLoading(true)
    await signOut({ callbackUrl: '/' })
  }

  return (
    <>
      <button
        onClick={() => setModal(true)}
        className="w-full flex items-center gap-2.5 px-3 py-2 text-sm font-medium text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className="w-[18px] h-[18px]">
          <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/>
          <polyline points="16 17 21 12 16 7"/>
          <line x1="21" y1="12" x2="9" y2="12"/>
        </svg>
        Cerrar sesión
      </button>

      <ConfirmModal
        open={modal}
        title="¿Cerrar sesión?"
        description="Se cerrará tu sesión y serás redirigido a la página de inicio."
        confirmLabel="Cerrar sesión"
        confirmVariant="neutral"
        loading={loading}
        onConfirm={handleLogout}
        onCancel={() => setModal(false)}
      />
    </>
  )
}
