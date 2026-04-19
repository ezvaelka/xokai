'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  LayoutDashboard, Users, FolderOpen, MessageSquare,
  CreditCard, FileText, Radio, UserPlus, Settings, User,
  GraduationCap, UsersRound,
  type LucideIcon,
} from 'lucide-react'
import Sidebar from './sysadmin/Sidebar'
import type { SidebarItem } from './sysadmin/Sidebar'
import Topbar from './sysadmin/Topbar'
import CommandPalette from './sysadmin/CommandPalette'
import { clearImpersonation } from '@/app/actions/impersonate'

// Nav items definidos en el cliente (los iconos no pueden cruzar el límite RSC)
const ALL_NAV: (SidebarItem & { roles: readonly string[] })[] = [
  { label: 'Dashboard',     href: '/dashboard',                        icon: LayoutDashboard, roles: ['admin', 'director', 'sysadmin', 'coordinador', 'finanzas'] },
  { label: 'Alumnos',       href: '/dashboard/alumnos',                icon: Users,           roles: ['admin', 'director', 'sysadmin', 'coordinador'] },
  { label: 'Grupos',        href: '/dashboard/grupos',                 icon: FolderOpen,      roles: ['admin', 'director', 'sysadmin', 'coordinador', 'maestro', 'teacher'] },
  { label: 'Maestros',      href: '/dashboard/maestros',               icon: GraduationCap,   roles: ['admin', 'director', 'sysadmin', 'coordinador'] },
  { label: 'Padres',        href: '/dashboard/padres',                 icon: UsersRound,      roles: ['admin', 'director', 'sysadmin', 'coordinador'] },
  { label: 'Comunicados',   href: '/dashboard/comunicados',            icon: MessageSquare,   roles: ['admin', 'director', 'sysadmin', 'coordinador', 'maestro', 'teacher'] },
  { label: 'Pagos',         href: '/dashboard/pagos',                  icon: CreditCard,      roles: ['admin', 'director', 'sysadmin', 'finanzas'] },
  { label: 'Documentos',    href: '/dashboard/documentos',             icon: FileText,        roles: ['admin', 'director', 'sysadmin'] },
  { label: 'Pickup',        href: '/dashboard/pickup',                 icon: Radio,           roles: ['admin', 'director', 'sysadmin', 'portero'] },
  { label: 'Usuarios',      href: '/dashboard/configuracion/usuarios', icon: UserPlus,        roles: ['admin', 'director', 'sysadmin'] },
  { label: 'Configuración', href: '/dashboard/configuracion',          icon: Settings,        roles: ['admin', 'director', 'sysadmin'] },
  { label: 'Perfil',        href: '/dashboard/perfil',                 icon: User,            roles: ['admin', 'director', 'sysadmin', 'coordinador', 'finanzas', 'maestro', 'teacher', 'portero'] },
]

type ImpersonatingData = {
  schoolId:   string
  schoolName: string
}

type Props = {
  userName:      string
  userEmail:     string
  avatarUrl:     string | null
  initials:      string
  schoolName:    string
  schoolActive:  boolean
  role:          string
  impersonating: ImpersonatingData | null
  children:      React.ReactNode
}

export default function DashboardShellClient({
  userName,
  userEmail,
  avatarUrl,
  initials,
  schoolName,
  schoolActive,
  role,
  impersonating,
  children,
}: Props) {
  const router = useRouter()
  const [cmdOpen, setCmdOpen] = useState(false)
  const [exitingImpersonation, setExitingImpersonation] = useState(false)

  // Filtrar nav por rol — hecho aquí en el cliente para evitar pasar funciones desde el server
  const items: SidebarItem[] = ALL_NAV
    .filter((item) => (item.roles as readonly string[]).includes(role))
    .map(({ label, href, icon }) => ({ label, href, icon } as SidebarItem))

  const mobileNavItems = items.slice(0, 5).map((item) => ({
    label: item.label,
    href:  item.href,
    icon:  <item.icon className="w-[18px] h-[18px]" />,
  }))

  useEffect(() => {
    function handler(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        setCmdOpen((v) => !v)
      } else if (e.key === 'Escape') {
        setCmdOpen(false)
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [])

  async function handleClearImpersonation() {
    setExitingImpersonation(true)
    try {
      await clearImpersonation()
    } catch {
      router.push('/sysadmin')
    }
  }

  const showPendingBanner = !schoolActive && !impersonating

  return (
    <div className="flex h-dvh bg-xk-bg overflow-hidden flex-col">
      {/* Banner de impersonación */}
      {impersonating && (
        <div className="shrink-0 bg-red-600 text-white px-4 py-2 flex items-center justify-between gap-3 z-50">
          <div className="flex items-center gap-2 min-w-0">
            <span className="text-base leading-none" aria-hidden>⚠️</span>
            <span className="text-xs font-semibold truncate">
              Modo soporte · {impersonating.schoolName}
            </span>
          </div>
          <button
            onClick={handleClearImpersonation}
            disabled={exitingImpersonation}
            className="shrink-0 inline-flex items-center gap-1 text-xs font-semibold underline hover:no-underline disabled:opacity-60 transition-opacity whitespace-nowrap"
          >
            {exitingImpersonation ? 'Saliendo…' : 'Salir →'}
          </button>
        </div>
      )}

      <div className="flex flex-1 min-h-0 overflow-hidden">
        <Sidebar
          userName={userName}
          userEmail={userEmail}
          avatarUrl={avatarUrl}
          initials={initials}
          items={items}
        />

        <div className="flex-1 flex flex-col min-w-0">
          <Topbar
            items={mobileNavItems}
            onOpenCommand={() => setCmdOpen(true)}
          />

          {/* Banner: escuela pendiente de aprobación */}
          {showPendingBanner && role !== 'sysadmin' && (
            <div className="shrink-0 bg-amber-50 border-b border-amber-200 px-5 py-3 flex items-start gap-3">
              <span className="text-amber-500 text-lg leading-none mt-0.5" aria-hidden>⏳</span>
              <div>
                <p className="text-sm font-semibold text-amber-800">Tu escuela está en revisión</p>
                <p className="text-xs text-amber-700 mt-0.5">
                  Estamos verificando tu solicitud. Mientras tanto puedes configurar alumnos, grupos y comunicados — todo estará listo cuando aprobemos tu cuenta.
                </p>
              </div>
            </div>
          )}

          <main className="flex-1 overflow-y-auto xk-scroll">
            <div className="max-w-[1320px] mx-auto px-4 lg:px-6 py-6 lg:py-8">
              {children}
            </div>
          </main>
        </div>
      </div>

      <CommandPalette open={cmdOpen} onOpenChange={setCmdOpen} />
    </div>
  )
}
