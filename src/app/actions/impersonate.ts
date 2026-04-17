'use server'

import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export async function startImpersonation(schoolId: string, schoolName: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('user_profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (!profile || profile.role !== 'sysadmin') redirect('/sysadmin')

  const cookieStore = await cookies()
  cookieStore.set('xokai-impersonating', JSON.stringify({ schoolId, schoolName }), {
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 8, // 8 horas
  })

  redirect('/dashboard')
}

export async function clearImpersonation() {
  const cookieStore = await cookies()
  cookieStore.delete('xokai-impersonating')
  redirect('/sysadmin')
}
