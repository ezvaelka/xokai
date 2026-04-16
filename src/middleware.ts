import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

// ─── Roles ───────────────────────────────────────────────────────────────────

const DIRECTOR_ROLES  = ['admin', 'director', 'sysadmin'] as const

const PUBLIC_PATHS = [
  '/login',
  '/forgot-password',
  '/reset-password',
  '/signup',
]

const ALLOWED: Record<string, string[]> = {
  maestro:     ['/dashboard/grupos', '/dashboard/comunicados', '/dashboard/perfil'],
  teacher:     ['/dashboard/grupos', '/dashboard/comunicados', '/dashboard/perfil'],
  portero:     ['/dashboard/pickup', '/dashboard/perfil'],
  coordinador: ['/dashboard', '/dashboard/alumnos', '/dashboard/grupos', '/dashboard/comunicados', '/dashboard/perfil'],
  finanzas:    ['/dashboard', '/dashboard/pagos', '/dashboard/perfil'],
}

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

  const isPublicPath = PUBLIC_PATHS.some((p) => pathname === p || pathname.startsWith(`${p}/`))
  const isDashboard  = pathname.startsWith('/dashboard')
  const isOnboarding = pathname.startsWith('/onboarding')
  const isSysadmin   = pathname.startsWith('/sysadmin')

  // ── Sin autenticación ───────────────────────────────────────────────────────

  if (!user) {
    if (isDashboard || isOnboarding || isSysadmin) {
      const loginUrl = new URL('/login', request.url)
      loginUrl.searchParams.set('redirect', pathname)
      return NextResponse.redirect(loginUrl)
    }
    if (pathname === '/') {
      return NextResponse.redirect(new URL('/login', request.url))
    }
    return response
  }

  // ── Autenticado en ruta pública ─────────────────────────────────────────────

  if (isPublicPath && pathname !== '/reset-password') {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  // ── Verificar perfil y rol ──────────────────────────────────────────────────

  if (isDashboard || isOnboarding || isSysadmin) {
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('role, school_id')
      .eq('id', user.id)
      .single()

    if (!profile && !isOnboarding) {
      return NextResponse.redirect(new URL('/onboarding', request.url))
    }

    if (profile && !profile.school_id && profile.role !== 'sysadmin' && !isOnboarding) {
      return NextResponse.redirect(new URL('/onboarding', request.url))
    }

    if (profile && isSysadmin && profile.role !== 'sysadmin') {
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }

    // Redirigir sysadmin fuera del dashboard de escuela (excepto perfil)
    if (profile && profile.role === 'sysadmin' && isDashboard && pathname !== '/dashboard/perfil') {
      return NextResponse.redirect(new URL('/sysadmin/schools', request.url))
    }

    if (profile && isDashboard) {
      const role = profile.role

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
