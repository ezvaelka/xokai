'use server'

import { revalidatePath } from 'next/cache'
import { createClient }      from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

// ─── Tipos ────────────────────────────────────────────────────────────────────

export type SchoolStatus = 'active' | 'onboarding' | 'paused' | 'all'

export type SchoolListItem = {
  id:                    string
  name:                  string
  city:                  string | null
  email:                 string | null
  active:                boolean
  onboarding_completed:  boolean
  created_at:            string
  director_name:         string | null
  director_email:        string | null
  student_count:         number
  status:                Exclude<SchoolStatus, 'all'>
}

export type SchoolDetail = {
  school: {
    id:                    string
    name:                  string
    short_name:            string | null
    address:               string | null
    city:                  string | null
    state:                 string | null
    phone:                 string | null
    email:                 string | null
    logo_url:              string | null
    timezone:              string
    active:                boolean
    rfc:                   string | null
    razon_social:          string | null
    cp_fiscal:             string | null
    regimen_fiscal:        string | null
    uso_cfdi:              string
    pickup_start:          string | null
    pickup_end:            string | null
    pickup_tolerance_mins: number
    onboarding_completed:  boolean
    created_at:            string
  }
  status:       Exclude<SchoolStatus, 'all'>
  users:        Array<{ id: string; email: string | null; first_name: string | null; last_name: string | null; role: string }>
  studentCount: number
  groupCount:   number
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

async function requireSysadmin() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('No autenticado')

  const { data: profile } = await supabase
    .from('user_profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (!profile || profile.role !== 'sysadmin') {
    throw new Error('Acceso denegado: requiere rol sysadmin')
  }
  return user
}

function classify(s: { active: boolean; onboarding_completed: boolean }): Exclude<SchoolStatus, 'all'> {
  if (!s.active) return 'paused'
  if (!s.onboarding_completed) return 'onboarding'
  return 'active'
}

// ─── listSchools ──────────────────────────────────────────────────────────────

export async function listSchools(status: SchoolStatus = 'all'): Promise<SchoolListItem[]> {
  await requireSysadmin()
  const admin = createAdminClient()

  const { data: schools, error } = await admin
    .from('schools')
    .select('id, name, city, email, active, onboarding_completed, created_at')
    .order('created_at', { ascending: false })

  if (error) throw new Error(error.message)
  if (!schools) return []

  const schoolIds = schools.map((s) => s.id)
  if (schoolIds.length === 0) return []

  // Director (primer admin de cada escuela)
  const { data: directors } = await admin
    .from('user_profiles')
    .select('id, school_id, first_name, last_name, role')
    .in('school_id', schoolIds)
    .eq('role', 'admin')

  // Emails de auth.users vía admin
  const directorByEmail = new Map<string, { name: string | null; email: string | null }>()
  if (directors && directors.length > 0) {
    for (const d of directors) {
      const { data: authUser } = await admin.auth.admin.getUserById(d.id)
      const name = [d.first_name, d.last_name].filter(Boolean).join(' ').trim() || null
      if (!directorByEmail.has(d.school_id)) {
        directorByEmail.set(d.school_id, {
          name,
          email: authUser?.user?.email ?? null,
        })
      }
    }
  }

  // Conteo de alumnos
  const studentCounts = new Map<string, number>()
  for (const sid of schoolIds) {
    const { count } = await admin
      .from('students')
      .select('id', { count: 'exact', head: true })
      .eq('school_id', sid)
    studentCounts.set(sid, count ?? 0)
  }

  const result: SchoolListItem[] = schools.map((s) => {
    const director = directorByEmail.get(s.id)
    return {
      id:                   s.id,
      name:                 s.name,
      city:                 s.city,
      email:                s.email,
      active:               s.active,
      onboarding_completed: s.onboarding_completed,
      created_at:           s.created_at,
      director_name:        director?.name ?? null,
      director_email:       director?.email ?? null,
      student_count:        studentCounts.get(s.id) ?? 0,
      status:               classify(s),
    }
  })

  if (status === 'all') return result
  return result.filter((s) => s.status === status)
}

// ─── getSchoolDetail ──────────────────────────────────────────────────────────

export async function getSchoolDetail(schoolId: string): Promise<SchoolDetail> {
  await requireSysadmin()
  const admin = createAdminClient()

  const { data: school, error } = await admin
    .from('schools')
    .select('*')
    .eq('id', schoolId)
    .single()

  if (error || !school) throw new Error(error?.message ?? 'Escuela no encontrada')

  const { data: profiles } = await admin
    .from('user_profiles')
    .select('id, first_name, last_name, role')
    .eq('school_id', schoolId)

  const users: SchoolDetail['users'] = []
  if (profiles) {
    for (const p of profiles) {
      const { data: authUser } = await admin.auth.admin.getUserById(p.id)
      users.push({
        id:         p.id,
        email:      authUser?.user?.email ?? null,
        first_name: p.first_name,
        last_name:  p.last_name,
        role:       p.role,
      })
    }
  }

  const { count: studentCount } = await admin
    .from('students')
    .select('id', { count: 'exact', head: true })
    .eq('school_id', schoolId)

  const { count: groupCount } = await admin
    .from('groups')
    .select('id', { count: 'exact', head: true })
    .eq('school_id', schoolId)

  return {
    school,
    status:       classify(school),
    users,
    studentCount: studentCount ?? 0,
    groupCount:   groupCount ?? 0,
  }
}

// ─── toggleSchoolActive ───────────────────────────────────────────────────────

export async function toggleSchoolActive(schoolId: string) {
  await requireSysadmin()
  const admin = createAdminClient()

  const { data: current, error: readErr } = await admin
    .from('schools')
    .select('active')
    .eq('id', schoolId)
    .single()
  if (readErr || !current) return { error: 'Escuela no encontrada' }

  const { error } = await admin
    .from('schools')
    .update({ active: !current.active })
    .eq('id', schoolId)

  if (error) return { error: error.message }

  revalidatePath('/sysadmin/schools')
  revalidatePath(`/sysadmin/schools/${schoolId}`)
  return { error: null, active: !current.active }
}

// ─── deleteSchool ─────────────────────────────────────────────────────────────

export async function deleteSchool(schoolId: string) {
  await requireSysadmin()
  const admin = createAdminClient()

  // Obtener usuarios de la escuela para borrar sus cuentas auth
  const { data: profiles } = await admin
    .from('user_profiles')
    .select('id')
    .eq('school_id', schoolId)

  // Borrar escuela (cascade limpia groups, students, user_profiles, etc.)
  const { error } = await admin.from('schools').delete().eq('id', schoolId)
  if (error) return { error: error.message }

  // Borrar cuentas auth de los usuarios que pertenecían a esta escuela
  if (profiles) {
    for (const p of profiles) {
      await admin.auth.admin.deleteUser(p.id).catch(() => null)
    }
  }

  revalidatePath('/sysadmin/schools')
  return { error: null }
}

// ─── resendMagicLinkToDirector ────────────────────────────────────────────────

export async function resendMagicLinkToDirector(schoolId: string) {
  await requireSysadmin()
  const admin = createAdminClient()

  const { data: director } = await admin
    .from('user_profiles')
    .select('id')
    .eq('school_id', schoolId)
    .eq('role', 'admin')
    .limit(1)
    .single()

  if (!director) return { error: 'La escuela no tiene directora registrada' }

  const { data: authUser } = await admin.auth.admin.getUserById(director.id)
  const email = authUser?.user?.email
  if (!email) return { error: 'Directora sin email válido' }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'
  const { error } = await admin.auth.admin.generateLink({
    type:  'magiclink',
    email,
    options: { redirectTo: `${appUrl}/auth/confirm` },
  })

  if (error) return { error: error.message }
  return { error: null, email }
}
