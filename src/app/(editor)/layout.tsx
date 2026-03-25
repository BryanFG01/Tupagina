import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/infrastructure/auth/auth-options'

// Layout mínimo — sin header, sin max-width, el editor toma toda la pantalla
export default async function EditorRootLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions)
  if (!session) redirect('/login')
  return <>{children}</>
}
