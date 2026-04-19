import { redirect } from 'next/navigation'
import { cookies }  from 'next/headers'
import { createClient } from '@/lib/supabase/server'
import DashboardShellClient from '@/components/DashboardShellClient'

// ─── Tipos ───────────────────────────────────────────────────────────────────

interface ShellProps {
  children:    React.ReactNode
  activeHref?: string
}

interface ImpersonatingData {
  schoolId:   string
  schoolName: string
}

// ─── Shell ────────────────────────────────────────────────────────────────────

export default async function DashboardShell({ children }: ShellProps) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('user_profiles')
    .select('first_name, last_name, avatar_url, role, school_id')
    .eq('id', user.id)
    .single()

  const profileData = profile as {
    first_name: string | null
    last_name:  string | null
    avatar_url: string | null
    role:       string
    school_id:  string | null
  } | null

  const role      = profileData?.role ?? 'admin'
  const userEmail = user.email ?? ''
  const fullName  = [profileData?.first_name, profileData?.last_name].filter(Boolean).join(' ') || userEmail
  const initials  = (profileData?.first_name?.[0] ?? userEmail[0] ?? 'U').toUpperCase()
  const avatarUrl = profileData?.avatar_url ?? null

  let schoolName   = 'Mi Escuela'
  let schoolActive = true
  if (profileData?.school_id) {
    const { data: school } = await supabase
      .from('schools')
      .select('name, active')
      .eq('id', profileData.school_id)
      .single()
    schoolName   = (school as { name: string; active: boolean } | null)?.name   ?? 'Mi Escuela'
    schoolActive = (school as { name: string; active: boolean } | null)?.active ?? true
  }

  // Leer cookie de impersonación
  const cookieStore = await cookies()
  const impersonCookie = cookieStore.get('xokai-impersonating')
  let impersonating: ImpersonatingData | null = null
  if (impersonCookie?.value) {
    try {
      impersonating = JSON.parse(impersonCookie.value) as ImpersonatingData
    } catch {
      impersonating = null
    }
  }

  // Nombre de escuela: impersonación tiene prioridad
  if (impersonating?.schoolName) schoolName = impersonating.schoolName

  return (
    <DashboardShellClient
      userName={fullName}
      userEmail={userEmail}
      avatarUrl={avatarUrl}
      initials={initials}
      schoolName={schoolName}
      schoolActive={schoolActive}
      role={role}
      impersonating={impersonating}
    >
      {children}
    </DashboardShellClient>
  )
}
