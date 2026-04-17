# Anti-patrones — Xokai
Cosas que NO hacer, aprendidas en el proceso.

## Git / Deploy
- NO usar MCP GitHub tool para push, create_branch o create_pull_request — da 403
- NO usar el proxy local para push — da 403 Permission denied
- NO pushear directo a `main` — siempre crear PR para mantener historial limpio
- NO hardcodear colores — usar siempre tokens xk-* de Tailwind
- NO mezclar capas en una sola tarea — da timeout
- NO mergear PR inmediatamente después de crearlo — esperar 3-4s para que GitHub calcule `mergeable`
- NO asumir que squash-merge deja la rama como "merged" en la API sin verificar `merged_at`
- NO commitear tokens/PATs en ningún archivo del repo — GitHub Push Protection los bloquea

## Código
- NO usar 'any' en TypeScript
- NO alert() o confirm() nativo — usar sonner + ConfirmDialog (AlertDialog)
- NO validar solo en cliente — siempre server-side también
- NO exponer datos sin filtrar por school_id
- NO asumir que los componentes shadcn existen — verificar /src/components/ui/ antes de importar
- NO usar el color accent verde (#1A6B4A) — el proyecto usa purple (#6D4AE8), globals.css es la fuente de verdad
- NO eliminar imports de lucide sin verificar que NO se usen en constantes o JSX fuera del componente principal — rompe el build de Vercel silenciosamente
- NO mostrar pantalla de éxito en la misma URL donde ocurrió el server action — Next.js re-renderiza y redirige antes de que el usuario la vea
- NO usar funciones de schema.sql en migraciones (ej. `is_sysadmin()`) — no están disponibles en ese contexto

## Seguridad
- NO pegar tokens en claude.ai chat — solo en Claude Code
- NO commitear .env — solo .env.example
- NO commitear ~/.claude/.github-pat — es local al entorno
