'use client'

import { useState } from 'react'
import { LogOut, Loader2 } from 'lucide-react'
import { signOut } from '@/app/actions/auth'

export default function DashboardLogout() {
  const [loading, setLoading] = useState(false)

  async function handleLogout() {
    setLoading(true)
    await signOut()
  }

  return (
    <button
      onClick={handleLogout}
      disabled={loading}
      title="Cerrar sesión"
      className="flex items-center justify-center w-8 h-8 rounded-lg text-xk-text-secondary hover:bg-xk-subtle hover:text-xk-text transition-colors disabled:opacity-50"
    >
      {loading
        ? <Loader2 size={16} className="animate-spin" />
        : <LogOut size={16} />
      }
    </button>
  )
}
