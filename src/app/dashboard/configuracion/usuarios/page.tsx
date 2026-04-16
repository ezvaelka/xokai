import { redirect }     from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import DashboardShell   from '@/components/DashboardShell'
import UsuariosClient   from './UsuariosClient'

export default async function UsuariosPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('user_profiles')
    .select('role, school_id')
    .eq('id', user.id)
    .single()

  if (!profile || !['admin', 'director', 'sysadmin'].includes(profile.role)) {
    redirect('/dashboard')
  }

  const [{ data: users }, { data: school }] = await Promise.all([
    supabase
      .from('user_profiles')
      .select('id, first_name, last_name, role, created_at')
      .eq('school_id', profile.school_id!)
      .order('created_at', { ascending: false }),
    supabase
      .from('schools')
      .select('join_code')
      .eq('id', profile.school_id!)
      .single(),
  ])

  return (
    <DashboardShell activeHref="/dashboard/configuracion/usuarios">
      <UsuariosClient
        initialUsers={users ?? []}
        joinCode={(school as any)?.join_code ?? ''}
        currentUserId={user.id}
      />
    </DashboardShell>
  )
}
