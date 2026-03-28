export type ChatMessage = {
  id: string
  sessionId: string
  sender: 'visitor' | 'admin'
  text: string
  createdAt: Date
}

export type ChatSession = {
  id: string
  landingId: string
  visitorName: string | null
  visitorId: string
  status: 'OPEN' | 'CLOSED'
  unreadCount: number
  createdAt: Date
  updatedAt: Date
  messages?: ChatMessage[]
  // joined from landing
  landingTitle?: string
  landingSlug?: string
}
