'use client'

import { useState, useTransition } from 'react'
import { useRouter }                from 'next/navigation'
import { toast }                    from 'sonner'
import { Loader2 }                  from 'lucide-react'
import { Button }                   from '@/components/ui/button'
import { createSchoolWithAdmin }    from '@/app/actions/sysadmin'

export default function CreateSchoolForm() {
  const router = useRouter()
  const [pending, start] = useTransition()
  const [form, setForm] = useState({
    schoolName: '',
    city:       '',
    email:      '',
    password:   '',
  })

  function set(k: keyof typeof form, v: string) {
    setForm((f) => ({ ...f, [k]: v }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.schoolName.trim()) { toast.error('El nombre de la escuela es requerido'); return }
    if (!form.email.trim())      { toast.error('El email de la directora es requerido'); return }
    if (form.password.length < 8) { toast.error('La contraseña debe tener al menos 8 caracteres'); return }

    start(async () => {
      const res = await createSchoolWithAdmin(form)
      if (res.error) { toast.error(res.error); return }
      toast.success(`Escuela "${form.schoolName}" creada`)
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
          Ciudad
        </label>
        <input
          value={form.city}
          onChange={(e) => set('city', e.target.value)}
          placeholder="Ej: Guadalajara"
          className="w-full rounded-xl border border-xk-border bg-xk-bg px-3 py-2.5 text-sm text-xk-text placeholder:text-xk-text-muted focus:outline-none focus:ring-2 focus:ring-xk-accent focus:border-transparent"
        />
      </div>

      <div className="pt-2 pb-1">
        <p className="text-xs font-semibold text-xk-text-muted uppercase tracking-widest mb-3">
          Acceso de la directora
        </p>

        <div className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-xk-text-muted uppercase tracking-wider mb-1.5">
              Email *
            </label>
            <input
              type="email"
              value={form.email}
              onChange={(e) => set('email', e.target.value)}
              placeholder="directora@escuela.mx"
              className="w-full rounded-xl border border-xk-border bg-xk-bg px-3 py-2.5 text-sm text-xk-text placeholder:text-xk-text-muted focus:outline-none focus:ring-2 focus:ring-xk-accent focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-xk-text-muted uppercase tracking-wider mb-1.5">
              Contraseña inicial *
            </label>
            <input
              type="password"
              value={form.password}
              onChange={(e) => set('password', e.target.value)}
              placeholder="Mínimo 8 caracteres"
              className="w-full rounded-xl border border-xk-border bg-xk-bg px-3 py-2.5 text-sm text-xk-text placeholder:text-xk-text-muted focus:outline-none focus:ring-2 focus:ring-xk-accent focus:border-transparent"
            />
            <p className="text-xs text-xk-text-muted mt-1">
              La directora podrá cambiarla desde su perfil.
            </p>
          </div>
        </div>
      </div>

      <Button type="submit" disabled={pending} className="w-full gap-2">
        {pending && <Loader2 size={14} className="animate-spin" />}
        Crear escuela
      </Button>
    </form>
  )
}
