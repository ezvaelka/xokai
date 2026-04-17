'use client'

import { useState } from 'react'
import { StatusBadge } from '@/components/ui/status-badge'
import SchoolActions   from './SchoolActions'
import SchoolNotes     from './SchoolNotes'
import SchoolPlanPanel from './SchoolPlanPanel'
import type { SchoolDetail, SchoolNote, ActivityLogEntry, SchoolPlan } from '@/app/actions/sysadmin'

type Props = {
  detail:      SchoolDetail
  notes:       SchoolNote[]
  activityLog: ActivityLogEntry[]
  plan:        SchoolPlan
  trialEndsAt: string | null
}

type Tab = 'resumen' | 'plan' | 'usuarios' | 'notas' | 'actividad'

const TABS: { key: Tab; label: string }[] = [
  { key: 'resumen',   label: 'Resumen' },
  { key: 'plan',      label: 'Plan & Billing' },
  { key: 'usuarios',  label: 'Usuarios' },
  { key: 'notas',     label: 'Notas internas' },
  { key: 'actividad', label: 'Actividad' },
]

const STATUS_TONE = {
  active:     { tone: 'success' as const, label: 'Activa' },
  onboarding: { tone: 'warning' as const, label: 'Onboarding' },
  paused:     { tone: 'neutral' as const, label: 'Pausada' },
  pending:    { tone: 'danger'  as const, label: 'Por aprobar' },
}

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' })
}

function Row({ label, value }: { label: string; value: string | number | null | undefined }) {
  return (
    <div className="flex items-start justify-between gap-4 py-2.5 border-b border-xk-border/40 last:border-0">
      <span className="text-xs text-xk-text-muted w-36 shrink-0">{label}</span>
      <span className="text-sm text-xk-text text-right break-words">{value || '—'}</span>
    </div>
  )
}

function RelTime({ iso }: { iso: string }) {
  const diff  = (Date.now() - new Date(iso).getTime()) / 1000
  const label = diff < 60 ? 'hace un momento'
    : diff < 3600  ? `hace ${Math.floor(diff / 60)}m`
    : diff < 86400 ? `hace ${Math.floor(diff / 3600)}h`
    : fmtDate(iso)
  return <span title={fmtDate(iso)}>{label}</span>
}

const ACTION_LABELS: Record<string, string> = {
  plan_changed:           'Plan actualizado',
  trial_extended:         'Trial extendido',
  feature_flags_updated:  'Feature flags actualizados',
  impersonated:           'Impersonación iniciada',
}

export default function SchoolDetailClient({ detail, notes, activityLog, plan, trialEndsAt }: Props) {
  const [tab, setTab] = useState<Tab>('resumen')
  const { school, status, users, studentCount, groupCount } = detail
  const st = STATUS_TONE[status]

  return (
    <div className="space-y-5">
      {/* Hero header */}
      <div className="xk-surface-elevated p-5">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-xk-accent-light flex items-center justify-center shrink-0">
              <span className="text-base font-bold text-xk-accent">
                {school.name.split(/\s+/).slice(0, 2).map((w) => w[0]).join('').toUpperCase()}
              </span>
            </div>
            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <h1 className="text-xl font-semibold text-xk-text">{school.name}</h1>
                <StatusBadge tone={st.tone}>{st.label}</StatusBadge>
              </div>
              <p className="text-xs text-xk-text-muted mt-0.5">{school.city ?? '—'} · ID: {school.id.slice(0, 8)}…</p>
            </div>
          </div>
          <div className="flex items-center gap-6">
            {([['Alumnos', studentCount], ['Grupos', groupCount], ['Usuarios', users.length]] as const).map(([l, v]) => (
              <div key={l} className="text-center">
                <p className="xk-num text-xl font-semibold text-xk-text">{v}</p>
                <p className="text-[10px] text-xk-text-muted uppercase tracking-wide">{l}</p>
              </div>
            ))}
          </div>
        </div>
        <div className="mt-4 pt-4 border-t border-xk-border/50">
          <SchoolActions schoolId={school.id} isActive={school.active} schoolName={school.name} />
        </div>
      </div>

      {/* Tab nav */}
      <div className="flex gap-1 border-b border-xk-border/50">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`px-3 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors ${
              tab === t.key
                ? 'border-xk-accent text-xk-accent'
                : 'border-transparent text-xk-text-secondary hover:text-xk-text'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Tab: Resumen */}
      {tab === 'resumen' && (
        <div className="grid md:grid-cols-2 gap-4">
          <div className="xk-surface-elevated p-5">
            <h3 className="text-xs font-semibold text-xk-text-muted uppercase tracking-wider mb-3">Contacto</h3>
            <Row label="Email"     value={school.email} />
            <Row label="Teléfono"  value={school.phone} />
            <Row label="Dirección" value={school.address} />
            <Row label="Ciudad"    value={school.city} />
            <Row label="Estado"    value={school.state} />
          </div>
          <div className="xk-surface-elevated p-5">
            <h3 className="text-xs font-semibold text-xk-text-muted uppercase tracking-wider mb-3">Fiscal</h3>
            <Row label="RFC"            value={school.rfc} />
            <Row label="Razón social"   value={school.razon_social} />
            <Row label="CP fiscal"      value={school.cp_fiscal} />
            <Row label="Régimen fiscal" value={school.regimen_fiscal} />
            <Row label="Uso CFDI"       value={school.uso_cfdi} />
          </div>
          <div className="xk-surface-elevated p-5">
            <h3 className="text-xs font-semibold text-xk-text-muted uppercase tracking-wider mb-3">Pickup</h3>
            <Row label="Inicio"    value={school.pickup_start} />
            <Row label="Fin"       value={school.pickup_end} />
            <Row label="Tolerancia" value={school.pickup_tolerance_mins != null ? `${school.pickup_tolerance_mins} min` : null} />
          </div>
          <div className="xk-surface-elevated p-5">
            <h3 className="text-xs font-semibold text-xk-text-muted uppercase tracking-wider mb-3">Sistema</h3>
            <Row label="Activa"            value={school.active ? 'Sí' : 'No'} />
            <Row label="Onboarding"        value={school.onboarding_completed ? 'Completado' : 'Pendiente'} />
            <Row label="Registrada"        value={fmtDate(school.created_at)} />
          </div>
        </div>
      )}

      {/* Tab: Plan */}
      {tab === 'plan' && (
        <SchoolPlanPanel schoolId={school.id} currentPlan={plan} trialEndsAt={trialEndsAt} />
      )}

      {/* Tab: Usuarios */}
      {tab === 'usuarios' && (
        <div className="xk-surface-elevated overflow-hidden">
          {users.length === 0 ? (
            <p className="p-8 text-sm text-xk-text-muted text-center">Sin usuarios registrados.</p>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-xk-border/50 bg-xk-subtle/30">
                  <th className="text-left px-4 py-3 text-[11px] font-semibold text-xk-text-muted uppercase tracking-wider">Nombre</th>
                  <th className="text-left px-4 py-3 text-[11px] font-semibold text-xk-text-muted uppercase tracking-wider">Email</th>
                  <th className="text-left px-4 py-3 text-[11px] font-semibold text-xk-text-muted uppercase tracking-wider">Rol</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-xk-border/30">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-xk-subtle/30 transition-colors">
                    <td className="px-4 py-3 text-xk-text">
                      {[u.first_name, u.last_name].filter(Boolean).join(' ') || '—'}
                    </td>
                    <td className="px-4 py-3 text-xk-text-secondary text-xs">{u.email ?? '—'}</td>
                    <td className="px-4 py-3">
                      <StatusBadge tone="neutral" dot={false}>{u.role}</StatusBadge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* Tab: Notas */}
      {tab === 'notas' && (
        <div className="xk-surface-elevated p-5">
          <p className="text-xs text-xk-text-muted mb-4">Solo visibles para sysadmin. Úsalas para contexto de seguimiento.</p>
          <SchoolNotes schoolId={school.id} initialNotes={notes} />
        </div>
      )}

      {/* Tab: Actividad */}
      {tab === 'actividad' && (
        <div className="xk-surface-elevated overflow-hidden">
          {activityLog.length === 0 ? (
            <p className="p-8 text-sm text-xk-text-muted text-center">Sin actividad registrada.</p>
          ) : (
            <div className="divide-y divide-xk-border/30">
              {activityLog.map((entry) => (
                <div key={entry.id} className="flex items-start justify-between gap-4 px-5 py-3.5">
                  <div>
                    <p className="text-sm font-medium text-xk-text">
                      {ACTION_LABELS[entry.action] ?? entry.action}
                    </p>
                    {entry.payload && (
                      <p className="text-[11px] text-xk-text-muted mt-0.5 font-mono">
                        {JSON.stringify(entry.payload)}
                      </p>
                    )}
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-xs text-xk-text-muted"><RelTime iso={entry.created_at} /></p>
                    {entry.actor_name && <p className="text-[10px] text-xk-text-muted mt-0.5">{entry.actor_name}</p>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
