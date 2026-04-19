'use server'

import { revalidatePath }      from 'next/cache'
import { createClient }        from '@/lib/supabase/server'
import { requireSchoolAdmin }  from '@/lib/auth'

// ─── Tipos ────────────────────────────────────────────────────────────────────

export type StudentItem = {
  id:             string
  first_name:     string
  last_name:      string
  student_code:   string | null
  group_id:       string | null
  group_name:     string | null
  group_level:    string | null
  date_of_birth:  string | null
  curp:           string | null
  photo_url:      string | null
  active:         boolean
  created_at:     string
}

export type StudentDetail = StudentItem & {
  allergies:     string | null
  medical_notes: string | null
}

export type CreateStudentInput = {
  first_name:     string
  last_name:      string
  student_code?:  string | null
  group_id?:      string | null
  date_of_birth?: string | null
  allergies?:     string | null
  medical_notes?: string | null
  curp?:          string | null
  photo_url?:     string | null
}

export type UpdateStudentInput = Partial<CreateStudentInput> & { active?: boolean }

// ─── listStudents ─────────────────────────────────────────────────────────────

export async function listStudents(filters?: {
  groupId?: string
  search?:  string
  active?:  boolean
}): Promise<StudentItem[]> {
  const { schoolId } = await requireSchoolAdmin()
  const supabase = await createClient()

  let query = supabase
    .from('students')
    .select(`
      id,
      first_name,
      last_name,
      student_code,
      group_id,
      date_of_birth,
      curp,
      photo_url,
      active,
      created_at,
      group:groups!students_group_id_fkey (
        name,
        level
      )
    `)
    .eq('school_id', schoolId)
    .order('last_name', { ascending: true })

  if (filters?.groupId) {
    query = query.eq('group_id', filters.groupId)
  }

  if (filters?.active !== undefined) {
    query = query.eq('active', filters.active)
  }

  if (filters?.search) {
    const term = `%${filters.search}%`
    query = query.or(`first_name.ilike.${term},last_name.ilike.${term}`)
  }

  const { data: students, error } = await query

  if (error) throw new Error(error.message)
  if (!students) return []

  return students.map((s) => {
    const groupRaw = s.group as unknown
    const group = Array.isArray(groupRaw)
      ? (groupRaw[0] as { name: string; level: string | null } | undefined)
      : null
    return {
      id:            s.id,
      first_name:    s.first_name,
      last_name:     s.last_name,
      student_code:  s.student_code,
      group_id:      s.group_id,
      group_name:    group?.name  ?? null,
      group_level:   group?.level ?? null,
      date_of_birth: s.date_of_birth,
      curp:          s.curp       ?? null,
      photo_url:     s.photo_url  ?? null,
      active:        s.active,
      created_at:    s.created_at,
    }
  })
}

// ─── getStudent ───────────────────────────────────────────────────────────────

export async function getStudent(studentId: string): Promise<StudentDetail> {
  const { schoolId } = await requireSchoolAdmin()
  const supabase = await createClient()

  const { data: student, error } = await supabase
    .from('students')
    .select(`
      id,
      first_name,
      last_name,
      student_code,
      group_id,
      date_of_birth,
      curp,
      photo_url,
      active,
      created_at,
      allergies,
      medical_notes,
      group:groups!students_group_id_fkey (
        name,
        level
      )
    `)
    .eq('id', studentId)
    .eq('school_id', schoolId)
    .single()

  if (error || !student) throw new Error(error?.message ?? 'Alumno no encontrado')

  const groupRaw = student.group as unknown
  const group = Array.isArray(groupRaw)
    ? (groupRaw[0] as { name: string; level: string | null } | undefined)
    : null

  return {
    id:            student.id,
    first_name:    student.first_name,
    last_name:     student.last_name,
    student_code:  student.student_code,
    group_id:      student.group_id,
    group_name:    group?.name  ?? null,
    group_level:   group?.level ?? null,
    date_of_birth: student.date_of_birth,
    curp:          student.curp       ?? null,
    photo_url:     student.photo_url  ?? null,
    active:        student.active,
    created_at:    student.created_at,
    allergies:     student.allergies,
    medical_notes: student.medical_notes,
  }
}

// ─── createStudent ────────────────────────────────────────────────────────────

export async function createStudent(
  data: CreateStudentInput
): Promise<{ error: string | null; id: string | null }> {
  const { schoolId } = await requireSchoolAdmin()
  const supabase = await createClient()

  const { data: created, error } = await supabase
    .from('students')
    .insert({
      school_id:     schoolId,
      first_name:    data.first_name,
      last_name:     data.last_name,
      student_code:  data.student_code  ?? null,
      group_id:      data.group_id      ?? null,
      date_of_birth: data.date_of_birth ?? null,
      allergies:     data.allergies     ?? null,
      medical_notes: data.medical_notes ?? null,
      curp:          data.curp          ?? null,
      photo_url:     data.photo_url     ?? null,
    })
    .select('id')
    .single()

  if (error) return { error: error.message, id: null }

  revalidatePath('/dashboard/alumnos')
  return { error: null, id: created.id }
}

// ─── updateStudent ────────────────────────────────────────────────────────────

export async function updateStudent(
  studentId: string,
  data: UpdateStudentInput
): Promise<{ error: string | null }> {
  const { schoolId } = await requireSchoolAdmin()
  const supabase = await createClient()

  const payload: Record<string, unknown> = {}
  if (data.first_name    !== undefined) payload.first_name    = data.first_name
  if (data.last_name     !== undefined) payload.last_name     = data.last_name
  if (data.student_code  !== undefined) payload.student_code  = data.student_code
  if (data.group_id      !== undefined) payload.group_id      = data.group_id
  if (data.date_of_birth !== undefined) payload.date_of_birth = data.date_of_birth
  if (data.allergies     !== undefined) payload.allergies     = data.allergies
  if (data.medical_notes !== undefined) payload.medical_notes = data.medical_notes
  if (data.curp          !== undefined) payload.curp          = data.curp
  if (data.photo_url     !== undefined) payload.photo_url     = data.photo_url
  if (data.active        !== undefined) payload.active        = data.active

  const { error } = await supabase
    .from('students')
    .update(payload)
    .eq('id', studentId)
    .eq('school_id', schoolId)

  if (error) return { error: error.message }

  revalidatePath('/dashboard/alumnos')
  return { error: null }
}

// ─── deactivateStudent ────────────────────────────────────────────────────────

export async function deactivateStudent(studentId: string): Promise<{ error: string | null }> {
  const { schoolId } = await requireSchoolAdmin()
  const supabase = await createClient()

  const { error } = await supabase
    .from('students')
    .update({ active: false })
    .eq('id', studentId)
    .eq('school_id', schoolId)

  if (error) return { error: error.message }

  revalidatePath('/dashboard/alumnos')
  return { error: null }
}
