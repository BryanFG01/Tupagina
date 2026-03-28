import { NextAuthOptions, Session } from 'next-auth'
import { getServerSession } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import bcrypt from 'bcryptjs'
import { prisma } from '@/infrastructure/db/prisma'

export const authOptions: NextAuthOptions = {
  secret: process.env.NEXTAUTH_SECRET || (process.env.DEMO_MODE === 'true' ? 'demo-secret-key-for-development-only' : undefined),
  session: {
    strategy: 'jwt',
  },
  pages: {
    signIn: '/login',
    error: '/login', // redirige errores de auth a la página de login para UX mejor
  },
  debug: process.env.NODE_ENV !== 'production',
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Contraseña', type: 'password' },
      },
      async authorize(credentials) {
        if (process.env.DEMO_MODE === 'true') {
          // En modo demo, acepta cualquier email/password y devuelve usuario mock
          if (credentials?.email && credentials?.password) {
            return {
              id: 'demo-user-id',
              email: credentials.email,
              name: 'Usuario Demo',
            }
          }
          return null
        }

        if (!credentials?.email || !credentials?.password) {
          throw new Error('Email y contraseña son requeridos')
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        })

        if (!user) {
          throw new Error('Credenciales incorrectas')
        }

        const passwordMatch = await bcrypt.compare(credentials.password, user.password)

        if (!passwordMatch) {
          throw new Error('Credenciales incorrectas')
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
      }
      return token
    },
    async session({ session, token }) {
      if (token.id && session.user) {
        session.user.id = token.id as string
      }
      return session
    },
  },
}

/**
 * Wrapper seguro de getServerSession.
 * Si el JWT está corrupto/expirado (JWEDecryptionFailed) devuelve null
 * en lugar de lanzar una excepción que crashea el layout.
 */
export async function safeGetSession(): Promise<Session | null> {
  try {
    return await getServerSession(authOptions)
  } catch {
    return null
  }
}
