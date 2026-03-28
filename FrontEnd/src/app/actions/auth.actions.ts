'use server'

import { registerUser, registerUserSchema } from '@/services/auth/register-user'

type ActionResult<T> =
  | { success: true; data: T }
  | { success: false; error: string }

export async function registerAction(input: {
  name?: string
  email: string
  password: string
}): Promise<ActionResult<{ id: string }>> {
  const parsed = registerUserSchema.safeParse(input)

  if (!parsed.success) {
    const firstError = parsed.error.errors[0]
    return { success: false, error: firstError?.message ?? 'Datos inválidos' }
  }

  try {
    const user = await registerUser(parsed.data)
    return { success: true, data: { id: user.id } }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Error al crear la cuenta'
    return { success: false, error: message }
  }
}
