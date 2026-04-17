'use client'

import { useEffect, useState } from 'react'
import { Search, LogOut, ArrowLeft } from 'lucide-react'
import { supabase } from '@/lib/supabase/client'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import MobileNav from '@/components/MobileNav'
import { cn } from '@/lib/utils'

type Props = {
  items: { label: string; href: string; icon: React.ReactNode }[]
  onOpenCommand?: () => void
}

export default function Topbar({ items, onOpenCommand }: Props) {
  const router = useRouter()
  const pathname = usePathname()
  const [mac, setMac] = useState(true)

  useEffect(() => {
    if (typeof navigator !== 'undefined') {
      setMac(/Mac|iPhone|iPad|iPod/.test(navigator.platform))
    }
  }, [])

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  const isSchoolDetail =
    pathname.startsWith('/sysadmin/schools/') &&
    pathname !== '/sysadmin/schools/new'

  return (
    <header className="h-[60px] shrink-0 bg-xk-surface/80 backdrop-blur-sm border-b border-xk-border/60 flex items-center justify-between px-4 lg:px-5 z-10">
      {/* Left: back button (on detail pages) + mobile nav + breadcrumb slot */}
      <div className="flex items-center gap-2 min-w-0">
        {isSchoolDetail && (
          <Link
            href="/sysadmin/schools"
            className="flex items-center gap-1 text-sm text-xk-text-secondary hover:text-xk-text p-1.5 rounded-lg hover:bg-xk-subtle transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline text-xs">Escuelas</span>
          </Link>
        )}
        <div className="lg:hidden">
          <MobileNav items={items} schoolName="Sysadmin" />
        </div>
        {!isSchoolDetail && (
          <span className="lg:hidden font-heading text-base font-bold text-xk-text">Xokai</span>
        )}
      </div>

      {/* Center: search/command palette trigger */}
      <div className="hidden md:flex flex-1 max-w-sm mx-6">
        <button
          onClick={onOpenCommand}
          className={cn(
            'w-full flex items-center gap-2 px-3 py-1.5 rounded-lg border border-xk-border/70 bg-xk-subtle/40 text-xs text-xk-text-muted',
            'hover:border-xk-border hover:bg-xk-subtle transition-colors',
          )}
        >
          <Search className="w-3.5 h-3.5" />
          <span>Buscar escuela, alumno, acción…</span>
          <span className="ml-auto inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded border border-xk-border bg-xk-card text-[10px] font-medium text-xk-text-secondary">
            {mac ? '⌘' : 'Ctrl'}K
          </span>
        </button>
      </div>

      {/* Right: logout */}
      <div className="flex items-center gap-1">
        <button
          onClick={onOpenCommand}
          className="md:hidden w-9 h-9 rounded-lg hover:bg-xk-subtle flex items-center justify-center text-xk-text-secondary"
          aria-label="Buscar"
        >
          <Search className="w-4 h-4" />
        </button>
        <button
          onClick={handleLogout}
          className="group inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs text-xk-text-secondary hover:bg-xk-subtle hover:text-xk-text transition-colors"
          title="Cerrar sesión"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Salir</span>
        </button>
      </div>
    </header>
  )
}
