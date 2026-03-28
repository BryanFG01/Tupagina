'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { createLandingAction } from '@/app/actions/landing.actions'
import { generateSlug } from '@/services/landing/create-landing'

export function NewLandingForm() {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [slug, setSlug] = useState('')

  function handleTitleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const title = e.target.value
    setSlug(generateSlug(title))
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    setLoading(true)

    const formData = new FormData(e.currentTarget)
    const result = await createLandingAction({
      title: formData.get('title') as string,
      slug: formData.get('slug') as string,
      description: (formData.get('description') as string) || undefined,
    })

    setLoading(false)

    if (!result.success) {
      setError(result.error)
      return
    }

    router.push(`/editor/${result.data.id}`)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Input
        label="Nombre de tu página"
        name="title"
        type="text"
        placeholder="Mis servicios de diseño"
        required
        onChange={handleTitleChange}
        hint="Este es el título que verán tus clientes"
      />
      <div>
        <Input
          label="URL de tu página"
          name="slug"
          type="text"
          value={slug}
          onChange={(e) => setSlug(e.target.value)}
          required
          hint="tunegocio.app/p/tu-url"
          prefix="tunegocio.app/p/"
        />
      </div>
      <Input
        label="Descripción corta (opcional)"
        name="description"
        type="text"
        placeholder="Diseño web profesional para pequeños negocios"
        hint="Aparece en resultados de búsqueda"
      />

      {error && (
        <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">{error}</p>
      )}

      <div className="flex gap-3 pt-2">
        <Button type="button" variant="secondary" onClick={() => router.back()}>
          Cancelar
        </Button>
        <Button type="submit" loading={loading} className="flex-1">
          Crear y editar →
        </Button>
      </div>
    </form>
  )
}
