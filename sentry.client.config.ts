// sentry.client.config.ts — corre en el navegador
// Doc: https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from '@sentry/nextjs'

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

  // Entorno (production / preview / development)
  environment: process.env.NEXT_PUBLIC_SENTRY_ENVIRONMENT ?? 'development',

  // Captura el 100% de transacciones en dev; reducir en prod si el volumen es alto
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,

  // Habilitar Session Replay (solo en producción para ahorrar cuota)
  replaysSessionSampleRate: 0,
  replaysOnErrorSampleRate: process.env.NODE_ENV === 'production' ? 1.0 : 0,

  // Filtrar errores de bots/extensiones que no son de Xokai
  ignoreErrors: [
    'ResizeObserver loop limit exceeded',
    'Non-Error exception captured',
    /^Script error\.?$/,
  ],

  // Desactivar en desarrollo si no se configuró el DSN
  enabled: !!process.env.NEXT_PUBLIC_SENTRY_DSN,
})
