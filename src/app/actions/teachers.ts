'use server'

import { revalidatePath }      from 'next/cache'
import { createClient }        from '@/lib/supabase/server'
import { createAdminClient }   from '@/lib/supabase/admin'
import { requireSchoolAdmin }  from '@/lib/auth'

// ─── Tipos ────────────────────────────────────────────────────────────────────

export type TeacherItem = {
  id:         string
  first_name: string | null
  last_name:  string | null
  email:      string | null
  role:       string
  active:     boolean
  created_at: string
}

export type InviteTeacherInput = {
  first_name: string
  last_name:  string
  email:      string
}

// ─── listTeachers ─────────────────────────────────────────────────────────────

export async function listTeachers(): Promise<TeacherItem[]> {
  const { schoolId } = await requireSchoolAdmin()
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('user_profiles')
    .select('id, first_name, last_name, role, created_at')
    .eq('school_id', schoolId)
    .in('role', ['teacher', 'maestro'])
    .order('last_name', { ascending: true })

  if (error) throw new Error(error.message)

  const ids = (data ?? []).map(t => t.id)
  const emailMap = new Map<string, string>()

  if (ids.length > 0) {
    const admin = createAdminClient()
    for (const id of ids) {
      const { data: userData } = await admin.auth.admin.getUserById(id)
      if (userData?.user?.email) emailMap.set(id, userData.user.email)
    }
  }

  return (data ?? []).map(t => ({
    id:         t.id,
    first_name: t.first_name,
    last_name:  t.last_name,
    email:      emailMap.get(t.id) ?? null,
    role:       t.role,
    active:     true,
    created_at: t.created_at,
  }))
}

// ─── inviteTeacher ────────────────────────────────────────────────────────────

export async function inviteTeacher(
  data: InviteTeacherInput
): Promise<{ error: string | null }> {
  const { schoolId } = await requireSchoolAdmin()
  const admin   = createAdminClient()
  const appUrl  = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'

  const { data: authData, error: authError } = await admin.auth.admin.inviteUserByEmail(
    data.email,
    {
      redirectTo: `${appUrl}/auth/confirm?next=/dashboard`,
      data: { rol: 'teacher', escuela_id: schoolId },
    },
  )

  if (authError || !authData.user) {
    return { error: authError?.message ?? 'Error al enviar la invitación' }
  }

  const { error: profileError } = await admin
    .from('user_profiles')
    .insert({
      id:         authData.user.id,
      role:       'teacher',
      school_id:  schoolId,
      first_name: data.first_name,
      last_name:  data.last_name,
    })

  if (profileError) {
    await admin.auth.admin.deleteUser(authData.user.id).catch(() => null)
    return { error: profileError.message }
  }

  revalidatePath('/dashboard/maestros')
  return { error: null }
}

// ─── removeTeacher ────────────────────────────────────────────────────────────

export async function removeTeacher(
  teacherId: string
): Promise<{ error: string | null }> {
  const { schoolId } = await requireSchoolAdmin()
  const supabase = await createClient()

  const { error } = await supabase
    .from('user_profiles')
    .update({ school_id: null })
    .eq('id', teacherId)
    .eq('school_id', schoolId)
    .in('role', ['teacher', 'maestro'])

  if (error) return { error: error.message }

  revalidatePath('/dashboard/maestros')
  return { error: null }
}
