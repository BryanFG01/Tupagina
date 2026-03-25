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
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect('/login')
  }

  const unreadChats = await getTotalUnread()

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Left sidebar */}
      <DashboardNav
        userEmail={session.user?.email ?? ''}
        userName={session.user?.name}
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
