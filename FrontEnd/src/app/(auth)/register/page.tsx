import Link from 'next/link'
import { RegisterForm } from './register-form'

export default function RegisterPage() {
  return (
    <main className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="text-2xl font-bold text-brand-600">
            TuNegocio
          </Link>
          <h1 className="mt-4 text-2xl font-bold text-gray-900">Crear cuenta gratis</h1>
          <p className="mt-2 text-gray-600">
            ¿Ya tienes cuenta?{' '}
            <Link href="/login" className="text-brand-600 hover:underline">
              Inicia sesión
            </Link>
          </p>
        </div>
        <div className="bg-white rounded-2xl shadow-sm border p-8">
          <RegisterForm />
        </div>
      </div>
    </main>
  )
}
