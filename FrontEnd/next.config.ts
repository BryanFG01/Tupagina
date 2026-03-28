import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [],
  },
  // Establece la raíz explícita para el tracing del build y evita warnings con múltiples lockfiles.
  outputFileTracingRoot: __dirname,
  // Permite que las server actions funcionen correctamente
  experimental: {
    serverActions: {
      allowedOrigins: ['localhost:3000'],
    },
  },
}

export default nextConfig
