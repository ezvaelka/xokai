import Link                     from 'next/link'
import { Building2, Users, DollarSign, TrendingUp, AlertTriangle, ArrowRight, Plus } from 'lucide-react'
import { getSysadminMetrics }   from '@/app/actions/sysadmin'
import { MetricCard }           from '@/components/ui/metric-card'
import { StatusBadge }          from '@/components/ui/status-badge'
import MetricsChart             from './MetricsChart'

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString('es-MX', { day: '2-digit', month: 'short' })
}

function fmtUsd(n: number) {
  return n.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 })
}

export default async function SysadminDashboard() {
  const m = await getSysadminMetrics()

  const utilizacion = m.totalSchools > 0
    ? Math.round((m.activeSchools / m.totalSchools) * 100)
    : 0

  return (
    <div className="space-y-8">

      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium text-xk-text-muted uppercase tracking-widest mb-1">Panel global</p>
          <h1 className="text-2xl font-semibold tracking-tight text-xk-text">Dashboard</h1>
        </div>
        <Link
          href="/sysadmin/schools/new"
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-xk-accent text-white text-sm font-medium hover:bg-xk-accent-dark transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" />
          Nueva escuela
        </Link>
      </div>

      {/* Alerta pendientes */}
      {m.pendingSchools > 0 && (
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

      {/* Métricas — 4 cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <MetricCard
          label="MRR"
          value={fmtUsd(m.mrrUsd)}
          sublabel="Ingresos mensuales"
          icon={DollarSign}
          iconTone="success"
          delta={m.mrrUsd > 0 ? { value: `${m.activeSchools} activas`, trend: 'up' } : undefined}
        />
        <MetricCard
          label="Escuelas activas"
          value={m.activeSchools}
          sublabel={`${utilizacion}% del total`}
          icon={Building2}
          iconTone="accent"
        />
        <MetricCard
          label="Alumnos totales"
          value={m.totalStudents.toLocaleString()}
          sublabel="En todas las escuelas"
          icon={Users}
          iconTone="neutral"
        />
        <MetricCard
          label="ARR estimado"
          value={fmtUsd(m.mrrUsd * 12)}
          sublabel="Proyección anual"
          icon={TrendingUp}
          iconTone="accent"
        />
      </div>

      {/* Cuerpo — 2 columnas */}
      <div className="grid lg:grid-cols-3 gap-4">

        {/* Gráfica */}
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

        {/* Distribución */}
        <div className="xk-surface-elevated p-5 flex flex-col gap-4">
          <h2 className="text-sm font-semibold text-xk-text">Distribución</h2>
          {([
            { label: 'Activas',      count: m.activeSchools,     tone: 'success' as const, color: 'bg-emerald-500' },
            { label: 'Onboarding',   count: m.onboardingSchools, tone: 'warning' as const, color: 'bg-amber-500' },
            { label: 'Por aprobar',  count: m.pendingSchools,    tone: 'danger'  as const, color: 'bg-orange-500' },
            { label: 'Pausadas',     count: m.pausedSchools,     tone: 'neutral' as const, color: 'bg-zinc-400' },
          ] as const).map((row) => {
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

      {/* Últimas escuelas */}
      {m.recentSchools.length > 0 && (
        <div className="xk-surface-elevated overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-xk-border/50">
            <h2 className="text-sm font-semibold text-xk-text">Últimas escuelas</h2>
            <Link href="/sysadmin/schools" className="text-xs text-xk-accent hover:text-xk-accent-dark font-medium">Ver todas →</Link>
          </div>
          <div className="divide-y divide-xk-border/40">
            {m.recentSchools.map((s) => (
              <Link key={s.id} href={`/sysadmin/schools/${s.id}`}
                className="flex items-center gap-4 px-5 py-3.5 hover:bg-xk-subtle/50 transition-colors group"
              >
                <div className="w-8 h-8 rounded-lg bg-xk-accent-light flex items-center justify-center shrink-0">
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
          <Link href="/sysadmin/schools/new" className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-xk-accent text-white text-sm font-medium hover:bg-xk-accent-dark transition-colors">
            <Plus className="w-4 h-4" /> Agregar escuela
          </Link>
        </div>
      )}
    </div>
  )
}
