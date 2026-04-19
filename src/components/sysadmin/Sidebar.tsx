'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { toast } from 'sonner'
import { LayoutDashboard, Building2, User, ChevronsLeft, ChevronsRight, type LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

export type SidebarItem = {
  label:       string
  href:        string
  icon:        LucideIcon
  badge?:      string | number
  badgeTone?:  'accent' | 'danger'
  comingSoon?: boolean
}

export type SidebarSection = {
  title?: string
  items:  SidebarItem[]
}

export const SYSADMIN_ITEMS: SidebarItem[] = [
  { label: 'Dashboard',  href: '/sysadmin',         icon: LayoutDashboard },
  { label: 'Escuelas',   href: '/sysadmin/schools', icon: Building2 },
  { label: 'Mi cuenta',  href: '/dashboard/perfil', icon: User },
]

type Props = {
  userName:   string
  userEmail:  string
  avatarUrl:  string | null
  initials:   string
  items?:     SidebarItem[]
  sections?:  SidebarSection[]
}

export default function Sidebar({ userName, userEmail, avatarUrl, initials, items, sections }: Props) {
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

  const resolvedSections: SidebarSection[] = sections
    ?? (items ? [{ items }] : [{ items: SYSADMIN_ITEMS }])

  const width = collapsed ? 'w-[68px]' : 'w-[232px]'

  function renderItem(item: SidebarItem) {
    const active = !item.comingSoon && (
      item.href === '/sysadmin'
        ? pathname === '/sysadmin'
        : pathname === item.href || pathname.startsWith(`${item.href}/`)
    )
    const Icon = item.icon

    const iconCn = cn(
      'w-[18px] h-[18px] shrink-0',
      active ? 'text-xk-accent' : 'text-xk-text-muted group-hover:text-xk-text',
    )

    const commonCn = cn(
      'group relative flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-[13px] font-medium transition-all',
      active
        ? 'bg-xk-accent-light text-xk-accent-dark'
        : 'text-xk-text-secondary hover:bg-xk-subtle hover:text-xk-text',
      collapsed && 'justify-center px-0',
      item.comingSoon && 'cursor-default',
    )

    const inner = (
      <>
        {active && (
          <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 rounded-r-full bg-xk-accent" />
        )}
        <Icon className={iconCn} />
        {!collapsed && <span className="truncate">{item.label}</span>}
        {/* Coming soon badge */}
        {!collapsed && item.comingSoon && (
          <span className="ml-auto text-[10px] font-medium text-xk-text-muted">
            Pronto
          </span>
        )}
        {/* Regular badge */}
        {!collapsed && !item.comingSoon && item.badge !== undefined && (
          <span className={cn(
            'ml-auto inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full text-[10px] font-semibold xk-num',
            item.badgeTone === 'danger'
              ? 'bg-red-500 text-white'
              : 'bg-xk-accent/10 text-xk-accent',
          )}>
            {item.badge}
          </span>
        )}
        {collapsed && item.badge !== undefined && item.badgeTone === 'danger' && !item.comingSoon && (
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-red-500" />
        )}
      </>
    )

    if (item.comingSoon) {
      return (
        <button
          key={item.label}
          type="button"
          title={collapsed ? `${item.label} (próximamente)` : undefined}
          onClick={() => toast('Próximamente disponible')}
          className={cn(commonCn, 'w-full text-left')}
        >
          {inner}
        </button>
      )
    }

    return (
      <Link
        key={item.href}
        href={item.href}
        title={collapsed ? item.label : undefined}
        className={commonCn}
      >
        {inner}
      </Link>
    )
  }

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
        {resolvedSections.map((section, si) => (
          <div key={si} className={si > 0 ? 'mt-4' : ''}>
            {section.title && !collapsed && (
              <p className="text-[10px] font-semibold text-xk-text-muted uppercase tracking-widest px-2.5 mb-1.5">
                {section.title}
              </p>
            )}
            <div className="space-y-0.5">
              {section.items.map(renderItem)}
            </div>
          </div>
        ))}
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
