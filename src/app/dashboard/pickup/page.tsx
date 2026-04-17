import { redirect }    from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import ComingSoon       from '@/components/ComingSoon'

export default async function PickupPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  return (
    <ComingSoon
      title="Pickup"
      description="Semáforo de salida en tiempo real. Los papás avisan desde la app cuándo van llegando y el portero autoriza la salida de cada alumno con GPS."
      eta="Próximamente"
      icon={
        <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor"
          strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="2"/>
          <path d="M16.24 7.76a6 6 0 0 1 0 8.49m-8.48-.01a6 6 0 0 1 0-8.49m11.31-2.82a10 10 0 0 1 0 14.14m-14.14 0a10 10 0 0 1 0-14.14"/>
        </svg>
      }
    />
  )
}
