'use client'

import type { FloatingButtonsContent, FloatingButton } from '@/domain/landing/block.types'

type Props = {
  content: FloatingButtonsContent
  onChange: (content: FloatingButtonsContent) => void
}

const BUTTON_TYPES: { value: FloatingButton['type']; label: string; defaultColor: string; defaultUrl: string }[] = [
  { value: 'whatsapp', label: '💬 WhatsApp',    defaultColor: '#25D366', defaultUrl: 'https://wa.me/1234567890' },
  { value: 'phone',    label: '📞 Teléfono',    defaultColor: '#3B82F6', defaultUrl: 'tel:+1234567890' },
  { value: 'email',    label: '✉️ Email',        defaultColor: '#8B5CF6', defaultUrl: 'mailto:tu@email.com' },
  { value: 'chat',     label: '💭 Chat',         defaultColor: '#F59E0B', defaultUrl: '#chat' },
  { value: 'custom',   label: '⭐ Personalizado', defaultColor: '#EF4444', defaultUrl: '#' },
]

const POSITIONS = [
  { value: 'bottom-right', label: '↘ Abajo derecha' },
  { value: 'bottom-left',  label: '↙ Abajo izquierda' },
  { value: 'top-right',    label: '↗ Arriba derecha' },
  { value: 'top-left',     label: '↖ Arriba izquierda' },
] as const

function nanoid() { return Math.random().toString(36).slice(2, 10) }

export function FloatingButtonsBlockEditor({ content, onChange }: Props) {
  function update<K extends keyof FloatingButtonsContent>(key: K, value: FloatingButtonsContent[K]) {
    onChange({ ...content, [key]: value })
  }

  function updateButton(id: string, patch: Partial<FloatingButton>) {
    onChange({ ...content, buttons: content.buttons.map(b => b.id === id ? { ...b, ...patch } : b) })
  }

  function addButton(type: FloatingButton['type']) {
    const preset = BUTTON_TYPES.find(t => t.value === type)!
    const btn: FloatingButton = {
      id: nanoid(),
      type,
      label: preset.label.replace(/^[^ ]+ /, ''),
      url: preset.defaultUrl,
      color: preset.defaultColor,
      visible: true,
    }
    onChange({ ...content, buttons: [...content.buttons, btn] })
  }

  function removeButton(id: string) {
    onChange({ ...content, buttons: content.buttons.filter(b => b.id !== id) })
  }

  return (
    <div className="space-y-5">
      {/* Position */}
      <div>
        <label className="block text-xs font-semibold text-gray-600 mb-2">📍 Posición en la página</label>
        <div className="grid grid-cols-2 gap-2">
          {POSITIONS.map(p => (
            <button
              key={p.value}
              onClick={() => update('position', p.value)}
              className={`py-2 px-3 rounded-xl text-xs font-semibold border transition-all ${
                content.position === p.value
                  ? 'bg-indigo-600 text-white border-indigo-600'
                  : 'bg-white text-gray-600 border-gray-200 hover:border-indigo-300'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* Size + labels */}
      <div className="flex gap-3">
        <div className="flex-1">
          <label className="block text-xs font-semibold text-gray-600 mb-2">Tamaño</label>
          <div className="flex gap-1.5">
            {(['sm', 'md', 'lg'] as const).map(s => (
              <button
                key={s}
                onClick={() => update('size', s)}
                className={`flex-1 py-2 rounded-xl text-xs font-bold border transition-all uppercase ${
                  content.size === s
                    ? 'bg-indigo-600 text-white border-indigo-600'
                    : 'bg-white text-gray-600 border-gray-200 hover:border-indigo-300'
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
        <div className="flex-1">
          <label className="block text-xs font-semibold text-gray-600 mb-2">Mostrar etiquetas</label>
          <button
            onClick={() => update('showLabels', !content.showLabels)}
            className={`w-full py-2 rounded-xl text-xs font-bold border transition-all ${
              content.showLabels
                ? 'bg-indigo-600 text-white border-indigo-600'
                : 'bg-white text-gray-600 border-gray-200'
            }`}
          >
            {content.showLabels ? 'Sí' : 'No'}
          </button>
        </div>
      </div>

      {/* Existing buttons */}
      <div>
        <label className="block text-xs font-semibold text-gray-600 mb-2">Botones configurados</label>
        <div className="space-y-3">
          {content.buttons.map(btn => (
            <div key={btn.id} className="border border-gray-200 rounded-xl p-3 bg-gray-50 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={btn.color}
                    onChange={e => updateButton(btn.id, { color: e.target.value })}
                    className="w-7 h-7 rounded-lg cursor-pointer border border-gray-200 p-0.5"
                  />
                  <span className="text-xs font-semibold text-gray-700">
                    {BUTTON_TYPES.find(t => t.value === btn.type)?.label ?? btn.type}
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => updateButton(btn.id, { visible: !btn.visible })}
                    className={`text-xs px-2 py-0.5 rounded-lg font-semibold transition-colors ${
                      btn.visible ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-200 text-gray-500'
                    }`}
                  >
                    {btn.visible ? 'Visible' : 'Oculto'}
                  </button>
                  <button onClick={() => removeButton(btn.id)} className="text-red-400 hover:text-red-600 text-xs px-1">✕</button>
                </div>
              </div>
              <input
                type="text"
                placeholder="Etiqueta (ej: Escríbenos)"
                value={btn.label}
                onChange={e => updateButton(btn.id, { label: e.target.value })}
                className="w-full text-xs border border-gray-200 rounded-lg px-3 py-1.5 focus:outline-none focus:border-indigo-400"
              />
              {btn.type === 'chat' ? (
                <div className="flex items-start gap-2 bg-indigo-50 border border-indigo-100 rounded-lg px-3 py-2">
                  <span className="text-indigo-500 mt-0.5">💬</span>
                  <p className="text-[11px] text-indigo-700 leading-snug">
                    Chat en vivo integrado. Los visitantes podrán escribirte directamente desde la página.
                    Los mensajes aparecen en <strong>Dashboard → Chats</strong>.
                  </p>
                </div>
              ) : (
                <input
                  type="text"
                  placeholder="URL (ej: https://wa.me/57...)"
                  value={btn.url}
                  onChange={e => updateButton(btn.id, { url: e.target.value })}
                  className="w-full text-xs border border-gray-200 rounded-lg px-3 py-1.5 focus:outline-none focus:border-indigo-400 font-mono"
                />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Add new button */}
      <div>
        <label className="block text-xs font-semibold text-gray-600 mb-2">➕ Agregar botón</label>
        <div className="grid grid-cols-2 gap-2">
          {BUTTON_TYPES.map(t => (
            <button
              key={t.value}
              onClick={() => addButton(t.value)}
              className="flex items-center gap-2 py-2 px-3 rounded-xl text-xs font-semibold border border-gray-200 bg-white hover:bg-gray-50 hover:border-indigo-300 transition-all text-left"
            >
              <span className="w-5 h-5 rounded-full flex-shrink-0" style={{ backgroundColor: t.defaultColor }} />
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <p className="text-xs text-gray-500 bg-blue-50 border border-blue-100 rounded-xl p-3">
          💡 Los botones flotantes aparecen fijos sobre la página mientras el usuario navega. Puedes combinar WhatsApp, teléfono y chat en el mismo bloque.
        </p>
        <p className="text-xs text-gray-500 bg-amber-50 border border-amber-100 rounded-xl p-3">
          💬 El botón <strong>Chat</strong> abre un chat en vivo directamente en tu página. Los mensajes se reciben en <strong>Dashboard → Chats</strong>. No necesita URL — funciona automáticamente con tu landing.
        </p>
      </div>
    </div>
  )
}
