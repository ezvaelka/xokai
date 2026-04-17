import { Suspense }                       from 'react'
import Link                               from 'next/link'
import { Plus }                           from 'lucide-react'
import { listSchools, type SchoolStatus } from '@/app/actions/sysadmin'
import SchoolsFilters                     from './SchoolsFilters'
import SchoolsTable                       from './SchoolsTable'

function parseStatus(value: string | string[] | undefined): SchoolStatus {
  const v = Array.isArray(value) ? value[0] : value
  if (v === 'active' || v === 'onboarding' || v === 'paused' || v === 'pending') return v
  return 'all'
}

function parseCity(value: string | string[] | undefined): string {
  const v = Array.isArray(value) ? value[0] : value
  return v ?? ''
}

const STATUS_PILLS = [
  { value: 'all',        label: 'Todas',       active: 'bg-xk-accent text-white',  inactive: 'bg-xk-surface text-xk-text-secondary hover:bg-xk-subtle border-xk-border/50' },
  { value: 'active',     label: 'Activas',     active: 'bg-emerald-600 text-white', inactive: 'bg-xk-surface text-xk-text-secondary hover:bg-xk-subtle border-xk-border/50' },
  { value: 'pending',    label: 'Por aprobar', active: 'bg-orange-600 text-white',  inactive: 'bg-orange-50 text-orange-700 hover:bg-orange-100 border-orange-200' },
  { value: 'onboarding', label: 'Onboarding',  active: 'bg-amber-600 text-white',   inactive: 'bg-xk-surface text-xk-text-secondary hover:bg-xk-subtle border-xk-border/50' },
  { value: 'paused',     label: 'Pausadas',    active: 'bg-zinc-600 text-white',    inactive: 'bg-xk-surface text-xk-text-secondary hover:bg-xk-subtle border-xk-border/50' },
] as const

export default async function SysadminSchoolsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; city?: string }>
}) {
  const params      = await searchParams
  const status      = parseStatus(params.status)
  const currentCity = parseCity(params.city)
  const all         = await listSchools('all')

  const schools = all.filter((s) => {
    const matchStatus = status === 'all' || s.status === status
    const matchCity   = !currentCity || s.city === currentCity
    return matchStatus && matchCity
  })

  const counts   = {
    active:     all.filter((s) => s.status === 'active').length,
    pending:    all.filter((s) => s.status === 'pending').length,
    onboarding: all.filter((s) => s.status === 'onboarding').length,
    paused:     all.filter((s) => s.status === 'paused').length,
  }
  const totalMrr = all.reduce((sum, s) => sum + (s.mrr_usd ?? 0), 0)
  const cities   = [...new Set(all.map((s) => s.city).filter((c): c is string => Boolean(c)))].sort()

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-medium text-xk-text-muted uppercase tracking-widest mb-1">Sysadmin</p>
          <h1 className="text-2xl font-semibold tracking-tight text-xk-text">Escuelas</h1>
          <p className="text-sm text-xk-text-secondary mt-1">
            {all.length} {all.length === 1 ? 'escuela' : 'escuelas'}
            {totalMrr > 0 && <> · <span className="text-emerald-700 font-medium xk-num">${totalMrr} MRR</span></>}
          </p>
        </div>
        <Link href="/sysadmin/schools/new"
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-xk-accent text-white text-sm font-medium hover:bg-xk-accent-dark transition-colors shadow-sm shrink-0">
          <Plus className="w-4 h-4" />Nueva escuela
        </Link>
      </div>

      <div className="flex flex-wrap gap-1.5">
        {STATUS_PILLS.map((pill) => {
          const count    = pill.value === 'all' ? all.length : counts[pill.value as keyof typeof counts]
          const isActive = status === pill.value
          return (
            <Link key={pill.value}
              href={`/sysadmin/schools${pill.value !== 'all' ? `?status=${pill.value}` : ''}`}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors border ${isActive ? `${pill.active} border-transparent` : pill.inactive}`}
            >
              {pill.label}
              <span className={`inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-md text-[10px] font-bold ${isActive ? 'bg-white/20' : 'bg-xk-subtle text-xk-text-muted'}`}>
                {count}
              </span>
            </Link>
          )
        })}
      </div>

      {cities.length > 0 && (
        <Suspense>
          <SchoolsFilters currentStatus={status} currentCity={currentCity} cities={cities} />
        </Suspense>
      )}

      {schools.length === 0 ? (
        <div className="xk-surface-elevated p-12 text-center xk-grid-bg">
          <p className="text-sm font-medium text-xk-text mb-1">Sin resultados</p>
          <p className="text-xs text-xk-text-muted mb-4">
            {status === 'all' && !currentCity ? 'No hay escuelas registradas.' : 'Prueba con otros filtros.'}
          </p>
          {status === 'all' && !currentCity && (
            <Link href="/sysadmin/schools/new" className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-xk-accent text-white text-sm font-medium hover:bg-xk-accent-dark transition-colors">
              <Plus className="w-4 h-4" /> Nueva escuela
            </Link>
          )}
        </div>
      ) : (
        <SchoolsTable schools={schools} />
      )}

      <p className="text-xs text-xk-text-muted">
        Mostrando <span className="xk-num font-medium">{schools.length}</span> de <span className="xk-num font-medium">{all.length}</span> escuelas
      </p>
    </div>
  )
}
