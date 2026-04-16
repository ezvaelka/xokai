# Anti-patrones — Xokai
Cosas que NO hacer, aprendidas en el proceso.

## Git / Deploy
- NO usar MCP GitHub tool para pushes de más de 10 archivos
- NO hardcodear colores — usar siempre design tokens
- NO mezclar capas en una sola tarea — da timeout

## Código
- NO usar 'any' en TypeScript
- NO alert() o confirm() nativo — usar sonner + AlertDialog
- NO validar solo en cliente — siempre server-side también
- NO exponer datos sin filtrar por escuela_id

## Seguridad
- NO pegar tokens en claude.ai chat — solo en Claude Code
- NO commitear .env — solo .env.example
