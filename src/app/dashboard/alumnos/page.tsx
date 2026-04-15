import { redirect }    from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import DashboardShell   from '@/components/DashboardShell'
import ComingSoon       from '@/components/ComingSoon'

export default async function AlumnosPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  return (
    <DashboardShell activeHref="/dashboard/alumnos">
      <ComingSoon
        title="Alumnos"
        description="Registra y gestiona el directorio de alumnos, asigna grupos, lleva asistencias y conecta cada alumno con su familia."
        eta="Próximamente"
        icon={
          <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor"
            strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
            <circle cx="9" cy="7" r="4"/>
            <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
            <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
          </svg>
        }
      />
    </DashboardShell>
  )
}
