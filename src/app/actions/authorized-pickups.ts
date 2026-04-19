'use server'

import { revalidatePath } from 'next/cache'
import { createClient }   from '@/lib/supabase/server'

// ─── Tipos ────────────────────────────────────────────────────────────────────

export type AuthorizedPickup = {
  id:           string
  student_id:   string
  first_name:   string
  last_name:    string
  phone:        string | null
  photo_url:    string | null
  relationship: string | null
  notes:        string | null
  active:       boolean
  created_at:   string
}

export type AddAuthorizedPickupInput = {
  first_name:   string
  last_name:    string
  phone?:       string | null
  photo_url?:   string | null
  relationship?: string | null
  notes?:       string | null
}

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

// ─── listAuthorizedPickups ─────────────────────────────────────────────────────

export async function listAuthorizedPickups(studentId: string): Promise<AuthorizedPickup[]> {
  const { schoolId } = await requireSchoolAdmin()
  const supabase = await createClient()

  const { data: student, error: sError } = await supabase
    .from('students')
    .select('id')
    .eq('id', studentId)
    .eq('school_id', schoolId)
    .single()

  if (sError || !student) throw new Error('Alumno no encontrado')

  const { data, error } = await supabase
    .from('authorized_pickups')
    .select('*')
    .eq('student_id', studentId)
    .eq('active', true)
    .order('created_at', { ascending: true })

  if (error) throw new Error(error.message)
  return data ?? []
}

// ─── addAuthorizedPickup ───────────────────────────────────────────────────────

export async function addAuthorizedPickup(
  studentId: string,
  data: AddAuthorizedPickupInput
): Promise<{ error: string | null }> {
  const { schoolId } = await requireSchoolAdmin()
  const supabase = await createClient()

  const { data: student } = await supabase
    .from('students')
    .select('id')
    .eq('id', studentId)
    .eq('school_id', schoolId)
    .single()

  if (!student) return { error: 'Alumno no encontrado' }

  const { error } = await supabase
    .from('authorized_pickups')
    .insert({
      student_id:   studentId,
      first_name:   data.first_name,
      last_name:    data.last_name,
      phone:        data.phone        ?? null,
      photo_url:    data.photo_url    ?? null,
      relationship: data.relationship ?? null,
      notes:        data.notes        ?? null,
    })

  if (error) return { error: error.message }

  revalidatePath(`/dashboard/alumnos/${studentId}`)
  return { error: null }
}

// ─── removeAuthorizedPickup ────────────────────────────────────────────────────

export async function removeAuthorizedPickup(
  pickupId: string,
  studentId: string
): Promise<{ error: string | null }> {
  await requireSchoolAdmin()
  const supabase = await createClient()

  const { error } = await supabase
    .from('authorized_pickups')
    .update({ active: false })
    .eq('id', pickupId)
    .eq('student_id', studentId)

  if (error) return { error: error.message }

  revalidatePath(`/dashboard/alumnos/${studentId}`)
  return { error: null }
}
