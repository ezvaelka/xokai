'use client'

import { useEffect, useState, useMemo } from 'react'
import Sidebar, { type SidebarSection } from './Sidebar'
import Topbar from './Topbar'
import CommandPalette from './CommandPalette'
import { Building2, LayoutDashboard, User, Users, DollarSign, Settings } from 'lucide-react'

type Props = {
  userName:  string
  userEmail: string
  avatarUrl: string | null
  initials:  string
  pendingSchools?: number
  children:  React.ReactNode
}

const MOBILE_NAV_ITEMS = [
  {
    label: 'Dashboard',
    href:  '/sysadmin',
    exact: true,
    icon: <LayoutDashboard className="w-[18px] h-[18px]" />,
  },
  {
    label: 'Escuelas',
    href:  '/sysadmin/schools',
    icon: <Building2 className="w-[18px] h-[18px]" />,
  },
  {
    label: 'Mi cuenta',
    href:  '/dashboard/perfil',
    icon: <User className="w-[18px] h-[18px]" />,
  },
]

export default function ShellClient({ userName, userEmail, avatarUrl, initials, pendingSchools = 0, children }: Props) {
  const [cmdOpen, setCmdOpen] = useState(false)

  const sidebarSections = useMemo<SidebarSection[]>(() => [
    {
      title: 'Plataforma',
      items: [
        { label: 'Dashboard', href: '/sysadmin',         icon: LayoutDashboard },
        {
          label:    'Escuelas',
          href:     '/sysadmin/schools',
          icon:     Building2,
          ...(pendingSchools > 0 ? { badge: pendingSchools, badgeTone: 'danger' as const } : {}),
        },
        { label: 'Usuarios', href: '#', icon: Users,      comingSoon: true },
        { label: 'Revenue',  href: '#', icon: DollarSign, comingSoon: true },
        { label: 'Sistema',  href: '#', icon: Settings,   comingSoon: true },
      ],
    },
    {
      title: 'Cuenta',
      items: [
        { label: 'Mi cuenta', href: '/dashboard/perfil', icon: User },
      ],
    },
  ], [pendingSchools])

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

  return (
    <div className="flex h-dvh bg-xk-bg overflow-hidden">
      <Sidebar
        userName={userName}
        userEmail={userEmail}
        avatarUrl={avatarUrl}
        initials={initials}
        sections={sidebarSections}
      />

      <div className="flex-1 flex flex-col min-w-0">
        <Topbar items={MOBILE_NAV_ITEMS} onOpenCommand={() => setCmdOpen(true)} />
        <main className="flex-1 overflow-y-auto xk-scroll">
          <div className="max-w-[1600px] mx-auto w-full px-4 lg:px-6 py-6 lg:py-8">
            {children}
          </div>
        </main>
      </div>

      <CommandPalette open={cmdOpen} onOpenChange={setCmdOpen} />
    </div>
  )
}
