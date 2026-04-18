'use client'

import { useState, useEffect }  from 'react'
import { createPortal }         from 'react-dom'
import { usePathname }          from 'next/navigation'
import Link                     from 'next/link'
import { Menu, X }              from 'lucide-react'

interface NavItem {
  label:  string
  href:   string
  exact?: boolean
  icon:   React.ReactNode
}

interface Props {
  items:      NavItem[]
  schoolName: string
}

export default function MobileNav({ items, schoolName }: Props) {
  const pathname = usePathname()
  const [open, setOpen]       = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => { setMounted(true) }, [])

  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [open])

  // Close drawer on route change
  useEffect(() => { setOpen(false) }, [pathname])

  function isActive(item: NavItem) {
    if (item.exact) return pathname === item.href
    return pathname === item.href || pathname.startsWith(item.href + '/')
  }

  const drawer = (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 z-40 bg-black/40 transition-opacity duration-300 ${open ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={() => setOpen(false)}
      />

      {/* Drawer panel */}
      <div
        className={`fixed top-0 left-0 bottom-0 z-50 w-[280px] bg-white shadow-2xl flex flex-col transition-transform duration-300 ease-out ${open ? 'translate-x-0' : '-translate-x-full'}`}
        style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-4 border-b border-gray-100 bg-xk-accent-light shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-xk-accent flex items-center justify-center shrink-0">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
                <polyline points="9 22 9 12 15 12 15 22"/>
              </svg>
            </div>
            <div>
              <p className="text-base font-bold text-xk-accent leading-none">Xokai</p>
              <p className="text-[11px] text-xk-text-secondary mt-0.5">{schoolName}</p>
            </div>
          </div>
          <button
            onClick={() => setOpen(false)}
            className="p-1.5 rounded-lg hover:bg-white/60 transition-colors"
            aria-label="Cerrar"
          >
            <X size={16} className="text-xk-text-secondary" />
          </button>
        </div>

        {/* Nav items */}
        <nav className="flex-1 overflow-y-auto px-2 py-3">
          {items.map((item) => {
            const active = isActive(item)
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className={[
                  'flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium transition-colors mb-0.5',
                  active
                    ? 'bg-xk-accent text-white'
                    : 'text-gray-700 hover:bg-gray-100',
                ].join(' ')}
              >
                <span className={active ? 'text-white' : 'text-gray-400'}>
                  {item.icon}
                </span>
                {item.label}
              </Link>
            )
          })}
        </nav>

        <div className="px-4 py-3 border-t border-gray-100 shrink-0">
          <p className="text-[11px] text-gray-400 text-center">© {new Date().getFullYear()} Xokai</p>
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
