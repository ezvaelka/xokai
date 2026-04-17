import { Suspense }                      from 'react'
import Link                              from 'next/link'
import { Plus }                          from 'lucide-react'
import { listSchools, type SchoolStatus } from '@/app/actions/sysadmin'
import SchoolsFilters                    from './SchoolsFilters'
import SchoolsTable                      from './SchoolsTable'

function parseStatus(value: string | string[] | undefined): SchoolStatus {
  const v = Array.isArray(value) ? value[0] : value
  if (v === 'active' || v === 'onboarding' || v === 'paused') return v
  return 'all'
}

function parseCity(value: string | string[] | undefined): string {
  const v = Array.isArray(value) ? value[0] : value
  return v ?? ''
}

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

  const counts = {
    active:     all.filter((s) => s.status === 'active').length,
    pending:    all.filter((s) => s.status === 'pending').length,
    onboarding: all.filter((s) => s.status === 'onboarding').length,
    paused:     all.filter((s) => s.status === 'paused').length,
  }

  const cities = [...new Set(all.map((s) => s.city).filter((c): c is string => Boolean(c)))].sort()

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex items-start justify-between gap-4 mb-6">
        <div>
          <h1 className="font-heading text-2xl font-bold text-xk-text">Escuelas</h1>
          <p className="text-sm text-xk-text-secondary mt-1">
            Vista global de todas las escuelas registradas en la plataforma.
          </p>
        </div>
        <Link
          href="/sysadmin/schools/new"
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-xk-accent text-white text-sm font-medium hover:bg-xk-accent-dark transition-colors shrink-0"
        >
          <Plus size={15} /> Nueva escuela
        </Link>
      </div>

      {/* Contadores de resumen */}
      {all.length > 0 && (
        <div className="flex flex-wrap gap-3 mb-5">
          <Link
            href="/sysadmin/schools?status=active"
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-green-50 border border-green-200 hover:bg-green-100 transition-colors"
          >
            <span className="w-2 h-2 rounded-full bg-green-500" />
            <span className="text-sm font-semibold text-green-700">{counts.active}</span>
            <span className="text-xs text-green-600">activas</span>
          </Link>
          {counts.pending > 0 && (
            <Link
              href="/sysadmin/schools?status=pending"
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-orange-50 border border-orange-300 hover:bg-orange-100 transition-colors animate-pulse"
            >
              <span className="w-2 h-2 rounded-full bg-orange-500" />
              <span className="text-sm font-semibold text-orange-700">{counts.pending}</span>
              <span className="text-xs text-orange-600">por aprobar</span>
            </Link>
          )}
          <Link
            href="/sysadmin/schools?status=onboarding"
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-amber-50 border border-amber-200 hover:bg-amber-100 transition-colors"
          >
            <span className="w-2 h-2 rounded-full bg-amber-500" />
            <span className="text-sm font-semibold text-amber-700">{counts.onboarding}</span>
            <span className="text-xs text-amber-600">en onboarding</span>
          </Link>
          <Link
            href="/sysadmin/schools?status=paused"
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-zinc-50 border border-zinc-200 hover:bg-zinc-100 transition-colors"
          >
            <span className="w-2 h-2 rounded-full bg-zinc-400" />
            <span className="text-sm font-semibold text-zinc-600">{counts.paused}</span>
            <span className="text-xs text-zinc-500">pausadas</span>
          </Link>
        </div>
      )}

      {/* Filtros — client component */}
      <Suspense>
        <SchoolsFilters
          currentStatus={status}
          currentCity={currentCity}
          cities={cities}
        />
      </Suspense>

      {schools.length === 0 ? (
        <div className="bg-xk-card border border-xk-border rounded-2xl p-10 text-center text-sm text-xk-text-muted">
          No hay escuelas {status === 'all' && !currentCity ? 'registradas' : 'con los filtros seleccionados'}.
        </div>
      ) : (
        <SchoolsTable schools={schools} />
      )}

      <p className="text-xs text-xk-text-muted mt-3">
        {schools.length} {schools.length === 1 ? 'escuela' : 'escuelas'}
      </p>
    </div>
  )
}
