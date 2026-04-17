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
- Remote URL usa PAT directo: https://[PAT]@github.com/ezvaelka/xokai.git
- PAT guardado en ~/.claude/.github-pat
- Stop hook auto-crea PR y mergea via curl cuando detecta rama sin PR abierto
- Verificar PR mergeado (state=closed + merged_at != null) para evitar falsos positivos
