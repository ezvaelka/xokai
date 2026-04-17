'use client'

import { useRouter } from 'next/navigation'
import { Building2, Users, ArrowRight } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import type { SchoolListItem, SchoolStatus } from '@/app/actions/sysadmin'

const STATUS_CONFIG: Record<Exclude<SchoolStatus, 'all'>, { label: string; dot: string; badge: string }> = {
  active:     { label: 'Activa',      dot: 'bg-green-500',  badge: 'bg-green-100 text-green-700 border-green-200' },
  onboarding: { label: 'Onboarding',  dot: 'bg-amber-500',  badge: 'bg-amber-100 text-amber-700 border-amber-200' },
  paused:     { label: 'Pausada',     dot: 'bg-zinc-400',   badge: 'bg-zinc-100 text-zinc-600 border-zinc-200' },
  pending:    { label: 'Por aprobar', dot: 'bg-orange-500', badge: 'bg-orange-100 text-orange-700 border-orange-200' },
}

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' })
}

function daysAgo(iso: string) {
  return Math.floor((Date.now() - new Date(iso).getTime()) / 86_400_000)
}

function SchoolInitials({ name }: { name: string }) {
  const words = name.trim().split(/\s+/)
  const letters = words.length >= 2
    ? (words[0][0] + words[1][0]).toUpperCase()
    : name.slice(0, 2).toUpperCase()
  return (
    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-xk-accent-light to-xk-accent-medium flex items-center justify-center shrink-0">
      <span className="text-xs font-bold text-xk-accent">{letters}</span>
    </div>
  )
}

export default function SchoolsTable({ schools }: { schools: SchoolListItem[] }) {
  const router = useRouter()

  return (
    <>
      {/* Tabla desktop */}
      <div className="hidden md:block">
        <Card className="border-xk-border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-xk-border bg-xk-subtle/60">
                  <th className="text-left px-4 py-3 text-xs font-semibold text-xk-text-muted uppercase tracking-wider">Escuela</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-xk-text-muted uppercase tracking-wider">Ciudad</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-xk-text-muted uppercase tracking-wider">Directora</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-xk-text-muted uppercase tracking-wider">Estado</th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-xk-text-muted uppercase tracking-wider">Alumnos</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-xk-text-muted uppercase tracking-wider">Registrada</th>
                  <th className="w-8" />
                </tr>
              </thead>
              <tbody className="divide-y divide-xk-border">
                {schools.map((s) => {
                  const cfg  = STATUS_CONFIG[s.status]
                  const days = daysAgo(s.created_at)
                  return (
                    <tr
                      key={s.id}
                      onClick={() => router.push(`/sysadmin/schools/${s.id}`)}
                      className="hover:bg-xk-subtle/40 transition-colors cursor-pointer group"
                    >
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-3">
                          <SchoolInitials name={s.name} />
                          <div>
                            <p className="font-medium text-xk-text">{s.name}</p>
                            {s.email && <p className="text-xs text-xk-text-muted mt-0.5">{s.email}</p>}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3.5 text-sm text-xk-text-secondary">{s.city ?? '—'}</td>
                      <td className="px-4 py-3.5">
                        {s.director_name
                          ? <div>
                              <p className="text-sm text-xk-text">{s.director_name}</p>
                              {s.director_email && <p className="text-xs text-xk-text-muted">{s.director_email}</p>}
                            </div>
                          : s.director_email
                            ? <p className="text-xs text-xk-text-muted">{s.director_email}</p>
                            : <span className="text-xk-text-muted">—</span>
                        }
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-1.5">
                          <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot} shrink-0`} />
                          <Badge className={`text-xs border ${cfg.badge}`}>
                            {cfg.label}{s.status === 'onboarding' ? ` · ${days}d` : ''}
                          </Badge>
                        </div>
                      </td>
                      <td className="px-4 py-3.5 text-right">
                        <div className="flex items-center justify-end gap-1 text-xk-text-secondary">
                          <Users className="w-3.5 h-3.5" />
                          <span className="font-mono text-sm">{s.student_count}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3.5 text-xs text-xk-text-muted">{fmtDate(s.created_at)}</td>
                      <td className="px-4 py-3.5">
                        <ArrowRight className="w-4 h-4 text-xk-text-muted opacity-0 group-hover:opacity-100 transition-opacity" />
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </Card>
      </div>

      {/* Cards mobile */}
      <div className="md:hidden space-y-3">
        {schools.map((s) => {
          const cfg  = STATUS_CONFIG[s.status]
          const days = daysAgo(s.created_at)
          return (
            <button
              key={s.id}
              onClick={() => router.push(`/sysadmin/schools/${s.id}`)}
              className="block w-full text-left"
            >
              <Card className="border-xk-border hover:border-xk-accent-medium hover:shadow-md transition-all p-4">
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <SchoolInitials name={s.name} />
                    <div className="min-w-0">
                      <p className="font-semibold text-xk-text leading-tight truncate">{s.name}</p>
                      {s.city && <p className="text-xs text-xk-text-muted mt-0.5">{s.city}</p>}
                    </div>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
                    <Badge className={`text-xs border ${cfg.badge}`}>
                      {s.status === 'onboarding' ? `${days}d` : cfg.label}
                    </Badge>
                  </div>
                </div>

                {(s.director_name || s.director_email) && (
                  <p className="text-xs text-xk-text-secondary mb-2 truncate">
                    {s.director_name ?? s.director_email}
                  </p>
                )}

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1 text-xk-text-muted">
                    <Users className="w-3.5 h-3.5" />
                    <span className="text-xs">{s.student_count} alumnos</span>
                  </div>
                  <div className="flex items-center gap-1 text-xk-accent">
                    <span className="text-xs font-medium">Ver detalle</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </div>
                </div>
              </Card>
            </button>
          )
        })}
      </div>
    </>
  )
}
