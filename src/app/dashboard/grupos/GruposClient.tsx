'use client'

import { useState, useTransition } from 'react'
import { useRouter }                from 'next/navigation'
import { toast }                    from 'sonner'
import { Plus, Pencil, Trash2, Users, Loader2 } from 'lucide-react'
import { Button }                   from '@/components/ui/button'
import GroupForm                    from './GroupForm'
import { deleteGroup, type GroupItem } from '@/app/actions/groups'

export default function GruposClient({ groups }: { groups: GroupItem[] }) {
  const router = useRouter()
  const [showForm, setShowForm]       = useState(false)
  const [editing, setEditing]         = useState<GroupItem | undefined>()
  const [deletingId, setDeletingId]   = useState<string | null>(null)
  const [pending, start]              = useTransition()

  function handleEdit(g: GroupItem, e: React.MouseEvent) {
    e.stopPropagation()
    setEditing(g)
    setShowForm(true)
  }

  function handleDelete(g: GroupItem, e: React.MouseEvent) {
    e.stopPropagation()
    if (!confirm(`¿Eliminar el grupo "${g.name}"? Esta acción no se puede deshacer.`)) return
    setDeletingId(g.id)
    start(async () => {
      const res = await deleteGroup(g.id)
      setDeletingId(null)
      if (res.error) toast.error(res.error)
      else { toast.success('Grupo eliminado'); router.refresh() }
    })
  }

  function handleFormClose() {
    setShowForm(false)
    setEditing(undefined)
  }

  function handleFormSuccess() {
    router.refresh()
  }

  return (
    <>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-heading text-2xl font-bold text-xk-text">Grupos</h1>
          <p className="text-sm text-xk-text-secondary mt-1">
            {groups.length} {groups.length === 1 ? 'grupo' : 'grupos'} registrados
          </p>
        </div>
        <Button onClick={() => { setEditing(undefined); setShowForm(true) }} className="gap-2">
          <Plus size={16} />
          Nuevo grupo
        </Button>
      </div>

      {/* Lista */}
      {groups.length === 0 ? (
        <div className="bg-xk-card border border-xk-border rounded-2xl p-12 text-center">
          <div className="w-14 h-14 bg-xk-accent-light rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Users size={28} className="text-xk-accent" />
          </div>
          <p className="font-heading text-lg font-semibold text-xk-text mb-1">Sin grupos aún</p>
          <p className="text-sm text-xk-text-muted mb-5">Crea tu primer grupo para empezar a organizar alumnos y maestros.</p>
          <Button onClick={() => setShowForm(true)} className="gap-2">
            <Plus size={16} /> Crear primer grupo
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {groups.map((g) => (
            <div
              key={g.id}
              onClick={() => router.push(`/dashboard/grupos/${g.id}`)}
              className="bg-xk-card border border-xk-border rounded-2xl p-5 hover:border-xk-accent cursor-pointer transition-colors group"
            >
              <div className="flex items-start justify-between gap-2 mb-3">
                <div className="w-10 h-10 bg-xk-accent-light rounded-xl flex items-center justify-center shrink-0">
                  <span className="text-xs font-bold text-xk-accent">
                    {g.grade ?? g.name.slice(0, 2).toUpperCase()}
                  </span>
                </div>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={(e) => handleEdit(g, e)}
                    className="p-1.5 rounded-lg hover:bg-xk-subtle transition-colors"
                  >
                    <Pencil size={13} className="text-xk-text-muted" />
                  </button>
                  <button
                    onClick={(e) => handleDelete(g, e)}
                    disabled={deletingId === g.id || pending}
                    className="p-1.5 rounded-lg hover:bg-red-50 transition-colors"
                  >
                    {deletingId === g.id
                      ? <Loader2 size={13} className="animate-spin text-red-500" />
                      : <Trash2 size={13} className="text-red-400" />
                    }
                  </button>
                </div>
              </div>

              <p className="font-heading text-base font-bold text-xk-text leading-tight mb-0.5">{g.name}</p>
              {g.level && <p className="text-xs text-xk-text-muted mb-2">{g.level}</p>}

              <div className="flex items-center justify-between mt-3 pt-3 border-t border-xk-border">
                <div className="flex items-center gap-1.5 text-xs text-xk-text-secondary">
                  <Users size={12} />
                  <span>{g.student_count} alumnos</span>
                </div>
                <span className="text-xs text-xk-text-muted">{g.academic_year}</span>
              </div>

              {g.teacher_name && (
                <p className="text-xs text-xk-text-muted mt-1.5 truncate">
                  Maestro/a: {g.teacher_name}
                </p>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Modal form */}
      {showForm && (
        <GroupForm
          group={editing}
          onClose={handleFormClose}
          onSuccess={handleFormSuccess}
        />
      )}
    </>
  )
}
