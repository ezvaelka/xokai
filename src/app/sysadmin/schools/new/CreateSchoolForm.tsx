'use client'

import { useState, useTransition } from 'react'
import { useRouter }                from 'next/navigation'
import { toast }                    from 'sonner'
import { Loader2 }                  from 'lucide-react'
import { Button }                   from '@/components/ui/button'
import { createSchoolWithAdmin }    from '@/app/actions/sysadmin'

const MX_STATES = [
  'Aguascalientes', 'Baja California', 'Baja California Sur', 'Campeche',
  'Chiapas', 'Chihuahua', 'Ciudad de México', 'Coahuila', 'Colima',
  'Durango', 'Estado de México', 'Guanajuato', 'Guerrero', 'Hidalgo',
  'Jalisco', 'Michoacán', 'Morelos', 'Nayarit', 'Nuevo León', 'Oaxaca',
  'Puebla', 'Querétaro', 'Quintana Roo', 'San Luis Potosí', 'Sinaloa',
  'Sonora', 'Tabasco', 'Tamaulipas', 'Tlaxcala', 'Veracruz', 'Yucatán',
  'Zacatecas',
]

const LATAM_COUNTRIES = [
  { flag: '🇦🇷', name: 'Argentina' },
  { flag: '🇧🇷', name: 'Brasil' },
  { flag: '🇨🇱', name: 'Chile' },
  { flag: '🇨🇴', name: 'Colombia' },
  { flag: '🇵🇪', name: 'Perú' },
]

export default function CreateSchoolForm() {
  const router = useRouter()
  const [pending, start] = useTransition()
  const [form, setForm] = useState({
    schoolName:        '',
    city:              '',
    directorFirstName: '',
    directorLastName:  '',
    email:             '',
  })

  function set(k: keyof typeof form, v: string) {
    setForm((f) => ({ ...f, [k]: v }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.schoolName.trim()) { toast.error('El nombre de la escuela es requerido'); return }
    if (!form.email.trim())      { toast.error('El email de la directora es requerido'); return }

    start(async () => {
      const res = await createSchoolWithAdmin({
        schoolName:        form.schoolName,
        city:              form.city,
        directorFirstName: form.directorFirstName,
        directorLastName:  form.directorLastName,
        email:             form.email,
      })
      if (res.error) { toast.error(res.error); return }
      toast.success(`Escuela "${form.schoolName}" creada — invite enviado a ${form.email}`)
      router.push(`/sysadmin/schools/${res.schoolId}`)
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5 max-w-lg">
      <div>
        <label className="block text-xs font-medium text-xk-text-muted uppercase tracking-wider mb-1.5">
          Nombre de la escuela *
        </label>
        <input
          value={form.schoolName}
          onChange={(e) => set('schoolName', e.target.value)}
          placeholder="Ej: Hábitat Learning Community"
          className="w-full rounded-xl border border-xk-border bg-xk-bg px-3 py-2.5 text-sm text-xk-text placeholder:text-xk-text-muted focus:outline-none focus:ring-2 focus:ring-xk-accent focus:border-transparent"
        />
      </div>

      <div>
        <label className="block text-xs font-medium text-xk-text-muted uppercase tracking-wider mb-1.5">
          Ubicación
        </label>
        <select
          value={form.city}
          onChange={(e) => set('city', e.target.value)}
          className="w-full rounded-xl border border-xk-border bg-xk-bg px-3 py-2.5 text-sm text-xk-text focus:outline-none focus:ring-2 focus:ring-xk-accent focus:border-transparent"
        >
          <option value="">Selecciona estado o país…</option>
          <optgroup label="🇲🇽 México">
            {MX_STATES.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </optgroup>
          <optgroup label="América Latina">
            {LATAM_COUNTRIES.map((c) => (
              <option key={c.name} value={c.name}>{c.flag} {c.name}</option>
            ))}
          </optgroup>
        </select>
      </div>

      <div>
        <label className="block text-xs font-medium text-xk-text-muted uppercase tracking-wider mb-1.5">
          Email de la directora *
        </label>
        <input
          type="email"
          value={form.email}
          onChange={(e) => set('email', e.target.value)}
          placeholder="directora@escuela.mx"
          className="w-full rounded-xl border border-xk-border bg-xk-bg px-3 py-2.5 text-sm text-xk-text placeholder:text-xk-text-muted focus:outline-none focus:ring-2 focus:ring-xk-accent focus:border-transparent"
        />
        <p className="text-xs text-xk-text-muted mt-1">
          Le llegará un email de invitación para activar su cuenta.
        </p>
      </div>

      <Button type="submit" disabled={pending} className="w-full gap-2">
        {pending && <Loader2 size={14} className="animate-spin" />}
        Crear escuela y enviar invitación
      </Button>
    </form>
  )
}
