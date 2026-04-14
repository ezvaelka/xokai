# Xokai — AI Pod Global Context

## El proyecto
Xokai es un SaaS de gestión escolar para escuelas privadas en México y LATAM.
Conecta a la escuela con cada familia a través de una sola plataforma.

## Stack tecnológico
- **Frontend web**: Next.js 14 (App Router) + TypeScript + Tailwind CSS
- **Mobile**: iOS (Swift/SwiftUI) + Android (Kotlin/Jetpack Compose)
- **Backend / DB**: Supabase (Postgres + Auth + RLS + Realtime)
- **Pagos**: Stripe + CFDI automático (facturación México)
- **Hosting**: Vercel (web) + Supabase Cloud
- **CI/CD**: GitHub Actions + Vercel Preview Deployments

## Módulos core
1. **Pickup / Semáforo** — GPS en tiempo real, tablet de puerta, semáforo 🔴🟡🟢
2. **Comunicados** — reemplaza WhatsApp, con confirmación de lectura
3. **Calendario escolar** — eventos, menú del día, extracurriculares
4. **Pagos y colegiaturas** — cobro automático, CFDI, planes de pago
5. **Firma electrónica** — contratos y documentos desde el celular

## Modelo de negocio
- **Xokai Base**: $7 USD / alumno activo / mes
- **Xokai + Pickup**: $9 USD / alumno activo / mes
- Sin cobros por usuario admin. Sin setup fee.
- Piloto gratuito para la primera escuela.

## Mercado objetivo
- Escuelas privadas en México (foco inicial: Guadalajara / Jalisco)
- Expansión a LATAM
- Primera escuela piloto: Hábitat Learning Community, Santa Anita, Jalisco

## Roles en la plataforma
- **Directora / Admin** — dashboard web completo
- **Padres de familia** — app móvil EN/ES
- **Maestros** — vista de su grupo
- **Portero / Puerta** — tablet con semáforo en tiempo real
- **Sysadmin (Ez)** — panel global multi-escuela

## CEO
**Ez** es el CEO y fundador. Toma las decisiones finales de producto, negocio y estrategia.
Todos los agentes deben alinearse a su visión y escalar decisiones importantes a él.

## Reglas globales para todos los agentes
- Siempre TypeScript — nunca JavaScript plano
- Siempre RLS activado en todas las tablas de Supabase
- Mobile-first en toda decisión de UX
- App bilingüe: español (ES) e inglés (EN)
- Cumplimiento LFPDPPP (privacidad México) en manejo de datos de menores
- CFDI 4.0 en todos los flujos de pago
- Seguridad primero — los datos son de niños y familias

## Contacto
- Web: xokai.app
- Email: hola@xokai.app
- Ciudad: Guadalajara, México
