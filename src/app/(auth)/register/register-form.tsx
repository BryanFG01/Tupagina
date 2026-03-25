'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { registerAction } from '@/app/actions/auth.actions'

export function RegisterForm() {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    setLoading(true)

    const formData = new FormData(e.currentTarget)
    const result = await registerAction({
      name: formData.get('name') as string,
      email: formData.get('email') as string,
      password: formData.get('password') as string,
    })

    setLoading(false)

    if (!result.success) {
      setError(result.error)
      return
    }

    router.push('/login?registered=true')
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <Input
        label="Tu nombre"
        name="name"
        type="text"
        placeholder="María García"
        autoComplete="name"
      />
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
        placeholder="Mínimo 8 caracteres"
        required
        autoComplete="new-password"
      />

      {error && (
        <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">{error}</p>
      )}

      <Button type="submit" className="w-full" loading={loading}>
        Crear cuenta gratis
      </Button>

      <p className="text-xs text-center text-gray-500">
        Al registrarte aceptas nuestros términos de uso.
      </p>
    </form>
  )
}
