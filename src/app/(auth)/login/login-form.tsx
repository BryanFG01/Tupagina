'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'

export function LoginForm() {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    setLoading(true)

    const formData = new FormData(e.currentTarget)

    const result = await signIn('credentials', {
      email: formData.get('email') as string,
      password: formData.get('password') as string,
      redirect: false,
    })

    setLoading(false)

    if (result?.error) {
      setError('Email o contraseña incorrectos')
      return
    }

    router.push('/dashboard')
    router.refresh()
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <Input
        label="Email"
        name="email"
        type="email"
        placeholder="tu@email.com"
        required
        autoComplete="email"
      />
      <Input
        label="Contraseña"
        name="password"
        type="password"
        placeholder="••••••••"
        required
        autoComplete="current-password"
      />

      {error && (
        <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">{error}</p>
      )}

      <Button type="submit" className="w-full !py-3 !text-base" loading={loading}>
        Iniciar sesión
      </Button>

      <p className="text-center text-xs text-gray-400 pt-2">
        Al continuar aceptas nuestros{' '}
        <a href="#" className="underline hover:text-gray-600">Términos de servicio</a>
      </p>
    </form>
  )
}
