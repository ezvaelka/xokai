'use client'

import * as React from 'react'
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
      <DialogContent className={cn(SIZE_MAP[size], className)}>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {description && <DialogDescription>{description}</DialogDescription>}
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-1">
          {children}

          <DialogFooter className="pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={submitting}
            >
              {cancelLabel}
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? 'Guardando...' : submitLabel}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
