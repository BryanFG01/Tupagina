'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import {
  getOrCreateChatSession,
  sendVisitorMessage,
  getSessionMessages,
} from '@/app/actions/chat.actions'
import type { ChatMessage, ChatSession } from '@/domain/chat/chat.types'

type Props = {
  landingId: string
  color?: string
}

function getVisitorId(): string {
  const KEY = 'tn_visitor_id'
  let id = localStorage.getItem(KEY)
  if (!id) {
    id = `v_${Date.now()}_${Math.random().toString(36).slice(2)}`
    localStorage.setItem(KEY, id)
  }
  return id
}

function IconChat() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-6 h-6">
      <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/>
    </svg>
  )
}
function IconClose() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-5 h-5">
      <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
    </svg>
  )
}
function IconSend() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
      <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
    </svg>
  )
}

// Status of the session init
type InitStatus = 'idle' | 'loading' | 'ok' | 'error'

export function ChatWidget({ landingId, color = '#4f46e5' }: Props) {
  const [open, setOpen] = useState(false)
  const [session, setSession] = useState<ChatSession | null>(null)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState('')
  const [nameInput, setNameInput] = useState('')
  const [nameConfirmed, setNameConfirmed] = useState(false)
  const [sending, setSending] = useState(false)
  const [initStatus, setInitStatus] = useState<InitStatus>('idle')
  const [unread, setUnread] = useState(0)

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const lastMessageTime = useRef<Date | null>(null)
  const initialized = useRef(false)

  const scrollToBottom = useCallback(() => {
    setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 50)
  }, [])

  // ── Init session ────────────────────────────────────────────────────────

  const initSession = useCallback(async () => {
    if (initialized.current) return
    initialized.current = true
    setInitStatus('loading')

    try {
      const visitorId = getVisitorId()
      const res = await getOrCreateChatSession(landingId, visitorId)

      if (!res.success) {
        setInitStatus('error')
        initialized.current = false
        return
      }

      const msgs = res.session.messages ?? []
      setSession(res.session)
      setMessages(msgs)
      setNameConfirmed(!!res.session.visitorName)
      if (msgs.length > 0) lastMessageTime.current = msgs[msgs.length - 1]!.createdAt
      setInitStatus('ok')
      scrollToBottom()
    } catch {
      setInitStatus('error')
      initialized.current = false
    }
  }, [landingId, scrollToBottom])

  useEffect(() => {
    if (open && initStatus === 'idle') initSession()
  }, [open, initStatus, initSession])

  // ── Polling ─────────────────────────────────────────────────────────────

  const pollMessages = useCallback(async (sessionId: string) => {
    try {
      const res = await getSessionMessages(sessionId, lastMessageTime.current ?? undefined)
      if (res.success && res.messages.length > 0) {
        setMessages(prev => {
          const ids = new Set(prev.map(m => m.id))
          const fresh = res.messages.filter(m => !ids.has(m.id))
          if (fresh.length === 0) return prev
          lastMessageTime.current = fresh[fresh.length - 1]!.createdAt
          return [...prev, ...fresh]
        })
        scrollToBottom()
      }
    } catch { /* ignore polling errors */ }
  }, [scrollToBottom])

  useEffect(() => {
    if (open && session) {
      pollRef.current = setInterval(() => pollMessages(session.id), 4000)
    } else {
      if (pollRef.current) clearInterval(pollRef.current)
    }
    return () => { if (pollRef.current) clearInterval(pollRef.current) }
  }, [open, session, pollMessages])

  // ── Unread badge ─────────────────────────────────────────────────────────

  useEffect(() => {
    if (!open && messages.length > 0) {
      setUnread(messages.filter(m => m.sender === 'admin').length)
    } else {
      setUnread(0)
    }
  }, [open, messages])

  // ── Name submit ──────────────────────────────────────────────────────────

  async function handleNameSubmit(e: React.FormEvent) {
    e.preventDefault()
    const name = nameInput.trim()
    if (!name || !session) return
    const visitorId = getVisitorId()
    const res = await getOrCreateChatSession(landingId, visitorId, name)
    if (res.success) {
      setSession(res.session)
      setNameConfirmed(true)
    }
  }

  // ── Send message ─────────────────────────────────────────────────────────

  async function handleSend(e: React.FormEvent) {
    e.preventDefault()
    const text = input.trim()
    if (!text || sending) return

    // If no session yet, try to init first
    if (!session) {
      initialized.current = false
      await initSession()
      return
    }

    setSending(true)
    setInput('')

    // Optimistic message
    const optimistic: ChatMessage = {
      id: `opt_${Date.now()}`,
      sessionId: session.id,
      sender: 'visitor',
      text,
      createdAt: new Date(),
    }
    setMessages(prev => [...prev, optimistic])
    lastMessageTime.current = optimistic.createdAt
    scrollToBottom()

    const res = await sendVisitorMessage(session.id, text)
    if (res.success) {
      setMessages(prev => prev.map(m => m.id === optimistic.id ? res.message : m))
      lastMessageTime.current = res.message.createdAt
    } else {
      // Remove optimistic on failure
      setMessages(prev => prev.filter(m => m.id !== optimistic.id))
      setInput(text) // restore input
    }
    setSending(false)
  }

  // ── Which view to show ───────────────────────────────────────────────────
  // needsName: session ok but no name confirmed yet and no messages sent yet
  const needsName = initStatus === 'ok' && !nameConfirmed && messages.length === 0

  // ── Render ───────────────────────────────────────────────────────────────

  return (
    <>
      {/* Toggle button */}
      <button
        onClick={() => setOpen(v => !v)}
        className="relative flex items-center justify-center w-14 h-14 rounded-full shadow-xl hover:scale-110 active:scale-95 transition-transform text-white"
        style={{ backgroundColor: color }}
        aria-label="Chat"
      >
        {open ? <IconClose /> : <IconChat />}
        {!open && unread > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
            {unread > 9 ? '9+' : unread}
          </span>
        )}
      </button>

      {/* Popup */}
      {open && (
        <div
          className="absolute bottom-full mb-3 right-0 w-80 bg-white rounded-2xl shadow-2xl border border-gray-200 flex flex-col overflow-hidden"
          style={{ maxHeight: '480px' }}
        >
          {/* Header */}
          <div className="px-4 py-3 flex items-center gap-3 text-white flex-shrink-0" style={{ backgroundColor: color }}>
            <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
              <IconChat />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-sm leading-tight">Chat en vivo</p>
              <p className="text-xs text-white/70">Estamos aquí para ayudarte</p>
            </div>
            <button onClick={() => setOpen(false)} className="text-white/80 hover:text-white p-1">
              <IconClose />
            </button>
          </div>

          {/* Body */}
          {initStatus === 'loading' || initStatus === 'idle' ? (
            <div className="flex-1 flex items-center justify-center py-12">
              <span className="text-gray-400 text-sm animate-pulse">Conectando…</span>
            </div>

          ) : initStatus === 'error' ? (
            <div className="flex-1 flex flex-col items-center justify-center py-10 px-6 gap-3">
              <p className="text-sm text-gray-500 text-center">No se pudo conectar al chat.</p>
              <button
                onClick={() => { initialized.current = false; setInitStatus('idle'); initSession() }}
                className="px-4 py-2 text-sm font-medium text-white rounded-lg"
                style={{ backgroundColor: color }}
              >
                Reintentar
              </button>
            </div>

          ) : needsName ? (
            <div className="flex-1 flex flex-col items-center justify-center p-6 gap-4">
              <p className="text-sm text-gray-600 text-center">
                ¡Hola! ¿Cómo te llamas? Así podemos atenderte mejor.
              </p>
              <form onSubmit={handleNameSubmit} className="w-full flex flex-col gap-2">
                <input
                  autoFocus
                  value={nameInput}
                  onChange={e => setNameInput(e.target.value)}
                  placeholder="Tu nombre..."
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
                />
                <button
                  type="submit"
                  disabled={!nameInput.trim()}
                  className="w-full py-2 rounded-lg text-white text-sm font-semibold disabled:opacity-50 transition-opacity"
                  style={{ backgroundColor: color }}
                >
                  Continuar
                </button>
                <button
                  type="button"
                  onClick={() => setNameConfirmed(true)}
                  className="text-xs text-gray-400 hover:text-gray-600 text-center"
                >
                  Continuar sin nombre
                </button>
              </form>
            </div>

          ) : (
            <>
              {/* Messages area */}
              <div
                className="flex-1 overflow-y-auto p-4 flex flex-col gap-2"
                style={{ minHeight: '200px', maxHeight: '320px' }}
              >
                {messages.length === 0 && (
                  <p className="text-xs text-gray-400 text-center mt-6">
                    Envía un mensaje para empezar la conversación.
                  </p>
                )}
                {messages.map(msg => (
                  <div key={msg.id} className={`flex ${msg.sender === 'visitor' ? 'justify-end' : 'justify-start'}`}>
                    <div
                      className={`max-w-[78%] px-3 py-2 rounded-2xl text-sm leading-snug
                        ${msg.sender === 'visitor'
                          ? 'text-white rounded-br-sm'
                          : 'bg-gray-100 text-gray-800 rounded-bl-sm'}`}
                      style={msg.sender === 'visitor' ? { backgroundColor: color } : {}}
                    >
                      {msg.text}
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>

              {/* Input */}
              <form
                onSubmit={handleSend}
                className="border-t border-gray-100 p-3 flex gap-2 flex-shrink-0"
              >
                <input
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  placeholder="Escribe un mensaje…"
                  disabled={sending}
                  autoFocus
                  className="flex-1 text-sm border border-gray-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-300 disabled:opacity-50"
                />
                <button
                  type="submit"
                  disabled={!input.trim() || sending}
                  className="w-9 h-9 flex items-center justify-center rounded-xl text-white disabled:opacity-40 flex-shrink-0 transition-opacity"
                  style={{ backgroundColor: color }}
                >
                  {sending
                    ? <span className="w-4 h-4 border-2 border-white/50 border-t-white rounded-full animate-spin" />
                    : <IconSend />}
                </button>
              </form>
            </>
          )}
        </div>
      )}
    </>
  )
}
