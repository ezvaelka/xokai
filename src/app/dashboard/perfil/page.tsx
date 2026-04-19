import { redirect }    from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
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

  const profileData = profile as {
    first_name: string | null
    last_name:  string | null
    avatar_url: string | null
    role:       string
    school_id:  string | null
  } | null

  let schoolName: string | null = null
  if (profileData?.school_id) {
    const { data: school } = await supabase
      .from('schools')
      .select('name')
      .eq('id', profileData.school_id)
      .single()
    schoolName = (school as { name: string } | null)?.name ?? null
  }

  return (
    <PerfilClient
      userId={user.id}
      email={user.email ?? ''}
      initialFirstName={profileData?.first_name ?? ''}
      initialLastName={profileData?.last_name  ?? ''}
      initialAvatarUrl={profileData?.avatar_url ?? null}
      role={profileData?.role ?? 'admin'}
      schoolName={schoolName}
    />
  )
}
