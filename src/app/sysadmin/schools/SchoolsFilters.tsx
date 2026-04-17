'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import type { SchoolStatus } from '@/app/actions/sysadmin'

const FILTERS: Array<{ key: SchoolStatus; label: string }> = [
  { key: 'all',        label: 'Todas' },
  { key: 'active',     label: 'Activas' },
  { key: 'onboarding', label: 'En onboarding' },
  { key: 'paused',     label: 'Pausadas' },
]

interface Props {
  currentStatus: SchoolStatus
  currentCity:   string
  cities:        string[]
}

export default function SchoolsFilters({ currentStatus, currentCity, cities }: Props) {
  const router = useRouter()
  const params = useSearchParams()

  function buildUrl(status: SchoolStatus, city: string) {
    const p = new URLSearchParams()
    if (status !== 'all') p.set('status', status)
    if (city)             p.set('city', city)
    return `/sysadmin/schools${p.size > 0 ? `?${p.toString()}` : ''}`
  }

  const hasFilters = currentStatus !== 'all' || currentCity !== ''

  return (
    <div className="space-y-3 mb-5">
      {/* Status pills */}
      <div className="flex flex-wrap gap-2">
        {FILTERS.map((f) => {
          const active = currentStatus === f.key
          return (
            <button
              key={f.key}
              onClick={() => router.push(buildUrl(f.key, currentCity))}
              className={[
                'px-3.5 py-1.5 rounded-full text-xs font-medium border transition-colors',
                active
                  ? 'bg-xk-accent text-white border-xk-accent'
                  : 'bg-xk-card text-xk-text-secondary border-xk-border hover:bg-xk-subtle',
              ].join(' ')}
            >
              {f.label}
            </button>
          )
        })}
      </div>

      {/* Ciudad + Eliminar filtros */}
      {cities.length > 0 && (
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs text-xk-text-muted font-medium">Ciudad:</span>
          {cities.map((city) => {
            const active = currentCity === city
            return (
              <button
                key={city}
                onClick={() => router.push(buildUrl(currentStatus, active ? '' : city))}
                className={[
                  'px-3 py-1 rounded-full text-xs font-medium border transition-colors',
                  active
                    ? 'bg-xk-accent text-white border-xk-accent'
                    : 'bg-xk-card text-xk-text-secondary border-xk-border hover:bg-xk-subtle',
                ].join(' ')}
              >
                {city}
              </button>
            )
          })}

          {hasFilters && (
            <button
              onClick={() => router.push('/sysadmin/schools')}
              className="px-3 py-1 rounded-full text-xs font-medium text-red-600 border border-red-200 bg-red-50 hover:bg-red-100 transition-colors"
            >
              Eliminar filtros
            </button>
          )}
        </div>
      )}

      {/* Eliminar filtros cuando no hay ciudades pero sí hay filtro de status */}
      {cities.length === 0 && hasFilters && (
        <button
          onClick={() => router.push('/sysadmin/schools')}
          className="px-3 py-1 rounded-full text-xs font-medium text-red-600 border border-red-200 bg-red-50 hover:bg-red-100 transition-colors"
        >
          Eliminar filtros
        </button>
      )}
    </div>
  )
}
