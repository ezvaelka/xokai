'use client'

import { useRouter } from 'next/navigation'
import { ChevronDown } from 'lucide-react'
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

interface Props {
  currentStatus: ClassifyStatus | 'all'
  currentState:  string
  currentPlan:   SchoolPlan | ''
  statusCounts:  Partial<Record<ClassifyStatus | 'all', number>>
  planCounts:    Partial<Record<SchoolPlan | '', number>>
}

export default function SchoolsFilters({
  currentStatus, currentState, currentPlan, statusCounts,
}: Props) {
  const router = useRouter()

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

  function buildUrl(status: ClassifyStatus | 'all', state: string, plan: SchoolPlan | '') {
    const p = new URLSearchParams()
    if (status !== 'all') p.set('status', status)
    if (state)            p.set('state', state)
    if (plan)             p.set('plan', plan)
    return `/sysadmin/schools${p.size > 0 ? `?${p.toString()}` : ''}`
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

      {/* Row 2: Plan + Región — 2 selects compactos, sin wrapping */}
      <div className="flex items-center gap-2">
        <div className="relative shrink-0">
          <select
            value={currentPlan}
            onChange={(e) => router.push(buildUrl(currentStatus, currentState, e.target.value as SchoolPlan | ''))}
            className={['appearance-none h-8 pl-3 pr-7 rounded-lg border bg-xk-surface text-xs cursor-pointer focus:outline-none focus:ring-2 focus:ring-xk-accent/20 transition-colors',
              currentPlan ? 'border-xk-accent text-xk-accent font-medium' : 'border-xk-border text-xk-text hover:border-xk-border-strong',
            ].join(' ')}
          >
            <option value="">Plan</option>
            <option value="trial">Trial</option>
            <option value="base">Base</option>
            <option value="base_pickup">Base+Pickup</option>
            <option value="suspended">Suspendida</option>
            <option value="churned">Churned</option>
          </select>
          <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-xk-text-muted pointer-events-none" />
        </div>

        <div className="relative shrink-0">
          <select
            value={currentState}
            onChange={(e) => router.push(buildUrl(currentStatus, e.target.value, currentPlan))}
            className={['appearance-none h-8 pl-3 pr-7 rounded-lg border bg-xk-surface text-xs cursor-pointer focus:outline-none focus:ring-2 focus:ring-xk-accent/20 transition-colors',
              currentState ? 'border-xk-accent text-xk-accent font-medium' : 'border-xk-border text-xk-text hover:border-xk-border-strong',
            ].join(' ')}
          >
            <option value="">Región</option>
            <optgroup label="🇲🇽 México">
              {MX_STATES.map((s) => <option key={s} value={s}>{s}</option>)}
            </optgroup>
            <optgroup label="América Latina">
              {LATAM_COUNTRIES.map((c) => <option key={c.name} value={c.name}>{c.flag} {c.name}</option>)}
            </optgroup>
          </select>
          <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-xk-text-muted pointer-events-none" />
        </div>
      </div>
    </div>
  )
}
