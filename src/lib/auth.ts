import { redirect } from 'next/navigation'
import { cookies }  from 'next/headers'
import { createClient } from '@/lib/supabase/server'

export type UserRole = 'sysadmin' | 'admin' | 'maestro' | 'teacher' | 'portero' | 'guardian' | 'coordinador' | 'finanzas'

export interface CurrentUser {
  id:       string
  email:    string
  role:     UserRole
  schoolId: string | null
  profile: {
    firstName: string | null
    lastName:  string | null
    avatarUrl: string | null
  }
}

export interface ImpersonatingData {
  schoolId:   string
  schoolName: string
}

/** Obtiene usuario + rol + escuela. Redirige a /login si no hay sesión. */
export async function getCurrentUser(): Promise<CurrentUser> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('user_profiles')
    .select('role, school_id, first_name, last_name, avatar_url')
    .eq('id', user.id)
    .single()

  return {
    id:       user.id,
    email:    user.email ?? '',
    role:     (profile?.role ?? 'admin') as UserRole,
    schoolId: profile?.school_id ?? null,
    profile: {
      firstName: profile?.first_name ?? null,
      lastName:  profile?.last_name  ?? null,
      avatarUrl: profile?.avatar_url ?? null,
    },
  }
}

/** Verifica que el usuario tenga uno de los roles dados. Lanza redirect si no. */
export async function requireRole(...roles: UserRole[]): Promise<CurrentUser> {
  const user = await getCurrentUser()
  if (!roles.includes(user.role)) {
    redirect(user.role === 'sysadmin' ? '/sysadmin' : '/dashboard')
  }
  return user
}

/** Devuelve datos de impersonación desde la cookie, o null si no está impersonando. */
export async function getImpersonatingSchool(): Promise<ImpersonatingData | null> {
  const cookieStore = await cookies()
  const raw = cookieStore.get('xokai-impersonating')?.value
  if (!raw) return null
  try {
    return JSON.parse(raw) as ImpersonatingData
  } catch {
    return null
  }
}

/** Devuelve el school_id efectivo — cookie de impersonación o school_id del perfil. */
export async function getEffectiveSchoolId(): Promise<string | null> {
  const imp = await getImpersonatingSchool()
  if (imp) return imp.schoolId
  const user = await getCurrentUser()
  return user.schoolId
}

/**
 * Exige admin/director de escuela o sysadmin impersonando.
 * Devuelve userId + schoolId efectivo (el impersonado si aplica).
 * Úsalo en server actions que mutan/leen datos de una escuela.
 */
export async function requireSchoolAdmin(): Promise<{ userId: string; schoolId: string }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('No autenticado')

  const { data: profile } = await supabase
    .from('user_profiles')
    .select('school_id, role')
    .eq('id', user.id)
    .single()

  if (!profile) throw new Error('Perfil no encontrado')

  // Sysadmin impersonando una escuela → usa el schoolId de la cookie.
  if (profile.role === 'sysadmin') {
    const imp = await getImpersonatingSchool()
    if (imp) return { userId: user.id, schoolId: imp.schoolId }
    throw new Error('Acceso denegado: requiere rol admin o director')
  }

  if (!['admin', 'director'].includes(profile.role)) {
    throw new Error('Acceso denegado: requiere rol admin o director')
  }
  if (!profile.school_id) throw new Error('Usuario sin escuela asignada')

  return { userId: user.id, schoolId: profile.school_id }
}
