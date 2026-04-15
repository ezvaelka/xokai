import { redirect }    from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import DashboardShell   from '@/components/DashboardShell'
import ComingSoon       from '@/components/ComingSoon'

export default async function ComunicadosPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  return (
    <DashboardShell activeHref="/dashboard/comunicados">
      <ComingSoon
        title="Comunicados"
        description="Reemplaza WhatsApp — envía comunicados oficiales a padres de familia con confirmación de lectura y sin grupos caóticos."
        eta="Próximamente"
        icon={
          <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor"
            strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
          </svg>
        }
      />
    </DashboardShell>
  )
}
