'use client'

import { useEffect, useState } from 'react'
import { Command } from 'cmdk'
import { useRouter } from 'next/navigation'
import { Building2, Home, Plus, User } from 'lucide-react'
import { getSchoolsForSearch } from '@/app/actions/sysadmin'

type Props = {
  open:   boolean
  onOpenChange: (open: boolean) => void
}

const ITEMS = [
  { label: 'Dashboard',          hint: 'Métricas globales', href: '/sysadmin',              icon: Home },
  { label: 'Escuelas',           hint: 'Lista de escuelas', href: '/sysadmin/schools',      icon: Building2 },
  { label: 'Nueva escuela',      hint: 'Registrar escuela', href: '/sysadmin/schools/new',  icon: Plus },
  { label: 'Mi cuenta',          hint: 'Perfil',            href: '/dashboard/perfil',      icon: User },
] as const

const GROUP_CLASS = '[&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:pt-2 [&_[cmdk-group-heading]]:pb-1 [&_[cmdk-group-heading]]:text-[10px] [&_[cmdk-group-heading]]:uppercase [&_[cmdk-group-heading]]:tracking-wider [&_[cmdk-group-heading]]:text-xk-text-muted [&_[cmdk-group-heading]]:font-semibold'

export default function CommandPalette({ open, onOpenChange }: Props) {
  const router = useRouter()
  const [query, setQuery] = useState('')
  const [schools, setSchools] = useState<Array<{ id: string; name: string; city: string | null }>>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (open && schools.length === 0) {
      setLoading(true)
      getSchoolsForSearch()
        .then(data => { setSchools(data); setLoading(false) })
        .catch(() => setLoading(false))
    }
    if (!open) setQuery('')
  }, [open]) // eslint-disable-line react-hooks/exhaustive-deps

  function go(href: string) {
    onOpenChange(false)
    router.push(href)
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-24 px-4" onClick={() => onOpenChange(false)}>
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" />
      <div
        className="relative w-full max-w-lg xk-surface-elevated shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <Command label="Command palette" className="flex flex-col">
          <Command.Input
            value={query}
            onValueChange={setQuery}
            placeholder="Buscar escuela, comando…"
            className="w-full px-4 py-3.5 text-sm bg-transparent border-b border-xk-border/60 outline-none placeholder:text-xk-text-muted"
          />
          <Command.List className="max-h-[360px] overflow-y-auto xk-scroll p-2">
            <Command.Empty className="py-8 text-center text-xs text-xk-text-muted">
              Sin resultados.
            </Command.Empty>

            {/* Navigation */}
            <Command.Group heading="Navegación" className={GROUP_CLASS}>
              {ITEMS.map((item) => {
                const Icon = item.icon
                return (
                  <Command.Item
                    key={item.href}
                    value={`${item.label} ${item.hint}`}
                    onSelect={() => go(item.href)}
                    className="flex items-center gap-3 px-2.5 py-2 rounded-md text-sm cursor-pointer data-[selected=true]:bg-xk-subtle"
                  >
                    <Icon className="w-4 h-4 text-xk-text-muted" />
                    <span className="text-xk-text">{item.label}</span>
                    <span className="ml-auto text-[11px] text-xk-text-muted">{item.hint}</span>
                  </Command.Item>
                )
              })}
            </Command.Group>

            {/* Schools */}
            {schools.length > 0 && (
              <Command.Group heading="Escuelas" className={GROUP_CLASS}>
                {schools.map(school => (
                  <Command.Item
                    key={school.id}
                    value={`${school.name} ${school.city ?? ''}`}
                    onSelect={() => go(`/sysadmin/schools/${school.id}`)}
                    className="flex items-center gap-3 px-2.5 py-2 rounded-md text-sm cursor-pointer data-[selected=true]:bg-xk-subtle"
                  >
                    <Building2 className="w-4 h-4 text-xk-text-muted shrink-0" />
                    <div className="min-w-0">
                      <p className="text-xk-text truncate">{school.name}</p>
                      {school.city && <p className="text-[11px] text-xk-text-muted">{school.city}</p>}
                    </div>
                    <span className="ml-auto text-[11px] text-xk-text-muted shrink-0">Ver detalle</span>
                  </Command.Item>
                ))}
              </Command.Group>
            )}

            {loading && (
              <div className="py-4 text-center text-xs text-xk-text-muted">Cargando escuelas…</div>
            )}
          </Command.List>
        </Command>
      </div>
    </div>
  )
}
