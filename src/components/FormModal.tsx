'use client'

import * as React from 'react'
import { Loader2 } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'

interface FormModalProps {
  /** Elemento que dispara la apertura del modal */
  trigger?: React.ReactNode
  title: string
  description?: string
  /** Texto del botón de submit. Default: "Guardar" */
  submitLabel?: string
  /** Texto del botón de cancelar. Default: "Cancelar" */
  cancelLabel?: string
  /** Callback de envío del form. Debe retornar Promise. */
  onSubmit: () => Promise<void>
  /** Si el modal está abierto (modo controlado) */
  open?: boolean
  /** Callback para cambiar el estado de open (modo controlado) */
  onOpenChange?: (open: boolean) => void
  /** Si true, deshabilita el botón submit */
  submitting?: boolean
  children: React.ReactNode
  className?: string
  /** Tamaño del modal: sm | md | lg. Default: md */
  size?: 'sm' | 'md' | 'lg'
}

const SIZE_MAP = {
  sm: 'sm:max-w-sm',
  md: 'sm:max-w-lg',
  lg: 'sm:max-w-2xl',
}

/**
 * FormModal — modal base con form estándar.
 * Soporta modo controlado (open + onOpenChange) y modo no controlado (trigger).
 *
 * @example
 * <FormModal
 *   trigger={<Button>Nuevo alumno</Button>}
 *   title="Agregar alumno"
 *   description="Ingresa los datos del alumno."
 *   onSubmit={handleSubmit(onSave)}
 * >
 *   <FormField ... />
 * </FormModal>
 */
export function FormModal({
  trigger,
  title,
  description,
  submitLabel = 'Guardar',
  cancelLabel = 'Cancelar',
  onSubmit,
  open,
  onOpenChange,
  submitting = false,
  children,
  className,
  size = 'md',
}: FormModalProps) {
  const [internalOpen, setInternalOpen] = React.useState(false)
  const isControlled = open !== undefined
  const isOpen = isControlled ? open : internalOpen
  const setOpen = isControlled ? (onOpenChange ?? (() => {})) : setInternalOpen

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    await onSubmit()
  }

  return (
    <Dialog open={isOpen} onOpenChange={setOpen}>
      {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
      <DialogContent className={cn('p-0 gap-0 overflow-hidden', SIZE_MAP[size], className)}>
        <DialogHeader className="px-6 pt-5 pb-0">
          <DialogTitle>{title}</DialogTitle>
          {description && <DialogDescription>{description}</DialogDescription>}
        </DialogHeader>

        <Separator className="mt-4" />

        <form onSubmit={handleSubmit} className="px-6 pb-6 space-y-4">
          <div className="space-y-4 pt-4">
            {children}
          </div>

          <DialogFooter className="pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={submitting}
            >
              {cancelLabel}
            </Button>
            <Button type="submit" disabled={submitting} className="min-w-[100px]">
              {submitting ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Guardando…
                </span>
              ) : (
                submitLabel
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
