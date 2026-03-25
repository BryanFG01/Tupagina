// RUTA TEMPORAL — solo para validar la vista sin base de datos
// Eliminar cuando el DB esté configurado

import { BlockRenderer } from '@/components/blocks/BlockRenderer'
import type { Block } from '@/domain/landing/block.types'

const DEMO_BLOCKS: Block[] = [
  {
    id: '1',
    type: 'hero',
    order: 0,
    content: {
      title: 'Servicios de diseño profesional',
      subtitle: 'Logos, identidad de marca y diseño web para tu negocio',
      ctaText: 'Ver mis servicios',
      ctaUrl: '#servicios',
    },
  },
  {
    id: '2',
    type: 'services',
    order: 1,
    content: {
      title: 'Mis servicios',
      items: [
        { title: 'Diseño de logo', description: 'Logo profesional con 3 propuestas y revisiones ilimitadas', price: '$150' },
        { title: 'Diseño web', description: 'Landing page moderna, responsive y optimizada', price: '$400' },
        { title: 'Branding completo', description: 'Logo + paleta de colores + tipografía + manual de marca', price: '$600' },
      ],
    },
  },
  {
    id: '3',
    type: 'testimonials',
    order: 2,
    content: {
      title: '¿Qué dicen mis clientes?',
      items: [
        { name: 'María García', text: 'Excelente trabajo, mi logo quedó exactamente como lo imaginaba. Lo recomiendo 100%.' },
        { name: 'Carlos López', text: 'Muy profesional y rápido. Mi página web triplicó las consultas en el primer mes.' },
      ],
    },
  },
  {
    id: '4',
    type: 'payment',
    order: 3,
    content: {
      title: 'Diseño de logo profesional',
      description: 'Incluye 3 propuestas, revisiones ilimitadas y archivos en todos los formatos',
      price: 15000,
      currency: 'usd',
      provider: 'stripe',
      buttonText: 'Contratar ahora — $150',
    },
  },
  {
    id: '5',
    type: 'contact',
    order: 4,
    content: {
      title: '¿Tienes preguntas? Hablemos',
      whatsapp: '5491112345678',
      email: 'hola@ejemplo.com',
      buttonText: 'Contáctame por WhatsApp',
    },
  },
]

export default function DemoPage() {
  return (
    <main className="min-h-screen bg-white">
      {/* Banner de demo */}
      <div className="bg-yellow-400 text-yellow-900 text-center text-sm py-2 font-medium">
        Vista previa de demo — Esta es una landing page de ejemplo
      </div>

      {DEMO_BLOCKS.map((block) => (
        <BlockRenderer key={block.id} block={block} />
      ))}
    </main>
  )
}
