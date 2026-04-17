'use client'

import { useState, useTransition } from 'react'
import { toast }                    from 'sonner'
import { Loader2, X }               from 'lucide-react'
import { Button }                   from '@/components/ui/button'
import { createGroup, updateGroup, type GroupItem, type CreateGroupInput } from '@/app/actions/groups'

interface Props {
  group?:     GroupItem
  onClose:    () => void
  onSuccess?: () => void
}

const CURRENT_YEAR = new Date().getFullYear()
const DEFAULT_YEAR = `${CURRENT_YEAR}-${CURRENT_YEAR + 1}`

export default function GroupForm({ group, onClose, onSuccess }: Props) {
  const [pending, start] = useTransition()
  const [form, setForm] = useState<CreateGroupInput>({
    name:         group?.name         ?? '',
    grade:        group?.grade        ?? null,
    level:        group?.level        ?? '',
    academic_year: group?.academic_year ?? DEFAULT_YEAR,
  })

  function set(k: keyof CreateGroupInput, v: string | number | null) {
    setForm((f) => ({ ...f, [k]: v }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.name.trim()) { toast.error('El nombre del grupo es requerido'); return }
    if (!form.academic_year.trim()) { toast.error('El año escolar es requerido'); return }

    start(async () => {
      const res = group
        ? await updateGroup(group.id, form)
        : await createGroup(form)

      if (res.error) { toast.error(res.error); return }
      toast.success(group ? 'Grupo actualizado' : 'Grupo creado')
      onSuccess?.()
      onClose()
    })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
        <div className="flex items-center justify-between px-6 py-4 border-b border-xk-border">
          <h2 className="font-heading text-lg font-bold text-xk-text">
            {group ? 'Editar grupo' : 'Nuevo grupo'}
          </h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-xk-subtle transition-colors">
            <X size={16} className="text-xk-text-muted" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
          <div>
            <label className="block text-xs font-medium text-xk-text-muted uppercase tracking-wider mb-1.5">
              Nombre del grupo *
            </label>
            <input
              value={form.name}
              onChange={(e) => set('name', e.target.value)}
              placeholder="Ej: 1°A, Kinder B, Secundaria 3"
              className="w-full rounded-xl border border-xk-border bg-xk-bg px-3 py-2.5 text-sm text-xk-text placeholder:text-xk-text-muted focus:outline-none focus:ring-2 focus:ring-xk-accent focus:border-transparent"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-xk-text-muted uppercase tracking-wider mb-1.5">
                Grado
              </label>
              <input
                type="number"
                min={1}
                max={12}
                value={form.grade ?? ''}
                onChange={(e) => set('grade', e.target.value ? Number(e.target.value) : null)}
                placeholder="Ej: 1"
                className="w-full rounded-xl border border-xk-border bg-xk-bg px-3 py-2.5 text-sm text-xk-text placeholder:text-xk-text-muted focus:outline-none focus:ring-2 focus:ring-xk-accent focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-xk-text-muted uppercase tracking-wider mb-1.5">
                Nivel
              </label>
              <input
                value={form.level ?? ''}
                onChange={(e) => set('level', e.target.value || null)}
                placeholder="Ej: Primaria"
                className="w-full rounded-xl border border-xk-border bg-xk-bg px-3 py-2.5 text-sm text-xk-text placeholder:text-xk-text-muted focus:outline-none focus:ring-2 focus:ring-xk-accent focus:border-transparent"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-xk-text-muted uppercase tracking-wider mb-1.5">
              Año escolar *
            </label>
            <input
              value={form.academic_year}
              onChange={(e) => set('academic_year', e.target.value)}
              placeholder={DEFAULT_YEAR}
              className="w-full rounded-xl border border-xk-border bg-xk-bg px-3 py-2.5 text-sm text-xk-text placeholder:text-xk-text-muted focus:outline-none focus:ring-2 focus:ring-xk-accent focus:border-transparent"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">
              Cancelar
            </Button>
            <Button type="submit" disabled={pending} className="flex-1 gap-2">
              {pending && <Loader2 size={14} className="animate-spin" />}
              {group ? 'Guardar cambios' : 'Crear grupo'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
