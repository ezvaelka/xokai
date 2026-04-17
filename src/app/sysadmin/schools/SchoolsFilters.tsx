'use client'

import { useRouter } from 'next/navigation'
import type { SchoolStatus } from '@/app/actions/sysadmin'
import { X } from 'lucide-react'

type Counts = { all: number; active: number; pending: number; onboarding: number; paused: number }

interface Props {
  currentStatus: SchoolStatus
  currentCity:   string
  cities:        string[]
  counts:        Counts
}

const STATUS_FILTERS = [
  { key: 'all' as SchoolStatus,        label: 'Todas' },
  { key: 'active' as SchoolStatus,     label: 'Activas' },
  { key: 'pending' as SchoolStatus,    label: 'Por aprobar' },
  { key: 'onboarding' as SchoolStatus, label: 'Onboarding' },
  { key: 'paused' as SchoolStatus,     label: 'Pausadas' },
]

export default function SchoolsFilters({ currentStatus, currentCity, cities, counts }: Props) {
  const router = useRouter()

  function go(status: SchoolStatus, city: string) {
    const p = new URLSearchParams()
    if (status !== 'all') p.set('status', status)
    if (city) p.set('city', city)
    router.push(`/sysadmin/schools${p.size > 0 ? `?${p.toString()}` : ''}`)
  }

  const hasFilters = currentStatus !== 'all' || currentCity !== ''

  return (
    <div className="flex flex-wrap items-center gap-3">
      {/* Status pills */}
      <div className="flex flex-wrap gap-1.5">
        {STATUS_FILTERS.map((f) => {
          const count = counts[f.key]
          const active = currentStatus === f.key
          return (
            <button
              key={f.key}
              onClick={() => go(f.key, currentCity)}
              className={[
                'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors',
                active
                  ? 'bg-xk-accent text-white border-transparent'
                  : 'bg-xk-surface text-xk-text-secondary border-xk-border/60 hover:bg-xk-subtle hover:text-xk-text',
              ].join(' ')}
            >
              {f.label}
              <span className={`min-w-[18px] h-[18px] px-1 rounded text-[10px] font-bold flex items-center justify-center ${active ? 'bg-white/20 text-white' : 'bg-xk-subtle text-xk-text-muted'}`}>
                {count}
              </span>
            </button>
          )
        })}
      </div>

      {/* Separator */}
      {cities.length > 0 && <div className="w-px h-5 bg-xk-border/60 hidden sm:block" />}

      {/* City chips */}
      {cities.length > 0 && (
        <div className="flex flex-wrap gap-1.5 items-center">
          {cities.map((city) => {
            const active = currentCity === city
            return (
              <button
                key={city}
                onClick={() => go(currentStatus, active ? '' : city)}
                className={[
                  'px-2.5 py-1 rounded-md text-xs font-medium border transition-colors',
                  active
                    ? 'bg-xk-accent/10 text-xk-accent border-xk-accent/30'
                    : 'bg-transparent text-xk-text-muted border-xk-border/50 hover:bg-xk-subtle hover:text-xk-text',
                ].join(' ')}
              >
                {city}
              </button>
            )
          })}
        </div>
      )}

      {/* Clear filters */}
      {hasFilters && (
        <button
          onClick={() => router.push('/sysadmin/schools')}
          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs text-red-600 border border-red-200/70 bg-red-50 hover:bg-red-100 transition-colors"
        >
          <X className="w-3 h-3" />
          Limpiar
        </button>
      )}
    </div>
  )
}
