'use client'

import { useState, useTransition, useMemo } from 'react'
import { useRouter }                         from 'next/navigation'
import { toast }                             from 'sonner'
import { Plus, Search, UserX, Loader2, ChevronLeft, ChevronRight } from 'lucide-react'
import { Button }                            from '@/components/ui/button'
import { ConfirmDialog }                     from '@/components/ConfirmDialog'
import StudentForm                           from './StudentForm'
import { deactivateStudent, type StudentItem } from '@/app/actions/students'
import type { GroupItem }                    from '@/app/actions/groups'

const PAGE_SIZE = 20

interface Props {
  students: StudentItem[]
  groups:   GroupItem[]
}

export default function AlumnosClient({ students, groups }: Props) {
  const router = useRouter()
  const [showForm, setShowForm]     = useState(false)
  const [search, setSearch]         = useState('')
  const [filterGroup, setGroup]     = useState('')
  const [filterLevel, setLevel]     = useState('')
  const [filterActive, setActive]   = useState<'all' | 'active' | 'inactive'>('active')
  const [page, setPage]             = useState(1)
  const [deactivatingId, setDeacId] = useState<string | null>(null)
  const [pending, start]            = useTransition()

  const levels = useMemo(() => {
    const set = new Set<string>()
    students.forEach(s => { if (s.group_level) set.add(s.group_level) })
    return Array.from(set).sort()
  }, [students])

  const filtered = useMemo(() => {
    return students.filter(s => {
      const name = `${s.first_name} ${s.last_name}`.toLowerCase()
      const matchSearch = !search || name.includes(search.toLowerCase()) ||
        (s.student_code?.toLowerCase().includes(search.toLowerCase()) ?? false) ||
        (s.curp?.toLowerCase().includes(search.toLowerCase()) ?? false)
      const matchGroup  = !filterGroup || s.group_id === filterGroup
      const matchLevel  = !filterLevel || s.group_level === filterLevel
      const matchActive = filterActive === 'all' ? true
        : filterActive === 'active' ? s.active : !s.active
      return matchSearch && matchGroup && matchLevel && matchActive
    })
  }, [students, search, filterGroup, filterLevel, filterActive])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const safePage   = Math.min(page, totalPages)
  const paged      = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE)

  function resetPage() { setPage(1) }

  function handleDeactivate(s: StudentItem) {
    setDeacId(s.id)
    start(async () => {
      const res = await deactivateStudent(s.id)
      setDeacId(null)
      if (res.error) toast.error(res.error)
      else { toast.success('Alumno dado de baja'); router.refresh() }
    })
  }

  function Avatar({ s }: { s: StudentItem }) {
    if (s.photo_url) {
      return (
        <img
          src={s.photo_url}
          alt={`${s.first_name} ${s.last_name}`}
          className="w-8 h-8 rounded-full object-cover shrink-0"
        />
      )
    }
    return (
      <div className="w-8 h-8 rounded-full bg-xk-accent-light flex items-center justify-center shrink-0">
        <span className="text-xs font-bold text-xk-accent">
          {s.first_name[0]}{s.last_name[0]}
        </span>
      </div>
    )
  }

  return (
    <>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-heading text-2xl font-bold text-xk-text">Alumnos</h1>
          <p className="text-sm text-xk-text-secondary mt-1">
            {students.filter(s => s.active).length} alumnos activos
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
            onChange={e => { setSearch(e.target.value); resetPage() }}
            placeholder="Buscar por nombre, matrícula o CURP…"
            className="w-full pl-8 pr-3 py-2 rounded-xl border border-xk-border bg-xk-card text-sm text-xk-text placeholder:text-xk-text-muted focus:outline-none focus:ring-2 focus:ring-xk-accent focus:border-transparent"
          />
        </div>

        {levels.length > 1 && (
          <select
            value={filterLevel}
            onChange={e => { setLevel(e.target.value); setGroup(''); resetPage() }}
            className="rounded-xl border border-xk-border bg-xk-card px-3 py-2 text-sm text-xk-text focus:outline-none focus:ring-2 focus:ring-xk-accent focus:border-transparent"
          >
            <option value="">Todos los niveles</option>
            {levels.map(l => <option key={l} value={l}>{l}</option>)}
          </select>
        )}

        {groups.length > 0 && (
          <select
            value={filterGroup}
            onChange={e => { setGroup(e.target.value); resetPage() }}
            className="rounded-xl border border-xk-border bg-xk-card px-3 py-2 text-sm text-xk-text focus:outline-none focus:ring-2 focus:ring-xk-accent focus:border-transparent"
          >
            <option value="">Todos los grupos</option>
            {groups
              .filter(g => !filterLevel || g.level === filterLevel)
              .map(g => <option key={g.id} value={g.id}>{g.name}</option>)
            }
          </select>
        )}

        <div className="flex rounded-xl border border-xk-border overflow-hidden bg-xk-card">
          {(['active', 'all', 'inactive'] as const).map(v => (
            <button
              key={v}
              onClick={() => { setActive(v); resetPage() }}
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
                  <th className="text-left px-4 py-3 hidden lg:table-cell">CURP</th>
                  <th className="text-left px-4 py-3">Grupo</th>
                  <th className="text-left px-4 py-3">Estado</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody>
                {paged.map(s => (
                  <tr
                    key={s.id}
                    onClick={() => router.push(`/dashboard/alumnos/${s.id}`)}
                    className="border-b border-xk-border last:border-0 hover:bg-xk-subtle/50 transition-colors cursor-pointer"
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2.5">
                        <Avatar s={s} />
                        <span className="font-medium text-xk-text">{s.first_name} {s.last_name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-xk-text-muted">{s.student_code ?? '—'}</td>
                    <td className="px-4 py-3 font-mono text-xs text-xk-text-muted hidden lg:table-cell">
                      {s.curp ?? '—'}
                    </td>
                    <td className="px-4 py-3 text-xk-text-secondary">{s.group_name ?? '—'}</td>
                    <td className="px-4 py-3">
                      <span className={[
                        'inline-flex px-2 py-0.5 rounded-full text-xs font-medium',
                        s.active ? 'bg-green-100 text-green-700' : 'bg-zinc-100 text-zinc-500',
                      ].join(' ')}>
                        {s.active ? 'Activo' : 'Inactivo'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right" onClick={e => e.stopPropagation()}>
                      {s.active && (
                        <ConfirmDialog
                          trigger={
                            <button
                              disabled={deactivatingId === s.id || pending}
                              className="p-1.5 rounded-lg hover:bg-red-50 transition-colors"
                              title="Dar de baja"
                            >
                              {deactivatingId === s.id
                                ? <Loader2 size={13} className="animate-spin text-red-400" />
                                : <UserX size={13} className="text-red-400" />
                              }
                            </button>
                          }
                          title="¿Dar de baja al alumno?"
                          description={`${s.first_name} ${s.last_name} quedará inactivo. Puedes reactivarlo más adelante.`}
                          confirmLabel="Sí, dar de baja"
                          destructive
                          onConfirm={() => handleDeactivate(s)}
                        />
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile cards */}
          <div className="md:hidden space-y-3">
            {paged.map(s => (
              <button
                key={s.id}
                onClick={() => router.push(`/dashboard/alumnos/${s.id}`)}
                className="block w-full text-left bg-xk-card border border-xk-border rounded-2xl p-4 hover:border-xk-accent transition-colors"
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <Avatar s={s} />
                    <div>
                      <p className="font-medium text-xk-text text-sm">{s.first_name} {s.last_name}</p>
                      {s.group_name && <p className="text-xs text-xk-text-muted">{s.group_name}</p>}
                    </div>
                  </div>
                  <span className="text-xs text-xk-accent font-medium shrink-0">Ver →</span>
                </div>
              </button>
            ))}
          </div>

          {/* Footer: count + pagination */}
          <div className="flex items-center justify-between mt-3">
            <p className="text-xs text-xk-text-muted">
              {filtered.length} alumno{filtered.length !== 1 ? 's' : ''}
              {totalPages > 1 && ` · página ${safePage} de ${totalPages}`}
            </p>
            {totalPages > 1 && (
              <div className="flex items-center gap-1">
                <button
                  disabled={safePage <= 1}
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  className="p-1.5 rounded-lg border border-xk-border hover:bg-xk-subtle disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronLeft size={13} />
                </button>
                {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                  const n = safePage <= 3 ? i + 1
                    : safePage >= totalPages - 2 ? totalPages - 4 + i
                    : safePage - 2 + i
                  if (n < 1 || n > totalPages) return null
                  return (
                    <button
                      key={n}
                      onClick={() => setPage(n)}
                      className={[
                        'w-7 h-7 rounded-lg text-xs font-medium transition-colors',
                        n === safePage
                          ? 'bg-xk-accent text-white'
                          : 'border border-xk-border hover:bg-xk-subtle text-xk-text',
                      ].join(' ')}
                    >
                      {n}
                    </button>
                  )
                })}
                <button
                  disabled={safePage >= totalPages}
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  className="p-1.5 rounded-lg border border-xk-border hover:bg-xk-subtle disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronRight size={13} />
                </button>
              </div>
            )}
          </div>
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
