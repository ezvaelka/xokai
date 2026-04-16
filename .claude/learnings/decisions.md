# Decisiones Técnicas — Xokai
Registro de decisiones arquitectónicas y técnicas tomadas durante el desarrollo.

## C0 — Fundación
- shadcn/ui configurado manualmente (Tailwind v4 compatible)
- RLS activo por rol: sysadmin / admin / teacher / portero / guardian
- Componentes base en /components/ui/custom/
- Sonner para toasts, Zod + react-hook-form para forms

## C1 — Auth
- Magic link + email/password via Supabase Auth
- Roles en user_metadata de Supabase
- Middleware Next.js protege /dashboard/* por rol
- Onboarding wizard crea escuela y vincula admin
