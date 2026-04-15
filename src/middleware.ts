import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

// ─── Rutas ───────────────────────────────────────────────────────────────────

/** Rutas accesibles sin autenticación */
const PUBLIC_PATHS = [
  '/login',
  '/forgot-password',
  '/reset-password',
  '/invite/accept',
]

/** Rutas que requieren auth pero tienen lógica especial (sin perfil completo OK) */
const SETUP_PATHS = ['/invite/accept', '/onboarding']

/** Rutas a las que solo puede acceder un maestro en el dashboard */
const TEACHER_PATHS = [
  '/dashboard/grupos',
  '/dashboard/comunicados',
  '/dashboard/perfil',
]

/** Rutas a las que solo puede acceder un portero en el dashboard */
const PORTERO_PATHS = [
  '/dashboard/pickup',
  '/dashboard/perfil',
]

/** Prefijos estáticos — excluir siempre */
const STATIC_PREFIXES = ['/_next/', '/favicon.ico', '/icons/', '/images/']

// ─── Middleware ───────────────────────────────────────────────────────────────

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Ignorar assets estáticos
  if (STATIC_PREFIXES.some((p) => pathname.startsWith(p))) {
    return NextResponse.next()
  }

  let response = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll: (cookiesToSet) => {
          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options)
          })
        },
      },
    }
  )

  // Obtener usuario (verifica el JWT, no confiar solo en cookie)
  const { data: { user } } = await supabase.auth.getUser()

  const isPublicPath  = PUBLIC_PATHS.some((p) => pathname === p || pathname.startsWith(`${p}/`))
  const isSetupPath   = SETUP_PATHS.some((p)  => pathname === p || pathname.startsWith(`${p}/`))
  const isDashboard   = pathname.startsWith('/dashboard')
  const isOnboarding  = pathname.startsWith('/onboarding')

  // ── Usuario NO autenticado ──────────────────────────────────────────────────

  if (!user) {
    // Bloquear dashboard y rutas de setup
    if (isDashboard || (isSetupPath && !isPublicPath)) {
      const loginUrl = new URL('/login', request.url)
      loginUrl.searchParams.set('redirect', pathname)
      return NextResponse.redirect(loginUrl)
    }
    // Raíz → login
    if (pathname === '/') {
      return NextResponse.redirect(new URL('/login', request.url))
    }
    return response
  }

  // ── Usuario autenticado en página pública (login, forgot-password) ──────────
  // Excepción: invite/accept y reset-password siempre accesibles para completar el flujo

  if (isPublicPath && !isSetupPath && pathname !== '/reset-password') {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  // ── Usuario autenticado: verificar perfil y rol ─────────────────────────────

  if (isDashboard || isOnboarding || isSetupPath) {
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('role, school_id')
      .eq('id', user.id)
      .single()

    // Sin perfil → debe completar invitación
    if (!profile && !pathname.startsWith('/invite/accept')) {
      return NextResponse.redirect(new URL('/invite/accept', request.url))
    }

    // Con perfil pero sin escuela (y no sysadmin) → onboarding
    if (
      profile &&
      !profile.school_id &&
      profile.role !== 'sysadmin' &&
      !isOnboarding
    ) {
      return NextResponse.redirect(new URL('/onboarding', request.url))
    }

    // Routing por rol (solo en rutas de dashboard)
    if (profile && isDashboard) {
      const role = profile.role

      if (role === 'teacher') {
        const allowed = TEACHER_PATHS.some((p) => pathname.startsWith(p))
        if (!allowed) {
          return NextResponse.redirect(new URL('/dashboard/grupos', request.url))
        }
      }

      if (role === 'portero') {
        const allowed = PORTERO_PATHS.some((p) => pathname.startsWith(p))
        if (!allowed) {
          return NextResponse.redirect(new URL('/dashboard/pickup', request.url))
        }
      }
    }
  }

  // Raíz autenticada → dashboard
  if (pathname === '/') {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  return response
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
