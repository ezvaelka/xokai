import { redirect }       from 'next/navigation'
import { createClient }   from '@/lib/supabase/server'
import DashboardLogout    from '@/components/DashboardLogout'
import SysadminNav        from '@/components/SysadminNav'

interface ShellProps {
  children:   React.ReactNode
  activeHref?: string
}

export const SYSADMIN_NAV = [
  {
    label: 'Escuelas',
    href:  '/sysadmin/schools',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor"
        strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
        <polyline points="9 22 9 12 15 12 15 22"/>
      </svg>
    ),
  },
  {
    label: 'Mi cuenta',
    href:  '/dashboard/perfil',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor"
        strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
        <circle cx="12" cy="7" r="4"/>
      </svg>
    ),
  },
] as const

export default async function SysadminShell({ children, activeHref }: ShellProps) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('user_profiles')
    .select('first_name, last_name, avatar_url, role')
    .eq('id', user.id)
    .single()

  if (!profile || profile.role !== 'sysadmin') redirect('/dashboard')

  const userEmail = user.email ?? ''
  const fullName  = [profile.first_name, profile.last_name].filter(Boolean).join(' ') || userEmail
  const initials  = (profile.first_name?.[0] ?? userEmail[0] ?? 'S').toUpperCase()
  const avatarUrl = profile.avatar_url ?? null

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
        <aside className="xk-sidebar">
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
                  Panel Global
                </p>
              </div>
            </div>

            <div className="mt-3.5 px-2.5 py-1.5 bg-xk-card border border-xk-border rounded-lg flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-green-500 shrink-0" />
              <span className="text-[11px] text-xk-text font-medium truncate">Sysadmin</span>
            </div>
          </div>

          <nav className="flex-1 px-3 py-4">
            <p className="text-[10px] font-semibold text-xk-text-muted uppercase tracking-widest px-3 mb-2">
              Navegación
            </p>
            <SysadminNav items={SYSADMIN_NAV} activeHref={activeHref} />
          </nav>

          <div className="px-5 py-3.5 border-t border-xk-border text-center">
            <p className="text-[11px] text-xk-text-muted">© {new Date().getFullYear()} Xokai · Sysadmin</p>
          </div>
        </aside>

        <div className="xk-main">
          <header className="h-16 shrink-0 bg-xk-card border-b border-xk-border flex items-center justify-between px-4 lg:px-6 z-10">
            <div className="flex items-center gap-2 lg:gap-3">
              <span className="font-heading text-xl font-bold text-xk-accent">Xokai</span>
              <span className="hidden sm:flex items-center gap-1.5">
                <span className="w-px h-4 bg-xk-border" />
                <span className="text-sm text-xk-text-secondary font-medium">Sysadmin</span>
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
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-xk-accent to-xk-accent-dark flex items-center justify-center text-sm font-bold text-white shadow-sm">
                    {initials}
                  </div>
                )}
              </a>
              <DashboardLogout />
            </div>
          </header>

          <main className="xk-content">{children}</main>
        </div>
      </div>
    </>
  )
}
