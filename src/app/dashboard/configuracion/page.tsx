import { redirect } from 'next/navigation'

// Redirigir /dashboard/configuracion → /dashboard/configuracion/usuarios
export default function ConfiguracionPage() {
  redirect('/dashboard/configuracion/usuarios')
}
