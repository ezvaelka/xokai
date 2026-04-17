'use client'

import { useRouter } from 'next/navigation'
import type { SchoolStatus } from '@/app/actions/sysadmin'

const TABS: Array<{ key: SchoolStatus; label: string }> = [
  { key: 'all',        label: 'Todas' },
  { key: 'active',     label: 'Activas' },
  { key: 'trial',      label: 'Trial' },
  { key: 'pending',    label: 'Por aprobar' },
  { key: 'onboarding', label: 'Onboarding' },
  { key: 'paused',     label: 'Pausadas' },
  { key: 'churned',    label: 'Churned' },
]

const MEXICO_STATES = [
  'Aguascalientes', 'Baja California', 'Baja California Sur', 'Campeche',
  'Chiapas', 'Chihuahua', 'Ciudad de México', 'Coahuila', 'Colima',
  'Durango', 'Guanajuato', 'Guerrero', 'Hidalgo', 'Jalisco', 'México',
  'Michoacán', 'Morelos', 'Nayarit', 'Nuevo León', 'Oaxaca', 'Puebla',
  'Querétaro', 'Quintana Roo', 'San Luis Potosí', 'Sinaloa', 'Sonora',
  'Tabasco', 'Tamaulipas', 'Tlaxcala', 'Veracruz', 'Yucatán', 'Zacatecas',
]

const LATAM: Array<{ country: string; cities: string[] }> = [
  { country: 'Argentina', cities: ['Buenos Aires', 'Córdoba', 'Rosario', 'Mendoza', 'La Plata', 'San Miguel de Tucumán', 'Mar del Plata'] },
  { country: 'Colombia',  cities: ['Bogotá', 'Medellín', 'Cali', 'Barranquilla', 'Cartagena', 'Cúcuta', 'Bucaramanga'] },
  { country: 'Perú',      cities: ['Lima', 'Arequipa', 'Trujillo', 'Chiclayo', 'Cusco'] },
  { country: 'Brasil',    cities: ['São Paulo', 'Rio de Janeiro', 'Brasília', 'Salvador', 'Fortaleza', 'Belo Horizonte', 'Manaus'] },
  { country: 'Chile',     cities: ['Santiago', 'Valparaíso', 'Concepción', 'La Serena', 'Antofagasta', 'Temuco'] },
]

interface Props {
  currentStatus: SchoolStatus
  currentState:  string
  counts:        Record<SchoolStatus, number>
}

export default function SchoolsFilters({ currentStatus, currentState, counts }: Props) {
  const router = useRouter()

  function buildUrl(status: SchoolStatus, state: string) {
    const p = new URLSearchParams()
    if (status !== 'all') p.set('status', status)
    if (state)            p.set('state', state)
    return `/sysadmin/schools${p.size > 0 ? `?${p.toString()}` : ''}`
  }

  return (
    <div className="space-y-3 mb-5">
      {/* Status tabs — horizontal scroll on mobile, wraps on desktop */}
      <div className="overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0 pb-0.5">
        <div className="flex gap-1.5 min-w-max sm:min-w-0 sm:flex-wrap">
          {TABS.map((tab) => {
            const active = currentStatus === tab.key
            const count  = counts[tab.key] ?? 0
            return (
              <button
                key={tab.key}
                onClick={() => router.push(buildUrl(tab.key, currentState))}
                className={[
                  'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors whitespace-nowrap shrink-0',
                  active
                    ? 'bg-xk-accent text-white border-transparent'
                    : 'bg-transparent text-xk-text-secondary border-xk-border hover:bg-xk-subtle',
                ].join(' ')}
              >
                {tab.label}
                <span className={[
                  'inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-md text-[10px] font-bold',
                  active ? 'bg-white/25 text-white' : 'bg-xk-subtle text-xk-text-muted',
                ].join(' ')}>
                  {count}
                </span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Estado / País dropdown */}
      <select
        value={currentState}
        onChange={(e) => router.push(buildUrl(currentStatus, e.target.value))}
        className="w-full sm:w-auto sm:min-w-[220px] h-8 px-3 rounded-lg border border-xk-border bg-xk-card text-sm text-xk-text focus:outline-none focus:ring-2 focus:ring-xk-accent/30 focus:border-xk-accent transition-colors"
      >
        <option value="">Todos los estados</option>
        <optgroup label="── MÉXICO ──">
          {MEXICO_STATES.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </optgroup>
        {LATAM.map(({ country, cities }) => (
          <optgroup key={country} label={`── ${country.toUpperCase()} ──`}>
            {cities.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </optgroup>
        ))}
      </select>
    </div>
  )
}
