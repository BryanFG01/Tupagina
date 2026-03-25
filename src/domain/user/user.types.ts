export type User = {
  id: string
  name: string | null
  email: string
  createdAt: Date
  updatedAt: Date
}

export type CreateUserInput = {
  name?: string
  email: string
  password: string // plain text, se hashea en infrastructure
}

export type UserSession = {
  id: string
  name: string | null
  email: string
}
