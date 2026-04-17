# Xokai — Learnings técnicos y de producto

Decisiones, patrones y gotchas aprendidos en producción.
Actualizar cada sprint.

---

## Auth / Supabase

### `emailRedirectTo` es obligatorio en `signUp()`
Sin él, el correo de confirmación apunta al Site URL de Supabase (`/`), no al onboarding.
```ts
emailRedirectTo: `${appUrl}/auth/confirm?next=${encodeURIComponent('/onboarding?type=director')}`
```

### RLS policies en migraciones — no usar funciones de `schema.sql`
Las funciones definidas en `schema.sql` (ej. `is_sysadmin()`) no están disponibles en el contexto de migraciones. Usar subqueries inline:
```sql
coalesce((select role = 'sysadmin' from user_profiles where id = auth.uid()), false)
```

### Invite flow
`inviteUserByEmail` + `redirectTo: ${appUrl}/auth/confirm?next=/onboarding`.
El route `/auth/confirm` maneja tanto PKCE (`?code=`) como OTP (`?token_hash=`).
- El `type=invite` no debe redirigir a `/invite/accept` (ruta inexistente) — eliminar ese case de `resolveNext()`.

### `uuid` no está instalado
Usar `crypto.randomUUID()` nativo en lugar de `import { v4 as uuidv4 } from 'uuid'`.

---

## Next.js App Router

### Server actions re-renderizan el server component actual
Después de que un server action completa, Next.js re-renderiza automáticamente los server components de la ruta actual. Si el server component tiene un `redirect()` condicional (ej. `if (profile?.school_id) redirect('/dashboard')`), puede dispararse y borrar la pantalla de éxito antes de que el usuario la vea.

**Solución:** navegar a una ruta diferente desde el cliente al terminar el action:
```ts
router.push(`/onboarding/success?name=...&code=...`)
```
Las pantallas de éxito/confirmación deben vivir en su propia URL, no en la misma ruta donde ocurrió la acción.

### `searchParams` requieren `await` en Next.js 14+
```ts
// ✅ correcto
const params = await searchParams

// ❌ incorrecto
const { status } = searchParams
```

### Layouts dobles
Las rutas dentro de un `layout.tsx` heredan el shell automáticamente. No volver a envolver en el shell dentro de `page.tsx` — causa doble render del sidebar/header.

---

## Modelo de datos

### Status de escuela — derivado, no columna
El status se calcula desde dos columnas existentes, no requiere campo extra:

| `active` | `onboarding_completed` | Status          |
|----------|------------------------|-----------------|
| `false`  | `false`                | `onboarding`    |
| `false`  | `true`                 | `pending`       |
| `true`   | `true`                 | `active`        |
| `false`  | `true` (manual pause)  | `paused`        |

### `join_code` — mecanismo de invitación para staff
Generado en `completeOnboarding()`:
```ts
crypto.randomUUID().replace(/-/g, '').slice(0, 8).toUpperCase()
```
Siempre mostrarlo en la pantalla de éxito del onboarding Y en `/dashboard/perfil`.

### Notificación a sysadmin — best-effort
```ts
void notifySysadmin({ ... }) // no await, no bloquea el flujo
```
Usar Resend API via `fetch` sin SDK. Env vars requeridas: `RESEND_API_KEY`, `SYSADMIN_EMAIL`.

---

## UX / Producto

### Pantallas finales de flujo siempre necesitan
1. Confirmación clara de qué pasó ("¡X fue registrada!")
2. Contexto del estado actual ("Tu solicitud está pendiente de aprobación")
3. 2–3 próximos pasos accionables con descripción
4. CTA primario para continuar el flujo

### Onboarding es solo para directoras
Staff se une vía `join_code` en una pantalla separada. Pasar `?type=director` en el `emailRedirectTo` para saltar la pantalla de elección y arrancar directo en el wizard de directora.

### Pre-llenar campos con datos conocidos
El correo de la escuela en onboarding debe pre-llenarse con el email del signup:
```ts
useForm({ defaultValues: { email: userEmail } })
```

### Textos de botones reflejan el estado real
- ❌ "¡Activar mi escuela!" (cuando la escuela queda pendiente de aprobación)
- ✅ "Enviar solicitud"

---

## Git / Deploy

### Flujo de trabajo
1. Crear feature branch desde `main`
2. Desarrollar y commitear en el branch
3. Push al branch remoto
4. Crear PR con título descriptivo + cuerpo con cambios y plan de prueba
5. Mergear el PR (nunca `git push branch:main` directo)

### Vercel falla silenciosamente en errores de TypeScript
Siempre correr `npx tsc --noEmit` antes de push para detectar errores. Los imports de Lucide eliminados pero todavía referenciados en constantes rompen el build.

### Sync de tracking refs
Después de push con PAT, sincronizar los refs locales para que el stop-hook no reporte falsos positivos:
```bash
git fetch <PAT_URL> main:refs/remotes/origin/main branch:refs/remotes/origin/branch
```
