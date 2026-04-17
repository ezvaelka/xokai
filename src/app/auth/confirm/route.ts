import { createServerClient } from '@supabase/ssr'
import { cookies }            from 'next/headers'
import { NextResponse, type NextRequest } from 'next/server'

/**
 * Manejador de callbacks de Supabase Auth.
 * Soporta dos flujos:
 *  - PKCE  (nuevo): llega ?code=xxx              → exchangeCodeForSession
 *  - OTP   (clásico): llega ?token_hash=xxx&type=xxx → verifyOtp
 *
 * Usado por: magic links, invitaciones, recuperación de contraseña.
 */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)

  const code       = searchParams.get('code')
  const token_hash = searchParams.get('token_hash')
  const type       = searchParams.get('type') as
    | 'recovery' | 'invite' | 'magiclink' | 'email' | 'signup'
    | null
  const next = searchParams.get('next') ?? '/dashboard'

  if (code || (token_hash && type)) {
    const cookieStore = await cookies()

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll: () => cookieStore.getAll(),
          setAll: (cookiesToSet) => {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options)
            })
          },
        },
      }
    )

    // ── Flujo PKCE (code) ────────────────────────────────────────────────────
    if (code) {
      const { error } = await supabase.auth.exchangeCodeForSession(code)
      if (!error) {
        return NextResponse.redirect(`${origin}${resolveNext(type, next)}`)
      }
    }

    // ── Flujo OTP (token_hash) ───────────────────────────────────────────────
    if (token_hash && type) {
      const { error } = await supabase.auth.verifyOtp({ type, token_hash })
      if (!error) {
        return NextResponse.redirect(`${origin}${resolveNext(type, next)}`)
      }
    }
  }

  // Token inválido o expirado
  return NextResponse.redirect(`${origin}/login?error=link_invalido`)
}

function resolveNext(
  type: 'recovery' | 'invite' | 'magiclink' | 'email' | 'signup' | null,
  fallback: string,
) {
  if (type === 'recovery') return '/reset-password'
  return fallback
}
