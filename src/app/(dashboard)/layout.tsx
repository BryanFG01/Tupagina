import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/infrastructure/auth/auth-options'
import { getTotalUnread } from '@/app/actions/chat.actions'
import { DashboardNav } from '@/components/dashboard/DashboardNav'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  let session = null

  if (process.env.DEMO_MODE !== 'true') {
    session = await getServerSession(authOptions)

    if (!session) {
      redirect('/login')
    }
  }

  // En modo demo, usar 0 para unread chats
  const unreadChats = process.env.DEMO_MODE === 'true' ? 0 : await getTotalUnread()

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Left sidebar */}
      <DashboardNav
        userEmail={process.env.DEMO_MODE === 'true' ? 'demo@usuario.com' : session?.user?.email ?? ''}
        userName={process.env.DEMO_MODE === 'true' ? 'Usuario Demo' : session?.user?.name ?? ''}
        unreadChats={unreadChats}
      />

      {/* Main content — offset by sidebar width */}
      <div className="flex-1 ml-56 min-w-0">
        <main className="max-w-5xl mx-auto px-8 py-8">
          {children}
        </main>
      </div>
    </div>
  )
}
