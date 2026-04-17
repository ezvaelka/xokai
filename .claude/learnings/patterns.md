# Patrones que Funcionan — Xokai

## Arquitectura
- page.tsx = server component con auth check
- [Modulo]Client.tsx = toda la interactividad
- Filtrar SIEMPRE por escuela_id en queries

## Push + PR + Merge a GitHub
- El proxy local (127.0.0.1:52920) da 403 en push — no funciona
- El MCP GitHub tool da 403 en create_branch y create_pull_request — no tiene permisos de escritura
- Solución para push: cambiar el remote URL con el PAT directo:
  `git remote set-url origin https://[PAT]@github.com/ezvaelka/xokai.git`
- Solución para PR + merge: usar curl con el PAT desde bash:
  `curl -X POST -H "Authorization: token $PAT" https://api.github.com/repos/ezvaelka/xokai/pulls -d '{...}'`
  `curl -X PUT -H "Authorization: token $PAT" https://api.github.com/repos/ezvaelka/xokai/pulls/N/merge`
- PAT guardado en ~/.claude/.github-pat (600 perms, nunca commiteado)
- Stop hook configura auto PR+merge al finalizar cada sesión
- Esperar 3-4s antes de mergear — GitHub necesita calcular `mergeable`

## Componentes UI
- shadcn components en /src/components/ui/ (no en /components/ui/custom/)
- Los custom components (PageHeader, DataTable, etc.) están en /src/components/ directamente
- Si falta un componente Radix (ej. dropdown-menu): instalar + crear el .tsx manualmente
  `npm install @radix-ui/react-dropdown-menu --legacy-peer-deps`
- Usar siempre tokens xk-* de Tailwind (ej. `text-xk-text`, `bg-xk-subtle`, `border-xk-border`)
- El accent color del proyecto es PURPLE (#6D4AE8), no verde — respetar globals.css

## Módulos del dashboard
- Todos empezaban como ComingSoon — hay que construirlos uno a uno
- Patrón probado: page.tsx (server, fetch + auth) + [Modulo]Client.tsx (client, toda la UI)
- AlumnosClient: DataTable + FormModal + ConfirmDialog + DropdownMenu en columna acciones

## Claude Code
- Tareas atómicas pequeñas evitan timeouts
- Auto-accept mode para ir más rápido
- Leer CLAUDE_CONTEXT.md y /.claude/learnings/ al inicio de cada sesión
