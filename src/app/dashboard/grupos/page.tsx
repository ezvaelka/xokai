import { redirect }    from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import DashboardShell   from '@/components/DashboardShell'
import ComingSoon       from '@/components/ComingSoon'

export default async function GruposPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  return (
    <DashboardShell activeHref="/dashboard/grupos">
      <ComingSoon
        title="Grupos"
        description="Organiza los grupos académicos por grado y nivel, asigna maestros titulares y lleva el seguimiento por grupo."
        eta="Próximamente"
        icon={
          <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor"
            strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/>
          </svg>
        }
      />
    </DashboardShell>
  )
}
