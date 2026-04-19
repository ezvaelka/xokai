'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { Building2, Users, DollarSign, TrendingUp, ArrowRight, ChevronDown, LogIn, Eye } from 'lucide-react'
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis } from 'recharts'
import { MetricCard } from '@/components/ui/metric-card'
import { StatusBadge } from '@/components/ui/status-badge'
import MetricsChart from './MetricsChart'
import MrrChart from './MrrChart'
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

function DonutChart({ title, data, total, activeFilter, onFilter }: {
  title: string
  data: { name: string; value: number; color: string }[]
  total: number
  activeFilter?: string | null
  onFilter?: (name: string) => void
}) {
  const sum = data.reduce((a, d) => a + d.value, 0)
  return (
    <div className="xk-surface-elevated p-4 flex flex-col flex-1">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-semibold text-xk-text">{title}</h2>
        {activeFilter && onFilter && (
          <button
            onClick={() => onFilter(activeFilter)}
            className="text-[10px] text-xk-accent hover:text-xk-accent-dark font-medium"
          >
            Limpiar filtro
          </button>
        )}
      </div>
      {data.length > 0 ? (
        <>
          <div className="relative h-[140px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data}
                  cx="50%" cy="50%"
                  innerRadius="55%" outerRadius="82%"
                  paddingAngle={2}
                  dataKey="value"
                  onClick={(entry) => { if (entry?.name) onFilter?.(entry.name) }}
                  className={onFilter ? 'cursor-pointer outline-none' : ''}
                >
                  {data.map((entry, i) => (
                    <Cell
                      key={i}
                      fill={entry.color}
                      opacity={activeFilter && activeFilter !== entry.name ? 0.35 : 1}
                      stroke={activeFilter === entry.name ? entry.color : '#fff'}
                      strokeWidth={activeFilter === entry.name ? 2 : 1}
                    />
                  ))}
                </Pie>
                <Tooltip contentStyle={TOOLTIP_STYLE} formatter={(value, name) => [value, name]} />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="xk-num text-xl font-bold text-xk-text leading-none">{sum}</span>
              <span className="text-[9px] text-xk-text-muted mt-0.5 uppercase tracking-wider">total</span>
            </div>
          </div>
          <div className="space-y-1.5 pt-2 border-t border-xk-border/40 mt-2">
            {data.map(d => {
              const pct = total > 0 ? Math.round((d.value / total) * 100) : 0
              const isActive = activeFilter === d.name
              return (
                <button
                  key={d.name}
                  type="button"
                  onClick={() => onFilter?.(d.name)}
                  className={[
                    'w-full flex items-center justify-between text-xs transition-all rounded-md px-1.5 py-0.5',
                    onFilter ? 'cursor-pointer hover:bg-xk-subtle' : 'cursor-default',
                    isActive ? 'bg-xk-accent-light' : '',
                  ].join(' ')}
                >
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: d.color }} />
                    <span className={isActive ? 'text-xk-accent-dark font-medium' : 'text-xk-text-secondary'}>{d.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="xk-num font-semibold text-xk-text">{d.value}</span>
                    <span className="xk-num w-7 text-right text-xk-text-muted">{pct}%</span>
                  </div>
                </button>
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

export default function DashboardClient({ metrics: m, schools, firstName }: Props) {
  const [statusFilter, setStatusFilter] = useState('')
  const [regionFilter, setRegionFilter] = useState('')
  const [planFilter, setPlanFilter]     = useState('')
  const [chartPeriod, setChartPeriod]   = useState<3 | 6 | 12>(12)
  const [donutFilter, setDonutFilter]   = useState<string | null>(null)

  const anyFilterActive = !!statusFilter || !!regionFilter || !!planFilter

  function clearFilters() {
    setStatusFilter('')
    setRegionFilter('')
    setPlanFilter('')
  }

  const handleDonutFilter = (name: string) => {
    setDonutFilter(prev => prev === name ? null : name)
  }

  // Schools filtered by header filters (región + plan) — afectan TODAS las métricas
  const filteredSchools = useMemo(() =>
    schools.filter(s =>
      (!statusFilter || s.status === statusFilter) &&
      (!regionFilter || s.state === regionFilter || s.city === regionFilter) &&
      (!planFilter   || s.plan === planFilter)
    ), [schools, statusFilter, regionFilter, planFilter])

  const visibleSchools = useMemo(() =>
    filteredSchools.filter(s => {
      if (!donutFilter) return true
      const statusMap: Record<string, string> = { 'Activas': 'active', 'Onboarding': 'onboarding', 'Por aprobar': 'pending', 'Pausadas': 'paused' }
      const planMap: Record<string, string>   = { 'Trial': 'trial', 'Base': 'base', 'Base+Pickup': 'base_pickup', 'Suspendida': 'suspended', 'Churned': 'churned' }
      if (statusMap[donutFilter]) return s.status === statusMap[donutFilter]
      if (planMap[donutFilter])   return s.plan   === planMap[donutFilter]
      return true
    }), [filteredSchools, search, donutFilter])

  const filteredSchoolsByMonth = useMemo(() => {
    const now = new Date()
    const months = Array.from({ length: 12 }, (_, i) => {
      const d = new Date(now.getFullYear(), now.getMonth() - (11 - i), 1)
      return {
        month:  d.toLocaleDateString('es-MX', { month: 'short', year: '2-digit' }),
        isoKey: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`,
      }
    })
    const counts: Record<string, number> = {}
    filteredSchools.forEach(s => {
      const k = s.created_at.slice(0, 7)
      counts[k] = (counts[k] ?? 0) + 1
    })
    return months.map(mo => ({ month: mo.month, count: counts[mo.isoKey] ?? 0 })).slice(-chartPeriod)
  }, [filteredSchools, chartPeriod])

  const mrrByMonth = useMemo(() => {
    const now = new Date()
    return Array.from({ length: 12 }, (_, i) => {
      const d = new Date(now.getFullYear(), now.getMonth() - (11 - i), 1)
      const isoKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
      const label  = d.toLocaleDateString('es-MX', { month: 'short', year: '2-digit' })
      const active = filteredSchools.filter(s => s.created_at.slice(0, 7) <= isoKey)
      return {
        month:       label,
        base:        active.filter(s => s.plan === 'base').reduce((sum, s) => sum + (s.mrr_usd ?? 0), 0),
        base_pickup: active.filter(s => s.plan === 'base_pickup').reduce((sum, s) => sum + (s.mrr_usd ?? 0), 0),
      }
    }).slice(-chartPeriod)
  }, [filteredSchools, chartPeriod])

  const regionData = useMemo(() => {
    const counts: Record<string, number> = {}
    filteredSchools.forEach(s => {
      const r = s.state ?? s.city ?? 'Sin región'
      counts[r] = (counts[r] ?? 0) + 1
    })
    return Object.entries(counts)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 8)
  }, [filteredSchools])

  // Métricas calculadas desde filteredSchools
  const mrrUsd        = filteredSchools.reduce((sum, s) => sum + (s.mrr_usd ?? 0), 0)
  const totalStudents = filteredSchools.reduce((sum, s) => sum + (s.student_count ?? 0), 0)
  const activeSchools = filteredSchools.filter(s => s.status === 'active').length
  const utilizacion   = filteredSchools.length > 0 ? Math.round((activeSchools / filteredSchools.length) * 100) : 0

  const estatusData = useMemo(() => [
    { name: 'Activas',     value: filteredSchools.filter(s => s.status === 'active').length,     color: '#059669' },
    { name: 'Por aprobar', value: filteredSchools.filter(s => s.status === 'pending').length,    color: '#DC2626' },
    { name: 'Onboarding',  value: filteredSchools.filter(s => s.status === 'onboarding').length, color: '#D97706' },
    { name: 'Pausadas',    value: filteredSchools.filter(s => s.status === 'paused').length,     color: '#A8A49E' },
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
      <div className="flex flex-col gap-3">
        <h1 className="text-[clamp(20px,2.2vw,28px)] font-semibold tracking-tight text-xk-text">
          {greeting()}, {firstName} <span className="inline-block">👋</span>
        </h1>
        {/* Filters — single scroll row on mobile */}
        <div className="flex items-center gap-2 overflow-x-auto pb-0.5 -mx-4 px-4 sm:mx-0 sm:px-0 sm:flex-wrap">
          <div className="relative shrink-0">
            <select
              value={regionFilter}
              onChange={e => setRegionFilter(e.target.value)}
              className={['appearance-none h-8 pl-3 pr-7 rounded-lg border bg-xk-surface text-xs cursor-pointer focus:outline-none focus:ring-2 focus:ring-xk-accent/20 transition-colors',
                regionFilter ? 'border-xk-accent text-xk-accent font-medium' : 'border-xk-border text-xk-text hover:border-xk-border-strong',
              ].join(' ')}
            >
              <option value="">Región</option>
              <optgroup label="🇲🇽 México">
                {MX_STATES.map(s => <option key={s} value={s}>{s}</option>)}
              </optgroup>
              <optgroup label="América Latina">
                {LATAM_COUNTRIES.map(c => <option key={c.name} value={c.name}>{c.flag} {c.name}</option>)}
              </optgroup>
            </select>
            <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-xk-text-muted pointer-events-none" />
          </div>
          <div className="relative shrink-0">
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              className={['appearance-none h-8 pl-3 pr-7 rounded-lg border bg-xk-surface text-xs cursor-pointer focus:outline-none focus:ring-2 focus:ring-xk-accent/20 transition-colors',
                statusFilter ? 'border-xk-accent text-xk-accent font-medium' : 'border-xk-border text-xk-text hover:border-xk-border-strong',
              ].join(' ')}
            >
              <option value="">Estatus</option>
              <option value="active">Activas</option>
              <option value="pending">Por aprobar</option>
              <option value="onboarding">Onboarding</option>
              <option value="paused">Pausadas</option>
            </select>
            <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-xk-text-muted pointer-events-none" />
          </div>
          <div className="relative shrink-0">
            <select
              value={planFilter}
              onChange={e => setPlanFilter(e.target.value)}
              className={['appearance-none h-8 pl-3 pr-7 rounded-lg border bg-xk-surface text-xs cursor-pointer focus:outline-none focus:ring-2 focus:ring-xk-accent/20 transition-colors',
                planFilter ? 'border-xk-accent text-xk-accent font-medium' : 'border-xk-border text-xk-text hover:border-xk-border-strong',
              ].join(' ')}
            >
              <option value="">Plan</option>
              <option value="trial">Trial</option>
              <option value="base">Base</option>
              <option value="base_pickup">Base+Pickup</option>
              <option value="suspended">Suspendida</option>
              <option value="churned">Churned</option>
            </select>
            <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-xk-text-muted pointer-events-none" />
          </div>
          {anyFilterActive && (
            <button
              onClick={clearFilters}
              className="shrink-0 h-8 px-3 rounded-lg border border-xk-border text-xs text-xk-text-secondary hover:bg-xk-subtle hover:text-xk-text transition-colors"
            >
              × Limpiar
            </button>
          )}
          <Link
            href="/sysadmin/schools/new"
            className="shrink-0 inline-flex items-center gap-1.5 h-8 px-3.5 rounded-lg bg-xk-accent text-white text-xs font-medium hover:bg-xk-accent-dark transition-colors shadow-sm whitespace-nowrap"
          >
            + Nueva escuela
          </Link>
        </div>
      </div>

      {/* Alerta pendientes — badge morado con CTA */}
      {m.pendingSchools > 0 && (
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
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 w-full">
        <MetricCard
          label="MRR"
          value={fmtUsd(mrrUsd)}
          sublabel="Ingresos mensuales"
          icon={DollarSign}
          iconTone="success"
        />
        <MetricCard
          label="Escuelas activas"
          value={activeSchools}
          sublabel={`${utilizacion}% del total`}
          icon={Building2}
          iconTone="accent"
        />
        <MetricCard
          label="Alumnos"
          value={totalStudents.toLocaleString()}
          sublabel={`en ${filteredSchools.length} ${filteredSchools.length === 1 ? 'escuela' : 'escuelas'}`}
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

      {/* Donut charts */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <DonutChart
          title="Escuelas por Estatus"
          data={estatusData}
          total={filteredSchools.length}
          activeFilter={donutFilter}
          onFilter={handleDonutFilter}
        />
        <DonutChart
          title="Escuelas por Plan"
          data={planData}
          total={filteredSchools.length}
          activeFilter={donutFilter}
          onFilter={handleDonutFilter}
        />
      </div>

      {/* MRR Timeline — full width */}
      <div className="xk-surface-elevated p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-sm font-semibold text-xk-text">MRR por Plan</h2>
            <p className="text-xs text-xk-text-muted mt-0.5">Crecimiento acumulado</p>
          </div>
          <div className="flex rounded-lg border border-xk-border overflow-hidden text-[11px] font-medium">
            {([3, 6, 12] as const).map(p => (
              <button
                key={p}
                onClick={() => setChartPeriod(p)}
                className={[
                  'px-2.5 py-1 transition-colors',
                  chartPeriod === p ? 'bg-xk-accent text-white' : 'text-xk-text-muted hover:bg-xk-subtle',
                ].join(' ')}
              >
                {p}m
              </button>
            ))}
          </div>
        </div>
        <div className="h-[200px] w-full">
          <MrrChart data={mrrByMonth} />
        </div>
      </div>

      {/* Nuevas escuelas (2/3) + Región (1/3) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 items-stretch">
        <div className="lg:col-span-2 xk-surface-elevated p-5 flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-semibold text-xk-text">Nuevas escuelas</h2>
              <p className="text-xs text-xk-text-muted mt-0.5">
                {chartPeriod === 12 ? 'Últimos 12 meses' : chartPeriod === 6 ? 'Últimos 6 meses' : 'Últimos 3 meses'}
              </p>
            </div>
            <span className="xk-num text-2xl font-semibold text-xk-text">{m.totalSchools}</span>
          </div>
          <div className="flex-1 min-h-[200px] w-full">
            <MetricsChart data={filteredSchoolsByMonth} />
          </div>
        </div>
        <div className="xk-surface-elevated p-5 flex flex-col">
          <h2 className="text-sm font-semibold text-xk-text mb-4">Por región</h2>
          {regionData.length > 0 ? (
            <div className="flex-1 min-h-[200px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  layout="vertical"
                  data={regionData}
                  margin={{ top: 0, right: 16, left: 0, bottom: 0 }}
                >
                  <XAxis
                    type="number"
                    allowDecimals={false}
                    tick={{ fontSize: 11, fill: '#A8A49E' }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    type="category"
                    dataKey="name"
                    width={80}
                    tick={{ fontSize: 11, fill: '#57534E' }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip
                    contentStyle={TOOLTIP_STYLE}
                    formatter={(value) => [value, 'Escuelas']}
                  />
                  <Bar dataKey="value" fill="#6D4AE8" radius={[0, 4, 4, 0]} maxBarSize={20} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center text-xs text-xk-text-muted min-h-[200px]">
              Sin datos aún.
            </div>
          )}
        </div>
      </div>

      {/* Últimas escuelas */}
      <div className="xk-surface-elevated overflow-hidden w-full">
          <div className="flex items-center justify-between px-5 py-4 border-b border-xk-border/50 flex-wrap gap-3">
            <div className="flex items-center gap-3">
              <h2 className="text-sm font-semibold text-xk-text">Últimas escuelas</h2>
              {donutFilter && (
                <button
                  onClick={() => setDonutFilter(null)}
                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-xk-accent-light text-xk-accent-dark text-[11px] font-medium hover:bg-xk-accent/15"
                >
                  {donutFilter}
                  <span className="text-xs">×</span>
                </button>
              )}
            </div>
            <Link
              href="/sysadmin/schools"
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-xk-accent/30 text-xs font-medium text-xk-accent hover:bg-xk-accent-light transition-colors whitespace-nowrap"
            >
              Ver todas <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          {visibleSchools.length > 0 ? (
            <div className="divide-y divide-xk-border/40">
              {visibleSchools.slice(0, 8).map((s) => (
                <div key={s.id} className="group relative hover:bg-xk-accent-light/40 transition-colors">
                  <Link
                    href={`/sysadmin/schools/${s.id}`}
                    className="flex items-center gap-4 px-5 py-3.5"
                  >
                    <div className="w-9 h-9 rounded-lg bg-xk-accent-light flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform duration-200">
                      <span className="text-[11px] font-bold text-xk-accent">{s.name.slice(0, 2).toUpperCase()}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-xk-text truncate">{s.name}</p>
                      <p className="text-xs text-xk-text-muted truncate">{s.state ?? s.city ?? '—'}</p>
                    </div>
                    {/* Alumnos */}
                    <div className="hidden sm:flex items-center gap-1 text-xk-text-secondary shrink-0 w-16 justify-end">
                      <Users className="w-3.5 h-3.5" />
                      <span className="xk-num text-xs font-medium">{s.student_count}</span>
                    </div>
                    {/* MRR */}
                    <div className="hidden md:flex items-center shrink-0 w-20 justify-end">
                      {s.mrr_usd > 0 ? (
                        <span className="xk-num text-xs font-semibold text-emerald-700">${s.mrr_usd}</span>
                      ) : (
                        <span className="text-xs text-xk-text-muted">—</span>
                      )}
                    </div>
                    {/* Status badge */}
                    <div className="hidden lg:block shrink-0">
                      <StatusBadge tone={STATUS_TONE[s.status]?.tone ?? 'neutral'} dot={false}>
                        {STATUS_TONE[s.status]?.label ?? s.status}
                      </StatusBadge>
                    </div>
                    <span className="hidden xl:inline text-xs text-xk-text-muted shrink-0 w-14 text-right">{fmtDate(s.created_at)}</span>
                  </Link>
                  {/* Hover actions — absolute overlay al hover */}
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity bg-xk-surface/95 backdrop-blur-sm rounded-lg px-1 py-1 shadow-sm pointer-events-auto">
                    <Link
                      href={`/sysadmin/schools/${s.id}`}
                      className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-[11px] font-medium text-xk-text-secondary hover:bg-xk-subtle hover:text-xk-text transition-colors"
                      onClick={e => e.stopPropagation()}
                    >
                      <Eye className="w-3 h-3" /> Ver
                    </Link>
                    <Link
                      href={`/sysadmin/schools/${s.id}?impersonate=1`}
                      className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-[11px] font-medium text-xk-accent hover:bg-xk-accent-light transition-colors"
                      onClick={e => e.stopPropagation()}
                    >
                      <LogIn className="w-3 h-3" /> Entrar como admin
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="px-5 py-10 text-center text-sm text-xk-text-muted">
              Sin escuelas con esos filtros.
            </div>
          )}
        </div>

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
