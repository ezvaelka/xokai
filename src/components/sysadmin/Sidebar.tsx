'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, Building2, User, ChevronsLeft, ChevronsRight, type LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

export type SidebarItem = {
  label: string
  href:  string
  icon:  LucideIcon
  badge?: string | number
}

export const SYSADMIN_ITEMS: SidebarItem[] = [
  { label: 'Dashboard',  href: '/sysadmin',         icon: LayoutDashboard },
  { label: 'Escuelas',   href: '/sysadmin/schools', icon: Building2 },
  { label: 'Mi cuenta',  href: '/dashboard/perfil', icon: User },
]

type Props = {
  userName:    string
  userEmail:   string
  avatarUrl:   string | null
  initials:    string
  items?:      SidebarItem[]
}

export default function Sidebar({ userName, userEmail, avatarUrl, initials, items = SYSADMIN_ITEMS }: Props) {
  const pathname = usePathname()
  const [collapsed, setCollapsed] = useState<boolean>(false)

  useEffect(() => {
    const stored = typeof window !== 'undefined' ? localStorage.getItem('xk-sidebar-collapsed') : null
    if (stored === '1') setCollapsed(true)
  }, [])

  function toggle() {
    const next = !collapsed
    setCollapsed(next)
    if (typeof window !== 'undefined') localStorage.setItem('xk-sidebar-collapsed', next ? '1' : '0')
  }

  const width = collapsed ? 'w-[68px]' : 'w-[232px]'

  return (
    <aside
      className={cn(
        'hidden lg:flex shrink-0 flex-col h-dvh bg-xk-surface border-r border-xk-border/70 transition-[width] duration-200',
        width,
      )}
    >
      {/* Logo */}
      <div className={cn('flex items-center gap-2.5 px-4 py-4 border-b border-xk-border/60 h-[60px]', collapsed && 'justify-center px-2')}>
        <Link href="/sysadmin" className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-xk-accent to-xk-accent-dark flex items-center justify-center shrink-0 shadow-sm">
            <span className="text-white font-bold text-sm">X</span>
          </div>
          {!collapsed && (
            <div className="min-w-0">
              <p className="font-heading text-[15px] font-bold text-xk-text leading-none">Xokai</p>
              <p className="text-[10px] text-xk-text-muted uppercase tracking-wider mt-0.5">Admin global</p>
            </div>
          )}
        </Link>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-2.5 py-3 overflow-y-auto xk-scroll">
        {!collapsed && (
          <p className="text-[10px] font-semibold text-xk-text-muted uppercase tracking-widest px-2.5 mb-1.5">
            Plataforma
          </p>
        )}
        <div className="space-y-0.5">
          {items.map((item) => {
            const active = item.href === '/sysadmin'
              ? pathname === '/sysadmin'
              : pathname === item.href || pathname.startsWith(`${item.href}/`)
            const Icon = item.icon
            return (
              <Link
                key={item.href}
                href={item.href}
                title={collapsed ? item.label : undefined}
                className={cn(
                  'group relative flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-[13px] font-medium transition-all',
                  active
                    ? 'bg-xk-accent-light text-xk-accent-dark'
                    : 'text-xk-text-secondary hover:bg-xk-subtle hover:text-xk-text',
                  collapsed && 'justify-center px-0',
                )}
              >
                {active && (
                  <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 rounded-r-full bg-xk-accent" />
                )}
                <Icon className={cn('w-[18px] h-[18px] shrink-0', active ? 'text-xk-accent' : 'text-xk-text-muted group-hover:text-xk-text')} />
                {!collapsed && <span className="truncate">{item.label}</span>}
                {!collapsed && item.badge !== undefined && (
                  <span className="ml-auto inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full bg-xk-accent/10 text-xk-accent text-[10px] font-semibold xk-num">
                    {item.badge}
                  </span>
                )}
              </Link>
            )
          })}
        </div>
      </nav>

      {/* User chip */}
      <div className="p-2.5 border-t border-xk-border/60">
        <Link
          href="/dashboard/perfil"
          className={cn(
            'flex items-center gap-2.5 px-2 py-1.5 rounded-lg hover:bg-xk-subtle transition-colors group',
            collapsed && 'justify-center px-0',
          )}
          title={collapsed ? userName : undefined}
        >
          {avatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={avatarUrl} alt={userName} className="w-8 h-8 rounded-full object-cover border border-xk-border shrink-0" />
          ) : (
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-xk-accent to-xk-accent-dark flex items-center justify-center text-xs font-bold text-white shrink-0">
              {initials}
            </div>
          )}
          {!collapsed && (
            <div className="min-w-0 flex-1">
              <p className="text-xs font-medium text-xk-text truncate leading-tight">{userName}</p>
              <p className="text-[10px] text-xk-text-muted truncate leading-tight">{userEmail}</p>
            </div>
          )}
        </Link>

        <button
          onClick={toggle}
          className={cn(
            'mt-2 w-full flex items-center justify-center gap-1.5 px-2 py-1.5 rounded-lg text-[11px] text-xk-text-muted hover:bg-xk-subtle hover:text-xk-text transition-colors',
          )}
        >
          {collapsed ? <ChevronsRight className="w-3.5 h-3.5" /> : (
            <>
              <ChevronsLeft className="w-3.5 h-3.5" />
              <span>Colapsar</span>
            </>
          )}
        </button>
      </div>
    </aside>
  )
}
