'use server'

import { revalidatePath } from 'next/cache'
import { createClient }   from '@/lib/supabase/server'

// ─── Tipos ────────────────────────────────────────────────────────────────────

export type GroupItem = {
  id:                  string
  name:                string
  grade:               number | null
  level:               string | null
  academic_year:       string
  active:              boolean
  student_count:       number
  teacher_name:        string | null
  teacher_primary_id:  string | null
  created_at:          string
}

export type GroupDetail = GroupItem & {
  students: Array<{
    id:           string
    first_name:   string
    last_name:    string
    student_code: string | null
    active:       boolean
  }>
  teacher_spanish_id:   string | null
  teacher_assistant_id: string | null
}

export type CreateGroupInput = {
  name:                  string
  grade?:                number | null
  level?:                string | null
  academic_year:         string
  teacher_primary_id?:   string | null
  teacher_spanish_id?:   string | null
  teacher_assistant_id?: string | null
}

export type UpdateGroupInput = Partial<CreateGroupInput> & { active?: boolean }

// ─── Helper interno ───────────────────────────────────────────────────────────

async function requireSchoolAdmin(): Promise<{ userId: string; schoolId: string }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('No autenticado')

  const { data: profile, error } = await supabase
    .from('user_profiles')
    .select('school_id, role')
    .eq('id', user.id)
    .single()

  if (error || !profile) throw new Error('Perfil no encontrado')
  if (!['admin', 'director'].includes(profile.role)) {
    throw new Error('Acceso denegado: requiere rol admin o director')
  }
  if (!profile.school_id) throw new Error('Usuario sin escuela asignada')

  return { userId: user.id, schoolId: profile.school_id }
}

// ─── listGroups ───────────────────────────────────────────────────────────────

export async function listGroups(): Promise<GroupItem[]> {
  const { schoolId } = await requireSchoolAdmin()
  const supabase = await createClient()

  const { data: groups, error } = await supabase
    .from('groups')
    .select(`
      id,
      name,
      grade,
      level,
      academic_year,
      active,
      teacher_primary_id,
      created_at,
      teacher:user_profiles!groups_teacher_primary_id_fkey (
        first_name,
        last_name
      )
    `)
    .eq('school_id', schoolId)
    .order('name', { ascending: true })

  if (error) throw new Error(error.message)
  if (!groups) return []

  // Conteo de alumnos activos por grupo
  const groupIds = groups.map((g) => g.id)
  const studentCountMap = new Map<string, number>()

  if (groupIds.length > 0) {
    for (const gid of groupIds) {
      const { count } = await supabase
        .from('students')
        .select('id', { count: 'exact', head: true })
        .eq('group_id', gid)
        .eq('active', true)
      studentCountMap.set(gid, count ?? 0)
    }
  }

  return groups.map((g) => {
    const teacherRaw = g.teacher as unknown
    const teacher = Array.isArray(teacherRaw) ? (teacherRaw[0] as { first_name: string | null; last_name: string | null } | undefined) : null
    const teacherName = teacher
      ? [teacher.first_name, teacher.last_name].filter(Boolean).join(' ').trim() || null
      : null

    return {
      id:                 g.id,
      name:               g.name,
      grade:              g.grade,
      level:              g.level,
      academic_year:      g.academic_year,
      active:             g.active,
      student_count:      studentCountMap.get(g.id) ?? 0,
      teacher_name:       teacherName,
      teacher_primary_id: g.teacher_primary_id,
      created_at:         g.created_at,
    }
  })
}

// ─── getGroup ─────────────────────────────────────────────────────────────────

export async function getGroup(groupId: string): Promise<GroupDetail> {
  const { schoolId } = await requireSchoolAdmin()
  const supabase = await createClient()

  const { data: group, error } = await supabase
    .from('groups')
    .select(`
      id,
      name,
      grade,
      level,
      academic_year,
      active,
      teacher_primary_id,
      teacher_spanish_id,
      teacher_assistant_id,
      created_at,
      teacher:user_profiles!groups_teacher_primary_id_fkey (
        first_name,
        last_name
      )
    `)
    .eq('id', groupId)
    .eq('school_id', schoolId)
    .single()

  if (error || !group) throw new Error(error?.message ?? 'Grupo no encontrado')

  const { data: students, error: studentsError } = await supabase
    .from('students')
    .select('id, first_name, last_name, student_code, active')
    .eq('group_id', groupId)
    .eq('school_id', schoolId)
    .order('last_name', { ascending: true })

  if (studentsError) throw new Error(studentsError.message)

  const { count: studentCount } = await supabase
    .from('students')
    .select('id', { count: 'exact', head: true })
    .eq('group_id', groupId)
    .eq('active', true)

  const teacherRaw = group.teacher as unknown
  const teacher = Array.isArray(teacherRaw) ? (teacherRaw[0] as { first_name: string | null; last_name: string | null } | undefined) : null
  const teacherName = teacher
    ? [teacher.first_name, teacher.last_name].filter(Boolean).join(' ').trim() || null
    : null

  return {
    id:                   group.id,
    name:                 group.name,
    grade:                group.grade,
    level:                group.level,
    academic_year:        group.academic_year,
    active:               group.active,
    student_count:        studentCount ?? 0,
    teacher_name:         teacherName,
    teacher_primary_id:   group.teacher_primary_id,
    teacher_spanish_id:   group.teacher_spanish_id,
    teacher_assistant_id: group.teacher_assistant_id,
    created_at:           group.created_at,
    students:             students ?? [],
  }
}

// ─── createGroup ──────────────────────────────────────────────────────────────

export async function createGroup(
  data: CreateGroupInput
): Promise<{ error: string | null; id: string | null }> {
  const { schoolId } = await requireSchoolAdmin()
  const supabase = await createClient()

  const { data: created, error } = await supabase
    .from('groups')
    .insert({
      school_id:            schoolId,
      name:                 data.name,
      grade:                data.grade ?? null,
      level:                data.level ?? null,
      academic_year:        data.academic_year,
      teacher_primary_id:   data.teacher_primary_id ?? null,
      teacher_spanish_id:   data.teacher_spanish_id ?? null,
      teacher_assistant_id: data.teacher_assistant_id ?? null,
    })
    .select('id')
    .single()

  if (error) return { error: error.message, id: null }

  revalidatePath('/dashboard/grupos')
  return { error: null, id: created.id }
}

// ─── updateGroup ──────────────────────────────────────────────────────────────

export async function updateGroup(
  groupId: string,
  data: UpdateGroupInput
): Promise<{ error: string | null }> {
  const { schoolId } = await requireSchoolAdmin()
  const supabase = await createClient()

  const payload: Record<string, unknown> = {}
  if (data.name                  !== undefined) payload.name                  = data.name
  if (data.grade                 !== undefined) payload.grade                 = data.grade
  if (data.level                 !== undefined) payload.level                 = data.level
  if (data.academic_year         !== undefined) payload.academic_year         = data.academic_year
  if (data.active                !== undefined) payload.active                = data.active
  if (data.teacher_primary_id    !== undefined) payload.teacher_primary_id    = data.teacher_primary_id
  if (data.teacher_spanish_id    !== undefined) payload.teacher_spanish_id    = data.teacher_spanish_id
  if (data.teacher_assistant_id  !== undefined) payload.teacher_assistant_id  = data.teacher_assistant_id

  const { error } = await supabase
    .from('groups')
    .update(payload)
    .eq('id', groupId)
    .eq('school_id', schoolId)

  if (error) return { error: error.message }

  revalidatePath('/dashboard/grupos')
  return { error: null }
}

// ─── deleteGroup ──────────────────────────────────────────────────────────────

export async function deleteGroup(groupId: string): Promise<{ error: string | null }> {
  const { schoolId } = await requireSchoolAdmin()
  const supabase = await createClient()

  // Verificar que no haya alumnos activos en el grupo
  const { count, error: countError } = await supabase
    .from('students')
    .select('id', { count: 'exact', head: true })
    .eq('group_id', groupId)
    .eq('school_id', schoolId)
    .eq('active', true)

  if (countError) return { error: countError.message }
  if (count && count > 0) {
    return { error: 'El grupo tiene alumnos activos. Muévelos antes de eliminar.' }
  }

  const { error } = await supabase
    .from('groups')
    .delete()
    .eq('id', groupId)
    .eq('school_id', schoolId)

  if (error) return { error: error.message }

  revalidatePath('/dashboard/grupos')
  return { error: null }
}
