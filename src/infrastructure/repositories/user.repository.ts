import bcrypt from 'bcryptjs'
import { prisma } from '@/infrastructure/db/prisma'
import type { User, CreateUserInput } from '@/domain/user/user.types'

export async function findUserByEmail(email: string): Promise<User | null> {
  const user = await prisma.user.findUnique({
    where: { email },
    select: { id: true, name: true, email: true, createdAt: true, updatedAt: true },
  })
  return user
}

export async function findUserById(id: string): Promise<User | null> {
  const user = await prisma.user.findUnique({
    where: { id },
    select: { id: true, name: true, email: true, createdAt: true, updatedAt: true },
  })
  return user
}

export async function createUser(input: CreateUserInput): Promise<User> {
  const hashedPassword = await bcrypt.hash(input.password, 12)

  const user = await prisma.user.create({
    data: {
      name: input.name ?? null,
      email: input.email,
      password: hashedPassword,
    },
    select: { id: true, name: true, email: true, createdAt: true, updatedAt: true },
  })

  return user
}

export async function emailExists(email: string): Promise<boolean> {
  const count = await prisma.user.count({ where: { email } })
  return count > 0
}
