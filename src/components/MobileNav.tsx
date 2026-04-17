'use client'

import { useState }    from 'react'
import { usePathname } from 'next/navigation'
import Link            from 'next/link'
import { Menu, X }     from 'lucide-react'

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
  const [open, setOpen] = useState(false)

  function isActive(item: NavItem) {
    if (item.exact) return pathname === item.href
    return pathname === item.href || pathname.startsWith(item.href + '/')
  }

  return (
    <>
      {/* Hamburger button — solo visible en mobile */}
      <button
        onClick={() => setOpen(true)}
        className="lg:hidden p-2 -ml-1 rounded-xl hover:bg-xk-subtle transition-colors"
        aria-label="Abrir menú"
      >
        <Menu size={22} className="text-xk-text" />
      </button>

      {/* Overlay */}
      {open && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/50 lg:hidden"
            onClick={() => setOpen(false)}
          />

          {/* Drawer */}
          <div className="fixed inset-y-0 left-0 z-50 w-72 bg-white border-r border-xk-border flex flex-col lg:hidden shadow-2xl">

            {/* Header del drawer */}
            <div className="px-5 pt-5 pb-4 border-b border-xk-border bg-gradient-to-br from-xk-accent-light to-xk-card flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-xk-accent flex items-center justify-center shrink-0">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff"
                    strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
                    <polyline points="9 22 9 12 15 12 15 22"/>
                  </svg>
                </div>
                <div className="min-w-0">
                  <p className="font-heading text-xl font-bold text-xk-accent leading-none">Xokai</p>
                  <p className="text-xs text-xk-text-secondary truncate max-w-[140px] mt-0.5">{schoolName}</p>
                </div>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="p-1.5 rounded-lg hover:bg-xk-subtle transition-colors shrink-0"
                aria-label="Cerrar menú"
              >
                <X size={18} className="text-xk-text-muted" />
              </button>
            </div>

            {/* Items de navegación */}
            <nav className="flex-1 px-3 py-4 overflow-y-auto">
              <p className="text-[10px] font-semibold text-xk-text-muted uppercase tracking-widest px-3 mb-2">
                Navegación
              </p>
              <div className="space-y-0.5">
                {items.map((item) => {
                  const active = isActive(item)
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setOpen(false)}
                      className={[
                        'flex items-center gap-2.5 px-3 py-3 rounded-xl text-sm font-medium transition-all',
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
            </nav>

            {/* Footer */}
            <div className="px-5 py-3 border-t border-xk-border shrink-0">
              <p className="text-[11px] text-xk-text-muted text-center">© {new Date().getFullYear()} Xokai · v0.2.0</p>
            </div>
          </div>
        </>
      )}
    </>
  )
}
