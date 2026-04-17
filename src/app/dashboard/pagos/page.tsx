import { redirect }    from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import ComingSoon       from '@/components/ComingSoon'

export default async function PagosPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  return (
    <ComingSoon
      title="Pagos"
      description="Cobra colegiaturas automáticamente, genera CFDI 4.0 en segundos y ofrece planes de pago flexibles a las familias."
      eta="Próximamente"
      icon={
        <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor"
          strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <rect x="1" y="4" width="22" height="16" rx="2"/>
          <line x1="1" y1="10" x2="23" y2="10"/>
        </svg>
      }
    />
  )
}
