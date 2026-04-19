import { redirect } from 'next/navigation'
import { cookies }  from 'next/headers'
import { createClient } from '@/lib/supabase/server'
import {
  LayoutDashboard,
  Users,
  FolderOpen,
  MessageSquare,
  CreditCard,
  FileText,
  Radio,
  UserPlus,
  Settings,
  User,
} from 'lucide-react'
import type { SidebarItem } from '@/components/sysadmin/Sidebar'
import DashboardShellClient from '@/components/DashboardShellClient'

// ─── Tipos ───────────────────────────────────────────────────────────────────

interface ShellProps {
  children:    React.ReactNode
  /** @deprecated Ignorado — el Sidebar detecta la ruta activa via usePathname() */
  activeHref?: string
}

interface ImpersonatingData {
  schoolId:   string
  schoolName: string
}

// ─── Nav items ────────────────────────────────────────────────────────────────

const NAV_ITEMS: (SidebarItem & { roles: readonly string[] })[] = [
  {
    label: 'Dashboard',
    href:  '/dashboard',
    icon:  LayoutDashboard,
    roles: ['admin', 'director', 'sysadmin', 'coordinador', 'finanzas'],
  },
  {
    label: 'Alumnos',
    href:  '/dashboard/alumnos',
    icon:  Users,
    roles: ['admin', 'director', 'sysadmin', 'coordinador'],
  },
  {
    label: 'Grupos',
    href:  '/dashboard/grupos',
    icon:  FolderOpen,
    roles: ['admin', 'director', 'sysadmin', 'coordinador', 'maestro', 'teacher'],
  },
  {
    label: 'Comunicados',
    href:  '/dashboard/comunicados',
    icon:  MessageSquare,
    roles: ['admin', 'director', 'sysadmin', 'coordinador', 'maestro', 'teacher'],
  },
  {
    label: 'Pagos',
    href:  '/dashboard/pagos',
    icon:  CreditCard,
    roles: ['admin', 'director', 'sysadmin', 'finanzas'],
  },
  {
    label: 'Documentos',
    href:  '/dashboard/documentos',
    icon:  FileText,
    roles: ['admin', 'director', 'sysadmin'],
  },
  {
    label: 'Pickup',
    href:  '/dashboard/pickup',
    icon:  Radio,
    roles: ['admin', 'director', 'sysadmin', 'portero'],
  },
  {
    label: 'Usuarios',
    href:  '/dashboard/configuracion/usuarios',
    icon:  UserPlus,
    roles: ['admin', 'director', 'sysadmin'],
  },
  {
    label: 'Configuración',
    href:  '/dashboard/configuracion',
    icon:  Settings,
    roles: ['admin', 'director', 'sysadmin'],
  },
  {
    label: 'Perfil',
    href:  '/dashboard/perfil',
    icon:  User,
    roles: ['admin', 'director', 'sysadmin', 'coordinador', 'finanzas', 'maestro', 'teacher', 'portero'],
  },
]

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

  // Nav filtrado por rol
  const visibleNav: SidebarItem[] = NAV_ITEMS
    .filter((item) => (item.roles as readonly string[]).includes(role))
    .map(({ label, href, icon, badge }) => ({ label, href, icon, badge }))

  return (
    <DashboardShellClient
      userName={fullName}
      userEmail={userEmail}
      avatarUrl={avatarUrl}
      initials={initials}
      schoolName={schoolName}
      schoolActive={schoolActive}
      role={role}
      items={visibleNav}
      impersonating={impersonating}
    >
      {children}
    </DashboardShellClient>
  )
}
