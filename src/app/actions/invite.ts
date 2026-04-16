'use server'

import { createClient }      from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { revalidatePath }    from 'next/cache'

export type UserRole = 'director' | 'coordinador' | 'maestro' | 'portero' | 'finanzas'

const ADMIN_ROLES = ['admin', 'director', 'sysadmin'] as const

// ─── Listar usuarios activos de la escuela ────────────────────────────────────

export async function listSchoolUsers() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { data: null, error: 'No autenticado' }

  const { data: profile } = await supabase
    .from('user_profiles')
    .select('school_id, role')
    .eq('id', user.id)
    .single()

  if (!profile?.school_id) return { data: [], error: null }

  const { data, error } = await supabase
    .from('user_profiles')
    .select('id, first_name, last_name, role, created_at')
    .eq('school_id', profile.school_id)
    .order('created_at', { ascending: false })

  if (error) return { data: null, error: error.message }
  return { data, error: null }
}

// ─── Eliminar usuario activo ──────────────────────────────────────────────────

export async function removeUser(targetUserId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'No autenticado' }

  const { data: profile } = await supabase
    .from('user_profiles')
    .select('role, school_id')
    .eq('id', user.id)
    .single()

  if (!profile || !ADMIN_ROLES.includes(profile.role as any)) {
    return { error: 'Solo el director puede eliminar usuarios' }
  }

  const { data: target } = await supabase
    .from('user_profiles')
    .select('school_id')
    .eq('id', targetUserId)
    .single()

  if (target?.school_id !== profile.school_id) {
    return { error: 'No puedes eliminar usuarios de otra escuela' }
  }

  const admin = createAdminClient()
  const { error } = await admin.auth.admin.deleteUser(targetUserId)
  if (error) return { error: error.message }

  revalidatePath('/dashboard/configuracion/usuarios')
  return { error: null }
}
