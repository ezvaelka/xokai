'use client'

import { useState, useTransition } from 'react'
import { useRouter }               from 'next/navigation'
import { toast }                   from 'sonner'
import { Plus, Loader2 }           from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { createSchoolWithAdmin } from '@/app/actions/sysadmin'
import { MX_STATES, LATAM_COUNTRIES } from '@/lib/school-locations'

const FIELD_CLASS =
  'w-full rounded-xl border border-xk-border bg-xk-bg px-3 py-2.5 text-sm text-xk-text placeholder:text-xk-text-muted focus:outline-none focus:ring-2 focus:ring-xk-accent focus:border-transparent'

const EMPTY = { schoolName: '', city: '', directorName: '', email: '' }

export default function NewSchoolModal() {
  const router = useRouter()
  const [open, setOpen]       = useState(false)
  const [pending, start]      = useTransition()
  const [form, setForm]       = useState(EMPTY)

  function set(k: keyof typeof form, v: string) {
    setForm((f) => ({ ...f, [k]: v }))
  }

  function handleOpenChange(v: boolean) {
    if (!pending) {
      setOpen(v)
      if (!v) setForm(EMPTY)
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.schoolName.trim())   { toast.error('El nombre de la escuela es requerido'); return }
    if (!form.directorName.trim()) { toast.error('El nombre de la directora es requerido'); return }
    if (!form.email.trim())        { toast.error('El email de la directora es requerido'); return }

    start(async () => {
      const [first, ...rest] = form.directorName.trim().split(' ')
      const res = await createSchoolWithAdmin({
        schoolName:        form.schoolName.trim(),
        city:              form.city,
        directorFirstName: first,
        directorLastName:  rest.join(' '),
        email:             form.email.trim(),
      })

      if (res.error) {
        toast.error(res.error)
        return
      }

      toast.success(`Escuela creada · Invitación enviada a ${form.email.trim()}`)
      setOpen(false)
      setForm(EMPTY)
      router.push(`/sysadmin/schools/${res.schoolId}`)
    })
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <button className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-lg bg-xk-accent text-white text-sm font-medium hover:bg-xk-accent-dark transition-colors shadow-sm shrink-0">
          <Plus className="w-4 h-4" />Nueva escuela
        </button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Nueva escuela</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          {/* Nombre de la escuela */}
          <div>
            <label className="block text-xs font-medium text-xk-text-muted uppercase tracking-wider mb-1.5">
              Nombre de la escuela *
            </label>
            <input
              value={form.schoolName}
              onChange={(e) => set('schoolName', e.target.value)}
              placeholder="Ej: Hábitat Learning Community"
              className={FIELD_CLASS}
            />
          </div>

          {/* Estado / País */}
          <div>
            <label className="block text-xs font-medium text-xk-text-muted uppercase tracking-wider mb-1.5">
              Estado / País
            </label>
            <select
              value={form.city}
              onChange={(e) => set('city', e.target.value)}
              className={FIELD_CLASS}
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

          {/* Nombre de la directora */}
          <div>
            <label className="block text-xs font-medium text-xk-text-muted uppercase tracking-wider mb-1.5">
              Nombre de la directora *
            </label>
            <input
              value={form.directorName}
              onChange={(e) => set('directorName', e.target.value)}
              placeholder="Nombre completo"
              className={FIELD_CLASS}
            />
          </div>

          {/* Email de la directora */}
          <div>
            <label className="block text-xs font-medium text-xk-text-muted uppercase tracking-wider mb-1.5">
              Email de la directora *
            </label>
            <input
              type="email"
              value={form.email}
              onChange={(e) => set('email', e.target.value)}
              placeholder="directora@escuela.mx"
              className={FIELD_CLASS}
            />
            <p className="text-xs text-xk-text-muted mt-1">
              Le llegará un email de invitación para activar su cuenta. Trial de 30 días automático.
            </p>
          </div>

          <Button type="submit" disabled={pending} className="w-full gap-2 mt-2">
            {pending && <Loader2 size={14} className="animate-spin" />}
            Crear escuela y enviar invitación
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
