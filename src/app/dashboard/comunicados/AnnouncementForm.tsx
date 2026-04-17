'use client'

import { useState, useTransition, useRef } from 'react'
import { toast }                            from 'sonner'
import { X, Loader2, ImagePlus, Link2, Users, School } from 'lucide-react'
import { Button }                           from '@/components/ui/button'
import {
  createAnnouncement,
  uploadAnnouncementImage,
  type CreateAnnouncementInput,
} from '@/app/actions/announcements'
import type { GroupItem } from '@/app/actions/groups'

interface Props {
  groups:    GroupItem[]
  onClose:   () => void
  onSuccess: () => void
}

export default function AnnouncementForm({ groups, onClose, onSuccess }: Props) {
  const [title,       setTitle]       = useState('')
  const [body,        setBody]        = useState('')
  const [segmentType, setSegmentType] = useState<'school' | 'group'>('school')
  const [segmentId,   setSegmentId]   = useState('')
  const [formUrl,     setFormUrl]     = useState('')
  const [formLabel,   setFormLabel]   = useState('')
  const [imagePreview, setPreview]    = useState<string | null>(null)
  const [imageUrl,    setImageUrl]    = useState<string | null>(null)
  const [uploading,   setUploading]   = useState(false)
  const [pending,     start]          = useTransition()
  const fileRef                       = useRef<HTMLInputElement>(null)

  async function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    setPreview(URL.createObjectURL(file))
    setUploading(true)

    const fd = new FormData()
    fd.append('image', file)
    const res = await uploadAnnouncementImage(fd)
    setUploading(false)

    if (res.error) {
      toast.error(res.error)
      setPreview(null)
      setImageUrl(null)
    } else {
      setImageUrl(res.url)
    }
  }

  function handleSubmit() {
    if (!title.trim())        { toast.error('El título es requerido'); return }
    if (!body.trim())         { toast.error('El cuerpo es requerido'); return }
    if (segmentType === 'group' && !segmentId) {
      toast.error('Selecciona un grupo'); return
    }

    const input: CreateAnnouncementInput = {
      title:        title.trim(),
      body:         body.trim(),
      image_url:    imageUrl,
      form_url:     formUrl.trim() || null,
      form_label:   formLabel.trim() || null,
      segment_type: segmentType,
      segment_id:   segmentType === 'group' ? segmentId : null,
    }

    start(async () => {
      const res = await createAnnouncement(input)
      if (res.error) toast.error(res.error)
      else { toast.success('Comunicado publicado'); onSuccess(); onClose() }
    })
  }

  const busy = pending || uploading

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="bg-xk-card border border-xk-border rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-xk-border">
          <h2 className="font-heading text-lg font-semibold text-xk-text">Nuevo comunicado</h2>
          <button onClick={onClose} className="text-xk-text-muted hover:text-xk-text transition-colors">
            <X size={18} />
          </button>
        </div>

        <div className="p-5 space-y-4">
          {/* Título */}
          <div>
            <label className="block text-xs font-medium text-xk-text-muted uppercase tracking-wider mb-1.5">
              Título *
            </label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ej: Reunión de padres — Viernes 25"
              className="w-full rounded-xl border border-xk-border bg-xk-bg px-3 py-2.5 text-sm text-xk-text placeholder:text-xk-text-muted focus:outline-none focus:ring-2 focus:ring-xk-accent focus:border-transparent"
            />
          </div>

          {/* Cuerpo */}
          <div>
            <label className="block text-xs font-medium text-xk-text-muted uppercase tracking-wider mb-1.5">
              Mensaje *
            </label>
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="Escribe el mensaje para los padres…"
              rows={5}
              className="w-full rounded-xl border border-xk-border bg-xk-bg px-3 py-2.5 text-sm text-xk-text placeholder:text-xk-text-muted resize-none focus:outline-none focus:ring-2 focus:ring-xk-accent focus:border-transparent"
            />
          </div>

          {/* Destinatarios */}
          <div>
            <label className="block text-xs font-medium text-xk-text-muted uppercase tracking-wider mb-1.5">
              Destinatarios
            </label>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => { setSegmentType('school'); setSegmentId('') }}
                className={[
                  'flex-1 flex items-center justify-center gap-2 py-2 rounded-xl border text-sm font-medium transition-colors',
                  segmentType === 'school'
                    ? 'bg-xk-accent text-white border-xk-accent'
                    : 'border-xk-border text-xk-text-secondary hover:bg-xk-subtle',
                ].join(' ')}
              >
                <School size={15} /> Toda la escuela
              </button>
              <button
                type="button"
                onClick={() => setSegmentType('group')}
                disabled={groups.length === 0}
                className={[
                  'flex-1 flex items-center justify-center gap-2 py-2 rounded-xl border text-sm font-medium transition-colors',
                  segmentType === 'group'
                    ? 'bg-xk-accent text-white border-xk-accent'
                    : 'border-xk-border text-xk-text-secondary hover:bg-xk-subtle',
                  groups.length === 0 ? 'opacity-40 cursor-not-allowed' : '',
                ].join(' ')}
              >
                <Users size={15} /> Un grupo
              </button>
            </div>
            {segmentType === 'group' && groups.length > 0 && (
              <select
                value={segmentId}
                onChange={(e) => setSegmentId(e.target.value)}
                className="mt-2 w-full rounded-xl border border-xk-border bg-xk-bg px-3 py-2.5 text-sm text-xk-text focus:outline-none focus:ring-2 focus:ring-xk-accent focus:border-transparent"
              >
                <option value="">Selecciona un grupo…</option>
                {groups.map((g) => (
                  <option key={g.id} value={g.id}>{g.name}</option>
                ))}
              </select>
            )}
          </div>

          {/* Imagen */}
          <div>
            <label className="block text-xs font-medium text-xk-text-muted uppercase tracking-wider mb-1.5">
              Imagen (opcional)
            </label>
            {imagePreview ? (
              <div className="relative">
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="w-full max-h-48 object-cover rounded-xl border border-xk-border"
                />
                {uploading && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/30 rounded-xl">
                    <Loader2 size={24} className="animate-spin text-white" />
                  </div>
                )}
                {!uploading && (
                  <button
                    type="button"
                    onClick={() => { setPreview(null); setImageUrl(null) }}
                    className="absolute top-2 right-2 w-6 h-6 rounded-full bg-black/50 flex items-center justify-center text-white hover:bg-black/70 transition-colors"
                  >
                    <X size={12} />
                  </button>
                )}
              </div>
            ) : (
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                className="w-full flex flex-col items-center justify-center gap-1.5 py-6 rounded-xl border-2 border-dashed border-xk-border text-xk-text-muted hover:border-xk-accent hover:text-xk-accent transition-colors"
              >
                <ImagePlus size={20} />
                <span className="text-xs">Seleccionar imagen (máx. 5 MB)</span>
              </button>
            )}
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleImageChange}
            />
          </div>

          {/* Link a formulario */}
          <div>
            <label className="block text-xs font-medium text-xk-text-muted uppercase tracking-wider mb-1.5">
              Link a formulario (opcional)
            </label>
            <div className="relative">
              <Link2 size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-xk-text-muted" />
              <input
                value={formUrl}
                onChange={(e) => setFormUrl(e.target.value)}
                type="url"
                placeholder="https://forms.google.com/…"
                className="w-full pl-8 pr-3 py-2.5 rounded-xl border border-xk-border bg-xk-bg text-sm text-xk-text placeholder:text-xk-text-muted focus:outline-none focus:ring-2 focus:ring-xk-accent focus:border-transparent"
              />
            </div>
            {formUrl.trim() && (
              <input
                value={formLabel}
                onChange={(e) => setFormLabel(e.target.value)}
                placeholder='Etiqueta del botón (ej: "Llenar encuesta")'
                className="mt-2 w-full rounded-xl border border-xk-border bg-xk-bg px-3 py-2.5 text-sm text-xk-text placeholder:text-xk-text-muted focus:outline-none focus:ring-2 focus:ring-xk-accent focus:border-transparent"
              />
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-5 py-4 border-t border-xk-border">
          <Button variant="outline" onClick={onClose} disabled={busy}>
            Cancelar
          </Button>
          <Button onClick={handleSubmit} disabled={busy} className="gap-2">
            {pending ? <Loader2 size={14} className="animate-spin" /> : null}
            Publicar comunicado
          </Button>
        </div>
      </div>
    </div>
  )
}
