import { redirect }    from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import ComingSoon       from '@/components/ComingSoon'

export default async function DocumentosPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  return (
    <ComingSoon
      title="Documentos"
      description="Envía contratos de inscripción, reglamentos y circulares para firma electrónica. Todo desde el celular, sin imprimir nada."
      eta="Próximamente"
      icon={
        <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor"
          strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
          <polyline points="14 2 14 8 20 8"/>
          <line x1="16" y1="13" x2="8" y2="13"/>
          <line x1="16" y1="17" x2="8" y2="17"/>
        </svg>
      }
    />
  )
}
