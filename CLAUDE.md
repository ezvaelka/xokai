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

## Flujo de trabajo Git

- **Siempre trabajar en feature branches** — nunca commitear directo a `main`
- **Siempre crear un PR** antes de mergear a `main`, incluso para fixes pequeños
- **Mergear via PR** (no `git push branch:main`) para mantener historial limpio en GitHub
- La rama de trabajo por defecto del agente es `claude/debug-google-login-RlRJ0` hasta que se cree una nueva

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

---

## Learnings técnicos (patrones aprendidos en producción)

### Auth / Supabase

- **`emailRedirectTo` es obligatorio en `signUp()`**. Sin él, el correo de confirmación apunta al Site URL de Supabase (normalmente `/`), no al onboarding.
  ```ts
  emailRedirectTo: `${appUrl}/auth/confirm?next=${encodeURIComponent('/onboarding?type=director')}`
  ```
- **RLS policies en migraciones**: nunca usar funciones definidas en `schema.sql` (como `is_sysadmin()`). Usar subqueries inline:
  ```sql
  coalesce((select role = 'sysadmin' from user_profiles where id = auth.uid()), false)
  ```
- **Invite flow**: `inviteUserByEmail` + `redirectTo: ${appUrl}/auth/confirm?next=/onboarding`. El route `/auth/confirm` maneja tanto PKCE (`?code=`) como OTP (`?token_hash=`).

### Next.js App Router

- **Server actions re-renderizan el server component actual al completar**. Si el server component tiene un `redirect()` condicional, éste puede dispararse antes de que el cliente muestre el estado de éxito. Solución: navegar a una ruta diferente (`router.push('/nueva-ruta')`) desde el cliente antes de que ocurra el re-render. Los server actions que crean recursos deben redirigir a una página de confirmación separada, no mostrar éxito en la misma URL.
- **`searchParams` en server components** requieren `await` en Next.js 14+: `const params = await searchParams`.
- **Layouts dobles**: las rutas dentro de un layout group heredan el layout automáticamente. No volver a envolver en el shell dentro de `page.tsx`.

### Modelo de datos (Supabase)

- **Status de escuela** se deriva de dos columnas, no es un campo separado:
  - `active:false + onboarding_completed:false` → `'onboarding'` (director no terminó)
  - `active:false + onboarding_completed:true` → `'pending'` (esperando aprobación sysadmin)
  - `active:true + onboarding_completed:true` → `'active'`
  - `active:false` (manual) → `'paused'`
- **`join_code`** de la escuela es el mecanismo de invitación para staff. Se genera en `completeOnboarding()` como `crypto.randomUUID().slice(0,8).toUpperCase()`. No usar el paquete `uuid` (no instalado) — usar `crypto.randomUUID()` nativo.
- **Notificación a sysadmin**: usar Resend API via `fetch` (no SDK). Enviar `void notifySysadmin()` (best-effort, no bloquea el flujo principal).

### UX / Producto

- **Pantallas finales de flujo** siempre necesitan: (1) confirmación de qué pasó, (2) contexto del estado actual, (3) 2-3 próximos pasos accionables, (4) CTA primario.
- **El onboarding es solo para directoras**. Staff se une vía `/onboarding?type=staff` o similar con el `join_code`. Pasar `?type=director` en el `emailRedirectTo` para saltarse la pantalla de elección.
- **Correo de escuela en onboarding**: pre-llenar con el email del signup (`defaultValues: { email: userEmail }`). Son campos distintos pero el default es útil.

### Git / Deploy

- Para mergear sin PR: `git rebase origin/main && git push <PAT_URL> branch:main`
- Vercel hace deploy automático al push a `main`.

### Ejecución de tareas (workflow del agente)

- **Hacer todo en chunks pequeños para evitar timeouts**. Archivos grandes (>200 líneas) → crear en múltiples ediciones. Commands largos → dividir. Push de muchos archivos → batches pequeños. No preguntar, hacerlo así por default.
- **`mcp__github__push_files` con muchos archivos grandes puede fallar**. Preferir commits incrementales (3-5 archivos por push).
