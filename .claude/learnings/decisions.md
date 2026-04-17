# Decisiones Técnicas — Xokai
Registro de decisiones arquitectónicas y técnicas tomadas durante el desarrollo.

## C0 — Fundación
- shadcn/ui configurado manualmente (Tailwind v4 compatible)
- RLS activo por rol: sysadmin / admin / teacher / portero / guardian
- Componentes base en /src/components/ (PageHeader, DataTable, FormModal, ConfirmDialog, EmptyState, LoadingSkeleton, StatusBadge)
- Componentes shadcn/ui primitivos en /src/components/ui/
- Sonner para toasts, Zod + react-hook-form para forms

## C1 — Auth
- Magic link + email/password via Supabase Auth
- Roles en tabla user_profiles (sysadmin, admin, teacher, portero, guardian)
- Middleware Next.js protege /dashboard/* por rol
- Onboarding wizard crea escuela y vincula admin

## C2 — UI / Design System
- Tailwind v4 con tokens CSS en globals.css (prefijo xk-*)
- Color accent = PURPLE #6D4AE8 (no verde como en CLAUDE_CONTEXT.md — globals.css es la fuente de verdad)
- Fuentes: Fraunces (headings, font-heading), Geist (body), Geist Mono
- Radix packages instalados: alert-dialog, dialog, label, separator, slot, dropdown-menu
- dropdown-menu agregado en sesión 2 al construir módulo Alumnos

## C3 — Módulos construidos
- Alumnos: CRUD completo (crear, editar, activar/desactivar) con tabla, búsqueda, modal, confirmación
  - Campos: first_name, last_name, student_code, group_id, date_of_birth, allergies, medical_notes
  - Acciones: DropdownMenu con Editar + ConfirmDialog para toggle activo

## C4 — Git / Deploy
- Push via PAT directo en URL (proxy local y MCP GitHub dan 403 en escritura)
- Flujo: feature branch → push → PR via curl → merge via curl
- Siempre sincronizar tracking refs locales después de push con PAT
- Verificar PR mergeado (state=closed + merged_at != null) para evitar falsos positivos

## C5 — Auth flow (self-serve con aprobación)
- Signup → email confirmación → `/auth/confirm?next=/onboarding?type=director` → onboarding wizard
- Onboarding crea escuela con `active:false, onboarding_completed:true` (= status `pending`)
- Sysadmin aprueba → `active:true` → escuela operativa
- Director ve banner "en revisión" mientras `!school.active`
- `join_code` generado al completar onboarding — visible en success screen y en `/dashboard/perfil`
- Sysadmin recibe email (Resend, best-effort) con link directo al detalle de la escuela

## C6 — Comunicados
- Bucket Supabase Storage: `announcement-images` (público)
- Soporta: imagen, link a formulario externo (Google/Microsoft), segmento (escuela/grupo)
- Server actions en `src/app/actions/announcements.ts`
- RLS: staff de la escuela puede crear/leer/borrar; guardians solo leen (futuro)

## C7 — Notas internas sysadmin
- Tabla `school_notes` (append-only) con author_id y created_at
- Visible solo para sysadmin vía RLS inline
- UI: lista de notas con autor + timestamp relativo + formulario al final
