// sentry.server.config.ts — corre en el servidor Node.js de Next.js
// Doc: https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from '@sentry/nextjs'

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

  environment: process.env.NEXT_PUBLIC_SENTRY_ENVIRONMENT ?? 'development',

  // Captura el 100% de transacciones en producción (ajustar si el volumen crece)
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.2 : 1.0,

  // No enviar datos de usuarios identificables sin consentimiento (LFPDPPP)
  sendDefaultPii: false,

  enabled: !!process.env.NEXT_PUBLIC_SENTRY_DSN,
})
