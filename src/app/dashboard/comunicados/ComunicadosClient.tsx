'use client'

import { useState, useTransition } from 'react'
import { useRouter }               from 'next/navigation'
import { toast }                   from 'sonner'
import { Plus, School, Users, Link2, Trash2, Loader2, BookOpen } from 'lucide-react'
import { Button }                  from '@/components/ui/button'
import { ConfirmDialog }           from '@/components/ConfirmDialog'
import AnnouncementForm            from './AnnouncementForm'
import { deleteAnnouncement, type AnnouncementItem } from '@/app/actions/announcements'
import type { GroupItem }          from '@/app/actions/groups'

interface Props {
  announcements: AnnouncementItem[]
  groups:        GroupItem[]
}

function fmtRelative(iso: string) {
  const diff = Date.now() - new Date(iso).getTime()
  const mins = Math.floor(diff / 60_000)
  if (mins < 1)  return 'hace un momento'
  if (mins < 60) return `hace ${mins}m`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24)  return `hace ${hrs}h`
  const days = Math.floor(hrs / 24)
  if (days < 7)  return `hace ${days}d`
  return new Date(iso).toLocaleString('es-MX', {
    day: '2-digit', month: 'short', year: 'numeric',
  })
}

export default function ComunicadosClient({ announcements, groups }: Props) {
  const router               = useRouter()
  const [showForm, setForm]  = useState(false)
  const [deletingId, setDel] = useState<string | null>(null)
  const [pending, start]     = useTransition()

  function handleDelete(a: AnnouncementItem) {
    setDel(a.id)
    start(async () => {
      const res = await deleteAnnouncement(a.id)
      setDel(null)
      if (res.error) toast.error(res.error)
      else { toast.success('Comunicado eliminado'); router.refresh() }
    })
  }

  return (
    <>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-heading text-2xl font-bold text-xk-text">Comunicados</h1>
          <p className="text-sm text-xk-text-secondary mt-1">
            {announcements.length} comunicado{announcements.length !== 1 ? 's' : ''} publicado{announcements.length !== 1 ? 's' : ''}
          </p>
        </div>
        <Button onClick={() => setForm(true)} className="gap-2">
          <Plus size={16} /> Nuevo comunicado
        </Button>
      </div>

      {/* Lista */}
      {announcements.length === 0 ? (
        <div className="bg-xk-card border border-xk-border rounded-2xl p-12 text-center">
          <div className="w-12 h-12 rounded-full bg-xk-accent-light flex items-center justify-center mx-auto mb-3">
            <BookOpen size={22} className="text-xk-accent" />
          </div>
          <p className="text-sm font-medium text-xk-text mb-1">Sin comunicados aún</p>
          <p className="text-xs text-xk-text-muted mb-4">
            Publica tu primer comunicado para informar a los padres.
          </p>
          <Button onClick={() => setForm(true)} size="sm" className="gap-2">
            <Plus size={14} /> Nuevo comunicado
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {announcements.map((a) => (
            <article
              key={a.id}
              className="bg-xk-card border border-xk-border rounded-2xl overflow-hidden hover:border-xk-accent/40 transition-colors"
            >
              {/* Imagen si hay */}
              {a.image_url && (
                <img
                  src={a.image_url}
                  alt=""
                  className="w-full max-h-52 object-cover"
                />
              )}

              <div className="p-4">
                {/* Meta */}
                <div className="flex items-center gap-2 mb-2">
                  <span className={[
                    'inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium',
                    a.segment_type === 'school'
                      ? 'bg-blue-50 text-blue-600'
                      : 'bg-purple-50 text-purple-600',
                  ].join(' ')}>
                    {a.segment_type === 'school'
                      ? <><School size={10} /> Toda la escuela</>
                      : <><Users size={10} /> {a.segment_label ?? 'Grupo'}</>
                    }
                  </span>
                  <span className="text-xs text-xk-text-muted">{fmtRelative(a.created_at)}</span>
                  {a.author_name && (
                    <span className="text-xs text-xk-text-muted">· {a.author_name}</span>
                  )}
                </div>

                {/* Título + cuerpo */}
                <h3 className="font-semibold text-xk-text text-sm mb-1 leading-snug">{a.title}</h3>
                <p className="text-sm text-xk-text-secondary leading-relaxed line-clamp-3">{a.body}</p>

                {/* Form link */}
                {a.form_url && (
                  <a
                    href={a.form_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="inline-flex items-center gap-1.5 mt-3 text-xs font-medium text-xk-accent hover:underline"
                  >
                    <Link2 size={11} />
                    {a.form_label || 'Ver formulario'}
                  </a>
                )}

                {/* Footer */}
                <div className="flex items-center justify-between mt-3 pt-3 border-t border-xk-border">
                  <span className="text-xs text-xk-text-muted">
                    {a.read_count > 0
                      ? `${a.read_count} lectura${a.read_count !== 1 ? 's' : ''}`
                      : 'Sin lecturas aún'}
                  </span>
                  <ConfirmDialog
                    trigger={
                      <button
                        disabled={deletingId === a.id || pending}
                        className="p-1.5 rounded-lg hover:bg-red-50 transition-colors"
                        title="Eliminar comunicado"
                      >
                        {deletingId === a.id
                          ? <Loader2 size={13} className="animate-spin text-red-400" />
                          : <Trash2 size={13} className="text-red-400" />
                        }
                      </button>
                    }
                    title="¿Eliminar comunicado?"
                    description={`"${a.title}" será eliminado para todos. Esta acción no se puede deshacer.`}
                    confirmLabel="Sí, eliminar"
                    destructive
                    onConfirm={() => handleDelete(a)}
                  />
                </div>
              </div>
            </article>
          ))}
        </div>
      )}

      {showForm && (
        <AnnouncementForm
          groups={groups}
          onClose={() => setForm(false)}
          onSuccess={() => router.refresh()}
        />
      )}
    </>
  )
}
