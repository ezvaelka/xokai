import { redirect }     from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import SysadminShell    from '@/components/SysadminShell'

export default async function SysadminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('user_profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (!profile || profile.role !== 'sysadmin') redirect('/dashboard')

  return <SysadminShell>{children}</SysadminShell>
}
