# Xokai — Contexto Global del Proyecto

Lee este archivo al inicio de cada sesión. Es la fuente de verdad para todo el codebase.

---

## El proyecto

Xokai es un SaaS de gestión escolar para escuelas privadas en México y LATAM.
Conecta a la escuela con cada familia a través de una sola plataforma.

- **Web**: xokai.app
- **Email**: hola@xokai.app
- **Ciudad**: Guadalajara, México

## CEO

**Ez** es el CEO y fundador. Toma las decisiones finales de producto, negocio y estrategia.
Todos los agentes deben alinearse a su visión y escalar decisiones importantes a él.

---

## Cliente piloto: Hábitat Learning Community

Santa Anita, Jalisco, México — colegio bilingüe (inglés/español).

### Modelo educativo de Hábitat

Cada alumno pertenece a:

**1. UN GRUPO REGULAR** (salón fijo: Kinder A, 1ro B, etc.)
- 3 maestros por grupo:
  - Maestro Principal → titular, da clases **EN INGLÉS** (colegio bilingüe)
  - Maestro de Español → da clases en español
  - Maestro Asistente → apoyo general
- El grupo es la unidad base para pickup, comunicados, colegiatura, calendario

**2. N ATELIERS** (incluidos en colegiatura, sin costo extra)
- Ejemplos: Música, Robótica, Wellness
- Alumnos de diferentes grupos pueden mezclarse
- Tienen instructor propio; NO generan cargo adicional

**3. N EXTRACURRICULARES** (cobro aparte, opcional)
- Ejemplos: Fútbol, Ballet, Ajedrez
- Inscripción opcional; costo mensual adicional
- Cupo máximo y lista de espera
- Generan cargo separado en el módulo de pagos

### Notas operativas de Hábitat
- El caos de las 2pm en pickup es el **dolor #1** de la directora
- Pickup es el módulo más valorado — prioridad máxima
- App debe ser bilingüe ES/EN para padres extranjeros

---

## Modelo de negocio

- **Xokai Base**: $7 USD / alumno activo / mes
- **Xokai + Pickup**: $9 USD / alumno activo / mes
- Sin cobros por usuario admin. Sin setup fee.
- Piloto gratuito para la primera escuela (Hábitat).

---

## Mercado objetivo

- Escuelas privadas en México (foco inicial: Guadalajara / Jalisco)
- Expansión a LATAM

---

## Módulos core

1. **Pickup / Semáforo** — GPS en tiempo real, tablet de puerta, semáforo 🔴🟡🟢
2. **Comunicados** — reemplaza WhatsApp, con confirmación de lectura
3. **Calendario escolar** — eventos, menú del día, extracurriculares
4. **Pagos y colegiaturas** — cobro automático, CFDI, planes de pago
5. **Firma electrónica** — contratos y documentos desde el celular

---

## Roles en la plataforma

| Rol | Acceso |
|-----|--------|
| `sysadmin` | Panel global multi-escuela (`/sysadmin`) |
| `admin` | Dashboard completo de su escuela (`/dashboard`) |
| `maestro` | Solo ve su grupo asignado |
| `portero` | Solo vista de pickup (tablet) |
| `guardian` | App móvil EN/ES (fuera del dashboard web) |

---

## Stack tecnológico

- **Frontend web**: Next.js 14 App Router + TypeScript estricto + Tailwind CSS v4
- **Mobile**: iOS (Swift/SwiftUI) + Android (Kotlin/Jetpack Compose)
- **Backend / DB**: Supabase (Postgres + Auth + RLS + Realtime)
- **Componentes UI**: shadcn/ui (Radix primitivos) + Zod + react-hook-form + sonner
- **Pagos**: Stripe Subscriptions + Webhooks + CFDI 4.0
- **Hosting**: Vercel (web) + Supabase Cloud
- **CI/CD**: GitHub Actions + Vercel Preview Deployments

### Paquetes Radix instalados
`alert-dialog`, `dialog`, `label`, `separator`, `slot`, `dropdown-menu`

Si falta un primitivo: `npm install @radix-ui/react-<name> --legacy-peer-deps`

---

## Design System — UNIFICADO (paleta morada)

> **globals.css es la fuente de verdad**. El color accent es PURPLE (`#6D4AE8`), NO verde.
> Nunca hardcodear colores — usar siempre tokens `xk-*` de Tailwind.

### Tokens CSS (`src/app/globals.css`)

```css
/* Fondos y superficies */
--color-xk-bg:              #FAFAF8   /* fondo principal */
--color-xk-surface:         #FFFFFF   /* cards, modales */
--color-xk-subtle:          #F4F3EF   /* hover, fondo sutil */
--color-xk-card:            #FFFFFF   /* alias de surface */

/* Bordes */
--color-xk-border:          #ECEAE3
--color-xk-border-strong:   #D8D5CC

/* Texto */
--color-xk-text:            #0F0E0C   /* texto principal */
--color-xk-text-secondary:  #57534E   /* texto secundario */
--color-xk-text-muted:      #A8A49E   /* deshabilitado */

/* Accent — PURPLE (no verde) */
--color-xk-accent:          #6D4AE8
--color-xk-accent-light:    #F3F0FF
--color-xk-accent-medium:   #C4B5FD
--color-xk-accent-dark:     #5B3BD4

/* Semánticos */
--color-xk-warning:         #D97706
--color-xk-danger:          #DC2626
--color-xk-success:         #059669

/* Sidebar oscuro */
--color-xk-sidebar-bg:      #0F0E0C
--color-xk-sidebar-hover:   #1C1A17
--color-xk-sidebar-text:    #E7E5E0
--color-xk-sidebar-muted:   #8A867E
```

### Clases Tailwind de uso frecuente

```
bg-xk-bg           bg-xk-surface        bg-xk-subtle
bg-xk-accent        bg-xk-accent-light   bg-xk-accent-dark
text-xk-text        text-xk-text-secondary text-xk-text-muted
text-xk-accent      text-xk-accent-dark
border-xk-border    border-xk-border-strong
```

### Clases de utilidad definidas en globals.css

```
.xk-surface          /* card con sombra xs */
.xk-surface-elevated /* card con sombra sm */
.xk-surface-flat     /* card sin sombra */
.xk-num              /* números tabulares (font-mono) */
.xk-metric-number    /* números grandes de métricas */
.xk-focus            /* focus ring morado */
.xk-sidebar-dark     /* sidebar oscuro */
.xk-grid-bg          /* patrón de grid sutil (empty states) */
.xk-scroll           /* scrollbar custom */
```

### Tipografía

- **Títulos/display**: `font-heading` → Fraunces (serif), weight 700
- **UI / body**: `font-sans` → Geist Sans
- **Monospace / números**: `font-mono` → Geist Mono

### shadcn/ui bridge

El `--primary` de shadcn apunta a `#6D4AE8` y `--ring` también. Todos los componentes shadcn heredan la paleta morada automáticamente.

---

## Schema de base de datos

```sql
escuelas (
  id, nombre, logo_url, direccion, rfc,
  horario_pickup_inicio, horario_pickup_fin,
  tolerancia_pickup_minutos,
  active, onboarding_completed,   -- status se deriva de ambos
  join_code,                       -- código de invitación para staff
  created_at
)

grupos (
  id, escuela_id, nombre, grado, ciclo_escolar,
  maestro_principal_id,   -- titular, da clases en INGLÉS
  maestro_español_id,     -- da clases en español
  maestro_asistente_id,   -- apoyo general
  activo, created_at
)

grupo_maestros (
  id, grupo_id, maestro_id,
  rol,   -- 'principal' | 'español' | 'asistente'
  created_at
)

actividades (
  id, escuela_id, nombre,
  tipo,              -- 'atelier' | 'extracurricular'
  instructor_id,
  cupo_maximo,
  costo_mensual,     -- NULL si tipo = 'atelier'
  cobro_aparte,      -- false para ateliers, true para extracurriculares
  horario,           -- JSONB: [{dia, hora_inicio, hora_fin}]
  activo, created_at
)

actividad_inscripciones (
  id, actividad_id, alumno_id,
  fecha_inicio, fecha_fin,
  status,   -- 'activo' | 'baja' | 'lista_espera'
  created_at
)

alumnos (
  id, escuela_id, grupo_id,
  nombre, apellido, foto_url, curp,
  fecha_nacimiento, activo, created_at
)

maestros (
  id, escuela_id, nombre, apellido,
  email, foto_url, activo, created_at
)

padres (
  id, escuela_id, nombre, apellido,
  email, telefono,
  idioma_preferido,  -- 'es' | 'en'
  activo, created_at
)

alumno_padres (
  alumno_id, padre_id,
  relacion,             -- 'madre' | 'padre' | 'tutor' | 'otro'
  autorizado_pickup,
  es_contacto_principal
)

personas_autorizadas_pickup (
  id, alumno_id, nombre, foto_url,
  relacion, telefono, activo
)

pickup_eventos (
  id, alumno_id, escuela_id,
  padre_id, recogido_por,
  status,   -- 'en_camino' | 'llegando' | 'entregado'
  folio, lat, lng, entregado_at, created_at
)

comunicados (
  id, escuela_id, titulo, cuerpo, adjunto_url,
  segmento_tipo,  -- 'escuela' | 'grupo' | 'grado' | 'actividad'
  segmento_id,
  programado_para, publicado_at, created_at
)

comunicado_lecturas (comunicado_id, padre_id, leido_at)

calendario_eventos (
  id, escuela_id, titulo, descripcion,
  tipo,   -- 'sin_clase' | 'examen' | 'evento' | 'extracurricular' | 'menu'
  fecha_inicio, fecha_fin,
  grupo_id,    -- NULL = toda la escuela
  actividad_id
)

pagos (
  id, escuela_id, alumno_id,
  concepto, monto,
  tipo,    -- 'colegiatura' | 'inscripcion' | 'extracurricular'
  status,  -- 'pendiente' | 'pagado' | 'vencido' | 'cancelado'
  fecha_limite, pagado_at,
  stripe_payment_id, cfdi_url, created_at
)

documentos (
  id, escuela_id, nombre, descripcion,
  pdf_url, requiere_firma, activo, created_at
)

documento_asignaciones (
  id, documento_id,
  scope_tipo,  -- 'escuela' | 'grupo' | 'alumno'
  scope_id
)

documento_firmas (
  id, documento_id, padre_id,
  firmado_at, pdf_firmado_url, folio
)

school_notes (
  id, school_id, author_id, content, created_at
  -- append-only, solo visible para sysadmin vía RLS
)

user_profiles (
  id,    -- = auth.uid()
  role,  -- 'sysadmin' | 'admin' | 'teacher' | 'portero' | 'guardian'
  first_name, last_name, avatar_url,
  school_id
)
```

### Status de escuela — derivado, no columna

```
active:false + onboarding_completed:false → 'onboarding'
active:false + onboarding_completed:true  → 'pending'  (esperando aprobación sysadmin)
active:true  + onboarding_completed:true  → 'active'
active:false (manual)                     → 'paused'
```

---

## Patrones de UI — obligatorios

### Estructura de página

```
page.tsx          ← server component
  · Verificar sesión con createClient()
  · Verificar rol del usuario
  · Fetch inicial de datos
  · Renderiza <[Modulo]Client data={data} />

[Modulo]Client.tsx ← client component
  · Toda la interactividad aquí
  · <PageHeader titulo descripcion accionPrimaria />
  · <[Modulo]Filters />
  · <[Modulo]Table />
  · Modales inline
```

### Tablas
- Búsqueda en tiempo real (debounce 300ms)
- Paginación server-side (20 items/página)
- Columna de acciones: `DropdownMenu` de shadcn
- Empty state: `xk-grid-bg` + icono + texto + CTA
- Loading: Skeleton rows — nunca spinner solo

### Forms / Modales
- `shadcn Dialog` siempre
- Validación: Zod schema + react-hook-form
- Cada campo: Label + Input + mensaje de error debajo
- Submit: loading state (disabled + spinner)
- Reset completo del form al cerrar modal

### Feedback
- Éxito → toast verde (`sonner`) en español
- Error → toast rojo con mensaje descriptivo
- Acción destructiva → `AlertDialog` de confirmación
- Nunca `alert()` o `confirm()` nativos

### Estados obligatorios en todo componente
- Loading → `<LoadingSkeleton>`
- Empty → `<EmptyState>` con CTA
- Error → mensaje + botón reintentar
- Éxito → toast + refetch

---

## Componentes base (ya creados)

Importar desde `@/components/` (no de `@/components/ui/custom/`):

| Componente | Descripción |
|------------|-------------|
| `<PageHeader>` | Header estándar con título + CTA |
| `<DataTable>` | Tabla con búsqueda y paginación |
| `<ConfirmDialog>` | AlertDialog antes de acción destructiva |
| `<FormModal>` | Modal base con form |
| `<EmptyState>` | Estado vacío con xk-grid-bg + CTA |
| `<LoadingSkeleton>` | Skeleton de carga |
| `<StatusBadge>` | Badge de estado con colores semánticos |

Componentes shadcn/ui primitivos: `@/components/ui/`

Componentes sysadmin:
- `<MetricCard>` → `@/components/ui/metric-card`
- `<StatusBadge>` → `@/components/ui/status-badge`

---

## Estructura de archivos por módulo

```
src/app/dashboard/[modulo]/
  page.tsx                 ← server component
  [Modulo]Client.tsx       ← client component principal
  components/
    [Modulo]Table.tsx
    [Modulo]Modal.tsx
    [Modulo]Filters.tsx

src/app/sysadmin/
  layout.tsx               ← auth check + SysadminShell
  page.tsx                 ← dashboard global (métricas)
  schools/                 ← gestión de escuelas
```

---

## Idioma y formato

- Todo el copy en **español México**
- Fechas: `DD/MM/YYYY`
- Hora: `12hr con AM/PM`
- Moneda: `MXN con símbolo $` (ej: `$1,500.00`)
- Nombres con acentos correctos siempre

---

## Reglas globales — nunca romper

- TypeScript estricto — **nunca `any`**
- RLS activado en **todas** las tablas de Supabase
- Mobile-first en toda decisión de UX
- App bilingüe: español (ES) e inglés (EN)
- Cumplimiento LFPDPPP (privacidad México) — datos de menores
- CFDI 4.0 en todos los flujos de pago
- Seguridad primero — datos de niños y familias
- Siempre filtrar queries por `school_id` / `escuela_id`
- Validación server-side siempre, nunca solo cliente

---

## Decisiones técnicas tomadas

### C0 — Fundación
- shadcn/ui configurado manualmente (Tailwind v4 compatible)
- RLS por rol: `sysadmin / admin / teacher / portero / guardian`
- Componentes custom en `/src/components/`
- Sonner para toasts, Zod + react-hook-form para forms

### C1 — Auth
- Magic link + email/password via Supabase Auth
- Roles en tabla `user_profiles`
- Middleware Next.js protege `/dashboard/*` y `/sysadmin/*` por rol
- Onboarding wizard crea escuela y vincula admin

### C2 — Design System
- Tailwind v4 con tokens CSS en `globals.css` (prefijo `xk-*`)
- Color accent = **PURPLE `#6D4AE8`** — globals.css es la fuente de verdad
- Fuentes: Fraunces (headings), Geist (body), Geist Mono

### C3 — Módulos construidos
- **Alumnos**: CRUD completo (crear, editar, activar/desactivar)
  - Campos: `first_name, last_name, student_code, group_id, date_of_birth, allergies, medical_notes`
  - Acciones: DropdownMenu con Editar + ConfirmDialog para toggle activo
- **Comunicados**: bucket `announcement-images` (público), soporta imagen + link externo + segmento
- **Sysadmin**: dashboard con métricas (MRR, escuelas, alumnos), listado de escuelas, notas internas

### C5 — Auth flow (self-serve con aprobación)
- Signup → email confirmación → `/auth/confirm?next=/onboarding?type=director` → wizard
- Onboarding → escuela con `active:false, onboarding_completed:true` (status `pending`)
- Sysadmin aprueba → `active:true` → escuela operativa
- Director ve banner "en revisión" mientras `!school.active`
- `join_code` visible en success screen y en `/dashboard/perfil`

### C6 — Comunicados
- Server actions en `src/app/actions/announcements.ts`
- RLS: staff de la escuela puede CRUD; guardians solo leen

### C7 — Notas sysadmin
- Tabla `school_notes` (append-only), visible solo para sysadmin vía RLS inline

---

## Learnings técnicos

### Auth / Supabase

- **`emailRedirectTo` obligatorio en `signUp()`** — sin él el email apunta al Site URL (normalmente `/`):
  ```ts
  emailRedirectTo: `${appUrl}/auth/confirm?next=${encodeURIComponent('/onboarding?type=director')}`
  ```
- **RLS policies en migraciones**: nunca usar funciones de `schema.sql`. Inlinear subquery:
  ```sql
  coalesce((select role = 'sysadmin' from user_profiles where id = auth.uid()), false)
  ```
- **Invite flow**: `inviteUserByEmail` + `redirectTo: ${appUrl}/auth/confirm?next=/onboarding`
- El route `/auth/confirm` maneja PKCE (`?code=`) y OTP (`?token_hash=`)

### Next.js App Router

- **Server actions re-renderizan** el server component al completar. Si tiene `redirect()`, se dispara antes de mostrar éxito. Fix: `router.push('/nueva-ruta')` desde el cliente antes del re-render. Las pantallas de éxito deben tener su propia ruta.
- **`searchParams`** requiere `await` en Next.js 14+: `const params = await searchParams`
- **Layouts dobles**: no re-envolver en el shell dentro de `page.tsx` si ya existe `layout.tsx`

### Modelo de datos

- **`join_code`**: `crypto.randomUUID().slice(0,8).toUpperCase()` — no usar el paquete `uuid` (no instalado)
- **Notificación sysadmin**: Resend API via `fetch` (no SDK). Usar `void notifySysadmin()` — no bloquea
  ```ts
  void notifySysadmin({ ... }) // best-effort
  ```
  Env vars: `RESEND_API_KEY`, `SYSADMIN_EMAIL`

### UX

- **Pantallas finales de flujo**: (1) confirmación de qué pasó, (2) estado actual, (3) 2-3 próximos pasos accionables, (4) CTA primario
- **Onboarding solo para directoras**. Staff se une vía `join_code`. Pasar `?type=director` en `emailRedirectTo`
- **Pre-llenar correo de escuela** con el email del signup

---

## Patrones que funcionan

### Arquitectura
```
page.tsx → server component con auth check
[Modulo]Client.tsx → toda la interactividad
Filtrar SIEMPRE por school_id en queries
```

### Push a GitHub

El proxy local y MCP GitHub tools dan 403 en escritura. Solución:

```bash
# Push con PAT directo en URL
git push https://[PAT]@github.com/ezvaelka/xokai.git branch-name

# Crear PR
curl -X POST -H "Authorization: token $PAT" https://api.github.com/repos/ezvaelka/xokai/pulls \
  -d '{"title":"...","head":"branch","base":"main","body":"..."}'

# Mergear (esperar 3-4s para que GitHub calcule mergeable)
curl -X PUT -H "Authorization: token $PAT" https://api.github.com/repos/ezvaelka/xokai/pulls/N/merge
```

- Sincronizar tracking refs después de push:
  `git fetch <PAT_URL> main:refs/remotes/origin/main branch:refs/remotes/origin/branch`

### Componentes UI
- shadcn primitivos en `/src/components/ui/`
- Custom components en `/src/components/` directamente
- Usar siempre tokens `xk-*` de Tailwind

### Claude Code — workflow de agente
- **Tareas atómicas pequeñas** — evitar timeouts:
  - Archivos >200 líneas → múltiples ediciones
  - Commands largos → dividir en varios Bash calls
  - Push con muchos archivos → batches de 3-5 archivos
- Leer `/CLAUDE.md` al inicio de cada sesión
- Correr `npx tsc --noEmit` antes de push

---

## Anti-patrones — nunca hacer

### Git / Deploy
- NO usar MCP GitHub tool para push, `create_branch`, `create_pull_request` — da 403
- NO pushear directo a `main` — siempre PR
- NO mergear PR inmediatamente — esperar 3-4s para que GitHub calcule `mergeable`
- NO commitear tokens/PATs en ningún archivo — GitHub Push Protection los bloquea
- NO commitear `.env` — solo `.env.example`

### Código
- NO usar `any` en TypeScript
- NO `alert()` o `confirm()` nativo — usar `sonner` + `ConfirmDialog`
- NO validar solo en cliente — siempre server-side también
- NO exponer datos sin filtrar por `school_id`
- NO asumir que los componentes shadcn existen — verificar `/src/components/ui/` antes de importar
- NO usar el color verde `#1A6B4A` como accent — el proyecto usa purple `#6D4AE8`
- NO eliminar imports de lucide sin verificar que NO se usen en constantes o JSX fuera del componente
- NO mostrar pantalla de éxito en la misma URL donde ocurrió el server action
- NO usar funciones de `schema.sql` en migraciones (ej. `is_sysadmin()`)

### Seguridad
- NO pegar tokens en claude.ai chat — solo en Claude Code
- NO commitear `~/.claude/.github-pat` — es local al entorno

---

## Flujo de trabajo Git

- **Siempre trabajar en feature branches** — nunca commitear directo a `main`
- **Siempre crear un PR** antes de mergear a `main`
- **Mergear via PR** para mantener historial limpio en GitHub
- La rama de trabajo activa está definida en el sistema de instrucciones del agente

---

## Referencias en el codebase

| Qué | Dónde |
|-----|-------|
| Design tokens | `src/app/globals.css` |
| Patrón de página | `src/app/dashboard/page.tsx` |
| Patrón de módulo | `src/app/dashboard/alumnos/page.tsx` |
| Cliente Supabase | `src/lib/supabase/client.ts` |
| Schema completo | `supabase/schema.sql` |
| Shell sysadmin | `src/components/SysadminShell.tsx` |
| Shell dashboard | `src/components/DashboardShell.tsx` |
| MetricCard | `src/components/ui/metric-card.tsx` |
| StatusBadge | `src/components/ui/status-badge.tsx` |
| Server actions | `src/app/actions/` |
