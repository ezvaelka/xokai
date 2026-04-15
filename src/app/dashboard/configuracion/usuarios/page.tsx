import { redirect }    from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import DashboardShell   from '@/components/DashboardShell'
import UsuariosClient   from './UsuariosClient'

export default async function UsuariosPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Solo admins y sysadmin pueden ver esta página
  const { data: profile } = await supabase
    .from('user_profiles')
    .select('role, school_id')
    .eq('id', user.id)
    .single()

  if (!profile || !['admin', 'sysadmin'].includes(profile.role)) {
    redirect('/dashboard')
  }

  // Obtener usuarios de la escuela
  const { data: users } = await supabase
    .from('user_profiles')
    .select('id, first_name, last_name, role, created_at')
    .eq('school_id', profile.school_id)
    .order('created_at', { ascending: false })

  // Correos de auth.users no disponibles vía RLS normal, incluimos lo que tenemos
  return (
    <DashboardShell activeHref="/dashboard/configuracion/usuarios">
      <UsuariosClient
        initialUsers={users ?? []}
        currentUserId={user.id}
      />
    </DashboardShell>
  )
}
