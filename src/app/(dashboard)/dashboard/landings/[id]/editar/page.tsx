import { notFound } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/infrastructure/auth/auth-options'
import { getLandingForEditor } from '@/services/landing/get-landings'
import { LandingEditor } from '@/components/editor/LandingEditor'

type Props = { params: Promise<{ id: string }> }

export default async function EditarLandingPage({ params }: Props) {
  const { id } = await params
  const session = await getServerSession(authOptions)
  const userId = session!.user!.id as string

  let landing
  try {
    landing = await getLandingForEditor(id, userId)
  } catch {
    notFound()
  }

  return <LandingEditor landing={landing} />
}
