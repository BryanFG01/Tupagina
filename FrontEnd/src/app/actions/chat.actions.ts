'use server'

import { prisma } from '@/infrastructure/db/prisma'
import { safeGetSession } from '@/infrastructure/auth/auth-options'
import type { ChatSession, ChatMessage } from '@/domain/chat/chat.types'

// ── Visitor-facing (no auth required) ──────────────────────────────────────

export async function getOrCreateChatSession(
  landingId: string,
  visitorId: string,
  visitorName?: string,
): Promise<{ success: true; session: ChatSession } | { success: false; error: string }> {
  try {
    let session = await prisma.chatSession.findFirst({
      where: { landingId, visitorId, status: 'OPEN' },
      include: { messages: { orderBy: { createdAt: 'asc' } } },
    })

    if (!session) {
      session = await prisma.chatSession.create({
        data: { landingId, visitorId, visitorName: visitorName ?? null },
        include: { messages: { orderBy: { createdAt: 'asc' } } },
      })
    } else if (visitorName && !session.visitorName) {
      session = await prisma.chatSession.update({
        where: { id: session.id },
        data: { visitorName },
        include: { messages: { orderBy: { createdAt: 'asc' } } },
      })
    }

    return {
      success: true,
      session: mapSession(session),
    }
  } catch (e) {
    return { success: false, error: String(e) }
  }
}

export async function sendVisitorMessage(
  sessionId: string,
  text: string,
): Promise<{ success: true; message: ChatMessage } | { success: false; error: string }> {
  try {
    const trimmed = text.trim()
    if (!trimmed) return { success: false, error: 'Mensaje vacío' }

    const [message] = await prisma.$transaction([
      prisma.chatMessage.create({ data: { sessionId, sender: 'visitor', text: trimmed } }),
      prisma.chatSession.update({
        where: { id: sessionId },
        data: { unreadCount: { increment: 1 }, updatedAt: new Date() },
      }),
    ])

    // Fire n8n webhook if configured (non-blocking)
    const session = await prisma.chatSession.findUnique({
      where: { id: sessionId },
      include: { landing: { select: { chatWebhookUrl: true, title: true, slug: true } } },
    })
    if (session?.landing?.chatWebhookUrl) {
      fetch(session.landing.chatWebhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          event: 'new_visitor_message',
          sessionId,
          landingTitle: session.landing.title,
          landingSlug: session.landing.slug,
          visitorName: session.visitorName,
          message: trimmed,
          sentAt: message.createdAt,
        }),
      }).catch(() => {}) // swallow errors — webhook is optional
    }

    return { success: true, message: mapMessage(message) }
  } catch (e) {
    return { success: false, error: String(e) }
  }
}

export async function getSessionMessages(
  sessionId: string,
  since?: Date,
): Promise<{ success: true; messages: ChatMessage[] } | { success: false; error: string }> {
  try {
    const messages = await prisma.chatMessage.findMany({
      where: {
        sessionId,
        ...(since ? { createdAt: { gt: since } } : {}),
      },
      orderBy: { createdAt: 'asc' },
    })
    return { success: true, messages: messages.map(mapMessage) }
  } catch (e) {
    return { success: false, error: String(e) }
  }
}

// ── Admin-facing (auth required) ───────────────────────────────────────────

export async function getChatSessions(landingId?: string): Promise<
  { success: true; sessions: ChatSession[] } | { success: false; error: string }
> {
  try {
    const session = await safeGetSession()
    if (!session) return { success: false, error: 'No autenticado' }
    const userId = session.user!.id as string

    const sessions = await prisma.chatSession.findMany({
      where: {
        landing: { userId },
        ...(landingId ? { landingId } : {}),
      },
      include: {
        messages: { orderBy: { createdAt: 'asc' } },
        landing: { select: { title: true, slug: true } },
      },
      orderBy: { updatedAt: 'desc' },
    })

    return {
      success: true,
      sessions: sessions.map(s => ({
        ...mapSession(s),
        landingTitle: s.landing.title,
        landingSlug: s.landing.slug,
      })),
    }
  } catch (e) {
    return { success: false, error: String(e) }
  }
}

export async function sendAdminMessage(
  sessionId: string,
  text: string,
): Promise<{ success: true; message: ChatMessage } | { success: false; error: string }> {
  try {
    const session = await safeGetSession()
    if (!session) return { success: false, error: 'No autenticado' }

    const trimmed = text.trim()
    if (!trimmed) return { success: false, error: 'Mensaje vacío' }

    const message = await prisma.chatMessage.create({
      data: { sessionId, sender: 'admin', text: trimmed },
    })
    await prisma.chatSession.update({
      where: { id: sessionId },
      data: { updatedAt: new Date() },
    })

    return { success: true, message: mapMessage(message) }
  } catch (e) {
    return { success: false, error: String(e) }
  }
}

export async function markSessionRead(
  sessionId: string,
): Promise<{ success: boolean }> {
  try {
    const session = await safeGetSession()
    if (!session) return { success: false }
    await prisma.chatSession.update({
      where: { id: sessionId },
      data: { unreadCount: 0 },
    })
    return { success: true }
  } catch {
    return { success: false }
  }
}

export async function closeChatSession(
  sessionId: string,
): Promise<{ success: boolean }> {
  try {
    const session = await safeGetSession()
    if (!session) return { success: false }
    await prisma.chatSession.update({
      where: { id: sessionId },
      data: { status: 'CLOSED' },
    })
    return { success: true }
  } catch {
    return { success: false }
  }
}

export async function saveChatWebhook(
  landingId: string,
  webhookUrl: string,
): Promise<{ success: boolean; error?: string }> {
  try {
    const session = await safeGetSession()
    if (!session) return { success: false, error: 'No autenticado' }
    const userId = session.user!.id as string

    const landing = await prisma.landingPage.findFirst({ where: { id: landingId, userId } })
    if (!landing) return { success: false, error: 'Página no encontrada' }

    await prisma.landingPage.update({
      where: { id: landingId },
      data: { chatWebhookUrl: webhookUrl || null },
    })
    return { success: true }
  } catch (e) {
    return { success: false, error: String(e) }
  }
}

export async function getTotalUnread(): Promise<number> {
  try {
    const session = await safeGetSession()
    if (!session) return 0
    const userId = session.user!.id as string

    const result = await prisma.chatSession.aggregate({
      where: { landing: { userId }, status: 'OPEN' },
      _sum: { unreadCount: true },
    })
    return result._sum.unreadCount ?? 0
  } catch {
    return 0
  }
}

// ── Mappers ─────────────────────────────────────────────────────────────────

function mapMessage(m: { id: string; sessionId: string; sender: string; text: string; createdAt: Date }): ChatMessage {
  return {
    id: m.id,
    sessionId: m.sessionId,
    sender: m.sender as 'visitor' | 'admin',
    text: m.text,
    createdAt: m.createdAt,
  }
}

function mapSession(s: {
  id: string; landingId: string; visitorName: string | null; visitorId: string;
  status: string; unreadCount: number; createdAt: Date; updatedAt: Date;
  messages?: { id: string; sessionId: string; sender: string; text: string; createdAt: Date }[]
}): ChatSession {
  return {
    id: s.id,
    landingId: s.landingId,
    visitorName: s.visitorName,
    visitorId: s.visitorId,
    status: s.status as 'OPEN' | 'CLOSED',
    unreadCount: s.unreadCount,
    createdAt: s.createdAt,
    updatedAt: s.updatedAt,
    messages: s.messages?.map(mapMessage),
  }
}
