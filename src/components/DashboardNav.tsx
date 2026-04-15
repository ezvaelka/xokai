'use client'

import { usePathname } from 'next/navigation'
import Link from 'next/link'

interface NavItem {
  label: string
  href:  string
  exact?: boolean
  icon:  React.ReactNode
}

interface DashboardNavProps {
  items:      NavItem[]
  activeHref?: string
}

export default function DashboardNav({ items, activeHref }: DashboardNavProps) {
  const pathname = usePathname()

  function isActive(item: NavItem) {
    if (activeHref) return activeHref === item.href
    if (item.exact)  return pathname === item.href
    return pathname === item.href || pathname.startsWith(`${item.href}/`)
  }

  return (
    <div className="space-y-0.5">
      {items.map((item) => {
        const active = isActive(item)
        return (
          <Link
            key={item.href}
            href={item.href}
            className={[
              'flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium transition-all',
              active
                ? 'bg-xk-accent-light text-xk-accent font-semibold'
                : 'text-xk-text-secondary hover:bg-xk-subtle hover:text-xk-text',
            ].join(' ')}
          >
            <span className={active ? 'text-xk-accent' : 'text-current opacity-60'}>
              {item.icon}
            </span>
            {item.label}
          </Link>
        )
      })}
    </div>
  )
}
