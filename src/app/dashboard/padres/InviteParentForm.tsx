'use client'

import { useState, useTransition } from 'react'
import { toast }                    from 'sonner'
import { Loader2, X }               from 'lucide-react'
import { Button }                   from '@/components/ui/button'
import { inviteParent }             from '@/app/actions/parents'

interface Props {
  onClose:   () => void
  onSuccess: () => void
}

export default function InviteParentForm({ onClose, onSuccess }: Props) {
  const [pending, start] = useTransition()
  const [form, setForm] = useState({ first_name: '', last_name: '', email: '' })

  function set(k: keyof typeof form, v: string) {
    setForm(f => ({ ...f, [k]: v }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.first_name.trim()) { toast.error('El nombre es requerido'); return }
    if (!form.last_name.trim())  { toast.error('El apellido es requerido'); return }
    if (!form.email.trim())      { toast.error('El correo es requerido'); return }

    start(async () => {
      const res = await inviteParent({
        first_name: form.first_name.trim(),
        last_name:  form.last_name.trim(),
        email:      form.email.trim().toLowerCase(),
      })
      if (res.error) { toast.error(res.error); return }
      toast.success(`Invitación enviada a ${form.email}`)
      onSuccess()
      onClose()
    })
  }

  const inputClass = "w-full rounded-xl border border-xk-border bg-xk-bg px-3 py-2.5 text-sm text-xk-text placeholder:text-xk-text-muted focus:outline-none focus:ring-2 focus:ring-xk-accent focus:border-transparent"

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
        <div className="flex items-center justify-between px-6 py-4 border-b border-xk-border">
          <h2 className="font-heading text-lg font-bold text-xk-text">Invitar padre / madre</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-xk-subtle transition-colors">
            <X size={16} className="text-xk-text-muted" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-xk-text-muted uppercase tracking-wider mb-1.5">Nombre *</label>
              <input value={form.first_name} onChange={e => set('first_name', e.target.value)} placeholder="Carlos" className={inputClass} />
            </div>
            <div>
              <label className="block text-xs font-medium text-xk-text-muted uppercase tracking-wider mb-1.5">Apellido *</label>
              <input value={form.last_name} onChange={e => set('last_name', e.target.value)} placeholder="López" className={inputClass} />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-xk-text-muted uppercase tracking-wider mb-1.5">Correo electrónico *</label>
            <input
              type="email"
              value={form.email}
              onChange={e => set('email', e.target.value)}
              placeholder="padre@familia.com"
              className={inputClass}
            />
          </div>

          <p className="text-xs text-xk-text-muted">
            Se enviará un correo de invitación para acceder a la app de Xokai.
          </p>

          <div className="flex gap-3 pt-1">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">Cancelar</Button>
            <Button type="submit" disabled={pending} className="flex-1 gap-2">
              {pending && <Loader2 size={14} className="animate-spin" />}
              Enviar invitación
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
