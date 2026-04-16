import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

// ─── Roles ───────────────────────────────────────────────────────────────────

/** Roles con acceso total a la escuela */
const DIRECTOR_ROLES  = ['admin', 'director', 'sysadmin'] as const

/** Rutas accesibles sin autenticación */
const PUBLIC_PATHS = [
  '/login',
  '/forgot-password',
  '/reset-password',
  '/invite/accept',
]

/** Rutas que requieren auth pero sin perfil completo OK */
const SETUP_PATHS = ['/invite/accept', '/onboarding']

/** Rutas permitidas por rol (allowlist) */
const ALLOWED: Record<string, string[]> = {
  maestro:     ['/dashboard/grupos', '/dashboard/comunicados', '/dashboard/perfil'],
  teacher:     ['/dashboard/grupos', '/dashboard/comunicados', '/dashboard/perfil'],
  portero:     ['/dashboard/pickup', '/dashboard/perfil'],
  coordinador: ['/dashboard', '/dashboard/alumnos', '/dashboard/grupos', '/dashboard/comunicados', '/dashboard/perfil'],
  finanzas:    ['/dashboard', '/dashboard/pagos', '/dashboard/perfil'],
}

/** Ruta de aterrizaje por rol */
const DEFAULT_ROUTE: Record<string, string> = {
  maestro:     '/dashboard/grupos',
  teacher:     '/dashboard/grupos',
  portero:     '/dashboard/pickup',
  coordinador: '/dashboard',
  finanzas:    '/dashboard/pagos',
}

const STATIC_PREFIXES = ['/_next/', '/favicon.ico', '/icons/', '/images/']

// ─── Middleware ───────────────────────────────────────────────────────────────

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

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

  const { data: { user } } = await supabase.auth.getUser()

  const isPublicPath   = PUBLIC_PATHS.some((p) => pathname === p || pathname.startsWith(`${p}/`))
  const isSetupPath    = SETUP_PATHS.some((p)  => pathname === p || pathname.startsWith(`${p}/`))
  const isDashboard    = pathname.startsWith('/dashboard')
  const isOnboarding   = pathname.startsWith('/onboarding')
  const isInviteAccept = pathname.startsWith('/invite/accept')

  // ── Sin autenticación ───────────────────────────────────────────────────────

  if (!user) {
    if (isDashboard || (isSetupPath && !isPublicPath)) {
      const loginUrl = new URL('/login', request.url)
      loginUrl.searchParams.set('redirect', pathname)
      return NextResponse.redirect(loginUrl)
    }
    if (pathname === '/') {
      return NextResponse.redirect(new URL('/login', request.url))
    }
    return response
  }

  // ── Autenticado en ruta pública (login, forgot-password) ───────────────────

  if (isPublicPath && !isSetupPath && pathname !== '/reset-password') {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  // ── Verificar perfil y rol ──────────────────────────────────────────────────

  if (isDashboard || isOnboarding || isSetupPath) {
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('role, school_id')
      .eq('id', user.id)
      .single()

    if (!profile && !isOnboarding && !isInviteAccept) {
      // Usuario invitado que no completó el form → volver a /invite/accept
      const metadata = (user.user_metadata ?? {}) as Record<string, string>
      if (metadata.invited_by) {
        return NextResponse.redirect(new URL('/invite/accept', request.url))
      }
      // Admin nuevo sin escuela → onboarding
      return NextResponse.redirect(new URL('/onboarding', request.url))
    }

    if (profile && !profile.school_id && profile.role !== 'sysadmin' && !isOnboarding) {
      return NextResponse.redirect(new URL('/onboarding', request.url))
    }

    if (profile && isDashboard) {
      const role = profile.role

      // Director / admin / sysadmin → acceso total, sin restricción
      if (!DIRECTOR_ROLES.includes(role as any) && ALLOWED[role]) {
        const allowed = ALLOWED[role].some((p) => pathname === p || pathname.startsWith(`${p}/`))
        if (!allowed) {
          return NextResponse.redirect(new URL(DEFAULT_ROUTE[role] ?? '/dashboard', request.url))
        }
      }
    }
  }

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
