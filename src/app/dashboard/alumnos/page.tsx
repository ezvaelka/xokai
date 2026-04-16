import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import DashboardShell from '@/components/DashboardShell'
import AlumnosClient from './AlumnosClient'

export default async function AlumnosPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('user_profiles')
    .select('school_id, role')
    .eq('id', user.id)
    .single()

  if (!profile?.school_id) redirect('/dashboard')

  const [{ data: students }, { data: groups }] = await Promise.all([
    supabase
      .from('students')
      .select('id, student_code, first_name, last_name, active, group_id, date_of_birth, allergies, medical_notes')
      .eq('school_id', profile.school_id)
      .order('last_name')
      .order('first_name'),
    supabase
      .from('groups')
      .select('id, name')
      .eq('school_id', profile.school_id)
      .eq('active', true)
      .order('name'),
  ])

  return (
    <DashboardShell activeHref="/dashboard/alumnos">
      <AlumnosClient
        students={students ?? []}
        groups={groups ?? []}
        schoolId={profile.school_id}
      />
    </DashboardShell>
  )
}
