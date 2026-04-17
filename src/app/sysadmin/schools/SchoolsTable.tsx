'use client'

import { useRouter } from 'next/navigation'
import type { SchoolListItem, SchoolStatus } from '@/app/actions/sysadmin'

const STATUS_BADGE: Record<Exclude<SchoolStatus, 'all'>, { label: string; className: string }> = {
  active:     { label: 'Activa',        className: 'bg-green-100 text-green-700 border-green-200' },
  onboarding: { label: 'En onboarding', className: 'bg-amber-100 text-amber-700 border-amber-200' },
  paused:     { label: 'Pausada',       className: 'bg-zinc-100 text-zinc-700 border-zinc-200' },
}

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' })
}

function daysAgo(iso: string) {
  return Math.floor((Date.now() - new Date(iso).getTime()) / 86_400_000)
}

export default function SchoolsTable({ schools }: { schools: SchoolListItem[] }) {
  const router = useRouter()

  return (
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
                  <tr
                    key={s.id}
                    onClick={() => router.push(`/sysadmin/schools/${s.id}`)}
                    className="border-b border-xk-border last:border-0 hover:bg-xk-subtle/50 transition-colors cursor-pointer"
                  >
                    <td className="px-4 py-3">
                      <p className="font-medium text-xk-text">{s.name}</p>
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
            <button
              key={s.id}
              onClick={() => router.push(`/sysadmin/schools/${s.id}`)}
              className="block w-full text-left bg-xk-card border border-xk-border rounded-2xl p-4 hover:border-xk-accent transition-colors"
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
            </button>
          )
        })}
      </div>
    </>
  )
}
