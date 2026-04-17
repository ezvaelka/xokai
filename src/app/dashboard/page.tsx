import { redirect }    from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

// ─── Helpers ─────────────────────────────────────────────────────────────────

function greeting() {
  const h = parseInt(
    new Intl.DateTimeFormat('es-MX', {
      timeZone: 'America/Mexico_City',
      hour:     'numeric',
      hour12:   false,
    }).format(new Date()),
    10,
  )
  if (h < 12) return 'Buenos días'
  if (h < 18) return 'Buenas tardes'
  return 'Buenas noches'
}

// ─── Stat card ───────────────────────────────────────────────────────────────

interface StatCardProps {
  label:     string
  value:     string
  desc:      string
  iconClass: string
  icon:      React.ReactNode
}

function StatCard({ label, value, desc, iconClass, icon }: StatCardProps) {
  return (
    <div className="bg-xk-card rounded-2xl border border-xk-border p-5 sm:p-6 flex flex-col gap-4">
      <div className="flex items-start justify-between">
        <span className="text-xs font-semibold text-xk-text-secondary uppercase tracking-wider">
          {label}
        </span>
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${iconClass}`}>
          {icon}
        </div>
      </div>
      <div>
        <p className="font-heading text-4xl font-bold text-xk-text tracking-tight leading-none">
          {value}
        </p>
        <p className="text-xs text-xk-text-muted mt-1.5">{desc}</p>
      </div>
    </div>
  )
}

// ─── Activity table ──────────────────────────────────────────────────────────

function ActivityTable({ schoolName }: { schoolName: string }) {
  return (
    <div className="bg-xk-card rounded-2xl border border-xk-border overflow-hidden">
      <div className="px-5 sm:px-6 py-4 border-b border-xk-border">
        <h3 className="font-heading text-lg font-semibold text-xk-text">Actividad reciente</h3>
        <p className="text-xs text-xk-text-muted mt-0.5">
          Últimas acciones registradas en {schoolName}
        </p>
      </div>

      {/* Header cols — desktop only */}
      <div className="hidden sm:grid sm:grid-cols-[140px_120px_1fr_110px] px-6 py-2.5 bg-xk-subtle border-b border-xk-border">
        {['Fecha', 'Tipo', 'Descripción', 'Estado'].map(col => (
          <span key={col} className="text-xs font-semibold text-xk-text-secondary uppercase tracking-wide">
            {col}
          </span>
        ))}
      </div>

      <div className="flex flex-col items-center justify-center py-16 px-4 text-center gap-3">
        <div className="w-14 h-14 rounded-2xl bg-xk-accent-light flex items-center justify-center">
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"
            className="text-xk-accent">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
            <polyline points="14 2 14 8 20 8"/>
            <line x1="16" y1="13" x2="8" y2="13"/>
            <line x1="16" y1="17" x2="8" y2="17"/>
          </svg>
        </div>
        <p className="font-heading text-base font-semibold text-xk-text">Sin actividad reciente</p>
        <p className="text-sm text-xk-text-muted max-w-xs leading-relaxed">
          Aquí verás pagos, comunicados, firmas y eventos de Pickup en tiempo real.
        </p>
      </div>
    </div>
  )
}

// ─── Page ────────────────────────────────────────────────────────────────────

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('user_profiles')
    .select('first_name, schools(name)')
    .eq('id', user.id)
    .single() as { data: { first_name: string | null; schools: { name: string } | null } | null }

  const schoolName = profile?.schools?.name ?? 'tu escuela'
  const firstName  = profile?.first_name ?? ''

  const STATS: StatCardProps[] = [
    {
      label:     'Total Alumnos',
      value:     '0',
      desc:      'alumnos activos',
      iconClass: 'bg-violet-100 text-violet-600',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor"
          strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
          <circle cx="9" cy="7" r="4"/>
          <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
          <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
        </svg>
      ),
    },
    {
      label:     'Pagos Pendientes',
      value:     '0',
      desc:      'por cobrar este mes',
      iconClass: 'bg-amber-100 text-amber-600',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor"
          strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="1" y="4" width="22" height="16" rx="2"/>
          <line x1="1" y1="10" x2="23" y2="10"/>
        </svg>
      ),
    },
    {
      label:     'Docs sin firmar',
      value:     '0',
      desc:      'requieren firma',
      iconClass: 'bg-red-100 text-red-600',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor"
          strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
          <polyline points="14 2 14 8 20 8"/>
          <line x1="12" y1="18" x2="12" y2="12"/>
          <line x1="9" y1="15" x2="15" y2="15"/>
        </svg>
      ),
    },
    {
      label:     'Pickup activo',
      value:     'No',
      desc:      'semáforo apagado',
      iconClass: 'bg-emerald-100 text-emerald-600',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor"
          strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="2"/>
          <path d="M16.24 7.76a6 6 0 0 1 0 8.49m-8.48-.01a6 6 0 0 1 0-8.49"/>
        </svg>
      ),
    },
  ]

  return (
    <div className="max-w-5xl">

      {/* Greeting */}
      <div className="mb-8">
        <h1 className="font-heading text-3xl sm:text-4xl font-bold text-xk-text">
          {greeting()}{firstName ? `, ${firstName}` : ''} 👋
        </h1>
        <p className="text-xk-text-secondary mt-1.5 text-sm">
          Aquí está el resumen de hoy en {schoolName}
        </p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
        {STATS.map(s => <StatCard key={s.label} {...s} />)}
      </div>

      {/* Activity */}
      <ActivityTable schoolName={schoolName} />

    </div>
  )
}
