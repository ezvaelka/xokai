# Patrones que Funcionan — Xokai

## Arquitectura
- page.tsx = server component con auth check
- [Modulo]Client.tsx = toda la interactividad
- Filtrar SIEMPRE por escuela_id en queries

## Push a GitHub
- El MCP tool de GitHub da timeout con archivos grandes
- El proxy local (127.0.0.1:52920) da 403 en push — no funciona
- Solución: cambiar el remote URL con el PAT directo:
  `git remote set-url origin https://[PAT]@github.com/ezvaelka/xokai.git`
- Luego: `git push -u origin [branch]`
- El PAT está en .git/config (nunca en archivos commiteados)

## Claude Code
- Tareas atómicas pequeñas evitan timeouts
- Pegar CLAUDE_CONTEXT.md al inicio de cada sesión
- Auto-accept mode para ir más rápido
