'use client'

import { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { Users, ArrowRight, DollarSign } from 'lucide-react'
import { StatusBadge } from '@/components/ui/status-badge'
import type { SchoolListItem, ClassifyStatus, SchoolPlan } from '@/app/actions/sysadmin'

const STATUS_TONE: Record<ClassifyStatus, { tone: Parameters<typeof StatusBadge>[0]['tone']; label: string }> = {
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

type SortKey = 'name' | 'region' | 'plan' | 'status' | 'students' | 'mrr' | 'created_at'
type SortDir = 'asc' | 'desc'

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
    <div className="w-9 h-9 rounded-lg bg-xk-accent-light flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform duration-200">
      <span className="text-[11px] font-bold text-xk-accent">{letters}</span>
    </div>
  )
}

function SortHeader({ label, sortKey, current, onSort }: {
  label: string
  sortKey: SortKey
  current: { key: SortKey; dir: SortDir }
  onSort: (k: SortKey) => void
}) {
  const active = current.key === sortKey
  return (
    <button
      onClick={() => onSort(sortKey)}
      className="inline-flex items-center gap-1 group text-[11px] font-semibold text-xk-text-muted uppercase tracking-wider hover:text-xk-text transition-colors"
    >
      {label}
      <span className={`text-[10px] ${active ? 'text-xk-accent' : 'text-xk-border group-hover:text-xk-text-muted'}`}>
        {active ? (current.dir === 'asc' ? '↑' : '↓') : '↕'}
      </span>
    </button>
  )
}

export default function SchoolsTable({ schools }: { schools: SchoolListItem[] }) {
  const router = useRouter()
  const [sort, setSort] = useState<{ key: SortKey; dir: SortDir }>({ key: 'created_at', dir: 'desc' })

  const sorted = useMemo(() => {
    return [...schools].sort((a, b) => {
      let cmp = 0
      if (sort.key === 'name')       cmp = a.name.localeCompare(b.name)
      if (sort.key === 'region')     cmp = (a.state ?? a.city ?? '').localeCompare(b.state ?? b.city ?? '')
      if (sort.key === 'plan')       cmp = (a.plan ?? '').localeCompare(b.plan ?? '')
      if (sort.key === 'status')     cmp = a.status.localeCompare(b.status)
      if (sort.key === 'students')   cmp = (a.student_count ?? 0) - (b.student_count ?? 0)
      if (sort.key === 'mrr')        cmp = (a.mrr_usd ?? 0) - (b.mrr_usd ?? 0)
      if (sort.key === 'created_at') cmp = new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
      return sort.dir === 'asc' ? cmp : -cmp
    })
  }, [schools, sort])

  function toggleSort(key: SortKey) {
    setSort(prev => prev.key === key ? { key, dir: prev.dir === 'asc' ? 'desc' : 'asc' } : { key, dir: 'asc' })
  }

  return (
    <>
      <div className="hidden md:block xk-surface-elevated overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-xk-border/50 bg-xk-subtle/30">
              <th className="text-left px-4 py-3">
                <SortHeader label="Escuela" sortKey="name" current={sort} onSort={toggleSort} />
              </th>
              <th className="text-left px-4 py-3">
                <SortHeader label="Región" sortKey="region" current={sort} onSort={toggleSort} />
              </th>
              <th className="text-left px-4 py-3">
                <SortHeader label="Plan" sortKey="plan" current={sort} onSort={toggleSort} />
              </th>
              <th className="text-left px-4 py-3">
                <SortHeader label="Estatus" sortKey="status" current={sort} onSort={toggleSort} />
              </th>
              <th className="text-right px-4 py-3">
                <SortHeader label="Alumnos" sortKey="students" current={sort} onSort={toggleSort} />
              </th>
              <th className="text-right px-4 py-3">
                <SortHeader label="MRR" sortKey="mrr" current={sort} onSort={toggleSort} />
              </th>
              <th className="text-left px-4 py-3">
                <SortHeader label="Registrada" sortKey="created_at" current={sort} onSort={toggleSort} />
              </th>
              <th className="w-8" />
            </tr>
          </thead>
          <tbody className="divide-y divide-xk-border/30">
            {sorted.map((s) => {
              const st   = STATUS_TONE[s.status]
              const plan = PLAN_TONE[s.plan ?? 'trial']
              const days = daysAgo(s.created_at)
              return (
                <tr key={s.id} onClick={() => router.push(`/sysadmin/schools/${s.id}`)}
                  className="hover:bg-xk-subtle/40 cursor-pointer group transition-all duration-150">
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
                    <span className="text-xs text-xk-text-secondary">{s.state ?? s.city ?? <span className="text-xk-text-muted">—</span>}</span>
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
        {sorted.map((s) => {
          const st   = STATUS_TONE[s.status]
          const plan = PLAN_TONE[s.plan ?? 'trial']
          return (
            <button key={s.id} onClick={() => router.push(`/sysadmin/schools/${s.id}`)} className="block w-full text-left">
              <div className="xk-surface-flat p-4 hover:-translate-y-0.5 hover:shadow-md transition-all duration-200">
                {/* Top row: avatar + name + status */}
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <SchoolAvatar name={s.name} />
                    <div className="min-w-0">
                      <p className="font-semibold text-xk-text text-sm truncate">{s.name}</p>
                      {(s.state ?? s.city) && <p className="text-[11px] text-xk-text-muted">{s.state ?? s.city}</p>}
                    </div>
                  </div>
                  <StatusBadge tone={st.tone}>{st.label}</StatusBadge>
                </div>
                {/* Bottom row: plan + students + mrr + ver */}
                <div className="flex items-center justify-between pt-2.5 border-t border-xk-border/40">
                  <div className="flex items-center gap-2">
                    <StatusBadge tone={plan.tone} dot={false}>{plan.label}</StatusBadge>
                    <div className="flex items-center gap-1 text-xk-text-muted">
                      <Users className="w-3 h-3" />
                      <span className="xk-num text-xs">{s.student_count}</span>
                    </div>
                    {s.mrr_usd > 0 && (
                      <span className="xk-num text-xs font-medium text-emerald-700">${s.mrr_usd}/mo</span>
                    )}
                  </div>
                  <span className="text-xs font-medium text-xk-accent">Ver →</span>
                </div>
              </div>
            </button>
          )
        })}
      </div>
    </>
  )
}
