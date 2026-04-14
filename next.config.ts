import type { NextConfig } from 'next'
import { withSentryConfig } from '@sentry/nextjs'

const nextConfig: NextConfig = {
  // Strict mode activo para detectar side effects en desarrollo
  reactStrictMode: true,

  images: {
    remotePatterns: [
      // Supabase Storage
      {
        protocol: 'https',
        hostname: '*.supabase.co',
        pathname: '/storage/v1/object/public/**',
      },
    ],
  },
}

export default withSentryConfig(nextConfig, {
  // Org y project de Sentry (configurar en CI/CD)
  org:     process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,

  // Silenciar logs de Sentry durante el build
  silent: !process.env.CI,

  // Subir source maps solo en producción
  sourcemaps: {
    disable: process.env.NODE_ENV !== 'production',
  },

  // Deshabilitar el tunneling automático (simplifica la config)
  tunnelRoute: undefined,

  // Desactivar si no se configuró el token de auth
  authToken: process.env.SENTRY_AUTH_TOKEN,
})
