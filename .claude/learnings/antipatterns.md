# Anti-patrones — Xokai
Cosas que NO hacer, aprendidas en el proceso.

## Git / Deploy
- NO usar MCP GitHub tool para push, create_branch o create_pull_request — da 403
- NO usar el proxy local (127.0.0.1:52920) para push — da 403 Permission denied
- NO hardcodear colores — usar siempre tokens xk-* de Tailwind
- NO mezclar capas en una sola tarea — da timeout
- NO crear PRs en rama main/develop/master — el stop hook los excluye correctamente
- NO mergear PR inmediatamente después de crearlo — esperar 3-4s para que GitHub calcule `mergeable`
- NO asumir que squash-merge deja la rama como "merged" en la API de PRs sin verificar `merged_at`

## Código
- NO usar 'any' en TypeScript
- NO alert() o confirm() nativo — usar sonner + ConfirmDialog (AlertDialog)
- NO validar solo en cliente — siempre server-side también
- NO exponer datos sin filtrar por school_id
- NO asumir que los componentes shadcn existen — verificar /src/components/ui/ antes de importar
- NO usar el color accent verde (#1A6B4A) de CLAUDE_CONTEXT.md — el proyecto usa purple (#6D4AE8), globals.css es la fuente de verdad

## Seguridad
- NO pegar tokens en claude.ai chat — solo en Claude Code
- NO commitear .env — solo .env.example
- NO commitear ~/.claude/.github-pat — es local al entorno
