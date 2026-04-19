import { getSysadminMetrics, listSchools } from '@/app/actions/sysadmin'
import { createClient } from '@/lib/supabase/server'
import DashboardClient from './DashboardClient'

export default async function SysadminDashboard() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const [profile, m, schools] = await Promise.all([
    user
      ? supabase.from('user_profiles').select('first_name').eq('id', user.id).single().then(r => r.data)
      : Promise.resolve(null),
    getSysadminMetrics(),
    listSchools('all'),
  ])

  return (
    <DashboardClient
      metrics={m}
      schools={schools}
      firstName={profile?.first_name ?? 'Ez'}
    />
  )
}
