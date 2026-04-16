'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient }      from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

// ─── Login con email + password ──────────────────────────────────────────────

export async function signInWithPassword(email: string, password: string) {
  const supabase = await createClient()
  const { error } = await supabase.auth.signInWithPassword({ email, password })
  if (error) return { error: traducirError(error.message), role: null }
  revalidatePath('/', 'layout')

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: null, role: null }

  const { data: profile } = await supabase
    .from('user_profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  return { error: null, role: profile?.role ?? null }
}

// ─── Crear cuenta ────────────────────────────────────────────────────────────

export async function signUp(email: string, password: string) {
  const supabase = await createClient()
  const { error } = await supabase.auth.signUp({ email, password })
  if (error) return { error: traducirError(error.message) }
  revalidatePath('/', 'layout')
  return { error: null }
}

// ─── Subir avatar ─────────────────────────────────────────────────────────────

export async function uploadAvatar(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'No autenticado', url: null }

  const file = formData.get('file') as File
  if (!file || file.size === 0) return { error: 'Archivo inválido', url: null }
  if (file.size > 3 * 1024 * 1024) return { error: 'La foto debe pesar menos de 3 MB', url: null }

  const ext  = file.name.split('.').pop() ?? 'jpg'
  const path = `avatars/${user.id}.${ext}`

  const admin = createAdminClient()
  const { error: upErr } = await admin.storage
    .from('school-assets')
    .upload(path, file, { upsert: true, contentType: file.type })

  if (upErr) return { error: upErr.message, url: null }
  const { data } = admin.storage.from('school-assets').getPublicUrl(path)
  return { error: null, url: data.publicUrl }
}

// ─── Recuperar contraseña ─────────────────────────────────────────────────────

export async function sendPasswordRecovery(email: string) {
  const supabase = await createClient()
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${appUrl}/auth/confirm?type=recovery`,
  })

  if (error) return { error: traducirError(error.message) }
  return { error: null }
}

// ─── Cambiar contraseña ───────────────────────────────────────────────────────

export async function updatePassword(newPassword: string) {
  const supabase = await createClient()
  const { error } = await supabase.auth.updateUser({ password: newPassword })
  if (error) return { error: traducirError(error.message) }
  return { error: null }
}

// ─── Cerrar sesión ────────────────────────────────────────────────────────────

export async function signOut() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  revalidatePath('/', 'layout')
  redirect('/login')
}

// ─── Cerrar sesión en todos los dispositivos ──────────────────────────────────

export async function signOutAll() {
  const supabase = await createClient()
  await supabase.auth.signOut({ scope: 'global' })
  revalidatePath('/', 'layout')
  redirect('/login')
}

// ─── Actualizar perfil de usuario ─────────────────────────────────────────────

export async function updateProfile(data: {
  first_name: string
  last_name: string
  avatar_url?: string
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'No autenticado' }

  const { error } = await supabase
    .from('user_profiles')
    .update({
      first_name: data.first_name,
      last_name:  data.last_name,
      avatar_url: data.avatar_url,
    })
    .eq('id', user.id)

  if (error) return { error: traducirError(error.message) }
  revalidatePath('/dashboard/perfil')
  return { error: null }
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function traducirError(msg: string): string {
  const errores: Record<string, string> = {
    'Invalid login credentials':    'Correo o contraseña incorrectos',
    'Email not confirmed':          'Debes confirmar tu correo antes de entrar',
    'User already registered':      'Este correo ya está registrado',
    'Password should be at least 6 characters':
                                    'La contraseña debe tener al menos 6 caracteres',
    'Email rate limit exceeded':    'Demasiados intentos. Espera unos minutos.',
    'Invalid email':                'El correo no es válido',
    'Signup is disabled':           'El registro está deshabilitado',
    'User not found':               'No existe una cuenta con ese correo',
  }
  return errores[msg] ?? msg
}
