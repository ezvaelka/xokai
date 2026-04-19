'use client'

import { useState, useEffect } from 'react'
import { createPortal }        from 'react-dom'
import { usePathname }         from 'next/navigation'
import Link                    from 'next/link'
import { Menu, X }             from 'lucide-react'
import { toast }               from 'sonner'
import { cn }                  from '@/lib/utils'

interface NavItem {
  label:       string
  href:        string
  exact?:      boolean
  icon:        React.ReactNode
  comingSoon?: boolean
}

export interface MobileNavSection {
  title?: string
  items:  NavItem[]
}

interface Props {
  items?:      NavItem[]
  sections?:   MobileNavSection[]
  schoolName?: string
}

export default function MobileNav({ items = [], sections, schoolName }: Props) {
  const pathname              = usePathname()
  const [open, setOpen]       = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => { setMounted(true) }, [])

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [open])

  useEffect(() => { setOpen(false) }, [pathname])

  function isActive(item: NavItem) {
    if (item.comingSoon || item.href === '#') return false
    if (item.exact) return pathname === item.href
    if (item.href === '/sysadmin') return pathname === '/sysadmin'
    return pathname === item.href || pathname.startsWith(item.href + '/')
  }

  const resolvedSections: MobileNavSection[] = sections ?? [{ items }]

  function renderItem(item: NavItem) {
    const active = isActive(item)

    const className = cn(
      'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors w-full text-left',
      active
        ? 'bg-xk-accent-light text-xk-accent-dark'
        : item.comingSoon
          ? 'text-xk-text-muted cursor-default'
          : 'text-xk-text-secondary hover:bg-xk-subtle hover:text-xk-text',
    )

    const inner = (
      <>
        <span className={cn('shrink-0', active ? 'text-xk-accent' : 'text-xk-text-muted')}>
          {item.icon}
        </span>
        <span className="flex-1 truncate">{item.label}</span>
        {item.comingSoon && (
          <span className="text-[10px] font-medium text-xk-text-muted shrink-0">Pronto</span>
        )}
        {active && (
          <span className="w-1.5 h-1.5 rounded-full bg-xk-accent shrink-0" />
        )}
      </>
    )

    if (item.comingSoon) {
      return (
        <button
          key={item.label}
          type="button"
          onClick={() => toast('Próximamente disponible')}
          className={className}
        >
          {inner}
        </button>
      )
    }

    return (
      <Link
        key={item.href}
        href={item.href}
        onClick={() => setOpen(false)}
        className={className}
      >
        {inner}
      </Link>
    )
  }

  const drawer = (
    <>
      <div
        className={cn(
          'fixed inset-0 z-40 bg-black/40 transition-opacity duration-300',
          open ? 'opacity-100' : 'opacity-0 pointer-events-none',
        )}
        onClick={() => setOpen(false)}
      />

      <div
        className={cn(
          'fixed top-0 left-0 bottom-0 z-50 w-[280px] bg-xk-surface border-r border-xk-border/70 shadow-2xl flex flex-col transition-transform duration-300 ease-out',
          open ? 'translate-x-0' : '-translate-x-full',
        )}
        style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
      >
        <div className="flex items-center justify-between px-4 py-4 border-b border-xk-border/60 h-[60px] shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-xk-accent to-xk-accent-dark flex items-center justify-center shrink-0 shadow-sm">
              <span className="text-white font-bold text-sm">X</span>
            </div>
            <div className="min-w-0">
              <p className="font-heading text-[15px] font-bold text-xk-text leading-none">Xokai</p>
              {schoolName && (
                <p className="text-[10px] text-xk-text-muted uppercase tracking-wider mt-0.5">{schoolName}</p>
              )}
            </div>
          </div>
          <button
            onClick={() => setOpen(false)}
            className="p-1.5 rounded-lg hover:bg-xk-subtle transition-colors"
            aria-label="Cerrar"
          >
            <X size={16} className="text-xk-text-secondary" />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto xk-scroll px-2.5 py-3">
          {resolvedSections.map((section, si) => (
            <div key={si} className={si > 0 ? 'mt-4' : ''}>
              {section.title && (
                <p className="text-[10px] font-semibold text-xk-text-muted uppercase tracking-widest px-3 mb-1.5">
                  {section.title}
                </p>
              )}
              <div className="space-y-0.5">
                {section.items.map((item) => (
                  <div key={item.comingSoon ? item.label : item.href}>
                    {renderItem(item)}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </nav>

        <div className="px-4 py-3 border-t border-xk-border/60 shrink-0">
          <p className="text-[11px] text-xk-text-muted text-center">© {new Date().getFullYear()} Xokai</p>
        </div>
      </div>
    </>
  )

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="lg:hidden p-2 -ml-1 rounded-lg hover:bg-xk-subtle transition-colors"
        aria-label="Abrir menú"
      >
        <Menu size={20} className="text-xk-text" />
      </button>

      {mounted && createPortal(drawer, document.body)}
    </>
  )
}
