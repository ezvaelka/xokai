'use client'

import { useState, useTransition, useMemo } from 'react'
import { useRouter }     from 'next/navigation'
import { toast }         from 'sonner'
import { Plus, Search, Pencil, Trash2, Users, Loader2, FolderOpen } from 'lucide-react'
import { Button }        from '@/components/ui/button'
import { ConfirmDialog } from '@/components/ConfirmDialog'
import GroupForm         from './GroupForm'
import { deleteGroup, type GroupItem, type TeacherOption } from '@/app/actions/groups'

interface Props {
  groups:   GroupItem[]
  teachers: TeacherOption[]
}

export default function GruposClient({ groups, teachers }: Props) {
  const router = useRouter()
  const [showForm, setShowForm]     = useState(false)
  const [editing, setEditing]       = useState<GroupItem | undefined>()
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [pending, start]            = useTransition()
  const [search, setSearch]         = useState('')
  const [yearFilter, setYearFilter] = useState('')

  const years = useMemo(() => {
    const set = new Set(groups.map(g => g.academic_year))
    return Array.from(set).sort().reverse()
  }, [groups])

  const filtered = useMemo(() =>
    groups.filter(g =>
      (!search     || g.name.toLowerCase().includes(search.toLowerCase())) &&
      (!yearFilter || g.academic_year === yearFilter)
    ), [groups, search, yearFilter])

  function handleEdit(g: GroupItem, e: React.MouseEvent) {
    e.stopPropagation()
    setEditing(g)
    setShowForm(true)
  }

  function handleDelete(g: GroupItem) {
    setDeletingId(g.id)
    start(async () => {
      const res = await deleteGroup(g.id)
      setDeletingId(null)
      if (res.error) toast.error(res.error)
      else { toast.success('Grupo eliminado'); router.refresh() }
    })
  }

  function gradeLabel(g: GroupItem) {
    if (g.level && g.grade) return `${g.grade}° ${g.level}`
    if (g.level)            return g.level
    if (g.grade)            return `${g.grade}°`
    return '—'
  }

  return (
    <>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-heading text-2xl font-bold text-xk-text">Grupos</h1>
          <p className="text-sm text-xk-text-secondary mt-1">
            {groups.filter(g => g.active).length} grupos activos
          </p>
        </div>
        <Button onClick={() => { setEditing(undefined); setShowForm(true) }} className="gap-2">
          <Plus size={16} /> Nuevo grupo
        </Button>
      </div>

      {/* Filtros */}
      <div className="flex flex-wrap gap-3 mb-5">
        <div className="relative flex-1 min-w-[200px]">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-xk-text-muted" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Buscar por nombre de grupo…"
            className="w-full pl-8 pr-3 py-2 rounded-xl border border-xk-border bg-xk-card text-sm text-xk-text placeholder:text-xk-text-muted focus:outline-none focus:ring-2 focus:ring-xk-accent focus:border-transparent"
          />
        </div>
        {years.length > 1 && (
          <select
            value={yearFilter}
            onChange={e => setYearFilter(e.target.value)}
            className="rounded-xl border border-xk-border bg-xk-card px-3 py-2 text-sm text-xk-text focus:outline-none focus:ring-2 focus:ring-xk-accent focus:border-transparent"
          >
            <option value="">Todos los ciclos</option>
            {years.map(y => <option key={y} value={y}>{y}</option>)}
          </select>
        )}
      </div>

      {/* Content */}
      {groups.length === 0 ? (
        <div className="bg-xk-card border border-xk-border rounded-2xl p-12 text-center">
          <div className="w-14 h-14 bg-xk-accent-light rounded-2xl flex items-center justify-center mx-auto mb-4">
            <FolderOpen size={28} className="text-xk-accent" />
          </div>
          <p className="font-heading text-lg font-semibold text-xk-text mb-1">No hay grupos aún</p>
          <p className="text-sm text-xk-text-muted mb-5">Crea tu primer grupo para organizar alumnos y maestros.</p>
          <Button onClick={() => setShowForm(true)} className="gap-2">
            <Plus size={16} /> Crear primer grupo
          </Button>
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-xk-card border border-xk-border rounded-2xl p-10 text-center text-sm text-xk-text-muted">
          No hay grupos que coincidan con los filtros.
        </div>
      ) : (
        <>
          {/* Desktop table */}
          <div className="hidden md:block bg-xk-card border border-xk-border rounded-2xl overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-xk-subtle border-b border-xk-border">
                <tr className="text-xs font-semibold text-xk-text-muted uppercase tracking-wider">
                  <th className="text-left px-4 py-3">Grupo</th>
                  <th className="text-left px-4 py-3">Grado</th>
                  <th className="text-left px-4 py-3">Maestro Principal</th>
                  <th className="text-left px-4 py-3">Alumnos</th>
                  <th className="text-left px-4 py-3">Ciclo Escolar</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody>
                {filtered.map(g => (
                  <tr
                    key={g.id}
                    onClick={() => router.push(`/dashboard/grupos/${g.id}`)}
                    className="border-b border-xk-border last:border-0 hover:bg-xk-subtle/50 transition-colors cursor-pointer"
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-xk-accent-light flex items-center justify-center shrink-0">
                          <span className="text-xs font-bold text-xk-accent">
                            {g.name.slice(0, 2).toUpperCase()}
                          </span>
                        </div>
                        <span className="font-medium text-xk-text">{g.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-xk-text-secondary">{gradeLabel(g)}</td>
                    <td className="px-4 py-3 text-xk-text-secondary">{g.teacher_name ?? '—'}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5 text-xk-text-secondary">
                        <Users size={13} />
                        <span className="font-mono text-xs">{g.student_count}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-xk-text-muted text-xs font-mono">{g.academic_year}</td>
                    <td className="px-4 py-3 text-right" onClick={e => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={e => handleEdit(g, e)}
                          className="p-1.5 rounded-lg hover:bg-xk-subtle transition-colors"
                          title="Editar"
                        >
                          <Pencil size={13} className="text-xk-text-muted" />
                        </button>
                        <ConfirmDialog
                          trigger={
                            <button
                              disabled={deletingId === g.id || pending}
                              className="p-1.5 rounded-lg hover:bg-red-50 transition-colors"
                              title="Eliminar"
                            >
                              {deletingId === g.id
                                ? <Loader2 size={13} className="animate-spin text-red-500" />
                                : <Trash2 size={13} className="text-red-400" />
                              }
                            </button>
                          }
                          title={`¿Eliminar "${g.name}"?`}
                          description="Esta acción no se puede deshacer. El grupo y toda su configuración serán eliminados."
                          confirmLabel="Sí, eliminar"
                          destructive
                          onConfirm={() => handleDelete(g)}
                        />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile cards */}
          <div className="md:hidden space-y-3">
            {filtered.map(g => (
              <div
                key={g.id}
                onClick={() => router.push(`/dashboard/grupos/${g.id}`)}
                className="bg-xk-card border border-xk-border rounded-2xl p-4 hover:border-xk-accent transition-colors cursor-pointer"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-medium text-xk-text">{g.name}</p>
                    <p className="text-xs text-xk-text-muted mt-0.5">{gradeLabel(g)}</p>
                  </div>
                  <div className="flex gap-1 shrink-0" onClick={e => e.stopPropagation()}>
                    <button onClick={e => handleEdit(g, e)} className="p-1.5 rounded-lg hover:bg-xk-subtle">
                      <Pencil size={13} className="text-xk-text-muted" />
                    </button>
                    <ConfirmDialog
                      trigger={
                        <button disabled={deletingId === g.id} className="p-1.5 rounded-lg hover:bg-red-50">
                          {deletingId === g.id
                            ? <Loader2 size={13} className="animate-spin text-red-500" />
                            : <Trash2 size={13} className="text-red-400" />
                          }
                        </button>
                      }
                      title={`¿Eliminar "${g.name}"?`}
                      description="Esta acción no se puede deshacer."
                      confirmLabel="Sí, eliminar"
                      destructive
                      onConfirm={() => handleDelete(g)}
                    />
                  </div>
                </div>
                <div className="flex items-center justify-between mt-3 pt-3 border-t border-xk-border">
                  <div className="flex items-center gap-1 text-xs text-xk-text-secondary">
                    <Users size={12} /> {g.student_count} alumnos
                  </div>
                  <span className="text-xs text-xk-text-muted font-mono">{g.academic_year}</span>
                </div>
                {g.teacher_name && (
                  <p className="text-xs text-xk-text-muted mt-1.5 truncate">Maestro/a: {g.teacher_name}</p>
                )}
              </div>
            ))}
          </div>

          <p className="text-xs text-xk-text-muted mt-3">
            {filtered.length} grupo{filtered.length !== 1 ? 's' : ''}
          </p>
        </>
      )}

      {showForm && (
        <GroupForm
          group={editing}
          teachers={teachers}
          onClose={() => { setShowForm(false); setEditing(undefined) }}
          onSuccess={() => router.refresh()}
        />
      )}
    </>
  )
}
