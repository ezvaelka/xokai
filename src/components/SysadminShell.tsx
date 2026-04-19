import { redirect }     from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import ShellClient      from '@/components/sysadmin/ShellClient'

interface ShellProps {
  children:   React.ReactNode
  activeHref?: string
}

// Legacy nav items kept for components that still import SYSADMIN_NAV
// New shell uses SYSADMIN_ITEMS from './sysadmin/Sidebar' with lucide icons.
export const SYSADMIN_NAV = [
  {
    label: 'Dashboard',
    href:  '/sysadmin',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor"
        strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="7" height="7" rx="1"/>
        <rect x="14" y="3" width="7" height="7" rx="1"/>
        <rect x="3" y="14" width="7" height="7" rx="1"/>
        <rect x="14" y="14" width="7" height="7" rx="1"/>
      </svg>
    ),
  },
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

export default async function SysadminShell({ children }: ShellProps) {
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

  // Count pending schools for sidebar badge
  const { count: pendingCount } = await supabase
    .from('schools')
    .select('id', { count: 'exact', head: true })
    .eq('active', false)
    .eq('onboarding_completed', true)

  return (
    <ShellClient
      userName={fullName}
      userEmail={userEmail}
      avatarUrl={avatarUrl}
      initials={initials}
      pendingSchools={pendingCount ?? 0}
    >
      {children}
    </ShellClient>
  )
}
