// RUTA TEMPORAL — validar vista del editor sin auth ni DB
import { LandingEditor } from '@/components/editor/LandingEditor'
import type { LandingPage } from '@/domain/landing/landing.types'

const DEMO_LANDING: LandingPage = {
  id: 'demo',
  userId: 'demo-user',
  title: 'Mis servicios de diseño',
  slug: 'mis-servicios',
  description: 'Landing page de ejemplo',
  published: false,
  createdAt: new Date(),
  updatedAt: new Date(),
  blocks: [],
}

export default function DemoEditorPage() {
  return <LandingEditor landing={DEMO_LANDING} />
}
