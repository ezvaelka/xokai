'use server'

import { revalidatePath } from 'next/cache'
import { createClient }      from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

// ─── Tipos ────────────────────────────────────────────────────────────────────

export type SchoolStatus = 'active' | 'onboarding' | 'paused' | 'pending' | 'all'
export type SchoolPlan   = 'trial' | 'base' | 'base_pickup' | 'suspended' | 'churned'

export const PLAN_LABELS: Record<SchoolPlan, string> = {
  trial:        'Trial',
  base:         'Base · $7/alumno',
  base_pickup:  'Base + Pickup · $9/alumno',
  suspended:    'Suspendida',
  churned:      'Churned',
}

export const PLAN_RATE_USD: Record<SchoolPlan, number> = {
  trial:        0,
  base:         7,
  base_pickup:  9,
  suspended:    0,
  churned:      0,
}

export type ActivityLogEntry = {
  id:         string
  action:     string
  payload:    Record<string, unknown> | null
  actor_name: string | null
  created_at: string
}

export type SchoolNote = {
  id:           string
  note:         string
  created_at:   string
  author_name:  string | null
  author_email: string | null
}

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
  plan:                  SchoolPlan
  trial_ends_at:         string | null
  suspended_at:          string | null
  mrr_usd:               number
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
    internal_notes:        string | null
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
  if (!s.active && s.onboarding_completed)  return 'pending'
  if (!s.active)                             return 'paused'
  if (!s.onboarding_completed)               return 'onboarding'
  return 'active'
}

// ─── listSchools ──────────────────────────────────────────────────────────────

export async function listSchools(status: SchoolStatus = 'all'): Promise<SchoolListItem[]> {
  await requireSysadmin()
  const admin = createAdminClient()

  const { data: schools, error } = await admin
    .from('schools')
    .select('id, name, city, email, active, onboarding_completed, created_at, plan, trial_ends_at, suspended_at')
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
    const director     = directorByEmail.get(s.id)
    const studentCount = studentCounts.get(s.id) ?? 0
    const plan         = (s.plan ?? 'trial') as SchoolPlan
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
      student_count:        studentCount,
      status:               classify(s),
      plan,
      trial_ends_at:        s.trial_ends_at ?? null,
      suspended_at:         s.suspended_at ?? null,
      mrr_usd:              studentCount * (PLAN_RATE_USD[plan] ?? 0),
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

// ─── updateSchoolNotes ────────────────────────────────────────────────────────

export async function updateSchoolNotes(schoolId: string, notes: string) {
  await requireSysadmin()
  const admin = createAdminClient()

  const { error } = await admin
    .from('schools')
    .update({ internal_notes: notes })
    .eq('id', schoolId)

  if (error) return { error: error.message }

  revalidatePath(`/sysadmin/schools/${schoolId}`)
  return { error: null }
}

// ─── createSchoolWithAdmin ────────────────────────────────────────────────────

function generateJoinCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  let code = ''
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return code
}

export async function createSchoolWithAdmin(data: {
  schoolName: string
  city:       string
  email:      string
}): Promise<{ error: string | null; schoolId: string | null }> {
  await requireSysadmin()
  const admin = createAdminClient()

  // Paso 1: Crear escuela
  const { data: school, error: schoolError } = await admin
    .from('schools')
    .insert({
      name:                 data.schoolName,
      city:                 data.city,
      active:               true,
      onboarding_completed: true,
      join_code:            generateJoinCode(),
    })
    .select('id')
    .single()

  if (schoolError || !school) {
    return { error: schoolError?.message ?? 'Error al crear la escuela', schoolId: null }
  }

  // Paso 2: Invitar directora — crea usuario + envía email automáticamente via Resend
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'
  const { data: authData, error: authError } = await admin.auth.admin.inviteUserByEmail(
    data.email,
    { redirectTo: `${appUrl}/auth/confirm?next=/onboarding` },
  )

  if (authError || !authData.user) {
    await Promise.resolve(admin.from('schools').delete().eq('id', school.id)).catch(() => null)
    return { error: authError?.message ?? 'Error al invitar a la directora', schoolId: null }
  }

  // Paso 3: Crear user_profile
  const { error: profileError } = await admin
    .from('user_profiles')
    .insert({
      id:        authData.user.id,
      role:      'admin',
      school_id: school.id,
    })

  if (profileError) {
    await admin.auth.admin.deleteUser(authData.user.id).catch(() => null)
    await Promise.resolve(admin.from('schools').delete().eq('id', school.id)).catch(() => null)
    return { error: profileError.message, schoolId: null }
  }

  revalidatePath('/sysadmin/schools')
  return { error: null, schoolId: school.id }
}

// ─── impersonateDirector ──────────────────────────────────────────────────────

export async function impersonateDirector(
  schoolId: string
): Promise<{ error: string | null; magicLink: string | null }> {
  await requireSysadmin()
  const admin = createAdminClient()

  const { data: director, error: directorError } = await admin
    .from('user_profiles')
    .select('id')
    .eq('school_id', schoolId)
    .eq('role', 'admin')
    .limit(1)
    .single()

  if (directorError || !director) {
    return { error: 'La escuela no tiene directora registrada', magicLink: null }
  }

  const { data: authUser, error: authUserError } = await admin.auth.admin.getUserById(director.id)
  if (authUserError || !authUser?.user?.email) {
    return { error: 'Directora sin email válido', magicLink: null }
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'
  const { data, error: linkError } = await admin.auth.admin.generateLink({
    type:  'magiclink',
    email: authUser.user.email,
    options: { redirectTo: `${appUrl}/dashboard` },
  })

  if (linkError || !data) {
    return { error: linkError?.message ?? 'Error al generar enlace', magicLink: null }
  }

  return { error: null, magicLink: data.properties.action_link }
}

// ─── getSchoolNotes ───────────────────────────────────────────────────────────

export async function getSchoolNotes(schoolId: string): Promise<SchoolNote[]> {
  await requireSysadmin()
  const admin = createAdminClient()

  const { data: notes, error } = await admin
    .from('school_notes')
    .select('id, note, created_at, author_id')
    .eq('school_id', schoolId)
    .order('created_at', { ascending: false })

  if (error) throw new Error(error.message)
  if (!notes || notes.length === 0) return []

  const authorIds = [...new Set(notes.map((n) => n.author_id).filter(Boolean))]
  const authorMap = new Map<string, { name: string | null; email: string | null }>()

  for (const id of authorIds) {
    const { data: profile } = await admin
      .from('user_profiles')
      .select('first_name, last_name')
      .eq('id', id)
      .single()
    const { data: authUser } = await admin.auth.admin.getUserById(id)
    const name = profile
      ? [profile.first_name, profile.last_name].filter(Boolean).join(' ').trim() || null
      : null
    authorMap.set(id, { name, email: authUser?.user?.email ?? null })
  }

  return notes.map((n) => {
    const author = n.author_id ? authorMap.get(n.author_id) : null
    return {
      id:           n.id,
      note:         n.note,
      created_at:   n.created_at,
      author_name:  author?.name ?? null,
      author_email: author?.email ?? null,
    }
  })
}

// ─── getSysadminMetrics ───────────────────────────────────────────────────────

export type SysadminMetrics = {
  totalSchools:      number
  activeSchools:     number
  pendingSchools:    number
  onboardingSchools: number
  pausedSchools:     number
  totalStudents:     number
  mrrUsd:            number
  recentSchools:     Array<{ id: string; name: string; city: string | null; status: Exclude<SchoolStatus, 'all'>; created_at: string; student_count: number }>
  schoolsByMonth:    Array<{ month: string; count: number }>
}

export async function getSysadminMetrics(): Promise<SysadminMetrics> {
  await requireSysadmin()
  const admin = createAdminClient()

  const { data: schools } = await admin
    .from('schools')
    .select('id, name, city, active, onboarding_completed, created_at')
    .order('created_at', { ascending: true })

  if (!schools || schools.length === 0) {
    return { totalSchools: 0, activeSchools: 0, pendingSchools: 0, onboardingSchools: 0, pausedSchools: 0, totalStudents: 0, mrrUsd: 0, recentSchools: [], schoolsByMonth: [] }
  }

  const classified = schools.map((s) => ({ ...s, status: classify(s) }))

  const activeSchools     = classified.filter((s) => s.status === 'active').length
  const pendingSchools    = classified.filter((s) => s.status === 'pending').length
  const onboardingSchools = classified.filter((s) => s.status === 'onboarding').length
  const pausedSchools     = classified.filter((s) => s.status === 'paused').length

  const { count: totalStudents } = await admin
    .from('students')
    .select('id', { count: 'exact', head: true })

  // MRR: $7 USD por alumno activo (base rate)
  const { count: activeStudents } = await admin
    .from('students')
    .select('id', { count: 'exact', head: true })
    .in('school_id', classified.filter((s) => s.status === 'active').map((s) => s.id))

  const mrrUsd = (activeStudents ?? 0) * 7

  // Últimas 5 escuelas registradas
  const recentIds = [...classified].reverse().slice(0, 5).map((s) => s.id)
  const studentCountMap = new Map<string, number>()
  for (const id of recentIds) {
    const { count } = await admin.from('students').select('id', { count: 'exact', head: true }).eq('school_id', id)
    studentCountMap.set(id, count ?? 0)
  }
  const recentSchools = [...classified]
    .reverse()
    .slice(0, 5)
    .map((s) => ({ id: s.id, name: s.name, city: s.city, status: s.status, created_at: s.created_at, student_count: studentCountMap.get(s.id) ?? 0 }))

  // Escuelas por mes (últimos 12 meses)
  const monthMap = new Map<string, number>()
  const now = new Date()
  for (let i = 11; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
    monthMap.set(key, 0)
  }
  for (const s of classified) {
    const d = new Date(s.created_at)
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
    if (monthMap.has(key)) monthMap.set(key, (monthMap.get(key) ?? 0) + 1)
  }
  const schoolsByMonth = Array.from(monthMap.entries()).map(([month, count]) => ({
    month: new Date(month + '-01').toLocaleDateString('es-MX', { month: 'short', year: '2-digit' }),
    count,
  }))

  return {
    totalSchools:   schools.length,
    activeSchools,
    pendingSchools,
    onboardingSchools,
    pausedSchools,
    totalStudents:  totalStudents ?? 0,
    mrrUsd,
    recentSchools,
    schoolsByMonth,
  }
}

// ─── addSchoolNote ────────────────────────────────────────────────────────────

// ─── updateSchoolPlan ─────────────────────────────────────────────────────────

export async function updateSchoolPlan(schoolId: string, plan: SchoolPlan) {
  const user = await requireSysadmin()
  const admin = createAdminClient()

  const updates: Record<string, unknown> = { plan }
  if (plan === 'suspended') updates.suspended_at = new Date().toISOString()
  if (plan !== 'suspended') updates.suspended_at = null

  const { error } = await admin.from('schools').update(updates).eq('id', schoolId)
  if (error) return { error: error.message }

  await logActivityInternal(admin, schoolId, user.id, 'plan_changed', { plan })
  revalidatePath('/sysadmin/schools')
  revalidatePath(`/sysadmin/schools/${schoolId}`)
  return { error: null }
}

// ─── extendTrial ──────────────────────────────────────────────────────────────

export async function extendTrial(schoolId: string, days: number) {
  const user = await requireSysadmin()
  const admin = createAdminClient()

  const { data: school } = await admin.from('schools').select('trial_ends_at').eq('id', schoolId).single()
  const base = school?.trial_ends_at ? new Date(school.trial_ends_at) : new Date()
  const newEnd = new Date(base.getTime() + days * 86_400_000)

  const { error } = await admin.from('schools').update({
    plan: 'trial',
    trial_ends_at: newEnd.toISOString(),
  }).eq('id', schoolId)

  if (error) return { error: error.message }

  await logActivityInternal(admin, schoolId, user.id, 'trial_extended', { days, new_end: newEnd.toISOString() })
  revalidatePath(`/sysadmin/schools/${schoolId}`)
  return { error: null }
}

// ─── updateSchoolFeatureFlags ─────────────────────────────────────────────────

export async function updateSchoolFeatureFlags(schoolId: string, flags: Record<string, boolean>) {
  const user = await requireSysadmin()
  const admin = createAdminClient()

  const { error } = await admin.from('schools').update({ feature_flags: flags }).eq('id', schoolId)
  if (error) return { error: error.message }

  await logActivityInternal(admin, schoolId, user.id, 'feature_flags_updated', { flags })
  revalidatePath(`/sysadmin/schools/${schoolId}`)
  return { error: null }
}

// ─── getActivityLog ───────────────────────────────────────────────────────────

export async function getActivityLog(schoolId: string): Promise<ActivityLogEntry[]> {
  await requireSysadmin()
  const admin = createAdminClient()

  const { data: logs } = await admin
    .from('school_activity_log')
    .select('id, action, payload, actor_id, created_at')
    .eq('school_id', schoolId)
    .order('created_at', { ascending: false })
    .limit(50)

  if (!logs || logs.length === 0) return []

  const actorIds = [...new Set(logs.map((l) => l.actor_id).filter(Boolean))]
  const actorNames = new Map<string, string>()
  for (const id of actorIds) {
    const { data: p } = await admin.from('user_profiles').select('first_name, last_name').eq('id', id).single()
    if (p) actorNames.set(id, [p.first_name, p.last_name].filter(Boolean).join(' ').trim() || id)
  }

  return logs.map((l) => ({
    id:         l.id,
    action:     l.action,
    payload:    (l.payload as Record<string, unknown>) ?? null,
    actor_name: l.actor_id ? (actorNames.get(l.actor_id) ?? null) : null,
    created_at: l.created_at,
  }))
}

// ─── logActivityInternal (helper privado) ─────────────────────────────────────

async function logActivityInternal(
  admin: ReturnType<typeof createAdminClient>,
  schoolId: string,
  actorId: string,
  action: string,
  payload?: Record<string, unknown>,
) {
  try {
    await admin.from('school_activity_log').insert({ school_id: schoolId, actor_id: actorId, action, payload: payload ?? null })
  } catch { /* best-effort */ }
}

// ─── addSchoolNote ────────────────────────────────────────────────────────────

export async function addSchoolNote(schoolId: string, note: string): Promise<{ error: string | null }> {
  const user = await requireSysadmin()
  const admin = createAdminClient()

  if (!note.trim()) return { error: 'La nota no puede estar vacía' }

  const { error } = await admin
    .from('school_notes')
    .insert({ school_id: schoolId, author_id: user.id, note: note.trim() })

  if (error) return { error: error.message }

  revalidatePath(`/sysadmin/schools/${schoolId}`)
  return { error: null }
}
