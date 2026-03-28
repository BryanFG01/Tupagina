import { z } from 'zod'
import { emailExists, createUser } from '@/infrastructure/repositories/user.repository'
import type { User } from '@/domain/user/user.types'

export const registerUserSchema = z.object({
  name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres').optional(),
  email: z.string().email('Email inválido'),
  password: z
    .string()
    .min(8, 'La contraseña debe tener al menos 8 caracteres'),
})

export type RegisterUserInput = z.infer<typeof registerUserSchema>

export async function registerUser(input: RegisterUserInput): Promise<User> {
  const alreadyExists = await emailExists(input.email)

  if (alreadyExists) {
    throw new Error('Ya existe una cuenta con este email')
  }

  const user = await createUser({
    name: input.name,
    email: input.email,
    password: input.password,
  })

  return user
}
