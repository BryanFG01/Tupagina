'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import {
  getChatSessions,
  sendAdminMessage,
  markSessionRead,
  closeChatSession,
  getSessionMessages,
  saveChatWebhook,
} from '@/app/actions/chat.actions'
import type { ChatSession, ChatMessage } from '@/domain/chat/chat.types'

// ── Icons ────────────────────────────────────────────────────────────────────

function IconChat() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
      <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/>
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

function IconRefresh() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
      <polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/>
      <path d="M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15"/>
    </svg>
  )
}

function IconWebhook() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
      <path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71"/>
      <path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71"/>
    </svg>
  )
}

function IconClose() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-4 h-4">
      <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
    </svg>
  )
}

function IconEmpty() {
  return (
    <svg viewBox="0 0 64 64" fill="none" className="w-16 h-16 mx-auto mb-4 opacity-40">
      <circle cx="32" cy="32" r="28" stroke="#94a3b8" strokeWidth="2"/>
      <path d="M20 28h24M20 34h16" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round"/>
      <path d="M32 48l-6 6v-6" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
}

// ── Time helper ──────────────────────────────────────────────────────────────

function timeAgo(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date
  const secs = Math.floor((Date.now() - d.getTime()) / 1000)
  if (secs < 60) return 'ahora'
  if (secs < 3600) return `${Math.floor(secs / 60)}m`
  if (secs < 86400) return `${Math.floor(secs / 3600)}h`
  return `${Math.floor(secs / 86400)}d`
}

// ── Main component ───────────────────────────────────────────────────────────

export default function ChatsPage() {
  const [sessions, setSessions] = useState<ChatSession[]>([])
  const [activeId, setActiveId] = useState<string | null>(null)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState('')
  const [sending, setSending] = useState(false)
  const [loading, setLoading] = useState(true)
  const [filterLanding, setFilterLanding] = useState('all')
  const [filterStatus, setFilterStatus] = useState<'OPEN' | 'ALL'>('OPEN')
  const [showWebhook, setShowWebhook] = useState(false)
  const [webhookUrl, setWebhookUrl] = useState('')
  const [webhookSaving, setWebhookSaving] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const lastMsgTime = useRef<Date | null>(null)

  const activeSession = sessions.find(s => s.id === activeId) ?? null

  // ── Load sessions ────────────────────────────────────────────────────────

  const loadSessions = useCallback(async () => {
    const res = await getChatSessions(filterLanding !== 'all' ? filterLanding : undefined)
    if (res.success) setSessions(res.sessions)
    setLoading(false)
  }, [filterLanding])

  useEffect(() => { loadSessions() }, [loadSessions])

  // ── Poll active session messages ─────────────────────────────────────────

  const pollMessages = useCallback(async (sessionId: string) => {
    const res = await getSessionMessages(sessionId, lastMsgTime.current ?? undefined)
    if (res.success && res.messages.length > 0) {
      setMessages(prev => {
        const ids = new Set(prev.map(m => m.id))
        const fresh = res.messages.filter(m => !ids.has(m.id))
        if (fresh.length === 0) return prev
        lastMsgTime.current = fresh[fresh.length - 1]!.createdAt
        return [...prev, ...fresh]
      })
    }
    // Refresh session list for unread counts
    loadSessions()
  }, [loadSessions])

  useEffect(() => {
    if (activeId) {
      pollRef.current = setInterval(() => pollMessages(activeId), 4000)
    } else {
      // When no active session, still refresh list every 10s
      pollRef.current = setInterval(loadSessions, 10000)
    }
    return () => { if (pollRef.current) clearInterval(pollRef.current) }
  }, [activeId, pollMessages, loadSessions])

  // ── Open session ─────────────────────────────────────────────────────────

  function openSession(session: ChatSession) {
    setActiveId(session.id)
    const msgs = session.messages ?? []
    setMessages(msgs)
    lastMsgTime.current = msgs.length > 0 ? msgs[msgs.length - 1]!.createdAt : null
    markSessionRead(session.id)
    setSessions(prev => prev.map(s => s.id === session.id ? { ...s, unreadCount: 0 } : s))
    setWebhookUrl('')
    setShowWebhook(false)

    setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100)
  }

  // ── Send admin message ───────────────────────────────────────────────────

  async function handleSend(e: React.FormEvent) {
    e.preventDefault()
    const text = input.trim()
    if (!text || !activeId || sending) return
    setSending(true)
    setInput('')

    const optimistic: ChatMessage = {
      id: `opt_${Date.now()}`,
      sessionId: activeId,
      sender: 'admin',
      text,
      createdAt: new Date(),
    }
    setMessages(prev => [...prev, optimistic])
    lastMsgTime.current = optimistic.createdAt

    const res = await sendAdminMessage(activeId, text)
    if (res.success) {
      setMessages(prev => prev.map(m => m.id === optimistic.id ? res.message : m))
    }
    setSending(false)
    setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 50)
  }

  // ── Close session ────────────────────────────────────────────────────────

  async function handleClose() {
    if (!activeId) return
    await closeChatSession(activeId)
    setSessions(prev => prev.map(s => s.id === activeId ? { ...s, status: 'CLOSED' } : s))
    setActiveId(null)
    setMessages([])
  }

  // ── Save webhook ─────────────────────────────────────────────────────────

  async function handleSaveWebhook() {
    if (!activeSession) return
    setWebhookSaving(true)
    await saveChatWebhook(activeSession.landingId, webhookUrl)
    setWebhookSaving(false)
    setShowWebhook(false)
  }

  // ── Filtered sessions ────────────────────────────────────────────────────

  const filteredSessions = sessions.filter(s => {
    if (filterStatus === 'OPEN' && s.status !== 'OPEN') return false
    return true
  })

  const totalUnread = sessions.reduce((acc, s) => acc + (s.unreadCount ?? 0), 0)

  // ── Render ───────────────────────────────────────────────────────────────

  return (
    <div className="flex gap-0 h-[calc(100vh-8rem)] bg-white rounded-2xl border border-gray-200 overflow-hidden">

      {/* ── Session list ── */}
      <div className="w-72 flex-shrink-0 border-r border-gray-200 flex flex-col">
        {/* Header */}
        <div className="px-4 py-4 border-b border-gray-100">
          <div className="flex items-center justify-between mb-3">
            <h1 className="font-bold text-gray-900 flex items-center gap-2">
              <IconChat />
              Chats
              {totalUnread > 0 && (
                <span className="bg-red-500 text-white text-xs font-bold px-1.5 py-0.5 rounded-full">
                  {totalUnread}
                </span>
              )}
            </h1>
            <button onClick={loadSessions} className="text-gray-400 hover:text-gray-600 p-1">
              <IconRefresh />
            </button>
          </div>

          {/* Filters */}
          <div className="flex gap-1">
            <button
              onClick={() => setFilterStatus('OPEN')}
              className={`flex-1 text-xs px-2 py-1.5 rounded-lg font-medium transition-colors ${filterStatus === 'OPEN' ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
            >
              Activos
            </button>
            <button
              onClick={() => setFilterStatus('ALL')}
              className={`flex-1 text-xs px-2 py-1.5 rounded-lg font-medium transition-colors ${filterStatus === 'ALL' ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
            >
              Todos
            </button>
          </div>
        </div>

        {/* Session list */}
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <span className="text-sm text-gray-400">Cargando…</span>
            </div>
          ) : filteredSessions.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 px-4">
              <IconEmpty />
              <p className="text-sm text-gray-400 text-center">No hay conversaciones {filterStatus === 'OPEN' ? 'activas' : ''}</p>
            </div>
          ) : (
            filteredSessions.map(s => (
              <button
                key={s.id}
                onClick={() => openSession(s)}
                className={`w-full text-left px-4 py-3 border-b border-gray-50 hover:bg-gray-50 transition-colors ${activeId === s.id ? 'bg-indigo-50 border-l-2 border-l-indigo-500' : ''}`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="font-medium text-sm text-gray-900 truncate">
                        {s.visitorName ?? 'Visitante'}
                      </span>
                      {s.status === 'CLOSED' && (
                        <span className="text-[10px] text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded-full flex-shrink-0">cerrado</span>
                      )}
                    </div>
                    <p className="text-xs text-gray-400 truncate mt-0.5">{s.landingTitle ?? s.landingId}</p>
                    {s.messages && s.messages.length > 0 && (
                      <p className="text-xs text-gray-500 truncate mt-1">
                        {s.messages[s.messages.length - 1]!.text}
                      </p>
                    )}
                  </div>
                  <div className="flex flex-col items-end gap-1 flex-shrink-0">
                    <span className="text-[10px] text-gray-400">{timeAgo(s.updatedAt)}</span>
                    {s.unreadCount > 0 && (
                      <span className="w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                        {s.unreadCount > 9 ? '9+' : s.unreadCount}
                      </span>
                    )}
                  </div>
                </div>
              </button>
            ))
          )}
        </div>
      </div>

      {/* ── Message thread ── */}
      {activeSession ? (
        <div className="flex-1 flex flex-col min-w-0">
          {/* Thread header */}
          <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
            <div>
              <h2 className="font-semibold text-gray-900">
                {activeSession.visitorName ?? 'Visitante anónimo'}
              </h2>
              <p className="text-xs text-gray-400 mt-0.5">
                {activeSession.landingTitle} · {timeAgo(activeSession.createdAt)} atrás
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowWebhook(v => !v)}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg border transition-colors ${showWebhook ? 'bg-indigo-50 border-indigo-200 text-indigo-700' : 'border-gray-200 text-gray-500 hover:bg-gray-50'}`}
                title="Webhook n8n"
              >
                <IconWebhook /> n8n
              </button>
              {activeSession.status === 'OPEN' && (
                <button
                  onClick={handleClose}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg border border-gray-200 text-gray-500 hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-colors"
                >
                  <IconClose /> Cerrar chat
                </button>
              )}
            </div>
          </div>

          {/* Webhook panel */}
          {showWebhook && (
            <div className="mx-6 mt-3 p-4 bg-amber-50 border border-amber-200 rounded-xl text-sm">
              <p className="font-medium text-amber-800 mb-2 flex items-center gap-1.5">
                <IconWebhook /> Webhook n8n — notificar mensajes nuevos
              </p>
              <p className="text-amber-700 text-xs mb-3">
                Cuando el visitante envíe un mensaje, se hará un POST a esta URL con los datos del chat.
                Aplica a todos los chats de la página <strong>{activeSession.landingTitle}</strong>.
              </p>
              <div className="flex gap-2">
                <input
                  value={webhookUrl}
                  onChange={e => setWebhookUrl(e.target.value)}
                  placeholder="https://tu-n8n.com/webhook/..."
                  className="flex-1 border border-amber-300 rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-amber-400"
                />
                <button
                  onClick={handleSaveWebhook}
                  disabled={webhookSaving}
                  className="px-3 py-1.5 bg-amber-600 text-white text-xs rounded-lg hover:bg-amber-700 disabled:opacity-50"
                >
                  {webhookSaving ? 'Guardando…' : 'Guardar'}
                </button>
              </div>
              <p className="text-amber-600 text-xs mt-2">
                Deja el campo vacío y guarda para desactivar el webhook.
              </p>
            </div>
          )}

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-3">
            {messages.length === 0 && (
              <div className="flex flex-col items-center justify-center h-full text-gray-400">
                <IconEmpty />
                <p className="text-sm">Sin mensajes aún</p>
              </div>
            )}
            {messages.map(msg => (
              <div key={msg.id} className={`flex ${msg.sender === 'admin' ? 'justify-end' : 'justify-start'}`}>
                <div className="flex flex-col gap-1 max-w-[65%]">
                  {msg.sender === 'visitor' && (
                    <span className="text-[10px] text-gray-400 ml-1">{activeSession.visitorName ?? 'Visitante'}</span>
                  )}
                  <div
                    className={`px-4 py-2.5 rounded-2xl text-sm leading-snug
                      ${msg.sender === 'admin'
                        ? 'bg-indigo-600 text-white rounded-br-sm'
                        : 'bg-gray-100 text-gray-800 rounded-bl-sm'}`}
                  >
                    {msg.text}
                  </div>
                  <span className={`text-[10px] text-gray-400 ${msg.sender === 'admin' ? 'text-right mr-1' : 'ml-1'}`}>
                    {timeAgo(msg.createdAt)}
                  </span>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Reply input */}
          <div className="border-t border-gray-100 p-4">
            {activeSession.status === 'CLOSED' ? (
              <p className="text-sm text-gray-400 text-center py-1">Esta conversación está cerrada.</p>
            ) : (
              <form onSubmit={handleSend} className="flex gap-3">
                <input
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  placeholder="Escribe tu respuesta…"
                  disabled={sending}
                  className="flex-1 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 disabled:opacity-50"
                  onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(e) } }}
                />
                <button
                  type="submit"
                  disabled={!input.trim() || sending}
                  className="w-11 h-11 flex items-center justify-center bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl disabled:opacity-40 transition-colors flex-shrink-0"
                >
                  <IconSend />
                </button>
              </form>
            )}
          </div>
        </div>
      ) : (
        /* Empty state */
        <div className="flex-1 flex flex-col items-center justify-center text-gray-400">
          <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mb-4">
            <IconChat />
          </div>
          <p className="font-medium text-gray-600">Selecciona una conversación</p>
          <p className="text-sm mt-1">Los mensajes de tus visitantes aparecerán aquí</p>
        </div>
      )}
    </div>
  )
}
