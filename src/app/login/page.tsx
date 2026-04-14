'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) { setError(error.message); setLoading(false); return }
    router.push('/dashboard')
    router.refresh()
  }

  const inputStyle = {
    width: '100%', padding: '10px 14px', borderRadius: '8px',
    border: '1px solid #DDD6FE', fontSize: '14px',
    boxSizing: 'border-box' as const, outline: 'none',
    color: '#1C1917', background: '#fff'
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#F0EFFE' }}>
      <div style={{ width: '100%', maxWidth: '420px', padding: '0 16px' }}>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <h1 style={{ fontSize: '48px', fontWeight: 700, color: '#6D4AE8', fontFamily: 'serif', margin: 0 }}>Xokai</h1>
          <p style={{ color: '#6B7280', marginTop: '8px', fontSize: '14px' }}>Plataforma de gestión escolar · México y LATAM</p>
        </div>
        <div style={{ background: '#fff', borderRadius: '16px', padding: '32px', border: '1px solid #DDD6FE' }}>
          <h2 style={{ marginBottom: '24px', fontSize: '20px', fontWeight: 600, color: '#1C1917' }}>Iniciar sesión</h2>
          <form onSubmit={handleSubmit}>
            {error && <p style={{ color: '#DC2626', background: '#FEE2E2', padding: '8px 12px', borderRadius: '8px', marginBottom: '16px', fontSize: '14px' }}>{error}</p>}
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '14px', marginBottom: '6px', fontWeight: 500, color: '#1C1917' }}>Correo electrónico</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} required placeholder="director@colegio.edu.mx" style={inputStyle} />
            </div>
            <div style={{ marginBottom: '24px' }}>
              <label style={{ display: 'block', fontSize: '14px', marginBottom: '6px', fontWeight: 500, color: '#1C1917' }}>Contraseña</label>
              <input type="password" value={password} onChange={e => setPassword(e.target.value)} required placeholder="••••••••" style={inputStyle} />
            </div>
            <button type="submit" disabled={loading}
              style={{ width: '100%', padding: '12px', background: '#6D4AE8', color: '#fff', border: 'none', borderRadius: '10px', fontSize: '15px', fontWeight: 600, cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1 }}>
              {loading ? 'Entrando…' : 'Entrar'}
            </button>
          </form>
        </div>
        <p style={{ textAlign: 'center', fontSize: '12px', color: '#9CA3AF', marginTop: '24px' }}>© 2026 Xokai · Todos los derechos reservados</p>
      </div>
    </div>
  )
}
