import { redirect }    from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import DashboardNav     from '@/components/DashboardNav'
import DashboardLogout  from '@/components/DashboardLogout'
import MobileNav        from '@/components/MobileNav'

// ─── Tipos ───────────────────────────────────────────────────────────────────

interface ShellProps {
  children:   React.ReactNode
  /** href activo para resaltar en el nav (ej: "/dashboard/perfil") */
  activeHref?: string
}

interface SchoolRow {
  name:   string
  active: boolean
}

interface ProfileRow {
  first_name:  string | null
  last_name:   string | null
  avatar_url:  string | null
  role:        string
  schools:     SchoolRow | null
}

// ─── Nav items ────────────────────────────────────────────────────────────────

export const NAV_ITEMS = [
  {
    label: 'Dashboard',
    href:  '/dashboard',
    exact: true,
    roles: ['admin', 'director', 'sysadmin', 'coordinador', 'finanzas'],
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor"
        strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="7" height="7" rx="1.5"/>
        <rect x="14" y="3" width="7" height="7" rx="1.5"/>
        <rect x="14" y="14" width="7" height="7" rx="1.5"/>
        <rect x="3" y="14" width="7" height="7" rx="1.5"/>
      </svg>
    ),
  },
  {
    label: 'Alumnos',
    href:  '/dashboard/alumnos',
    roles: ['admin', 'director', 'sysadmin', 'coordinador'],
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor"
        strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
        <circle cx="9" cy="7" r="4"/>
        <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
        <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
      </svg>
    ),
  },
  {
    label: 'Grupos',
    href:  '/dashboard/grupos',
    roles: ['admin', 'director', 'sysadmin', 'coordinador', 'maestro', 'teacher'],
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor"
        strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/>
      </svg>
    ),
  },
  {
    label: 'Comunicados',
    href:  '/dashboard/comunicados',
    roles: ['admin', 'director', 'sysadmin', 'coordinador', 'maestro', 'teacher'],
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor"
        strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
      </svg>
    ),
  },
  {
    label: 'Pagos',
    href:  '/dashboard/pagos',
    roles: ['admin', 'director', 'sysadmin', 'finanzas'],
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor"
        strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="1" y="4" width="22" height="16" rx="2"/>
        <line x1="1" y1="10" x2="23" y2="10"/>
      </svg>
    ),
  },
  {
    label: 'Documentos',
    href:  '/dashboard/documentos',
    roles: ['admin', 'director', 'sysadmin'],
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor"
        strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
        <polyline points="14 2 14 8 20 8"/>
        <line x1="16" y1="13" x2="8" y2="13"/>
        <line x1="16" y1="17" x2="8" y2="17"/>
      </svg>
    ),
  },
  {
    label: 'Pickup 🚦',
    href:  '/dashboard/pickup',
    roles: ['admin', 'director', 'sysadmin', 'portero'],
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor"
        strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="2"/>
        <path d="M16.24 7.76a6 6 0 0 1 0 8.49m-8.48-.01a6 6 0 0 1 0-8.49m11.31-2.82a10 10 0 0 1 0 14.14m-14.14 0a10 10 0 0 1 0-14.14"/>
      </svg>
    ),
  },
  {
    label: 'Usuarios',
    href:  '/dashboard/configuracion/usuarios',
    roles: ['admin', 'director', 'sysadmin'],
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor"
        strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
        <circle cx="9" cy="7" r="4"/>
        <line x1="19" y1="8" x2="19" y2="14"/>
        <line x1="22" y1="11" x2="16" y2="11"/>
      </svg>
    ),
  },
] as const

// ─── Shell ────────────────────────────────────────────────────────────────────

export default async function DashboardShell({ children, activeHref }: ShellProps) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('user_profiles')
    .select('first_name, last_name, avatar_url, role, schools(name, active)')
    .eq('id', user.id)
    .single() as { data: ProfileRow | null }

  const role        = profile?.role ?? 'admin'
  const schoolName  = profile?.schools?.name ?? 'Mi Escuela'
  const schoolActive = profile?.schools?.active ?? true
  const userEmail  = user.email ?? ''
  const fullName   = [profile?.first_name, profile?.last_name].filter(Boolean).join(' ') || userEmail
  const initials   = (profile?.first_name?.[0] ?? userEmail[0] ?? 'U').toUpperCase()
  const avatarUrl  = profile?.avatar_url ?? null

  // Nav filtrado por rol
  const visibleNav = NAV_ITEMS.filter((item) =>
    (item.roles as readonly string[]).includes(role)
  )

  return (
    <>
      <style>{`
        .xk-shell   { display: flex; height: 100dvh; background: var(--color-xk-bg, #F7F6F3); overflow: hidden; }
        .xk-sidebar { width: 260px; flex-shrink: 0; background: #fff; border-right: 1px solid var(--color-xk-border, #E2DFD8); display: flex; flex-direction: column; overflow-y: auto; }
        .xk-main    { flex: 1; display: flex; flex-direction: column; overflow: hidden; min-width: 0; }
        .xk-content { flex: 1; overflow-y: auto; padding: 32px 28px 48px; }
        @media (max-width: 1023px) {
          .xk-sidebar { display: none; }
          .xk-content { padding: 20px 16px 40px; }
        }
      `}</style>

      <div className="xk-shell">

        {/* ── Sidebar ── */}
        <aside className="xk-sidebar">

          {/* Logo + escuela */}
          <div className="px-5 pt-7 pb-5 border-b border-xk-border bg-gradient-to-br from-xk-accent-light to-xk-card">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-xk-accent flex items-center justify-center shrink-0">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff"
                  strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
                  <polyline points="9 22 9 12 15 12 15 22"/>
                </svg>
              </div>
              <div>
                <p className="font-heading text-xl font-bold text-xk-accent leading-none">Xokai</p>
                <p className="text-[10px] text-xk-text-secondary uppercase tracking-wider mt-0.5">
                  {{
                    sysadmin: 'Sysadmin', admin: 'Admin', director: 'Directora',
                    teacher: 'Maestro', maestro: 'Maestro', portero: 'Portero',
                    coordinador: 'Coordinador', finanzas: 'Finanzas', guardian: 'Padre',
                  }[role] ?? 'Usuario'}
                </p>
              </div>
            </div>

            <div className="mt-3.5 px-2.5 py-1.5 bg-xk-card border border-xk-border rounded-lg flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-green-500 shrink-0" />
              <span className="text-[11px] text-xk-text font-medium truncate">{schoolName}</span>
            </div>
          </div>

          {/* Navegación */}
          <nav className="flex-1 px-3 py-4">
            <p className="text-[10px] font-semibold text-xk-text-muted uppercase tracking-widest px-3 mb-2">
              Navegación
            </p>
            <DashboardNav items={visibleNav} activeHref={activeHref} />
          </nav>

          {/* Footer sidebar */}
          <div className="px-5 py-3.5 border-t border-xk-border text-center">
            <p className="text-[11px] text-xk-text-muted">© {new Date().getFullYear()} Xokai · v0.2.0</p>
          </div>
        </aside>

        {/* ── Main ── */}
        <div className="xk-main">

          {/* Header */}
          <header className="h-16 shrink-0 bg-xk-card border-b border-xk-border flex items-center justify-between px-4 lg:px-6 z-10">
            <div className="flex items-center gap-2 lg:gap-3">
              <MobileNav items={visibleNav} schoolName={schoolName} />
              <span className="font-heading text-xl font-bold text-xk-accent">Xokai</span>
              <span className="hidden sm:flex items-center gap-1.5">
                <span className="w-px h-4 bg-xk-border" />
                <span className="text-sm text-xk-text-secondary font-medium">{schoolName}</span>
              </span>
            </div>

            <div className="flex items-center gap-3">
              <p className="hidden sm:block text-xs text-xk-text-secondary max-w-[180px] truncate">{fullName}</p>
              <a href="/dashboard/perfil" className="group flex items-center">
                {avatarUrl ? (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img
                    src={avatarUrl}
                    alt={fullName}
                    className="w-9 h-9 rounded-full object-cover border-2 border-xk-border group-hover:border-xk-accent-medium transition-colors"
                  />
                ) : (
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-xk-accent to-xk-accent-dark flex items-center justify-center text-sm font-bold text-white shadow-sm group-hover:shadow-md transition-shadow">
                    {initials}
                  </div>
                )}
              </a>
              <DashboardLogout />
            </div>
          </header>

          {/* Banner: escuela pendiente de aprobación */}
          {!schoolActive && role !== 'sysadmin' && (
            <div className="bg-amber-50 border-b border-amber-200 px-5 py-3 flex items-start gap-3">
              <span className="text-amber-500 text-lg leading-none mt-0.5">⏳</span>
              <div>
                <p className="text-sm font-semibold text-amber-800">Tu escuela está en revisión</p>
                <p className="text-xs text-amber-700 mt-0.5">
                  Estamos verificando tu solicitud. Mientras tanto puedes configurar alumnos, grupos y comunicados — todo estará listo cuando aprobemos tu cuenta.
                </p>
              </div>
            </div>
          )}

          {/* Contenido de la página */}
          <main className="xk-content">
            {children}
          </main>

        </div>
      </div>
    </>
  )
}
