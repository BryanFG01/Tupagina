import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Providers } from './providers'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'TuNegocio — Crea tu página de ventas en minutos',
  description:
    'Crea una landing page profesional para tu negocio o servicio, recibe pagos en línea y consigue más clientes.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es">
      <body className={inter.className}>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
