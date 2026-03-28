'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { createLandingAction, updateLandingAction } from '@/app/actions/landing.actions'
import { useRouter } from 'next/navigation'
import { generateSlug } from '@/services/landing/create-landing'
import { BLOCK_DEFAULTS } from '@/domain/landing/block.types'
import type { BlockType } from '@/domain/landing/block.types'

// ─── Types ────────────────────────────────────────────────────────────────────

type Message = {
  id: string
  role: 'user' | 'assistant'
  content: string
  template?: ParsedTemplate | null
}

type AiBlock = {
  type: BlockType
  content?: Record<string, unknown>
}

type ParsedTemplate = {
  title: string
  slug: string
  blocks: AiBlock[]
}

// ─── Template Parser ──────────────────────────────────────────────────────────

function extractTemplate(text: string, streaming = false): { clean: string; template: ParsedTemplate | null } {
  const match = text.match(/<TEMPLATE>([\s\S]*?)<\/TEMPLATE>/)
  if (match) {
    try {
      const parsed = JSON.parse(match[1].trim()) as ParsedTemplate
      const clean = text.replace(/<TEMPLATE>[\s\S]*?<\/TEMPLATE>/, '').trim()
      return { clean, template: parsed }
    } catch {
      const clean = text.replace(/<TEMPLATE>[\s\S]*?<\/TEMPLATE>/, '').trim()
      return { clean, template: null }
    }
  }
  if (streaming) {
    const partialIdx = text.indexOf('<TEMPLATE>')
    if (partialIdx !== -1) {
      return { clean: text.slice(0, partialIdx).trim(), template: null }
    }
  }
  return { clean: text, template: null }
}

// ─── Icons ────────────────────────────────────────────────────────────────────

function SparkleIcon({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6L12 2z"/>
    </svg>
  )
}

function SendIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
      <line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>
    </svg>
  )
}

function CloseIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" className="w-4 h-4">
      <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
    </svg>
  )
}

function RocketIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
      <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 00-2.91-.09z"/>
      <path d="M12 15l-3-3a22 22 0 012-3.95A12.88 12.88 0 0122 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 01-4 2z"/>
      <path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5"/>
    </svg>
  )
}

function LoadingDots() {
  return (
    <div className="flex gap-1.5 items-center py-1">
      {[0, 1, 2].map(i => (
        <span
          key={i}
          className="w-2 h-2 rounded-full bg-indigo-300 animate-bounce"
          style={{ animationDelay: `${i * 0.18}s` }}
        />
      ))}
    </div>
  )
}

// ─── Template Card ─────────────────────────────────────────────────────────────

function TemplateCard({ template, onApply }: { template: ParsedTemplate; onApply: (t: ParsedTemplate) => void }) {
  const blocks = template.blocks ?? []
  const blockLabels: Partial<Record<string, string>> = {
    navbar: 'Navbar', hero: 'Hero', 'store-banner': 'Banner', store: 'Tienda',
    services: 'Servicios', features: 'Beneficios', stats: 'Estadísticas',
    testimonials: 'Testimonios', gallery: 'Galería', faq: 'FAQ',
    contact: 'Contacto', footer: 'Footer', 'brands-banner': 'Marcas',
    'icons-ticker': 'Categorías', payment: 'Pago', 'floating-buttons': 'WhatsApp',
  }
  return (
    <div className="mt-2 rounded-2xl overflow-hidden border border-indigo-100 shadow-sm">
      {/* Card header */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-4 py-3">
        <div className="flex items-start justify-between gap-2">
          <div>
            <p className="text-white font-bold text-sm leading-tight">{template.title}</p>
            <p className="text-indigo-200 text-[11px] mt-0.5 font-mono">/{template.slug}</p>
          </div>
          <span className="text-[10px] bg-white/20 text-white px-2.5 py-1 rounded-full font-semibold flex-shrink-0 backdrop-blur-sm">
            {blocks.length} bloques
          </span>
        </div>
      </div>
      {/* Blocks pills */}
      <div className="bg-indigo-50 px-4 py-3">
        <div className="flex flex-wrap gap-1.5 mb-3">
          {blocks.slice(0, 8).map((b, i) => (
            <span key={i} className="text-[10px] bg-white border border-indigo-200 text-indigo-700 px-2 py-0.5 rounded-full font-medium shadow-sm">
              {blockLabels[b.type] ?? b.type}
            </span>
          ))}
          {blocks.length > 8 && (
            <span className="text-[10px] text-indigo-400 px-1 py-0.5">+{blocks.length - 8} más</span>
          )}
        </div>
        <button
          onClick={() => onApply(template)}
          className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 active:scale-[0.98] text-white text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-2 shadow-md shadow-indigo-200"
        >
          <RocketIcon />
          Crear esta landing page
        </button>
      </div>
    </div>
  )
}

// ─── Message Bubble ────────────────────────────────────────────────────────────

function MessageBubble({ msg, onApply }: { msg: Message; onApply: (t: ParsedTemplate) => void }) {
  const isUser = msg.role === 'user'
  return (
    <div className={`flex gap-2 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
      {/* Avatar */}
      {!isUser && (
        <div className="w-7 h-7 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center flex-shrink-0 mt-0.5 shadow-sm shadow-indigo-200">
          <SparkleIcon className="w-3.5 h-3.5 text-white" />
        </div>
      )}

      <div className={`flex flex-col gap-1 ${isUser ? 'items-end' : 'items-start'} max-w-[83%]`}>
        {!isUser && (
          <span className="text-[10px] font-semibold text-gray-400 ml-0.5">Asistente IA</span>
        )}
        <div className={`rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed whitespace-pre-wrap ${
          isUser
            ? 'bg-gradient-to-br from-indigo-500 to-indigo-600 text-white rounded-tr-sm shadow-md shadow-indigo-200'
            : 'bg-white border border-gray-100 text-gray-800 rounded-tl-sm shadow-sm'
        }`}>
          {msg.content || <LoadingDots />}
        </div>
        {!isUser && msg.template && (
          <div className="w-full">
            <TemplateCard template={msg.template} onApply={onApply} />
          </div>
        )}
      </div>
    </div>
  )
}

// ─── Suggested prompts ────────────────────────────────────────────────────────

const SUGGESTIONS = [
  { emoji: '🛍️', label: 'Tienda de ropa' },
  { emoji: '🍕', label: 'Restaurante' },
  { emoji: '💆', label: 'Spa / Estética' },
  { emoji: '💼', label: 'Freelancer' },
]

// ─── Main Component ────────────────────────────────────────────────────────────

const INITIAL_MESSAGE: Message = {
  id: 'init',
  role: 'assistant',
  content: '¡Hola! 👋 Soy tu asistente de diseño.\n\nCuéntame sobre tu negocio y crearé una landing page profesional con colores, contenido y estructura adaptados a ti.\n\n¿Qué tipo de negocio tienes?',
  template: null,
}

export function AiAssistant() {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([INITIAL_MESSAGE])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [applying, setApplying] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 150)
  }, [open])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const sendMessage = useCallback(async (text?: string) => {
    const msg = (text ?? input).trim()
    if (!msg || loading) return

    const userMsg: Message = { id: Date.now().toString(), role: 'user', content: msg, template: null }
    const assistantMsg: Message = { id: (Date.now() + 1).toString(), role: 'assistant', content: '', template: null }

    setMessages(prev => [...prev, userMsg, assistantMsg])
    setInput('')
    setLoading(true)

    const history = [...messages, userMsg]
      .filter(m => m.id !== 'init')
      .map(m => ({ role: m.role, content: m.content }))

    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ messages: history }),
      })

      if (!res.ok) throw new Error('Error al contactar la IA')

      const reader = res.body!.getReader()
      const decoder = new TextDecoder()
      let fullText = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        const chunk = decoder.decode(value, { stream: true })
        for (const line of chunk.split('\n')) {
          if (!line.startsWith('data: ')) continue
          const data = line.slice(6).trim()
          if (!data || data === '[DONE]') continue
          try {
            const parsed = JSON.parse(data) as { text?: string; error?: string }
            if (parsed.error) {
              setMessages(prev => prev.map(m =>
                m.id === assistantMsg.id ? { ...m, content: `⚠️ ${parsed.error}` } : m
              ))
              return
            }
            if (parsed.text) {
              fullText += parsed.text
              const { clean } = extractTemplate(fullText, true)
              setMessages(prev => prev.map(m =>
                m.id === assistantMsg.id ? { ...m, content: clean } : m
              ))
            }
          } catch { /* skip malformed */ }
        }
      }

      const { clean, template } = extractTemplate(fullText)
      setMessages(prev => prev.map(m =>
        m.id === assistantMsg.id ? { ...m, content: clean, template } : m
      ))
    } catch (err) {
      const errMsg = err instanceof Error ? err.message : 'Error desconocido'
      setMessages(prev => prev.map(m =>
        m.id === assistantMsg.id ? { ...m, content: `❌ ${errMsg}` } : m
      ))
    } finally {
      setLoading(false)
    }
  }, [input, loading, messages])

  const applyTemplate = useCallback(async (template: ParsedTemplate) => {
    if (applying) return
    setApplying(true)

    try {
      let slug = template.slug || generateSlug(template.title)
      const slugBase = slug
      let attempt = 0

      let result = await createLandingAction({ title: template.title, slug })
      while (!result.success && result.error?.includes('URL ya está en uso')) {
        attempt++
        slug = `${slugBase}-${attempt}`
        result = await createLandingAction({ title: template.title, slug })
      }

      if (!result.success) throw new Error(result.error)

      const aiBlocks = template.blocks ?? []
      const validBlocks = aiBlocks.filter(b => b.type in BLOCK_DEFAULTS)
      const blocks = validBlocks.map((aiBlock, i) => ({
        id: `b-${aiBlock.type}-${i}`,
        type: aiBlock.type,
        order: i,
        content: { ...BLOCK_DEFAULTS[aiBlock.type], ...(aiBlock.content ?? {}) },
      }))

      const landingId = result.data.id
      const blocksResult = await updateLandingAction(landingId, { blocks })
      if (!blocksResult.success) throw new Error(blocksResult.error)

      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        role: 'assistant',
        content: `✅ ¡Landing "${template.title}" creada con éxito! Abriendo el editor...`,
        template: null,
      }])
      setTimeout(() => router.push(`/editor/${landingId}`), 1200)
    } catch (err) {
      const errMsg = err instanceof Error ? err.message : 'Error al crear la landing'
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        role: 'assistant',
        content: `❌ ${errMsg}`,
        template: null,
      }])
    } finally {
      setApplying(false)
    }
  }, [applying, router])

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  const isOnlyInitial = messages.length === 1

  return (
    <>
      {/* Floating button */}
      <button
        onClick={() => setOpen(v => !v)}
        className={`fixed bottom-6 right-6 z-50 rounded-2xl shadow-lg flex items-center justify-center transition-all duration-300 ${
          open
            ? 'bg-gray-800 w-10 h-10 rounded-xl scale-95'
            : 'bg-gradient-to-br from-indigo-500 to-purple-600 hover:scale-110 hover:shadow-xl hover:shadow-indigo-300/60 shadow-indigo-300/50'
        }`}
        style={open ? { width: 40, height: 40 } : { width: 52, height: 52 }}
        title="Asistente IA"
      >
        {open ? (
          <span className="text-white"><CloseIcon /></span>
        ) : (
          <span className="text-white"><SparkleIcon className="w-5 h-5" /></span>
        )}
      </button>

      {/* Chat panel */}
      {open && (
        <div
          className="fixed right-3 left-3 sm:left-auto z-50 flex flex-col overflow-hidden"
          style={{
            bottom: 74,
            width: 'min(368px, calc(100vw - 24px))',
            maxHeight: 'min(600px, calc(100dvh - 96px))',
            borderRadius: 20,
            boxShadow: '0 24px 60px -12px rgba(0,0,0,0.25), 0 0 0 1px rgba(0,0,0,0.05)',
            animation: 'slideUp 0.22s cubic-bezier(0.22,1,0.36,1)',
            background: '#f8f9fb',
          }}
        >
          {/* Header */}
          <div
            className="flex items-center gap-3 px-4 py-3.5 flex-shrink-0"
            style={{ background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)' }}
          >
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: 'rgba(255,255,255,0.18)', backdropFilter: 'blur(8px)' }}
            >
              <SparkleIcon className="w-4 h-4 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white font-bold text-sm leading-tight tracking-tight">Asistente de Diseño IA</p>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <p className="text-white/70 text-[11px]">En línea · Diseño + estrategia de ventas</p>
              </div>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 min-h-0" style={{ background: '#f8f9fb' }}>
            {messages.map(msg => (
              <MessageBubble key={msg.id} msg={msg} onApply={applyTemplate} />
            ))}

            {/* Suggested prompts — only show before any user message */}
            {isOnlyInitial && !loading && (
              <div className="pt-1">
                <p className="text-[10px] text-gray-400 font-medium mb-2 ml-0.5">Ejemplos rápidos</p>
                <div className="grid grid-cols-2 gap-1.5">
                  {SUGGESTIONS.map(s => (
                    <button
                      key={s.label}
                      onClick={() => sendMessage(`Tengo un negocio de ${s.label.toLowerCase()}`)}
                      className="flex items-center gap-2 px-3 py-2 bg-white border border-gray-200 rounded-xl text-xs text-gray-700 font-medium hover:border-indigo-300 hover:bg-indigo-50 hover:text-indigo-700 transition-all text-left shadow-sm"
                    >
                      <span>{s.emoji}</span>
                      <span>{s.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {applying && (
              <div className="flex items-center justify-center gap-2 py-3">
                <div className="w-4 h-4 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                <span className="text-xs text-indigo-600 font-medium">Creando tu landing page…</span>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Input area */}
          <div
            className="flex-shrink-0 px-3 pb-3 pt-2"
            style={{ background: '#f8f9fb', borderTop: '1px solid rgba(0,0,0,0.06)' }}
          >
            <div
              className="flex gap-2 items-end rounded-2xl px-3 py-2"
              style={{ background: '#ffffff', border: '1.5px solid #e5e7eb', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}
            >
              <textarea
                ref={inputRef}
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Describe tu negocio…"
                rows={1}
                disabled={loading || applying}
                className="flex-1 resize-none text-sm bg-transparent focus:outline-none placeholder-gray-400 disabled:opacity-60 max-h-28 overflow-y-auto py-1"
                style={{ minHeight: 36 }}
                onInput={e => {
                  const el = e.currentTarget
                  el.style.height = 'auto'
                  el.style.height = Math.min(el.scrollHeight, 112) + 'px'
                }}
              />
              <button
                onClick={() => sendMessage()}
                disabled={!input.trim() || loading || applying}
                className="w-8 h-8 rounded-xl flex items-center justify-center transition-all flex-shrink-0 mb-0.5 disabled:opacity-40 disabled:cursor-not-allowed"
                style={{
                  background: input.trim() && !loading && !applying
                    ? 'linear-gradient(135deg, #4f46e5, #7c3aed)'
                    : '#e5e7eb',
                  color: input.trim() && !loading && !applying ? '#fff' : '#9ca3af',
                }}
              >
                <SendIcon />
              </button>
            </div>
            <p className="text-[10px] text-gray-400 mt-1.5 text-center">
              Enter para enviar · Shift+Enter para nueva línea
            </p>
          </div>
        </div>
      )}

      <style>{`
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(16px) scale(0.96); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}</style>
    </>
  )
}
