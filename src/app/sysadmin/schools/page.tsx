import Link from 'next/link'
import { listSchools, type SchoolStatus } from '@/app/actions/sysadmin'

const FILTERS: Array<{ key: SchoolStatus; label: string }> = [
  { key: 'all',        label: 'Todas' },
  { key: 'active',     label: 'Activas' },
  { key: 'onboarding', label: 'En onboarding' },
  { key: 'paused',     label: 'Pausadas' },
]

const STATUS_BADGE: Record<Exclude<SchoolStatus, 'all'>, { label: string; className: string }> = {
  active:     { label: 'Activa',        className: 'bg-green-100 text-green-700 border-green-200' },
  onboarding: { label: 'En onboarding', className: 'bg-amber-100 text-amber-700 border-amber-200' },
  paused:     { label: 'Pausada',       className: 'bg-zinc-100 text-zinc-700 border-zinc-200' },
}

function parseStatus(value: string | string[] | undefined): SchoolStatus {
  const v = Array.isArray(value) ? value[0] : value
  if (v === 'active' || v === 'onboarding' || v === 'paused') return v
  return 'all'
}

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' })
}

function daysAgo(iso: string) {
  return Math.floor((Date.now() - new Date(iso).getTime()) / 86_400_000)
}

export default async function SysadminSchoolsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>
}) {
  const params = await searchParams
  const status = parseStatus(params.status)
  const all     = await listSchools('all')
  const schools = status === 'all' ? all : all.filter((s) => s.status === status)

  const counts = {
    active:     all.filter((s) => s.status === 'active').length,
    onboarding: all.filter((s) => s.status === 'onboarding').length,
    paused:     all.filter((s) => s.status === 'paused').length,
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="font-heading text-2xl font-bold text-xk-text">Escuelas</h1>
        <p className="text-sm text-xk-text-secondary mt-1">
          Vista global de todas las escuelas registradas en la plataforma.
        </p>
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

      {/* Filtros */}
      <div className="flex flex-wrap gap-2 mb-5">
        {FILTERS.map((f) => {
          const active = status === f.key
          return (
            <Link
              key={f.key}
              href={f.key === 'all' ? '/sysadmin/schools' : `/sysadmin/schools?status=${f.key}`}
              className={[
                'px-3.5 py-1.5 rounded-full text-xs font-medium border transition-colors',
                active
                  ? 'bg-xk-accent text-white border-xk-accent'
                  : 'bg-xk-card text-xk-text-secondary border-xk-border hover:bg-xk-subtle',
              ].join(' ')}
            >
              {f.label}
            </Link>
          )
        })}
      </div>

      {schools.length === 0 ? (
        <div className="bg-xk-card border border-xk-border rounded-2xl p-10 text-center text-sm text-xk-text-muted">
          No hay escuelas {status === 'all' ? 'registradas' : `con estado "${status}"`}.
        </div>
      ) : (
        <>
          {/* Tabla desktop */}
          <div className="hidden md:block bg-xk-card border border-xk-border rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-xk-subtle border-b border-xk-border">
                  <tr className="text-xs font-semibold text-xk-text-muted uppercase tracking-wider">
                    <th className="text-left px-4 py-3">Escuela</th>
                    <th className="text-left px-4 py-3">Ciudad</th>
                    <th className="text-left px-4 py-3">Directora</th>
                    <th className="text-left px-4 py-3">Estado</th>
                    <th className="text-right px-4 py-3">Alumnos</th>
                    <th className="text-left px-4 py-3">Creada</th>
                  </tr>
                </thead>
                <tbody>
                  {schools.map((s) => {
                    const badge = STATUS_BADGE[s.status]
                    const days  = daysAgo(s.created_at)
                    return (
                      <tr key={s.id} className="border-b border-xk-border last:border-0 hover:bg-xk-subtle/50 transition-colors">
                        <td className="px-4 py-3">
                          <Link href={`/sysadmin/schools/${s.id}`} className="font-medium text-xk-text hover:text-xk-accent">
                            {s.name}
                          </Link>
                          {s.email && <p className="text-xs text-xk-text-muted mt-0.5">{s.email}</p>}
                        </td>
                        <td className="px-4 py-3 text-xk-text-secondary">{s.city ?? '—'}</td>
                        <td className="px-4 py-3">
                          {s.director_name
                            ? <><p className="text-xk-text">{s.director_name}</p>{s.director_email && <p className="text-xs text-xk-text-muted">{s.director_email}</p>}</>
                            : s.director_email
                              ? <p className="text-xs text-xk-text-muted">{s.director_email}</p>
                              : <span className="text-xk-text-muted">—</span>
                          }
                        </td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${badge.className}`}>
                            {badge.label}{s.status === 'onboarding' ? ` · ${days}d` : ''}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right font-mono text-xk-text">{s.student_count}</td>
                        <td className="px-4 py-3 text-xs text-xk-text-muted">{fmtDate(s.created_at)}</td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Cards mobile */}
          <div className="md:hidden space-y-3">
            {schools.map((s) => {
              const badge = STATUS_BADGE[s.status]
              const days  = daysAgo(s.created_at)
              return (
                <Link
                  key={s.id}
                  href={`/sysadmin/schools/${s.id}`}
                  className="block bg-xk-card border border-xk-border rounded-2xl p-4 hover:border-xk-accent transition-colors"
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <p className="font-semibold text-xk-text leading-tight">{s.name}</p>
                    <span className={`shrink-0 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${badge.className}`}>
                      {s.status === 'onboarding' ? `${days}d` : badge.label}
                    </span>
                  </div>
                  {s.city && <p className="text-xs text-xk-text-muted mb-1">{s.city}</p>}
                  {(s.director_name || s.director_email) && (
                    <p className="text-xs text-xk-text-secondary mb-2">
                      {s.director_name ?? s.director_email}
                      {s.director_name && s.director_email && ` · ${s.director_email}`}
                    </p>
                  )}
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-xs text-xk-text-muted font-mono">{s.student_count} alumnos</span>
                    <span className="text-xs text-xk-accent font-medium">Ver →</span>
                  </div>
                </Link>
              )
            })}
          </div>
        </>
      )}

      <p className="text-xs text-xk-text-muted mt-3">
        {schools.length} {schools.length === 1 ? 'escuela' : 'escuelas'}
      </p>
    </div>
  )
}
