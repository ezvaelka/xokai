'use client'

import { useState, useMemo } from 'react'
import { useRouter }          from 'next/navigation'
import { toast }              from 'sonner'
import { UserPlus, Search, Mail, Users } from 'lucide-react'
import { Button }             from '@/components/ui/button'
import InviteParentForm       from './InviteParentForm'
import type { ParentItem }    from '@/app/actions/parents'

export default function PadresClient({ parents }: { parents: ParentItem[] }) {
  const router = useRouter()
  const [showInvite, setShowInvite] = useState(false)
  const [search, setSearch]         = useState('')

  const filtered = useMemo(() =>
    parents.filter(p => {
      if (!search) return true
      const name = `${p.first_name ?? ''} ${p.last_name ?? ''}`.toLowerCase()
      return name.includes(search.toLowerCase()) ||
        (p.email?.toLowerCase().includes(search.toLowerCase()) ?? false)
    }), [parents, search])

  function fullName(p: ParentItem) {
    return [p.first_name, p.last_name].filter(Boolean).join(' ') || 'Sin nombre'
  }

  function initials(p: ParentItem) {
    return [p.first_name?.[0], p.last_name?.[0]].filter(Boolean).join('').toUpperCase() || '?'
  }

  return (
    <>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-heading text-2xl font-bold text-xk-text">Padres</h1>
          <p className="text-sm text-xk-text-secondary mt-1">
            {parents.length} padre{parents.length !== 1 ? 's' : ''} y tutores
          </p>
        </div>
        <Button onClick={() => setShowInvite(true)} className="gap-2">
          <UserPlus size={16} /> Invitar padre
        </Button>
      </div>

      {/* Content */}
      {parents.length === 0 ? (
        <div className="bg-xk-card border border-xk-border rounded-2xl p-12 text-center">
          <div className="w-14 h-14 bg-xk-accent-light rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Users size={28} className="text-xk-accent" />
          </div>
          <p className="font-heading text-lg font-semibold text-xk-text mb-1">No hay padres aún</p>
          <p className="text-sm text-xk-text-muted mb-5">Invita a los padres y tutores para conectarlos con la escuela.</p>
          <Button onClick={() => setShowInvite(true)} className="gap-2">
            <UserPlus size={16} /> Invitar primer padre
          </Button>
        </div>
      ) : (
        <>
          {/* Search */}
          <div className="relative mb-5">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-xk-text-muted" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Buscar por nombre o correo…"
              className="w-full pl-8 pr-3 py-2 rounded-xl border border-xk-border bg-xk-card text-sm text-xk-text placeholder:text-xk-text-muted focus:outline-none focus:ring-2 focus:ring-xk-accent focus:border-transparent"
            />
          </div>

          {filtered.length === 0 ? (
            <div className="bg-xk-card border border-xk-border rounded-2xl p-10 text-center text-sm text-xk-text-muted">
              No hay padres que coincidan con la búsqueda.
            </div>
          ) : (
            <>
              {/* Desktop table */}
              <div className="hidden md:block bg-xk-card border border-xk-border rounded-2xl overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-xk-subtle border-b border-xk-border">
                    <tr className="text-xs font-semibold text-xk-text-muted uppercase tracking-wider">
                      <th className="text-left px-4 py-3">Nombre</th>
                      <th className="text-left px-4 py-3">Correo</th>
                      <th className="text-left px-4 py-3">Fecha de registro</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map(p => (
                      <tr key={p.id} className="border-b border-xk-border last:border-0 hover:bg-xk-subtle/40 transition-colors">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2.5">
                            <div className="w-9 h-9 rounded-full bg-xk-accent-light flex items-center justify-center shrink-0">
                              <span className="text-xs font-bold text-xk-accent">{initials(p)}</span>
                            </div>
                            <span className="font-medium text-xk-text">{fullName(p)}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1.5 text-xk-text-secondary">
                            <Mail size={12} className="shrink-0" />
                            <span className="text-xs">{p.email ?? '—'}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-xs text-xk-text-muted font-mono">
                          {new Date(p.created_at).toLocaleDateString('es-MX')}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile cards */}
              <div className="md:hidden space-y-3">
                {filtered.map(p => (
                  <div key={p.id} className="bg-xk-card border border-xk-border rounded-2xl p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-xk-accent-light flex items-center justify-center shrink-0">
                        <span className="text-sm font-bold text-xk-accent">{initials(p)}</span>
                      </div>
                      <div>
                        <p className="font-medium text-xk-text text-sm">{fullName(p)}</p>
                        {p.email && <p className="text-xs text-xk-text-muted">{p.email}</p>}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <p className="text-xs text-xk-text-muted mt-3">
                {filtered.length} padre{filtered.length !== 1 ? 's' : ''}
              </p>
            </>
          )}
        </>
      )}

      {showInvite && (
        <InviteParentForm
          onClose={() => setShowInvite(false)}
          onSuccess={() => router.refresh()}
        />
      )}
    </>
  )
}
