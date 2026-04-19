import { Suspense }                          from 'react'
import Link                                  from 'next/link'
import { Search }                            from 'lucide-react'
import { listSchools, type ClassifyStatus }  from '@/app/actions/sysadmin'
import type { SchoolPlan }                   from '@/lib/sysadmin-constants'
import SchoolsFilters                        from './SchoolsFilters'
import SchoolsTable                          from './SchoolsTable'
import NewSchoolModal                        from './NewSchoolModal'

function parseStatus(value: string | string[] | undefined): ClassifyStatus | 'all' {
  const v = Array.isArray(value) ? value[0] : value
  if (v === 'active' || v === 'onboarding' || v === 'paused' || v === 'pending') return v
  return 'all'
}

function parsePlan(value: string | string[] | undefined): SchoolPlan | '' {
  const v = Array.isArray(value) ? value[0] : value
  if (v === 'trial' || v === 'base' || v === 'base_pickup' || v === 'suspended' || v === 'churned') return v
  return ''
}

function parseState(value: string | string[] | undefined): string {
  const v = Array.isArray(value) ? value[0] : value
  return v ?? ''
}

export default async function SysadminSchoolsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; state?: string; plan?: string }>
}) {
  const params       = await searchParams
  const status       = parseStatus(params.status)
  const currentPlan  = parsePlan(params.plan)
  const currentState = parseState(params.state)
  const all          = await listSchools('all')

  const schools = all.filter((s) => {
    const matchStatus   = status === 'all' ? true : s.status === status
    const matchPlan     = !currentPlan ? true : s.plan === currentPlan
    const matchLocation = !currentState || s.state === currentState || s.city === currentState
    return matchStatus && matchPlan && matchLocation
  })

  const statusCounts: Partial<Record<ClassifyStatus | 'all', number>> = {
    all:        all.length,
    active:     all.filter((s) => s.status === 'active').length,
    pending:    all.filter((s) => s.status === 'pending').length,
    onboarding: all.filter((s) => s.status === 'onboarding').length,
    paused:     all.filter((s) => s.status === 'paused').length,
  }

  const planCounts: Partial<Record<SchoolPlan | '', number>> = {
    '':           all.length,
    trial:        all.filter((s) => s.plan === 'trial').length,
    base:         all.filter((s) => s.plan === 'base').length,
    base_pickup:  all.filter((s) => s.plan === 'base_pickup').length,
    suspended:    all.filter((s) => s.plan === 'suspended').length,
    churned:      all.filter((s) => s.plan === 'churned').length,
  }

  const totalMrr = all.reduce((sum, s) => sum + (s.mrr_usd ?? 0), 0)
  const hasFilters = status !== 'all' || currentState !== '' || currentPlan !== ''

  return (
    <div className="space-y-6">
      {/* Header — mobile: stacked; desktop: row */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
        <div>
          <p className="text-xs font-medium text-xk-text-muted uppercase tracking-widest mb-1">Sysadmin</p>
          <h1 className="text-2xl font-semibold tracking-tight text-xk-text">Escuelas</h1>
          <p className="text-sm text-xk-text-secondary mt-1">
            {all.length} {all.length === 1 ? 'escuela' : 'escuelas'}
            {totalMrr > 0 && <> · <span className="text-emerald-700 font-medium xk-num">${totalMrr} MRR</span></>}
          </p>
        </div>
        <NewSchoolModal />
      </div>

      <Suspense>
        <SchoolsFilters
          currentStatus={status}
          currentState={currentState}
          currentPlan={currentPlan}
          statusCounts={statusCounts}
          planCounts={planCounts}
        />
      </Suspense>

      {schools.length === 0 ? (
        <div className="xk-surface-elevated p-10 sm:p-14 text-center xk-grid-bg rounded-xl">
          <div className="w-12 h-12 rounded-xl bg-xk-subtle flex items-center justify-center mx-auto mb-4">
            <Search className="w-5 h-5 text-xk-text-muted" />
          </div>
          <p className="text-sm font-medium text-xk-text mb-1">
            {hasFilters ? 'Sin escuelas con estos filtros' : 'No hay escuelas registradas'}
          </p>
          <p className="text-xs text-xk-text-muted mb-5">
            {hasFilters ? 'Prueba con otros filtros.' : 'Agrega la primera escuela para comenzar.'}
          </p>
          {hasFilters ? (
            <Link
              href="/sysadmin/schools"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-xk-accent text-white text-sm font-medium hover:bg-xk-accent-dark transition-colors"
            >
              Eliminar filtros
            </Link>
          ) : (
            <NewSchoolModal />
          )}
        </div>
      ) : (
        <SchoolsTable schools={schools} />
      )}

      <p className="text-xs text-xk-text-muted">
        Mostrando <span className="xk-num font-medium">{schools.length}</span> de{' '}
        <span className="xk-num font-medium">{all.length}</span> escuelas
      </p>
    </div>
  )
}
