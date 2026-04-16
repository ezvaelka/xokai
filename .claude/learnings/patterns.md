# Patrones que Funcionan — Xokai

## Arquitectura
- page.tsx = server component con auth check
- [Modulo]Client.tsx = toda la interactividad
- Filtrar SIEMPRE por escuela_id en queries

## Push + PR + Merge a GitHub
- El MCP tool de GitHub da timeout con archivos grandes
- El proxy local (127.0.0.1:52920) da 403 en push — no funciona
<<<<<<< HEAD
- El MCP GitHub tool da 403 en create_branch y create_pull_request — no tiene permisos de escritura
- Solución para push: cambiar el remote URL con el PAT directo:
  `git remote set-url origin https://[PAT]@github.com/ezvaelka/xokai.git`
- Solución para PR + merge: usar curl con el PAT desde bash:
  `curl -X POST -H "Authorization: token $PAT" https://api.github.com/repos/ezvaelka/xokai/pulls -d '{...}'`
  `curl -X PUT -H "Authorization: token $PAT" https://api.github.com/repos/ezvaelka/xokai/pulls/N/merge`
- PAT guardado en ~/.claude/.github-pat (600 perms, nunca commiteado)
- Stop hook configura auto PR+merge al finalizar cada sesión
=======
- Solución: cambiar el remote URL con el PAT directo:
  `git remote set-url origin https://[PAT]@github.com/ezvaelka/xokai.git`
- Luego: `git push -u origin [branch]`
- El PAT está en .git/config (nunca en archivos commiteados)
>>>>>>> 1396db4 (Update patterns.md with PAT git push solution)

## Claude Code
- Tareas atómicas pequeñas evitan timeouts
- Pegar CLAUDE_CONTEXT.md al inicio de cada sesión
- Auto-accept mode para ir más rápido
