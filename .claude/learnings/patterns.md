# Patrones que Funcionan — Xokai

## Arquitectura
- page.tsx = server component con auth check
- [Modulo]Client.tsx = toda la interactividad
- Filtrar SIEMPRE por escuela_id en queries

## Push a GitHub
- El MCP tool de GitHub da timeout con archivos grandes
- Solución: usar bash directo → git push origin [branch]
- Si bash falla por proxy → hacer push desde terminal local

## Claude Code
- Tareas atómicas pequeñas evitan timeouts
- Pegar CLAUDE_CONTEXT.md al inicio de cada sesión
- Auto-accept mode para ir más rápido
