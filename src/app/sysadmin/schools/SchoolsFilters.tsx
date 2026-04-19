'use client'

import { useRouter } from 'next/navigation'
import type { ClassifyStatus } from '@/app/actions/sysadmin'
import type { SchoolPlan } from '@/lib/sysadmin-constants'
import { MX_STATES, LATAM_COUNTRIES } from '@/lib/school-locations'

const STATUS_TABS: Array<{ key: ClassifyStatus | 'all'; label: string }> = [
  { key: 'all',        label: 'Todas' },
  { key: 'active',     label: 'Activas' },
  { key: 'pending',    label: 'Por aprobar' },
  { key: 'onboarding', label: 'Onboarding' },
  { key: 'paused',     label: 'Pausadas' },
]

const PLAN_TABS: Array<{ key: SchoolPlan | ''; label: string }> = [
  { key: '',            label: 'Todos los planes' },
  { key: 'trial',       label: 'Trial' },
  { key: 'base',        label: 'Base' },
  { key: 'base_pickup', label: 'Base+Pickup' },
  { key: 'suspended',   label: 'Suspendida' },
  { key: 'churned',     label: 'Churned' },
]

interface Props {
  currentStatus: ClassifyStatus | 'all'
  currentState:  string
  currentPlan:   SchoolPlan | ''
  statusCounts:  Partial<Record<ClassifyStatus | 'all', number>>
  planCounts:    Partial<Record<SchoolPlan | '', number>>
}

export default function SchoolsFilters({
  currentStatus, currentState, currentPlan, statusCounts, planCounts,
}: Props) {
  const router = useRouter()

  function buildUrl(status: ClassifyStatus | 'all', state: string, plan: SchoolPlan | '') {
    const p = new URLSearchParams()
    if (status !== 'all') p.set('status', status)
    if (state)            p.set('state', state)
    if (plan)             p.set('plan', plan)
    return `/sysadmin/schools${p.size > 0 ? `?${p.toString()}` : ''}`
  }

  function chipClass(active: boolean) {
    return [
      'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors whitespace-nowrap shrink-0',
      active
        ? 'bg-xk-accent text-white border-transparent'
        : 'bg-transparent text-xk-text-secondary border-xk-border hover:bg-xk-subtle',
    ].join(' ')
  }

  function countBadge(active: boolean, count: number) {
    return (
      <span className={[
        'inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-md text-[10px] font-bold',
        active ? 'bg-white/25 text-white' : 'bg-xk-subtle text-xk-text-muted',
      ].join(' ')}>
        {count}
      </span>
    )
  }

  return (
    <div className="space-y-2 mb-5">
      {/* Row 1: Estatus */}
      <div className="overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0 pb-0.5">
        <div className="flex gap-1.5 min-w-max sm:min-w-0 sm:flex-wrap">
          {STATUS_TABS.map((tab) => {
            const active = currentStatus === tab.key
            const count  = statusCounts[tab.key] ?? 0
            return (
              <button
                key={tab.key}
                onClick={() => router.push(buildUrl(tab.key, currentState, currentPlan))}
                className={chipClass(active)}
              >
                {tab.label}
                {countBadge(active, count)}
              </button>
            )
          })}
        </div>
      </div>

      {/* Row 2: Plan + Región */}
      <div className="flex flex-wrap items-center gap-2">
        {/* Plan chips */}
        <div className="overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0 flex-1">
          <div className="flex gap-1.5 min-w-max sm:min-w-0 sm:flex-wrap">
            {PLAN_TABS.map((tab) => {
              const active = currentPlan === tab.key
              const count  = planCounts[tab.key] ?? 0
              return (
                <button
                  key={tab.key}
                  onClick={() => router.push(buildUrl(currentStatus, currentState, tab.key))}
                  className={chipClass(active)}
                >
                  {tab.label}
                  {tab.key !== '' && countBadge(active, count)}
                </button>
              )
            })}
          </div>
        </div>

        {/* Región dropdown */}
        <select
          value={currentState}
          onChange={(e) => router.push(buildUrl(currentStatus, e.target.value, currentPlan))}
          className="h-8 px-3 rounded-lg border border-xk-border bg-xk-card text-xs text-xk-text focus:outline-none focus:ring-2 focus:ring-xk-accent/30 focus:border-xk-accent transition-colors shrink-0"
        >
          <option value="">Todas las regiones</option>
          <optgroup label="🇲🇽 México">
            {MX_STATES.map((s) => <option key={s} value={s}>{s}</option>)}
          </optgroup>
          <optgroup label="América Latina">
            {LATAM_COUNTRIES.map((c) => <option key={c.name} value={c.name}>{c.flag} {c.name}</option>)}
          </optgroup>
        </select>
      </div>
    </div>
  )
}
