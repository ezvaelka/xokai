import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse, type NextRequest } from 'next/server'

/**
 * Manejador de callbacks de Supabase Auth.
 * Usado por: magic links, invitaciones, recuperación de contraseña.
 *
 * Supabase redirige aquí con ?token_hash=xxx&type=xxx
 * Verificamos el token y redirigimos al destino correcto.
 */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const token_hash = searchParams.get('token_hash')
  const type       = searchParams.get('type') as
    | 'recovery' | 'invite' | 'magiclink' | 'email' | 'signup'
    | null
  const next       = searchParams.get('next') ?? '/dashboard'

  if (token_hash && type) {
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

    const { error } = await supabase.auth.verifyOtp({ type, token_hash })

    if (!error) {
      // Redirigir según el tipo de confirmación
      if (type === 'recovery') {
        return NextResponse.redirect(`${origin}/reset-password`)
      }
      if (type === 'invite') {
        return NextResponse.redirect(`${origin}/invite/accept`)
      }
      // magic link, email confirmation → destino indicado o dashboard
      return NextResponse.redirect(`${origin}${next}`)
    }
  }

  // Token inválido o expirado
  return NextResponse.redirect(
    `${origin}/login?error=link_invalido`
  )
}
