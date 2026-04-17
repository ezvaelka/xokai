import { redirect }    from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import DashboardShell   from '@/components/DashboardShell'
import PerfilClient     from './PerfilClient'

export default async function PerfilPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('user_profiles')
    .select('first_name, last_name, avatar_url, role, school_id')
    .eq('id', user.id)
    .single()

  let joinCode: string | null = null
  if (profile?.school_id) {
    const { data: school } = await supabase
      .from('schools')
      .select('join_code')
      .eq('id', profile.school_id)
      .single()
    joinCode = school?.join_code ?? null
  }

  return (
    <DashboardShell activeHref="/dashboard/perfil">
      <PerfilClient
        userId={user.id}
        email={user.email ?? ''}
        initialFirstName={profile?.first_name ?? ''}
        initialLastName={profile?.last_name  ?? ''}
        initialAvatarUrl={profile?.avatar_url ?? null}
        role={profile?.role ?? 'admin'}
        joinCode={joinCode}
      />
    </DashboardShell>
  )
}
