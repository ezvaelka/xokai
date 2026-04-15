import { redirect }    from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import OnboardingClient from './OnboardingClient'

export default async function OnboardingPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Si ya tiene escuela → dashboard
  const { data: profile } = await supabase
    .from('user_profiles')
    .select('school_id, role')
    .eq('id', user.id)
    .single()

  if (profile?.school_id) redirect('/dashboard')

  return <OnboardingClient userEmail={user.email ?? ''} />
}
