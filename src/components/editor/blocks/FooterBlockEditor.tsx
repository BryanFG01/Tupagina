'use client'

import type { FooterContent, FooterColumn } from '@/domain/landing/block.types'

type Props = {
  content: FooterContent
  onChange: (content: FooterContent) => void
}

function field(label: string, value: string, onCh: (v: string) => void, placeholder?: string, mono = false) {
  return (
    <div>
      <label className="block text-xs font-semibold text-gray-600 mb-1">{label}</label>
      <input
        type="text"
        value={value}
        onChange={e => onCh(e.target.value)}
        placeholder={placeholder}
        className={`w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-indigo-400 ${mono ? 'font-mono text-xs' : ''}`}
      />
    </div>
  )
}

export function FooterBlockEditor({ content, onChange }: Props) {
  function upd<K extends keyof FooterContent>(key: K, value: FooterContent[K]) {
    onChange({ ...content, [key]: value })
  }

  function updateColumn(i: number, patch: Partial<FooterColumn>) {
    const cols = content.columns.map((c, idx) => idx === i ? { ...c, ...patch } : c)
    upd('columns', cols)
  }

  function addColumn() {
    upd('columns', [...content.columns, { title: 'Nueva sección', links: [] }])
  }

  function removeColumn(i: number) {
    upd('columns', content.columns.filter((_, idx) => idx !== i))
  }

  function addLink(colIdx: number) {
    const cols = content.columns.map((c, i) =>
      i === colIdx ? { ...c, links: [...c.links, { label: 'Enlace', url: '#' }] } : c
    )
    upd('columns', cols)
  }

  function updateLink(colIdx: number, linkIdx: number, patch: Partial<{ label: string; url: string }>) {
    const cols = content.columns.map((c, i) =>
      i === colIdx
        ? { ...c, links: c.links.map((l, j) => j === linkIdx ? { ...l, ...patch } : l) }
        : c
    )
    upd('columns', cols)
  }

  function removeLink(colIdx: number, linkIdx: number) {
    const cols = content.columns.map((c, i) =>
      i === colIdx ? { ...c, links: c.links.filter((_, j) => j !== linkIdx) } : c
    )
    upd('columns', cols)
  }

  return (
    <div className="space-y-5">
      {/* Brand */}
      <div className="space-y-3 border border-gray-100 rounded-xl p-3 bg-gray-50">
        <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Marca</p>
        {field('Nombre del negocio', content.brandName, v => upd('brandName', v), 'Mi Negocio')}
        {field('Eslogan / Tagline', content.tagline, v => upd('tagline', v), 'Calidad y servicio para ti')}
        {field('Texto de copyright', content.copyright, v => upd('copyright', v), `© 2025 Mi Negocio`)}
      </div>

      {/* Contact */}
      <div className="space-y-3 border border-gray-100 rounded-xl p-3 bg-gray-50">
        <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Contacto</p>
        {field('Email', content.email, v => upd('email', v), 'contacto@minegocio.com', true)}
        {field('Teléfono', content.phone, v => upd('phone', v), '+57 300 000 0000')}
        {field('Dirección', content.address, v => upd('address', v), 'Ciudad, País')}
      </div>

      {/* Social */}
      <div className="space-y-3 border border-gray-100 rounded-xl p-3 bg-gray-50">
        <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Redes sociales</p>
        <div className="grid grid-cols-2 gap-2">
          {[
            { key: 'instagram',     label: '📸 Instagram',    placeholder: 'https://instagram.com/tu_cuenta' },
            { key: 'facebook',      label: '📘 Facebook',     placeholder: 'https://facebook.com/tu_pagina' },
            { key: 'tiktok',        label: '🎵 TikTok',       placeholder: 'https://tiktok.com/@tu_cuenta' },
            { key: 'twitter',       label: '𝕏 Twitter / X',   placeholder: 'https://x.com/tu_cuenta' },
            { key: 'linkedin',      label: '💼 LinkedIn',     placeholder: 'https://linkedin.com/in/tu_perfil' },
            { key: 'youtube',       label: '▶️ YouTube',      placeholder: 'https://youtube.com/@tu_canal' },
            { key: 'whatsappFooter',label: '💬 WhatsApp',     placeholder: 'https://wa.me/57300...' },
          ].map(s => (
            <div key={s.key}>
              <label className="block text-[11px] font-semibold text-gray-500 mb-1">{s.label}</label>
              <input
                type="text"
                value={(content as unknown as Record<string, string>)[s.key] ?? ''}
                onChange={e => upd(s.key as keyof FooterContent, e.target.value as never)}
                placeholder={s.placeholder}
                className="w-full border border-gray-200 rounded-lg px-2.5 py-1.5 text-xs font-mono focus:outline-none focus:border-indigo-400"
              />
            </div>
          ))}
        </div>
      </div>

      {/* Link columns */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Columnas de enlaces</p>
          <button
            onClick={addColumn}
            className="text-xs text-indigo-600 hover:text-indigo-800 font-semibold"
          >
            + Agregar columna
          </button>
        </div>

        {content.columns.map((col, ci) => (
          <div key={ci} className="border border-gray-200 rounded-xl p-3 bg-white space-y-2">
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={col.title}
                onChange={e => updateColumn(ci, { title: e.target.value })}
                placeholder="Título de columna"
                className="flex-1 border border-gray-200 rounded-lg px-2.5 py-1.5 text-xs font-semibold focus:outline-none focus:border-indigo-400"
              />
              <button onClick={() => removeColumn(ci)} className="text-red-400 hover:text-red-600 text-xs">✕</button>
            </div>

            {col.links.map((link, li) => (
              <div key={li} className="flex gap-1.5 items-center">
                <input
                  type="text"
                  value={link.label}
                  onChange={e => updateLink(ci, li, { label: e.target.value })}
                  placeholder="Texto"
                  className="flex-1 border border-gray-200 rounded-lg px-2.5 py-1.5 text-xs focus:outline-none focus:border-indigo-400"
                />
                <input
                  type="text"
                  value={link.url}
                  onChange={e => updateLink(ci, li, { url: e.target.value })}
                  placeholder="URL"
                  className="flex-1 border border-gray-200 rounded-lg px-2.5 py-1.5 text-xs font-mono focus:outline-none focus:border-indigo-400"
                />
                <button onClick={() => removeLink(ci, li)} className="text-red-400 hover:text-red-600 text-xs flex-shrink-0">✕</button>
              </div>
            ))}
            <button
              onClick={() => addLink(ci)}
              className="text-xs text-indigo-500 hover:text-indigo-700 font-semibold"
            >
              + Enlace
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
