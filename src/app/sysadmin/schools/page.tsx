import { Suspense }                      from 'react'
import Link                              from 'next/link'
import { Plus }                          from 'lucide-react'
import { listSchools, type SchoolStatus } from '@/app/actions/sysadmin'
import SchoolsFilters                    from './SchoolsFilters'
import SchoolsTable                      from './SchoolsTable'

function parseStatus(value: string | string[] | undefined): SchoolStatus {
  const v = Array.isArray(value) ? value[0] : value
  if (v === 'active' || v === 'onboarding' || v === 'paused' || v === 'pending') return v
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
    <div className="max-w-7xl mx-auto space-y-6">

      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl font-bold text-xk-text">Escuelas</h1>
          <p className="text-sm text-xk-text-secondary mt-1">
            {all.length} {all.length === 1 ? 'escuela registrada' : 'escuelas registradas'} en la plataforma.
          </p>
        </div>
        <Link
          href="/sysadmin/schools/new"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-xk-accent text-white text-sm font-medium hover:bg-xk-accent-dark transition-colors shrink-0"
        >
          <Plus className="w-4 h-4" />
          Nueva escuela
        </Link>
      </div>

      {/* Status pills */}
      {all.length > 0 && (
        <div className="flex flex-wrap gap-2">
          <Link
            href="/sysadmin/schools"
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors border ${
              status === 'all'
                ? 'bg-xk-accent text-white border-xk-accent'
                : 'bg-xk-card text-xk-text-secondary border-xk-border hover:bg-xk-subtle'
            }`}
          >
            Todas · {all.length}
          </Link>
          <Link
            href="/sysadmin/schools?status=active"
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors border ${
              status === 'active'
                ? 'bg-green-600 text-white border-green-600'
                : 'bg-xk-card text-xk-text-secondary border-xk-border hover:bg-xk-subtle'
            }`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
            Activas · {counts.active}
          </Link>
          {counts.pending > 0 && (
            <Link
              href="/sysadmin/schools?status=pending"
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors border ${
                status === 'pending'
                  ? 'bg-orange-600 text-white border-orange-600'
                  : 'bg-orange-50 text-orange-700 border-orange-300 hover:bg-orange-100'
              }`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-orange-500" />
              Por aprobar · {counts.pending}
            </Link>
          )}
          <Link
            href="/sysadmin/schools?status=onboarding"
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors border ${
              status === 'onboarding'
                ? 'bg-amber-600 text-white border-amber-600'
                : 'bg-xk-card text-xk-text-secondary border-xk-border hover:bg-xk-subtle'
            }`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
            Onboarding · {counts.onboarding}
          </Link>
          <Link
            href="/sysadmin/schools?status=paused"
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors border ${
              status === 'paused'
                ? 'bg-zinc-600 text-white border-zinc-600'
                : 'bg-xk-card text-xk-text-secondary border-xk-border hover:bg-xk-subtle'
            }`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-zinc-400" />
            Pausadas · {counts.paused}
          </Link>
        </div>
      )}

      {/* Filtros de ciudad */}
      {cities.length > 0 && (
        <Suspense>
          <SchoolsFilters currentStatus={status} currentCity={currentCity} cities={cities} />
        </Suspense>
      )}

      {/* Tabla o vacío */}
      {schools.length === 0 ? (
        <div className="bg-xk-card border border-xk-border rounded-2xl p-12 text-center">
          <p className="text-sm text-xk-text-muted">
            No hay escuelas {status === 'all' && !currentCity ? 'registradas' : 'con los filtros seleccionados'}.
          </p>
          {status === 'all' && !currentCity && (
            <Link
              href="/sysadmin/schools/new"
              className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-xk-accent text-white text-sm font-medium hover:bg-xk-accent-dark transition-colors"
            >
              <Plus className="w-4 h-4" />
              Agregar primera escuela
            </Link>
          )}
        </div>
      ) : (
        <SchoolsTable schools={schools} />
      )}

      <p className="text-xs text-xk-text-muted">
        Mostrando {schools.length} {schools.length === 1 ? 'escuela' : 'escuelas'}
      </p>
    </div>
  )
}
