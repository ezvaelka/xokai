'use server'

import { createClient }      from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { revalidatePath }    from 'next/cache'

type UserRole = 'admin' | 'teacher' | 'portero'

export interface PendingInvite {
  id:         string   // auth.users.id
  email:      string
  role:       string   // from user_metadata.role
  invited_at: string   // ISO string
}

// ─── Invitar usuario a la escuela ─────────────────────────────────────────────

export async function inviteUser(data: { email: string; role: UserRole }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'No autenticado' }

  // Verificar que el invitador es admin o sysadmin
  const { data: profile } = await supabase
    .from('user_profiles')
    .select('role, school_id')
    .eq('id', user.id)
    .single()

  if (!profile || !['admin', 'sysadmin'].includes(profile.role)) {
    return { error: 'No tienes permisos para invitar usuarios' }
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'
  const admin  = createAdminClient()

  const { error } = await admin.auth.admin.inviteUserByEmail(data.email, {
    redirectTo: `${appUrl}/auth/confirm?type=invite`,
    data: {
      role:        data.role,
      school_id:   profile.school_id,
      invited_by:  user.id,
    },
  })

  if (error) {
    if (error.message.includes('already registered')) {
      return { error: 'Este correo ya tiene una cuenta en Xokai' }
    }
    return { error: error.message }
  }

  revalidatePath('/dashboard/configuracion/usuarios')
  return { error: null }
}

// ─── Aceptar invitación: crear/actualizar perfil ──────────────────────────────

export async function acceptInvitation(data: {
  first_name: string
  last_name:  string
  password:   string
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Sesión inválida. Vuelve a abrir el enlace de invitación.' }

  // Leer role y school_id que el admin pasó al invitar
  const metadata  = (user.user_metadata ?? {}) as Record<string, string>
  const role      = (metadata.role ?? 'teacher') as UserRole
  const school_id = metadata.school_id ?? null

  const admin = createAdminClient()

  // Actualizar contraseña
  const { error: pwErr } = await admin.auth.admin.updateUserById(user.id, {
    password: data.password,
  })
  if (pwErr) return { error: pwErr.message }

  // Crear / actualizar user_profile
  const { error: profileErr } = await admin
    .from('user_profiles')
    .upsert({
      id:         user.id,
      school_id,
      role,
      first_name: data.first_name,
      last_name:  data.last_name,
    })

  if (profileErr) return { error: profileErr.message }

  return { error: null }
}

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

// ─── Listar invitaciones pendientes de la escuela ─────────────────────────────

export async function listPendingInvites(): Promise<{
  data: PendingInvite[] | null
  error: string | null
}> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { data: null, error: 'No autenticado' }

  const { data: profile } = await supabase
    .from('user_profiles')
    .select('school_id, role')
    .eq('id', user.id)
    .single()

  if (!profile?.school_id) return { data: [], error: null }
  if (!['admin', 'sysadmin'].includes(profile.role)) return { data: null, error: 'No autorizado' }

  const admin = createAdminClient()
  // perPage: 1000 is sufficient for current scale; paginate if platform grows
  const { data, error } = await admin.auth.admin.listUsers({ perPage: 1000 })
  if (error) return { data: null, error: error.message }

  const pending: PendingInvite[] = data.users
    .filter(u =>
      u.invited_at != null &&
      u.email_confirmed_at == null &&
      (u.user_metadata as Record<string, string>)?.school_id === profile.school_id
    )
    .map(u => ({
      id:         u.id,
      email:      u.email ?? '',
      role:       ((u.user_metadata as Record<string, string>)?.role) ?? 'teacher',
      invited_at: u.invited_at!,
    }))

  return { data: pending, error: null }
}

// ─── Reenviar invitación ──────────────────────────────────────────────────────

export async function resendInvite(email: string, role: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'No autenticado' }

  const { data: profile } = await supabase
    .from('user_profiles')
    .select('role, school_id')
    .eq('id', user.id)
    .single()

  if (!profile || !['admin', 'sysadmin'].includes(profile.role)) {
    return { error: 'No tienes permisos para reenviar invitaciones' }
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'
  const admin  = createAdminClient()

  // inviteUserByEmail acts as upsert for pending (unconfirmed) users:
  // it updates invited_at and resends the email automatically
  const { error } = await admin.auth.admin.inviteUserByEmail(email, {
    redirectTo: `${appUrl}/auth/confirm?type=invite`,
    data: {
      role,
      school_id:  profile.school_id,
      invited_by: user.id,
    },
  })

  if (error) return { error: error.message }

  revalidatePath('/dashboard/configuracion/usuarios')
  return { error: null }
}

// ─── Cancelar invitación pendiente ────────────────────────────────────────────

export async function cancelInvite(targetUserId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'No autenticado' }

  const { data: profile } = await supabase
    .from('user_profiles')
    .select('role, school_id')
    .eq('id', user.id)
    .single()

  if (!profile || !['admin', 'sysadmin'].includes(profile.role)) {
    return { error: 'No tienes permisos' }
  }

  const admin = createAdminClient()

  // Re-verify the target is actually a pending invite for this school before deleting
  const { data: targetData, error: fetchErr } = await admin.auth.admin.getUserById(targetUserId)
  if (fetchErr || !targetData.user) return { error: 'Usuario no encontrado' }

  const t = targetData.user
  const isPending =
    t.invited_at != null &&
    t.email_confirmed_at == null &&
    (t.user_metadata as Record<string, string>)?.school_id === profile.school_id

  if (!isPending) return { error: 'No es una invitación pendiente de esta escuela' }

  const { error } = await admin.auth.admin.deleteUser(targetUserId)
  if (error) return { error: error.message }

  revalidatePath('/dashboard/configuracion/usuarios')
  return { error: null }
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

  if (!profile || profile.role !== 'admin') {
    return { error: 'Solo el admin puede eliminar usuarios' }
  }

  // Verificar que el target pertenece a la misma escuela
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
