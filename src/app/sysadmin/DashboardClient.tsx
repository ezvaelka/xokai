'use client'

import { useState, useMemo, useRef } from 'react'
import Link from 'next/link'
import { Building2, Users, DollarSign, TrendingUp, ArrowRight, ChevronDown, Search, LogIn, Eye } from 'lucide-react'
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts'
import { MetricCard } from '@/components/ui/metric-card'
import { StatusBadge } from '@/components/ui/status-badge'
import MetricsChart from './MetricsChart'
import { MX_STATES, LATAM_COUNTRIES } from '@/lib/school-locations'
import type { SysadminMetrics, SchoolListItem } from '@/app/actions/sysadmin'

type Props = {
  metrics: SysadminMetrics
  schools: SchoolListItem[]
  firstName: string
}

function greeting() {
  const h = new Date().getHours()
  if (h < 12) return 'Buenos días'
  if (h < 19) return 'Buenas tardes'
  return 'Buenas noches'
}

const STATUS_TONE = {
  active:     { tone: 'success' as const, label: 'Activa' },
  onboarding: { tone: 'warning' as const, label: 'Onboarding' },
  paused:     { tone: 'neutral' as const, label: 'Pausada' },
  pending:    { tone: 'danger'  as const, label: 'Por aprobar' },
}

const TOOLTIP_STYLE = {
  background: '#fff', border: '1px solid #ECEAE3',
  borderRadius: 8, fontSize: 12, boxShadow: '0 4px 6px -1px rgba(0,0,0,0.08)',
}

function DonutChart({ title, data, total }: {
  title: string
  data: { name: string; value: number; color: string }[]
  total: number
}) {
  return (
    <div className="xk-surface-elevated p-4 flex flex-col flex-1">
      <h2 className="text-sm font-semibold text-xk-text mb-3">{title}</h2>
      {data.length > 0 ? (
        <>
          <div className="h-[120px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={data} cx="50%" cy="50%" innerRadius="50%" outerRadius="78%"
                  paddingAngle={2} dataKey="value">
                  {data.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                </Pie>
                <Tooltip contentStyle={TOOLTIP_STYLE} formatter={(value, name) => [value, name]} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="space-y-1.5 pt-2 border-t border-xk-border/40 mt-2">
            {data.map(d => {
              const pct = total > 0 ? Math.round((d.value / total) * 100) : 0
              return (
                <div key={d.name} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: d.color }} />
                    <span className="text-xk-text-secondary">{d.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="xk-num font-semibold text-xk-text">{d.value}</span>
                    <span className="xk-num w-7 text-right text-xk-text-muted">{pct}%</span>
                  </div>
                </div>
              )
            })}
          </div>
        </>
      ) : (
        <div className="flex-1 flex items-center justify-center text-xs text-xk-text-muted">Sin datos aún.</div>
      )}
    </div>
  )
}

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString('es-MX', { day: '2-digit', month: 'short' })
}

function fmtUsd(n: number) {
  return n.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 })
}

const SELECT_CLASS = 'h-8 px-2.5 rounded-lg border border-xk-border bg-xk-surface text-xs text-xk-text focus:outline-none focus:ring-2 focus:ring-xk-accent/20 focus:border-xk-accent transition-colors'

export default function DashboardClient({ metrics: m, schools, firstName }: Props) {
  const [selectedId, setSelectedId]     = useState<string | 'all'>('all')
  const [search, setSearch]             = useState('')
  const [regionFilter, setRegionFilter] = useState('')
  const [planFilter, setPlanFilter]     = useState('')
  const [chartPeriod, setChartPeriod]   = useState<3 | 6 | 12>(12)
  const searchDebounce = useRef<ReturnType<typeof setTimeout> | null>(null)

  const selected = selectedId === 'all' ? null : schools.find(s => s.id === selectedId) ?? null

  // Schools filtered by header filters (región + plan) — afectan TODAS las métricas
  const filteredSchools = useMemo(() =>
    schools.filter(s =>
      (!regionFilter || s.state === regionFilter || s.city === regionFilter) &&
      (!planFilter   || s.plan === planFilter)
    ), [schools, regionFilter, planFilter])

  const visibleSchools = useMemo(() =>
    filteredSchools.filter(s =>
      (!search || s.name.toLowerCase().includes(search.toLowerCase()))
    ), [filteredSchools, search])

  const chartData = useMemo(() => m.schoolsByMonth.slice(-chartPeriod), [m.schoolsByMonth, chartPeriod])

  // Métricas calculadas desde filteredSchools
  const mrrUsd        = selectedId === 'all'
    ? filteredSchools.reduce((sum, s) => sum + (s.mrr_usd ?? 0), 0)
    : (selected?.mrr_usd ?? 0)
  const totalStudents = selectedId === 'all'
    ? filteredSchools.reduce((sum, s) => sum + (s.student_count ?? 0), 0)
    : (selected?.student_count ?? 0)
  const activeSchools = selectedId === 'all'
    ? filteredSchools.filter(s => s.status === 'active').length
    : (selected?.status === 'active' ? 1 : 0)
  const utilizacion   = selectedId === 'all'
    ? (filteredSchools.length > 0 ? Math.round((activeSchools / filteredSchools.length) * 100) : 0)
    : (selected?.status === 'active' ? 100 : 0)

  function handleSearch(v: string) {
    if (searchDebounce.current) clearTimeout(searchDebounce.current)
    searchDebounce.current = setTimeout(() => setSearch(v), 300)
  }

  const estatusData = useMemo(() => [
    { name: 'Activas',     value: filteredSchools.filter(s => s.status === 'active' && s.plan !== 'trial').length, color: '#059669' },
    { name: 'Trial',       value: filteredSchools.filter(s => s.plan === 'trial').length,                           color: '#6D4AE8' },
    { name: 'Onboarding',  value: filteredSchools.filter(s => s.status === 'onboarding').length,                    color: '#D97706' },
    { name: 'Por aprobar', value: filteredSchools.filter(s => s.status === 'pending').length,                       color: '#DC2626' },
    { name: 'Pausadas',    value: filteredSchools.filter(s => s.status === 'paused').length,                        color: '#A8A49E' },
  ].filter(d => d.value > 0), [filteredSchools])

  const planData = useMemo(() => [
    { name: 'Trial',        value: filteredSchools.filter(s => s.plan === 'trial').length,       color: '#6D4AE8' },
    { name: 'Base',         value: filteredSchools.filter(s => s.plan === 'base').length,        color: '#059669' },
    { name: 'Base+Pickup',  value: filteredSchools.filter(s => s.plan === 'base_pickup').length, color: '#0EA5E9' },
    { name: 'Suspendida',   value: filteredSchools.filter(s => s.plan === 'suspended').length,   color: '#D97706' },
    { name: 'Churned',      value: filteredSchools.filter(s => s.plan === 'churned').length,     color: '#A8A49E' },
  ].filter(d => d.value > 0), [filteredSchools])

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
        <h1 className="text-[clamp(20px,2.2vw,28px)] font-semibold tracking-tight text-xk-text">
          {greeting()}, {firstName} <span className="inline-block">👋</span>
        </h1>
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative">
            <select
              value={selectedId}
              onChange={e => setSelectedId(e.target.value)}
              className="appearance-none h-9 pl-3 pr-8 rounded-lg border border-xk-border bg-xk-surface text-xs text-xk-text cursor-pointer hover:border-xk-border-strong focus:outline-none focus:ring-2 focus:ring-xk-accent/20 focus:border-xk-accent transition-colors min-w-[160px]"
            >
              <option value="all">Todas las escuelas</option>
              {schools.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
            <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-xk-text-muted pointer-events-none" />
          </div>
          <div className="relative">
            <select
              value={regionFilter}
              onChange={e => setRegionFilter(e.target.value)}
              className="appearance-none h-9 pl-3 pr-8 rounded-lg border border-xk-border bg-xk-surface text-xs text-xk-text cursor-pointer hover:border-xk-border-strong focus:outline-none focus:ring-2 focus:ring-xk-accent/20 focus:border-xk-accent transition-colors min-w-[160px]"
            >
              <option value="">Todas las regiones</option>
              <optgroup label="🇲🇽 México">
                {MX_STATES.map(s => <option key={s} value={s}>{s}</option>)}
              </optgroup>
              <optgroup label="América Latina">
                {LATAM_COUNTRIES.map(c => <option key={c.name} value={c.name}>{c.flag} {c.name}</option>)}
              </optgroup>
            </select>
            <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-xk-text-muted pointer-events-none" />
          </div>
          <div className="relative">
            <select
              value={planFilter}
              onChange={e => setPlanFilter(e.target.value)}
              className="appearance-none h-9 pl-3 pr-8 rounded-lg border border-xk-border bg-xk-surface text-xs text-xk-text cursor-pointer hover:border-xk-border-strong focus:outline-none focus:ring-2 focus:ring-xk-accent/20 focus:border-xk-accent transition-colors min-w-[140px]"
            >
              <option value="">Todos los planes</option>
              <option value="trial">Trial</option>
              <option value="base">Base</option>
              <option value="base_pickup">Base+Pickup</option>
              <option value="suspended">Suspendida</option>
              <option value="churned">Churned</option>
            </select>
            <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-xk-text-muted pointer-events-none" />
          </div>
          <Link
            href="/sysadmin/schools/new"
            className="inline-flex items-center gap-1.5 h-9 px-3.5 rounded-lg bg-xk-accent text-white text-xs font-medium hover:bg-xk-accent-dark transition-colors shadow-sm whitespace-nowrap"
          >
            + Nueva escuela
          </Link>
        </div>
      </div>

      {/* School detail banner */}
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

      {/* Alerta pendientes — badge morado con CTA */}
      {selectedId === 'all' && m.pendingSchools > 0 && (
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 px-4 py-3 rounded-xl bg-xk-accent-light border border-xk-accent/20">
          <div className="flex items-center gap-3 flex-1">
            <span className="inline-flex items-center justify-center min-w-[32px] h-8 px-2 rounded-full bg-xk-accent text-white text-sm font-bold xk-num shrink-0">
              {m.pendingSchools}
            </span>
            <p className="text-sm font-medium text-xk-text">
              {m.pendingSchools === 1 ? 'escuela espera' : 'escuelas esperan'} aprobación
            </p>
          </div>
          <Link
            href="/sysadmin/schools?status=pending"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-xk-accent text-white text-xs font-medium hover:bg-xk-accent-dark transition-colors shrink-0"
          >
            Revisar ahora <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
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
          label={selectedId === 'all' ? 'Escuelas activas' : 'Estatus'}
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

      {/* Charts — global view only */}
      {selectedId === 'all' && (
        <div className="grid lg:grid-cols-3 gap-4 items-stretch">
          {/* Nuevas escuelas — 2/3 width */}
          <div className="lg:col-span-2 xk-surface-elevated p-5 flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-sm font-semibold text-xk-text">Nuevas escuelas</h2>
                <p className="text-xs text-xk-text-muted mt-0.5">
                  {chartPeriod === 12 ? 'Últimos 12 meses' : chartPeriod === 6 ? 'Últimos 6 meses' : 'Últimos 3 meses'}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className="xk-num text-2xl font-semibold text-xk-text">{m.totalSchools}</span>
                {/* Period selector */}
                <div className="flex rounded-lg border border-xk-border overflow-hidden text-[11px] font-medium">
                  {([3, 6, 12] as const).map(p => (
                    <button
                      key={p}
                      onClick={() => setChartPeriod(p)}
                      className={[
                        'px-2.5 py-1 transition-colors',
                        chartPeriod === p
                          ? 'bg-xk-accent text-white'
                          : 'text-xk-text-muted hover:bg-xk-subtle',
                      ].join(' ')}
                    >
                      {p}m
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <div className="flex-1">
              <MetricsChart data={chartData} />
            </div>
          </div>

          {/* Right column: two donut charts stacked */}
          <div className="flex flex-col gap-4">
            <DonutChart title="Escuelas por Estatus" data={estatusData} total={m.totalSchools} />
            <DonutChart title="Escuelas por Plan"    data={planData}    total={m.totalSchools} />
          </div>
        </div>
      )}

      {/* School detail panel */}
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

      {/* Filtros + Últimas escuelas — global view only */}
      {selectedId === 'all' && (
        <div className="xk-surface-elevated overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-xk-border/50 flex-wrap gap-3">
            <h2 className="text-sm font-semibold text-xk-text">Últimas escuelas</h2>
            <div className="flex items-center gap-2 flex-wrap">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-xk-text-muted pointer-events-none" />
                <input
                  type="text"
                  placeholder="Buscar por nombre…"
                  onChange={e => handleSearch(e.target.value)}
                  className="h-8 pl-8 pr-3 rounded-lg border border-xk-border bg-xk-surface text-xs text-xk-text placeholder:text-xk-text-muted focus:outline-none focus:ring-2 focus:ring-xk-accent/20 focus:border-xk-accent transition-colors w-44"
                />
              </div>
              {/* Región */}
              <select value={regionFilter} onChange={e => setRegionFilter(e.target.value)} className={SELECT_CLASS}>
                <option value="">Todas las regiones</option>
                <optgroup label="🇲🇽 México">
                  {MX_STATES.map(s => <option key={s} value={s}>{s}</option>)}
                </optgroup>
                <optgroup label="América Latina">
                  {LATAM_COUNTRIES.map(c => <option key={c.name} value={c.name}>{c.flag} {c.name}</option>)}
                </optgroup>
              </select>
              {/* Plan */}
              <select value={planFilter} onChange={e => setPlanFilter(e.target.value)} className={SELECT_CLASS}>
                <option value="">Todos los planes</option>
                <option value="trial">Trial</option>
                <option value="base">Base</option>
                <option value="base_pickup">Base+Pickup</option>
              </select>
              <Link href="/sysadmin/schools" className="text-xs text-xk-accent hover:text-xk-accent-dark font-medium whitespace-nowrap">
                Ver todas →
              </Link>
            </div>
          </div>
          {visibleSchools.length > 0 ? (
            <div className="divide-y divide-xk-border/40">
              {visibleSchools.slice(0, 8).map((s) => (
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
                    <p className="text-xs text-xk-text-muted">{s.state ?? s.city ?? '—'}</p>
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
          ) : (
            <div className="px-5 py-10 text-center text-sm text-xk-text-muted">
              Sin escuelas con esos filtros.
            </div>
          )}
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
