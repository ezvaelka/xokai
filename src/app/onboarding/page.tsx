import { redirect }    from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import OnboardingClient from './OnboardingClient'

export default async function OnboardingPage({
  searchParams,
}: {
  searchParams: Promise<{ type?: string }>
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('user_profiles')
    .select('school_id, role')
    .eq('id', user.id)
    .single()

  if (profile?.school_id) redirect('/dashboard')

  const params = await searchParams
  const initialType = params.type === 'director' ? 'director' as const : null

  return <OnboardingClient userEmail={user.email ?? ''} initialType={initialType} />
}
