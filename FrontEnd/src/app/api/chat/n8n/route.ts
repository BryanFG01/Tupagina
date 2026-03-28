import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/infrastructure/db/prisma'

/**
 * POST /api/chat/n8n
 *
 * Endpoint que n8n llama para enviar la respuesta del bot al visitante.
 * Auth: Bearer token en el header Authorization (N8N_CHAT_SECRET).
 *
 * Body esperado:
 * {
 *   sessionId: string   — ID de la sesión de chat
 *   text:      string   — Texto de la respuesta
 * }
 *
 * Respuesta exitosa:
 * { ok: true, messageId: string }
 */
export async function POST(req: NextRequest) {
  // ── Auth ────────────────────────────────────────────────────────────────
  const secret = process.env.N8N_CHAT_SECRET
  if (!secret) {
    return NextResponse.json({ ok: false, error: 'N8N_CHAT_SECRET no configurado' }, { status: 500 })
  }

  const auth = req.headers.get('authorization') ?? ''
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : auth

  if (token !== secret) {
    return NextResponse.json({ ok: false, error: 'No autorizado' }, { status: 401 })
  }

  // ── Body ─────────────────────────────────────────────────────────────────
  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ ok: false, error: 'Body JSON inválido' }, { status: 400 })
  }

  const { sessionId, text } = body as { sessionId?: string; text?: string }

  if (!sessionId || typeof sessionId !== 'string') {
    return NextResponse.json({ ok: false, error: 'sessionId requerido' }, { status: 400 })
  }
  if (!text || typeof text !== 'string' || !text.trim()) {
    return NextResponse.json({ ok: false, error: 'text requerido' }, { status: 400 })
  }

  // ── Verificar que la sesión existe ───────────────────────────────────────
  const session = await prisma.chatSession.findUnique({ where: { id: sessionId } })
  if (!session) {
    return NextResponse.json({ ok: false, error: 'Sesión no encontrada' }, { status: 404 })
  }
  if (session.status === 'CLOSED') {
    return NextResponse.json({ ok: false, error: 'Sesión cerrada' }, { status: 400 })
  }

  // ── Guardar mensaje como "admin" (bot) ───────────────────────────────────
  const message = await prisma.chatMessage.create({
    data: {
      sessionId,
      sender: 'admin',
      text:   text.trim(),
    },
  })

  await prisma.chatSession.update({
    where: { id: sessionId },
    data:  { updatedAt: new Date() },
  })

  return NextResponse.json({ ok: true, messageId: message.id })
}
