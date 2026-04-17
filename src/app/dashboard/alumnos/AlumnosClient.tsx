'use client'

import { useState, useTransition, useMemo } from 'react'
import { useRouter }                         from 'next/navigation'
import { toast }                             from 'sonner'
import { Plus, Search, UserX, Pencil, Loader2 } from 'lucide-react'
import { Button }                            from '@/components/ui/button'
import StudentForm                           from './StudentForm'
import { deactivateStudent, type StudentItem } from '@/app/actions/students'
import type { GroupItem }                    from '@/app/actions/groups'

interface Props {
  students: StudentItem[]
  groups:   GroupItem[]
}

export default function AlumnosClient({ students, groups }: Props) {
  const router = useRouter()
  const [showForm, setShowForm]     = useState(false)
  const [search, setSearch]         = useState('')
  const [filterGroup, setGroup]     = useState('')
  const [filterActive, setActive]   = useState<'all' | 'active' | 'inactive'>('active')
  const [deactivatingId, setDeacId] = useState<string | null>(null)
  const [pending, start]            = useTransition()

  const filtered = useMemo(() => {
    return students.filter((s) => {
      const name = `${s.first_name} ${s.last_name}`.toLowerCase()
      const matchSearch = !search || name.includes(search.toLowerCase()) ||
        (s.student_code?.toLowerCase().includes(search.toLowerCase()) ?? false)
      const matchGroup  = !filterGroup || s.group_id === filterGroup
      const matchActive = filterActive === 'all' ? true
        : filterActive === 'active' ? s.active : !s.active
      return matchSearch && matchGroup && matchActive
    })
  }, [students, search, filterGroup, filterActive])

  function handleDeactivate(s: StudentItem, e: React.MouseEvent) {
    e.stopPropagation()
    if (!confirm(`¿Dar de baja a ${s.first_name} ${s.last_name}? El alumno quedará inactivo.`)) return
    setDeacId(s.id)
    start(async () => {
      const res = await deactivateStudent(s.id)
      setDeacId(null)
      if (res.error) toast.error(res.error)
      else { toast.success('Alumno dado de baja'); router.refresh() }
    })
  }

  return (
    <>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-heading text-2xl font-bold text-xk-text">Alumnos</h1>
          <p className="text-sm text-xk-text-secondary mt-1">
            {students.filter((s) => s.active).length} alumnos activos
          </p>
        </div>
        <Button onClick={() => setShowForm(true)} className="gap-2">
          <Plus size={16} /> Registrar alumno
        </Button>
      </div>

      {/* Filtros */}
      <div className="flex flex-wrap gap-3 mb-5">
        <div className="relative flex-1 min-w-[200px]">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-xk-text-muted" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por nombre o matrícula…"
            className="w-full pl-8 pr-3 py-2 rounded-xl border border-xk-border bg-xk-card text-sm text-xk-text placeholder:text-xk-text-muted focus:outline-none focus:ring-2 focus:ring-xk-accent focus:border-transparent"
          />
        </div>

        {groups.length > 0 && (
          <select
            value={filterGroup}
            onChange={(e) => setGroup(e.target.value)}
            className="rounded-xl border border-xk-border bg-xk-card px-3 py-2 text-sm text-xk-text focus:outline-none focus:ring-2 focus:ring-xk-accent focus:border-transparent"
          >
            <option value="">Todos los grupos</option>
            {groups.map((g) => (
              <option key={g.id} value={g.id}>{g.name}</option>
            ))}
          </select>
        )}

        <div className="flex rounded-xl border border-xk-border overflow-hidden bg-xk-card">
          {(['active', 'all', 'inactive'] as const).map((v) => (
            <button
              key={v}
              onClick={() => setActive(v)}
              className={[
                'px-3 py-2 text-xs font-medium transition-colors',
                filterActive === v
                  ? 'bg-xk-accent text-white'
                  : 'text-xk-text-secondary hover:bg-xk-subtle',
              ].join(' ')}
            >
              {{ active: 'Activos', all: 'Todos', inactive: 'Inactivos' }[v]}
            </button>
          ))}
        </div>
      </div>

      {/* Tabla */}
      {filtered.length === 0 ? (
        <div className="bg-xk-card border border-xk-border rounded-2xl p-10 text-center text-sm text-xk-text-muted">
          {students.length === 0
            ? 'No hay alumnos registrados aún. Comienza registrando el primero.'
            : 'No hay alumnos que coincidan con los filtros.'}
        </div>
      ) : (
        <>
          {/* Desktop table */}
          <div className="hidden md:block bg-xk-card border border-xk-border rounded-2xl overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-xk-subtle border-b border-xk-border">
                <tr className="text-xs font-semibold text-xk-text-muted uppercase tracking-wider">
                  <th className="text-left px-4 py-3">Nombre</th>
                  <th className="text-left px-4 py-3">Matrícula</th>
                  <th className="text-left px-4 py-3">Grupo</th>
                  <th className="text-left px-4 py-3">Estado</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody>
                {filtered.map((s) => (
                  <tr
                    key={s.id}
                    onClick={() => router.push(`/dashboard/alumnos/${s.id}`)}
                    className="border-b border-xk-border last:border-0 hover:bg-xk-subtle/50 transition-colors cursor-pointer"
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-xk-accent-light flex items-center justify-center shrink-0">
                          <span className="text-xs font-bold text-xk-accent">
                            {s.first_name[0]}{s.last_name[0]}
                          </span>
                        </div>
                        <span className="font-medium text-xk-text">{s.first_name} {s.last_name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-xk-text-muted">{s.student_code ?? '—'}</td>
                    <td className="px-4 py-3 text-xk-text-secondary">{s.group_name ?? '—'}</td>
                    <td className="px-4 py-3">
                      <span className={[
                        'inline-flex px-2 py-0.5 rounded-full text-xs font-medium',
                        s.active
                          ? 'bg-green-100 text-green-700'
                          : 'bg-zinc-100 text-zinc-500',
                      ].join(' ')}>
                        {s.active ? 'Activo' : 'Inactivo'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      {s.active && (
                        <button
                          onClick={(e) => handleDeactivate(s, e)}
                          disabled={deactivatingId === s.id || pending}
                          className="p-1.5 rounded-lg hover:bg-red-50 transition-colors"
                          title="Dar de baja"
                        >
                          {deactivatingId === s.id
                            ? <Loader2 size={13} className="animate-spin text-red-400" />
                            : <UserX size={13} className="text-red-400" />
                          }
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile cards */}
          <div className="md:hidden space-y-3">
            {filtered.map((s) => (
              <button
                key={s.id}
                onClick={() => router.push(`/dashboard/alumnos/${s.id}`)}
                className="block w-full text-left bg-xk-card border border-xk-border rounded-2xl p-4 hover:border-xk-accent transition-colors"
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-full bg-xk-accent-light flex items-center justify-center shrink-0">
                      <span className="text-xs font-bold text-xk-accent">
                        {s.first_name[0]}{s.last_name[0]}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium text-xk-text text-sm">{s.first_name} {s.last_name}</p>
                      {s.group_name && <p className="text-xs text-xk-text-muted">{s.group_name}</p>}
                    </div>
                  </div>
                  <span className="text-xs text-xk-accent font-medium">Ver →</span>
                </div>
              </button>
            ))}
          </div>

          <p className="text-xs text-xk-text-muted mt-3">{filtered.length} alumno{filtered.length !== 1 ? 's' : ''}</p>
        </>
      )}

      {showForm && (
        <StudentForm
          groups={groups}
          onClose={() => setShowForm(false)}
          onSuccess={() => router.refresh()}
        />
      )}
    </>
  )
}
