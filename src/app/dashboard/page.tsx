import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import LogoutButton from './LogoutButton'

// ─── Constants ───────────────────────────────────────────────────────────────

const SCHOOL_NAME = 'Hábitat Learning Community'

const FONT_HEADING = 'var(--font-fraunces), Georgia, "Times New Roman", serif'
const FONT_BODY    = 'var(--font-geist-sans), system-ui, sans-serif'

// ─── Colors ──────────────────────────────────────────────────────────────────

const C = {
  accent:    '#6D4AE8',
  accentBg:  '#EDE9FE',
  accentMid: '#DDD6FE',
  bg:        '#F0EFFE',
  surface:   '#FFFFFF',
  text:      '#1C1917',
  textMid:   '#44403C',
  textSoft:  '#78716C',
  textMuted: '#A8A29E',
  border:    '#EDE9FE',
  divider:   '#F5F3FF',
} as const

// ─── Navigation ──────────────────────────────────────────────────────────────

const NAV_ITEMS = [
  {
    label: 'Dashboard', href: '/dashboard', active: true,
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="7" height="7" rx="1.5"/>
        <rect x="14" y="3" width="7" height="7" rx="1.5"/>
        <rect x="14" y="14" width="7" height="7" rx="1.5"/>
        <rect x="3" y="14" width="7" height="7" rx="1.5"/>
      </svg>
    ),
  },
  {
    label: 'Alumnos', href: '/dashboard/alumnos', active: false,
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
        <circle cx="9" cy="7" r="4"/>
        <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
        <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
      </svg>
    ),
  },
  {
    label: 'Grupos', href: '/dashboard/grupos', active: false,
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/>
      </svg>
    ),
  },
  {
    label: 'Comunicados', href: '/dashboard/comunicados', active: false,
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
      </svg>
    ),
  },
  {
    label: 'Pagos', href: '/dashboard/pagos', active: false,
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="1" y="4" width="22" height="16" rx="2"/>
        <line x1="1" y1="10" x2="23" y2="10"/>
      </svg>
    ),
  },
  {
    label: 'Documentos', href: '/dashboard/documentos', active: false,
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
        <polyline points="14 2 14 8 20 8"/>
        <line x1="16" y1="13" x2="8" y2="13"/>
        <line x1="16" y1="17" x2="8" y2="17"/>
      </svg>
    ),
  },
  {
    label: 'Pickup 🚦', href: '/dashboard/pickup', active: false,
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="2"/>
        <path d="M16.24 7.76a6 6 0 0 1 0 8.49m-8.48-.01a6 6 0 0 1 0-8.49m11.31-2.82a10 10 0 0 1 0 14.14m-14.14 0a10 10 0 0 1 0-14.14"/>
      </svg>
    ),
  },
] as const

// ─── Stat cards ──────────────────────────────────────────────────────────────

const STATS = [
  {
    label: 'Total Alumnos',
    value: '0',
    desc: 'alumnos activos',
    iconBg: '#EDE9FE',
    iconColor: '#6D4AE8',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
        <circle cx="9" cy="7" r="4"/>
        <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
        <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
      </svg>
    ),
  },
  {
    label: 'Pagos Pendientes',
    value: '0',
    desc: 'por cobrar este mes',
    iconBg: '#FEF3C7',
    iconColor: '#D97706',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="1" y="4" width="22" height="16" rx="2"/>
        <line x1="1" y1="10" x2="23" y2="10"/>
      </svg>
    ),
  },
  {
    label: 'Docs sin firmar',
    value: '0',
    desc: 'requieren firma',
    iconBg: '#FFE4E6',
    iconColor: '#E11D48',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
        <polyline points="14 2 14 8 20 8"/>
        <line x1="12" y1="18" x2="12" y2="12"/>
        <line x1="9" y1="15" x2="15" y2="15"/>
      </svg>
    ),
  },
  {
    label: 'Pickup activo',
    value: 'No',
    desc: 'semáforo apagado',
    iconBg: '#DCFCE7',
    iconColor: '#16A34A',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="2"/>
        <path d="M16.24 7.76a6 6 0 0 1 0 8.49m-8.48-.01a6 6 0 0 1 0-8.49"/>
      </svg>
    ),
  },
] as const

// ─── Sub-components ──────────────────────────────────────────────────────────

function StatCard({
  label, value, desc, iconBg, iconColor, icon,
}: {
  label: string; value: string; desc: string
  iconBg: string; iconColor: string; icon: React.ReactNode
}) {
  return (
    <div style={{
      background: C.surface,
      border: `1px solid ${C.border}`,
      borderRadius: 18,
      padding: '22px 24px 20px',
      boxShadow: '0 2px 8px rgba(109, 74, 232, 0.06), 0 0 0 0 transparent',
      display: 'flex',
      flexDirection: 'column',
      gap: 14,
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <span style={{ fontSize: 12, fontWeight: 600, color: C.textSoft, textTransform: 'uppercase', letterSpacing: '0.07em' }}>
          {label}
        </span>
        <div style={{
          width: 40, height: 40,
          background: iconBg, borderRadius: 12,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: iconColor, flexShrink: 0,
        }}>
          {icon}
        </div>
      </div>
      <div>
        <p style={{
          margin: 0,
          fontSize: 42, fontWeight: 700, lineHeight: 1,
          color: C.text,
          fontFamily: FONT_HEADING,
          letterSpacing: '-1px',
        }}>
          {value}
        </p>
        <p style={{ margin: '6px 0 0', fontSize: 12, color: C.textMuted }}>{desc}</p>
      </div>
    </div>
  )
}

function ActivityTable() {
  const cols = ['Fecha', 'Tipo', 'Descripción', 'Estado']
  return (
    <div style={{
      background: C.surface,
      border: `1px solid ${C.border}`,
      borderRadius: 18,
      overflow: 'hidden',
      boxShadow: '0 2px 8px rgba(109, 74, 232, 0.06)',
    }}>
      <div style={{
        padding: '18px 24px',
        borderBottom: `1px solid ${C.divider}`,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <div>
          <h3 style={{
            margin: 0, fontSize: 16, fontWeight: 600, color: C.text,
            fontFamily: FONT_HEADING,
          }}>
            Actividad reciente
          </h3>
          <p style={{ margin: '3px 0 0', fontSize: 12, color: C.textMuted }}>
            Últimas acciones registradas en la plataforma
          </p>
        </div>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: '150px 130px 1fr 110px',
        padding: '10px 24px',
        background: C.divider,
        borderBottom: `1px solid ${C.border}`,
      }}>
        {cols.map(col => (
          <span key={col} style={{
            fontSize: 11, fontWeight: 600,
            color: C.textSoft,
            textTransform: 'uppercase', letterSpacing: '0.08em',
          }}>
            {col}
          </span>
        ))}
      </div>

      <div style={{
        padding: '64px 24px',
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12,
        textAlign: 'center',
      }}>
        <div style={{
          width: 56, height: 56,
          background: C.accentBg,
          borderRadius: 16,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          marginBottom: 4,
        }}>
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke={C.accent} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
            <polyline points="14 2 14 8 20 8"/>
            <line x1="16" y1="13" x2="8" y2="13"/>
            <line x1="16" y1="17" x2="8" y2="17"/>
          </svg>
        </div>
        <p style={{ margin: 0, fontSize: 15, fontWeight: 600, color: C.textMid, fontFamily: FONT_HEADING }}>
          Sin actividad reciente
        </p>
        <p style={{ margin: 0, fontSize: 13, color: C.textMuted, maxWidth: 340, lineHeight: 1.6 }}>
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

  const email   = user.email ?? 'admin@xokai.app'
  const initial = email[0].toUpperCase()

  return (
    <>
      <style>{`
        .xk-shell   { display: flex; height: 100dvh; background: ${C.bg}; overflow: hidden; font-family: ${FONT_BODY}; }
        .xk-sidebar { width: 256px; flex-shrink: 0; background: ${C.surface}; border-right: 1px solid ${C.accentMid}; display: flex; flex-direction: column; overflow-y: auto; }
        .xk-main    { flex: 1; display: flex; flex-direction: column; overflow: hidden; min-width: 0; }
        .xk-content { flex: 1; overflow-y: auto; padding: 32px 28px 48px; }
        .xk-stats   { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin-bottom: 28px; }
        .xk-nav-item { display: flex; align-items: center; gap: 10px; padding: 10px 12px; border-radius: 10px; margin-bottom: 2px; text-decoration: none; font-size: 14px; font-weight: 400; color: ${C.textSoft}; transition: background 0.15s, color 0.15s; }
        .xk-nav-item:hover { background: ${C.accentBg}; color: ${C.accent}; }
        .xk-nav-item.active { background: ${C.accentBg}; color: ${C.accent}; font-weight: 600; }
        .xk-mobile-banner { display: none; }

        @media (max-width: 1023px) {
          .xk-sidebar { display: none; }
          .xk-stats   { grid-template-columns: repeat(2, 1fr); }
          .xk-content { padding: 20px 16px 40px; }
          .xk-mobile-banner { display: flex; }
        }
        @media (max-width: 599px) {
          .xk-stats { grid-template-columns: 1fr; }
          .xk-header-school { display: none; }
        }
      `}</style>

      <div className="xk-shell">

        <aside className="xk-sidebar">
          <div style={{
            padding: '28px 20px 20px',
            borderBottom: `1px solid ${C.accentMid}`,
            background: `linear-gradient(160deg, ${C.accentBg} 0%, ${C.surface} 100%)`,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{
                width: 38, height: 38,
                background: C.accent,
                borderRadius: 10,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0,
              }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
                  <polyline points="9 22 9 12 15 12 15 22"/>
                </svg>
              </div>
              <div>
                <p style={{ margin: 0, fontSize: 20, fontWeight: 700, color: C.accent, fontFamily: FONT_HEADING, letterSpacing: '-0.3px' }}>
                  Xokai
                </p>
                <p style={{ margin: 0, fontSize: 10, color: C.textSoft, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                  Admin
                </p>
              </div>
            </div>

            <div style={{
              marginTop: 14,
              padding: '6px 10px',
              background: C.surface,
              border: `1px solid ${C.accentMid}`,
              borderRadius: 8,
              display: 'flex', alignItems: 'center', gap: 6,
            }}>
              <div style={{
                width: 6, height: 6, borderRadius: '50%',
                background: '#16A34A', flexShrink: 0,
              }} />
              <span style={{ fontSize: 11, color: C.textMid, fontWeight: 500, lineHeight: 1.3 }}>
                {SCHOOL_NAME}
              </span>
            </div>
          </div>

          <nav style={{ flex: 1, padding: '16px 12px' }}>
            <p style={{
              fontSize: 10, fontWeight: 600, color: C.textMuted,
              textTransform: 'uppercase', letterSpacing: '0.09em',
              padding: '0 12px', margin: '0 0 8px',
            }}>
              Navegación
            </p>
            {NAV_ITEMS.map(item => (
              <a
                key={item.href}
                href={item.href}
                className={`xk-nav-item${item.active ? ' active' : ''}`}
              >
                {item.icon}
                {item.label}
              </a>
            ))}
          </nav>

          <div style={{ padding: '14px 20px', borderTop: `1px solid ${C.accentMid}` }}>
            <p style={{ margin: 0, fontSize: 11, color: C.textMuted, textAlign: 'center' }}>
              © 2026 Xokai · v0.1.0
            </p>
          </div>
        </aside>

        <div className="xk-main">

          <header style={{
            height: 64, flexShrink: 0,
            background: C.surface,
            borderBottom: `1px solid ${C.border}`,
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '0 24px',
            zIndex: 10,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ fontFamily: FONT_HEADING, fontSize: 22, fontWeight: 700, color: C.accent }}>
                Xokai
              </span>
              <span className="xk-header-school" style={{ display: 'flex', alignItems: 'center', gap: 6, marginLeft: 4 }}>
                <span style={{ width: 1, height: 18, background: C.accentMid }} />
                <span style={{ fontSize: 13, color: C.textSoft, fontWeight: 500 }}>
                  {SCHOOL_NAME}
                </span>
              </span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <p style={{ margin: 0, fontSize: 12, color: C.textSoft, maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {email}
              </p>
              <div style={{
                width: 36, height: 36,
                background: `linear-gradient(135deg, ${C.accent} 0%, #9B72F5 100%)`,
                borderRadius: '50%',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 14, fontWeight: 700, color: '#fff',
                fontFamily: FONT_HEADING, flexShrink: 0,
                boxShadow: `0 2px 6px rgba(109, 74, 232, 0.35)`,
              }}>
                {initial}
              </div>
              <LogoutButton />
            </div>
          </header>

          <div className="xk-mobile-banner" style={{
            background: C.accentBg,
            borderBottom: `1px solid ${C.accentMid}`,
            padding: '8px 16px',
            fontSize: 12, color: C.accent,
            alignItems: 'center', gap: 6,
          }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/>
            </svg>
            Dashboard · Alumnos · Grupos · Comunicados · Pagos · Documentos · Pickup 🚦
          </div>

          <main className="xk-content">

            <div style={{ marginBottom: 28 }}>
              <h1 style={{
                margin: 0,
                fontSize: 30, fontWeight: 700, color: C.text,
                fontFamily: FONT_HEADING, letterSpacing: '-0.5px', lineHeight: 1.15,
              }}>
                Buenos días 👋
              </h1>
              <p style={{ margin: '6px 0 0', fontSize: 14, color: C.textSoft }}>
                Aquí está el resumen de hoy en {SCHOOL_NAME}
              </p>
            </div>

            <div className="xk-stats">
              {STATS.map(s => (
                <StatCard key={s.label} {...s} />
              ))}
            </div>

            <ActivityTable />

          </main>
        </div>
      </div>
    </>
  )
}
