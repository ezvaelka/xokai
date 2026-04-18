import { Suspense }                       from 'react'
import Link                               from 'next/link'
import { Search }                         from 'lucide-react'
import { listSchools, type SchoolStatus } from '@/app/actions/sysadmin'
import SchoolsFilters                     from './SchoolsFilters'
import SchoolsTable                       from './SchoolsTable'
import NewSchoolModal                     from './NewSchoolModal'

function parseStatus(value: string | string[] | undefined): SchoolStatus {
  const v = Array.isArray(value) ? value[0] : value
  if (v === 'active' || v === 'onboarding' || v === 'paused' || v === 'pending'
    || v === 'trial' || v === 'churned') return v
  return 'all'
}

function parseState(value: string | string[] | undefined): string {
  const v = Array.isArray(value) ? value[0] : value
  return v ?? ''
}

export default async function SysadminSchoolsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; state?: string }>
}) {
  const params       = await searchParams
  const status       = parseStatus(params.status)
  const currentState = parseState(params.state)
  const all          = await listSchools('all')

  const schools = all.filter((s) => {
    const matchStatus =
      status === 'all'     ? true :
      status === 'trial'   ? s.plan === 'trial' :
      status === 'churned' ? s.plan === 'churned' :
      s.status === status
    const matchLocation = !currentState
      || s.state === currentState
      || s.city  === currentState
    return matchStatus && matchLocation
  })

  const counts: Record<SchoolStatus, number> = {
    all:        all.length,
    active:     all.filter((s) => s.status === 'active').length,
    trial:      all.filter((s) => s.plan   === 'trial').length,
    pending:    all.filter((s) => s.status === 'pending').length,
    onboarding: all.filter((s) => s.status === 'onboarding').length,
    paused:     all.filter((s) => s.status === 'paused').length,
    churned:    all.filter((s) => s.plan   === 'churned').length,
  }

  const totalMrr = all.reduce((sum, s) => sum + (s.mrr_usd ?? 0), 0)
  const hasFilters = status !== 'all' || currentState !== ''

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
          counts={counts}
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
