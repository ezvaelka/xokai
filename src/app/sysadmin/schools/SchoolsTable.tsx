'use client'

import { useRouter } from 'next/navigation'
import { Users, ArrowRight, DollarSign } from 'lucide-react'
import { StatusBadge } from '@/components/ui/status-badge'
import type { SchoolListItem, SchoolStatus, SchoolPlan } from '@/app/actions/sysadmin'

const STATUS_TONE: Record<Exclude<SchoolStatus, 'all'>, { tone: Parameters<typeof StatusBadge>[0]['tone']; label: string }> = {
  active:     { tone: 'success', label: 'Activa' },
  onboarding: { tone: 'warning', label: 'Onboarding' },
  paused:     { tone: 'neutral', label: 'Pausada' },
  pending:    { tone: 'danger',  label: 'Por aprobar' },
}

const PLAN_TONE: Record<SchoolPlan, { tone: Parameters<typeof StatusBadge>[0]['tone']; label: string }> = {
  trial:        { tone: 'info',    label: 'Trial' },
  base:         { tone: 'accent',  label: 'Base' },
  base_pickup:  { tone: 'accent',  label: 'Base+Pickup' },
  suspended:    { tone: 'danger',  label: 'Suspendida' },
  churned:      { tone: 'neutral', label: 'Churned' },
}

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: '2-digit' })
}

function daysAgo(iso: string) {
  return Math.floor((Date.now() - new Date(iso).getTime()) / 86_400_000)
}

function SchoolAvatar({ name }: { name: string }) {
  const words = name.trim().split(/\s+/)
  const letters = words.length >= 2
    ? (words[0][0] + words[1][0]).toUpperCase()
    : name.slice(0, 2).toUpperCase()
  return (
    <div className="w-9 h-9 rounded-lg bg-xk-accent-light flex items-center justify-center shrink-0">
      <span className="text-[11px] font-bold text-xk-accent">{letters}</span>
    </div>
  )
}

export default function SchoolsTable({ schools }: { schools: SchoolListItem[] }) {
  const router = useRouter()
  return (
    <>
      <div className="hidden md:block xk-surface-elevated overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-xk-border/50 bg-xk-subtle/30">
              <th className="text-left px-4 py-3 text-[11px] font-semibold text-xk-text-muted uppercase tracking-wider">Escuela</th>
              <th className="text-left px-4 py-3 text-[11px] font-semibold text-xk-text-muted uppercase tracking-wider">Plan</th>
              <th className="text-left px-4 py-3 text-[11px] font-semibold text-xk-text-muted uppercase tracking-wider">Estado</th>
              <th className="text-right px-4 py-3 text-[11px] font-semibold text-xk-text-muted uppercase tracking-wider">Alumnos</th>
              <th className="text-right px-4 py-3 text-[11px] font-semibold text-xk-text-muted uppercase tracking-wider">MRR</th>
              <th className="text-left px-4 py-3 text-[11px] font-semibold text-xk-text-muted uppercase tracking-wider">Registrada</th>
              <th className="w-8" />
            </tr>
          </thead>
          <tbody className="divide-y divide-xk-border/30">
            {schools.map((s) => {
              const st   = STATUS_TONE[s.status]
              const plan = PLAN_TONE[s.plan ?? 'trial']
              const days = daysAgo(s.created_at)
              return (
                <tr key={s.id} onClick={() => router.push(`/sysadmin/schools/${s.id}`)}
                  className="hover:bg-xk-subtle/40 cursor-pointer group transition-colors">
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-3">
                      <SchoolAvatar name={s.name} />
                      <div>
                        <p className="font-medium text-xk-text">{s.name}</p>
                        <p className="text-[11px] text-xk-text-muted mt-0.5">
                          {s.city ?? '—'}{s.director_name ? ` · ${s.director_name}` : ''}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3.5">
                    <StatusBadge tone={plan.tone}>{plan.label}</StatusBadge>
                    {s.plan === 'trial' && s.trial_ends_at && (
                      <p className="text-[10px] text-xk-text-muted mt-0.5">
                        {new Date(s.trial_ends_at) > new Date()
                          ? `${Math.max(0, Math.ceil((new Date(s.trial_ends_at).getTime() - Date.now()) / 86_400_000))}d restantes`
                          : 'Vencido'}
                      </p>
                    )}
                  </td>
                  <td className="px-4 py-3.5">
                    <StatusBadge tone={st.tone}>
                      {st.label}{s.status === 'onboarding' ? ` · ${days}d` : ''}
                    </StatusBadge>
                  </td>
                  <td className="px-4 py-3.5 text-right">
                    <div className="flex items-center justify-end gap-1 text-xk-text-secondary">
                      <Users className="w-3.5 h-3.5" />
                      <span className="xk-num">{s.student_count}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3.5 text-right">
                    {s.mrr_usd > 0 ? (
                      <div className="flex items-center justify-end gap-1 text-emerald-700">
                        <DollarSign className="w-3 h-3" />
                        <span className="xk-num font-medium">{s.mrr_usd}</span>
                      </div>
                    ) : (
                      <span className="text-xk-text-muted text-xs">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3.5 text-[11px] text-xk-text-muted">{fmtDate(s.created_at)}</td>
                  <td className="px-4 py-3.5">
                    <ArrowRight className="w-4 h-4 text-xk-text-muted opacity-0 group-hover:opacity-100 transition-opacity" />
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      <div className="md:hidden space-y-2">
        {schools.map((s) => {
          const st   = STATUS_TONE[s.status]
          const plan = PLAN_TONE[s.plan ?? 'trial']
          return (
            <button key={s.id} onClick={() => router.push(`/sysadmin/schools/${s.id}`)} className="block w-full text-left">
              <div className="xk-surface-flat p-4 hover:shadow-sm transition-shadow">
                <div className="flex items-start justify-between gap-3 mb-2.5">
                  <div className="flex items-center gap-3 min-w-0">
                    <SchoolAvatar name={s.name} />
                    <div className="min-w-0">
                      <p className="font-semibold text-xk-text text-sm truncate">{s.name}</p>
                      {s.city && <p className="text-[11px] text-xk-text-muted">{s.city}</p>}
                    </div>
                  </div>
                  <StatusBadge tone={st.tone}>{st.label}</StatusBadge>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <StatusBadge tone={plan.tone} dot={false}>{plan.label}</StatusBadge>
                    <div className="flex items-center gap-1 text-xk-text-muted">
                      <Users className="w-3 h-3" />
                      <span className="xk-num text-xs">{s.student_count}</span>
                    </div>
                  </div>
                  {s.mrr_usd > 0 && (
                    <span className="xk-num text-xs font-medium text-emerald-700">${s.mrr_usd}/mo</span>
                  )}
                </div>
              </div>
            </button>
          )
        })}
      </div>
    </>
  )
}
