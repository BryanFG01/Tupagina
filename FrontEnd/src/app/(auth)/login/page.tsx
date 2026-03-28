import Link from 'next/link'
import Image from 'next/image'
import { LoginForm } from './login-form'

export default function LoginPage() {
  return (
    <main className="min-h-screen flex">

      {/* ── Lado izquierdo: imagen ── */}
      <div className="hidden lg:block relative w-1/2 flex-shrink-0">
        <Image
          src="/screen.png"
          alt="TuNegocio preview"
          fill
          className="object-cover object-center"
          priority
        />
        {/* Overlay: capa de color + desenfoque visual */}
        <div className="absolute inset-0 bg-indigo-950/75 mix-blend-multiply" />
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/60 via-violet-900/40 to-black/70" />

        {/* Contenido encima del overlay */}
        <div className="absolute inset-0 flex flex-col justify-between p-10">
          {/* Logo top */}
          <span className="text-white/90 font-black text-xl tracking-tight">
            Tu<span className="text-indigo-300">Negocio</span>
          </span>

          {/* Copy bottom */}
          <div className="space-y-4">
            {/* Chips de features */}
            <div className="flex flex-wrap gap-2">
              {['Pagos integrados', 'Sin código', 'En minutos'].map(tag => (
                <span key={tag} className="text-xs font-medium bg-white/10 text-white/80 border border-white/20 px-3 py-1 rounded-full backdrop-blur-sm">
                  {tag}
                </span>
              ))}
            </div>
            <p className="text-2xl font-bold text-white leading-snug">
              Crea tu página de ventas y empieza a cobrar hoy
            </p>
            <p className="text-sm text-white/60">
              Bloques listos, carrito, Stripe y más — todo en un solo lugar.
            </p>
          </div>
        </div>
      </div>

      {/* ── Lado derecho: formulario ── */}
      <div className="flex-1 flex items-center justify-center bg-white px-6 py-12">
        <div className="w-full max-w-md">

          {/* Logo */}
          <div className="mb-10">
            <Link href="/" className="text-2xl font-black text-gray-900 tracking-tight">
              Tu<span className="text-indigo-600">Negocio</span>
            </Link>
          </div>

          {/* Encabezado */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Iniciar sesión</h1>
            <p className="mt-2 text-gray-500">
              ¿No tienes cuenta?{' '}
              <Link href="/register" className="text-indigo-600 font-medium hover:underline">
                Regístrate gratis
              </Link>
            </p>
          </div>

          {/* Form */}
          <LoginForm />

        </div>
      </div>
    </main>
  )
}
