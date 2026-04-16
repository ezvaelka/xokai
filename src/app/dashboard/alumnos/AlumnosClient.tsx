'use client'

import * as React from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { UserPlus, GraduationCap, MoreHorizontal, Pencil, PowerOff, Power } from 'lucide-react'
import { supabase } from '@/lib/supabase/client'
import { PageHeader } from '@/components/PageHeader'
import { DataTable, type Column } from '@/components/DataTable'
import { FormModal } from '@/components/FormModal'
import { ConfirmDialog } from '@/components/ConfirmDialog'
import { StatusBadge } from '@/components/StatusBadge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

// ─── Types ───────────────────────────────────────────────────────────────────

interface Student {
  id: string
  student_code: string | null
  first_name: string
  last_name: string
  active: boolean
  group_id: string | null
  date_of_birth: string | null
  allergies: string | null
  medical_notes: string | null
}

interface Group {
  id: string
  name: string
}

interface Props {
  students: Student[]
  groups: Group[]
  schoolId: string
}

// ─── Schema ──────────────────────────────────────────────────────────────────

const alumnoSchema = z.object({
  first_name: z.string().min(1, 'El nombre es requerido'),
  last_name: z.string().min(1, 'El apellido es requerido'),
  student_code: z.string().optional(),
  group_id: z.string().optional(),
  date_of_birth: z.string().optional(),
  allergies: z.string().optional(),
  medical_notes: z.string().optional(),
})

type AlumnoForm = z.infer<typeof alumnoSchema>

// ─── Component ───────────────────────────────────────────────────────────────

export default function AlumnosClient({ students: initial, groups, schoolId }: Props) {
  const [students, setStudents] = React.useState<Student[]>(initial)
  const [modalOpen, setModalOpen] = React.useState(false)
  const [editing, setEditing] = React.useState<Student | null>(null)

  const groupMap = React.useMemo(
    () => Object.fromEntries(groups.map((g) => [g.id, g.name])),
    [groups]
  )

  const form = useForm<AlumnoForm>({
    resolver: zodResolver(alumnoSchema),
    defaultValues: { first_name: '', last_name: '', student_code: '', group_id: '', date_of_birth: '', allergies: '', medical_notes: '' },
  })

  function openNew() {
    setEditing(null)
    form.reset({ first_name: '', last_name: '', student_code: '', group_id: '', date_of_birth: '', allergies: '', medical_notes: '' })
    setModalOpen(true)
  }

  function openEdit(student: Student) {
    setEditing(student)
    form.reset({
      first_name: student.first_name,
      last_name: student.last_name,
      student_code: student.student_code ?? '',
      group_id: student.group_id ?? '',
      date_of_birth: student.date_of_birth ?? '',
      allergies: student.allergies ?? '',
      medical_notes: student.medical_notes ?? '',
    })
    setModalOpen(true)
  }

  async function onSubmit() {
    const valid = await form.trigger()
    if (!valid) return

    const values = form.getValues()
    const payload = {
      first_name: values.first_name,
      last_name: values.last_name,
      student_code: values.student_code || null,
      group_id: values.group_id || null,
      date_of_birth: values.date_of_birth || null,
      allergies: values.allergies || null,
      medical_notes: values.medical_notes || null,
    }

    if (editing) {
      const { error } = await supabase
        .from('students')
        .update(payload)
        .eq('id', editing.id)

      if (error) { toast.error('No se pudo actualizar el alumno'); return }

      setStudents((prev) =>
        prev.map((s) => s.id === editing.id ? { ...s, ...payload } : s)
      )
      toast.success('Alumno actualizado')
    } else {
      const { data, error } = await supabase
        .from('students')
        .insert({ ...payload, school_id: schoolId, active: true })
        .select()
        .single()

      if (error || !data) { toast.error('No se pudo crear el alumno'); return }

      setStudents((prev) => [...prev, data as Student].sort((a, b) =>
        `${a.last_name} ${a.first_name}`.localeCompare(`${b.last_name} ${b.first_name}`)
      ))
      toast.success('Alumno agregado')
    }

    setModalOpen(false)
  }

  async function toggleActive(student: Student) {
    const { error } = await supabase
      .from('students')
      .update({ active: !student.active })
      .eq('id', student.id)

    if (error) { toast.error('No se pudo actualizar el estado'); return }

    setStudents((prev) =>
      prev.map((s) => s.id === student.id ? { ...s, active: !s.active } : s)
    )
    toast.success(student.active ? 'Alumno desactivado' : 'Alumno reactivado')
  }

  // ─── Table columns ──────────────────────────────────────────────────────────

  const columns: Column<Student>[] = [
    {
      key: 'last_name',
      header: 'Nombre',
      cell: (s) => (
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-xk-accent-light text-xk-accent text-xs font-semibold">
            {s.first_name[0]}{s.last_name[0]}
          </div>
          <div>
            <p className="font-medium text-xk-text">{s.first_name} {s.last_name}</p>
            {s.student_code && <p className="text-xs text-xk-text-muted">#{s.student_code}</p>}
          </div>
        </div>
      ),
    },
    {
      key: 'group_id',
      header: 'Grupo',
      cell: (s) => s.group_id
        ? <span className="text-xk-text">{groupMap[s.group_id] ?? '—'}</span>
        : <span className="text-xk-text-muted">Sin grupo</span>,
    },
    {
      key: 'active',
      header: 'Estado',
      cell: (s) => <StatusBadge type="active" value={s.active} />,
      className: 'w-24',
    },
    {
      key: 'id',
      header: '',
      className: 'w-10',
      cell: (s) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <MoreHorizontal className="h-4 w-4" />
              <span className="sr-only">Acciones</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => openEdit(s)}>
              <Pencil className="mr-2 h-4 w-4" />
              Editar
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <ConfirmDialog
              trigger={
                <DropdownMenuItem
                  onSelect={(e) => e.preventDefault()}
                  className={s.active ? 'text-xk-danger focus:text-xk-danger' : ''}
                >
                  {s.active
                    ? <><PowerOff className="mr-2 h-4 w-4" />Desactivar</>
                    : <><Power className="mr-2 h-4 w-4" />Reactivar</>
                  }
                </DropdownMenuItem>
              }
              title={s.active ? '¿Desactivar alumno?' : '¿Reactivar alumno?'}
              description={
                s.active
                  ? `${s.first_name} ${s.last_name} no aparecerá en el semáforo ni en listas activas.`
                  : `${s.first_name} ${s.last_name} volverá a aparecer en todas las listas activas.`
              }
              confirmLabel={s.active ? 'Sí, desactivar' : 'Sí, reactivar'}
              destructive={s.active}
              onConfirm={() => toggleActive(s)}
            />
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ]

  // ─── Render ─────────────────────────────────────────────────────────────────

  return (
    <>
      <PageHeader
        title="Alumnos"
        description={`${students.filter((s) => s.active).length} alumnos activos`}
        action={
          <Button onClick={openNew} className="gap-2">
            <UserPlus className="h-4 w-4" />
            Nuevo alumno
          </Button>
        }
      />

      <DataTable
        data={students}
        columns={columns}
        searchPlaceholder="Buscar por nombre o matrícula..."
        searchFn={(s, q) =>
          `${s.first_name} ${s.last_name} ${s.student_code ?? ''}`.toLowerCase().includes(q)
        }
        rowKey={(s) => s.id}
        emptyTitle="Sin alumnos registrados"
        emptyDescription="Agrega el primer alumno para comenzar a usar el semáforo y el resto de los módulos."
        emptyIcon={<GraduationCap className="h-6 w-6" />}
        emptyAction={
          <Button onClick={openNew} className="gap-2">
            <UserPlus className="h-4 w-4" />
            Agregar primer alumno
          </Button>
        }
      />

      {/* ── Modal crear / editar ─────────────────────────────────────────── */}
      <FormModal
        open={modalOpen}
        onOpenChange={(open) => { setModalOpen(open); if (!open) form.reset() }}
        title={editing ? 'Editar alumno' : 'Nuevo alumno'}
        description={editing ? 'Actualiza los datos del alumno.' : 'Ingresa los datos del nuevo alumno.'}
        submitLabel={editing ? 'Guardar cambios' : 'Agregar alumno'}
        submitting={form.formState.isSubmitting}
        onSubmit={onSubmit}
        size="md"
      >
        {/* Nombre + Apellido */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="first_name">Nombre(s) <span className="text-xk-danger">*</span></Label>
            <Input id="first_name" placeholder="María" {...form.register('first_name')} />
            {form.formState.errors.first_name && (
              <p className="text-xs text-xk-danger">{form.formState.errors.first_name.message}</p>
            )}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="last_name">Apellido(s) <span className="text-xk-danger">*</span></Label>
            <Input id="last_name" placeholder="González" {...form.register('last_name')} />
            {form.formState.errors.last_name && (
              <p className="text-xs text-xk-danger">{form.formState.errors.last_name.message}</p>
            )}
          </div>
        </div>

        {/* Matrícula + Grupo */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="student_code">Matrícula</Label>
            <Input id="student_code" placeholder="2025-001" {...form.register('student_code')} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="group_id">Grupo</Label>
            <select
              id="group_id"
              {...form.register('group_id')}
              className="flex h-9 w-full rounded-md border border-xk-border bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus:outline-none focus:ring-1 focus:ring-xk-accent text-xk-text"
            >
              <option value="">Sin grupo</option>
              {groups.map((g) => (
                <option key={g.id} value={g.id}>{g.name}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Fecha de nacimiento */}
        <div className="space-y-1.5">
          <Label htmlFor="date_of_birth">Fecha de nacimiento</Label>
          <Input id="date_of_birth" type="date" {...form.register('date_of_birth')} />
        </div>

        {/* Alergias */}
        <div className="space-y-1.5">
          <Label htmlFor="allergies">Alergias</Label>
          <Input id="allergies" placeholder="Nueces, lactosa..." {...form.register('allergies')} />
        </div>

        {/* Notas médicas */}
        <div className="space-y-1.5">
          <Label htmlFor="medical_notes">Notas médicas</Label>
          <Input id="medical_notes" placeholder="Información relevante para el personal..." {...form.register('medical_notes')} />
        </div>
      </FormModal>
    </>
  )
}
