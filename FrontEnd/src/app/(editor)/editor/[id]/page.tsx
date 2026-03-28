import { notFound, redirect } from 'next/navigation'
import { safeGetSession } from '@/infrastructure/auth/auth-options'
import { getLandingForEditor } from '@/services/landing/get-landings'
import { LandingEditor } from '@/components/editor/LandingEditor'

type Props = { params: Promise<{ id: string }> }

export default async function EditorPage({ params }: Props) {
  const { id } = await params
  const session = await safeGetSession()
  if (!session?.user?.id) redirect('/login')
  const userId = session.user.id as string

  let landing
  try {
    landing = await getLandingForEditor(id, userId)
  } catch {
    notFound()
  }

  return <LandingEditor landing={landing} />
}
