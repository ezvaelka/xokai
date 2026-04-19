'use server'

import { revalidatePath }     from 'next/cache'
import { createClient }       from '@/lib/supabase/server'
import { createAdminClient }  from '@/lib/supabase/admin'
import { requireSchoolAdmin } from '@/lib/auth'

// ─── Tipos ────────────────────────────────────────────────────────────────────

export type ParentItem = {
  id:         string
  first_name: string | null
  last_name:  string | null
  email:      string | null
  created_at: string
}

export type InviteParentInput = {
  first_name: string
  last_name:  string
  email:      string
}

// ─── listParents ──────────────────────────────────────────────────────────────

export async function listParents(): Promise<ParentItem[]> {
  const { schoolId } = await requireSchoolAdmin()
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('user_profiles')
    .select('id, first_name, last_name, created_at')
    .eq('school_id', schoolId)
    .eq('role', 'guardian')
    .order('last_name', { ascending: true })

  if (error) throw new Error(error.message)

  const ids = (data ?? []).map(p => p.id)
  const emailMap = new Map<string, string>()

  if (ids.length > 0) {
    const admin = createAdminClient()
    for (const id of ids) {
      const { data: userData } = await admin.auth.admin.getUserById(id)
      if (userData?.user?.email) emailMap.set(id, userData.user.email)
    }
  }

  return (data ?? []).map(p => ({
    id:         p.id,
    first_name: p.first_name,
    last_name:  p.last_name,
    email:      emailMap.get(p.id) ?? null,
    created_at: p.created_at,
  }))
}

// ─── inviteParent ─────────────────────────────────────────────────────────────

export async function inviteParent(
  data: InviteParentInput
): Promise<{ error: string | null }> {
  const { schoolId } = await requireSchoolAdmin()
  const admin  = createAdminClient()
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'

  const { data: authData, error: authError } = await admin.auth.admin.inviteUserByEmail(
    data.email,
    {
      redirectTo: `${appUrl}/auth/confirm?next=/`,
      data: { rol: 'guardian', escuela_id: schoolId },
    },
  )

  if (authError || !authData.user) {
    return { error: authError?.message ?? 'Error al enviar la invitación' }
  }

  const { error: profileError } = await admin
    .from('user_profiles')
    .insert({
      id:         authData.user.id,
      role:       'guardian',
      school_id:  schoolId,
      first_name: data.first_name,
      last_name:  data.last_name,
    })

  if (profileError) {
    await admin.auth.admin.deleteUser(authData.user.id).catch(() => null)
    return { error: profileError.message }
  }

  revalidatePath('/dashboard/padres')
  return { error: null }
}
