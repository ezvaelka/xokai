'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { Building2, Users, DollarSign, TrendingUp, AlertTriangle, ArrowRight, ChevronDown } from 'lucide-react'
import { MetricCard } from '@/components/ui/metric-card'
import { StatusBadge } from '@/components/ui/status-badge'
import MetricsChart from './MetricsChart'
import type { SysadminMetrics, SchoolListItem } from '@/app/actions/sysadmin'

type Props = {
  metrics: SysadminMetrics
  schools: SchoolListItem[]
}

const STATUS_TONE = {
  active:     { tone: 'success' as const, label: 'Activa' },
  onboarding: { tone: 'warning' as const, label: 'Onboarding' },
  paused:     { tone: 'neutral' as const, label: 'Pausada' },
  pending:    { tone: 'danger'  as const, label: 'Por aprobar' },
}

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString('es-MX', { day: '2-digit', month: 'short' })
}

function fmtUsd(n: number) {
  return n.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 })
}

export default function DashboardClient({ metrics: m, schools }: Props) {
  const [selectedId, setSelectedId] = useState<string | 'all'>('all')

  const selected = selectedId === 'all' ? null : schools.find(s => s.id === selectedId) ?? null

  const _filtered = useMemo(() => {
    if (selectedId === 'all') return null
    return schools.filter(s => s.id === selectedId)
  }, [selectedId, schools])

  // Metrics for current view
  const mrrUsd        = selectedId === 'all' ? m.mrrUsd : (selected?.mrr_usd ?? 0)
  const totalStudents = selectedId === 'all' ? m.totalStudents : (selected?.student_count ?? 0)
  const activeSchools = selectedId === 'all' ? m.activeSchools : (selected?.status === 'active' ? 1 : 0)
  const utilizacion   = selectedId === 'all'
    ? (m.totalSchools > 0 ? Math.round((m.activeSchools / m.totalSchools) * 100) : 0)
    : (selected?.status === 'active' ? 100 : 0)

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <p className="text-xs font-medium text-xk-text-muted uppercase tracking-widest mb-1">Panel global</p>
          <h1 className="text-2xl font-semibold tracking-tight text-xk-text">Dashboard</h1>
        </div>
        <div className="flex items-center gap-3">
          {/* School selector */}
          <div className="relative">
            <select
              value={selectedId}
              onChange={e => setSelectedId(e.target.value)}
              className="appearance-none pl-3 pr-8 py-2 rounded-lg border border-xk-border bg-xk-surface text-sm text-xk-text cursor-pointer hover:border-xk-border focus:outline-none focus:ring-2 focus:ring-xk-accent/20 focus:border-xk-accent transition-colors"
            >
              <option value="all">Todas las escuelas</option>
              {schools.map(s => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-xk-text-muted pointer-events-none" />
          </div>
          <Link
            href="/sysadmin/schools/new"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-xk-accent text-white text-sm font-medium hover:bg-xk-accent-dark transition-colors shadow-sm"
          >
            + Nueva
          </Link>
        </div>
      </div>

      {/* School detail banner when one school selected */}
      {selected && (
        <Link
          href={`/sysadmin/schools/${selected.id}`}
          className="flex items-center gap-3 px-4 py-3 rounded-xl bg-xk-accent-light border border-xk-accent/20 hover:bg-xk-accent/10 transition-colors group"
        >
          <Building2 className="w-4 h-4 text-xk-accent shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-xk-accent">{selected.name}</p>
            <p className="text-xs text-xk-text-muted">{selected.city ?? '—'} · Mostrando métricas de esta escuela</p>
          </div>
          <StatusBadge tone={STATUS_TONE[selected.status]?.tone ?? 'neutral'}>
            {STATUS_TONE[selected.status]?.label ?? selected.status}
          </StatusBadge>
          <ArrowRight className="w-4 h-4 text-xk-accent opacity-0 group-hover:opacity-100 transition-opacity" />
        </Link>
      )}

      {/* Alerta pendientes — only in global view */}
      {selectedId === 'all' && m.pendingSchools > 0 && (
        <Link href="/sysadmin/schools?status=pending" className="block">
          <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 hover:bg-amber-100 transition-colors">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <p className="text-sm font-medium">
              {m.pendingSchools} {m.pendingSchools === 1 ? 'escuela pendiente' : 'escuelas pendientes'} de aprobación
            </p>
            <ArrowRight className="w-4 h-4 ml-auto" />
          </div>
        </Link>
      )}

      {/* Metric cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <MetricCard
          label="MRR"
          value={fmtUsd(mrrUsd)}
          sublabel={selectedId === 'all' ? 'Ingresos mensuales' : 'Esta escuela'}
          icon={DollarSign}
          iconTone="success"
          delta={mrrUsd > 0 ? { value: `${activeSchools} activa${activeSchools !== 1 ? 's' : ''}`, trend: 'up' } : undefined}
        />
        <MetricCard
          label={selectedId === 'all' ? 'Escuelas activas' : 'Estado'}
          value={selectedId === 'all' ? activeSchools : (STATUS_TONE[selected?.status ?? 'paused']?.label ?? '—')}
          sublabel={selectedId === 'all' ? `${utilizacion}% del total` : (selected?.city ?? '—')}
          icon={Building2}
          iconTone="accent"
        />
        <MetricCard
          label="Alumnos"
          value={totalStudents.toLocaleString()}
          sublabel={selectedId === 'all' ? 'En todas las escuelas' : 'En esta escuela'}
          icon={Users}
          iconTone="neutral"
        />
        <MetricCard
          label="ARR estimado"
          value={fmtUsd(mrrUsd * 12)}
          sublabel="Proyección anual"
          icon={TrendingUp}
          iconTone="accent"
        />
      </div>

      {/* Charts — only global view */}
      {selectedId === 'all' && (
        <div className="grid lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2 xk-surface-elevated p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-sm font-semibold text-xk-text">Nuevas escuelas</h2>
                <p className="text-xs text-xk-text-muted mt-0.5">Últimos 12 meses</p>
              </div>
              <span className="xk-num text-2xl font-semibold text-xk-text">{m.totalSchools}</span>
            </div>
            <MetricsChart data={m.schoolsByMonth} />
          </div>
          <div className="xk-surface-elevated p-5 flex flex-col gap-4">
            <h2 className="text-sm font-semibold text-xk-text">Distribución</h2>
            {([
              { label: 'Activas',      count: m.activeSchools,     tone: 'success' as const, color: 'bg-emerald-500' },
              { label: 'Onboarding',   count: m.onboardingSchools, tone: 'warning' as const, color: 'bg-amber-500' },
              { label: 'Por aprobar',  count: m.pendingSchools,    tone: 'danger'  as const, color: 'bg-orange-500' },
              { label: 'Pausadas',     count: m.pausedSchools,     tone: 'neutral' as const, color: 'bg-zinc-400' },
            ] as const).map(row => {
              const pct = m.totalSchools > 0 ? (row.count / m.totalSchools) * 100 : 0
              return (
                <div key={row.label} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <StatusBadge tone={row.tone} dot={false}>{row.label}</StatusBadge>
                    <span className="xk-num font-semibold text-xk-text">{row.count}</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-xk-subtle overflow-hidden">
                    <div className={`h-full rounded-full ${row.color} transition-all duration-500`} style={{ width: `${pct}%` }} />
                  </div>
                </div>
              )
            })}
            <div className="pt-2 border-t border-xk-border/50 mt-auto flex items-center justify-between text-xs">
              <span className="text-xk-text-muted">Total</span>
              <span className="xk-num font-bold text-xk-text">{m.totalSchools}</span>
            </div>
          </div>
        </div>
      )}

      {/* When school selected: show school-specific detail */}
      {selected && (
        <div className="xk-surface-elevated p-5">
          <h2 className="text-sm font-semibold text-xk-text mb-4">Detalles — {selected.name}</h2>
          <div className="grid sm:grid-cols-2 gap-4 text-sm">
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-xk-text-muted text-xs">Plan</span>
                <span className="text-xk-text font-medium">{selected.plan}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-xk-text-muted text-xs">Ciudad</span>
                <span className="text-xk-text">{selected.city ?? '—'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-xk-text-muted text-xs">Email</span>
                <span className="text-xk-text text-xs">{selected.director_email ?? '—'}</span>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-xk-text-muted text-xs">Alumnos</span>
                <span className="xk-num font-semibold text-xk-text">{selected.student_count}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-xk-text-muted text-xs">MRR</span>
                <span className="xk-num font-semibold text-emerald-700">
                  {selected.mrr_usd > 0 ? fmtUsd(selected.mrr_usd) : '—'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-xk-text-muted text-xs">Registrada</span>
                <span className="text-xk-text">{fmtDate(selected.created_at)}</span>
              </div>
            </div>
          </div>
          <Link
            href={`/sysadmin/schools/${selected.id}`}
            className="mt-4 inline-flex items-center gap-1.5 text-xs text-xk-accent hover:text-xk-accent-dark font-medium"
          >
            Ver detalle completo <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
      )}

      {/* Últimas escuelas — global view only */}
      {selectedId === 'all' && m.recentSchools.length > 0 && (
        <div className="xk-surface-elevated overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-xk-border/50">
            <h2 className="text-sm font-semibold text-xk-text">Últimas escuelas</h2>
            <Link href="/sysadmin/schools" className="text-xs text-xk-accent hover:text-xk-accent-dark font-medium">Ver todas →</Link>
          </div>
          <div className="divide-y divide-xk-border/40">
            {m.recentSchools.map((s) => (
              <Link
                key={s.id}
                href={`/sysadmin/schools/${s.id}`}
                className="flex items-center gap-4 px-5 py-3.5 hover:bg-xk-subtle/50 transition-all duration-150 group"
              >
                <div className="w-8 h-8 rounded-lg bg-xk-accent-light flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform duration-200">
                  <span className="text-[11px] font-bold text-xk-accent">{s.name.slice(0, 2).toUpperCase()}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-xk-text truncate">{s.name}</p>
                  <p className="text-xs text-xk-text-muted">{s.city ?? '—'}</p>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <div className="flex items-center gap-1 text-xk-text-muted">
                    <Users className="w-3.5 h-3.5" />
                    <span className="xk-num text-xs">{s.student_count}</span>
                  </div>
                  <span className="text-xs text-xk-text-muted">{fmtDate(s.created_at)}</span>
                  <ArrowRight className="w-3.5 h-3.5 text-xk-text-muted opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Empty state */}
      {m.totalSchools === 0 && (
        <div className="xk-surface-elevated p-16 text-center xk-grid-bg">
          <div className="inline-flex w-14 h-14 rounded-2xl bg-xk-accent-light items-center justify-center mb-4">
            <Building2 className="w-6 h-6 text-xk-accent" />
          </div>
          <p className="text-base font-semibold text-xk-text mb-1">Sin escuelas aún</p>
          <p className="text-sm text-xk-text-muted mb-5">Registra la primera escuela para ver métricas aquí.</p>
          <Link
            href="/sysadmin/schools/new"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-xk-accent text-white text-sm font-medium hover:bg-xk-accent-dark transition-colors"
          >
            + Agregar escuela
          </Link>
        </div>
      )}
    </div>
  )
}
