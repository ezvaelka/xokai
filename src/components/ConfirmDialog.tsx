'use client'

import * as React from 'react'
import { AlertTriangle } from 'lucide-react'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { cn } from '@/lib/utils'

interface ConfirmDialogProps {
  /** Elemento que abre el diálogo (botón de eliminar, etc.) */
  trigger: React.ReactNode
  title: string
  description: string
  /** Texto del botón de confirmación. Default: "Confirmar" */
  confirmLabel?: string
  /** Texto del botón de cancelar. Default: "Cancelar" */
  cancelLabel?: string
  /** Callback que se ejecuta al confirmar. Puede ser async. */
  onConfirm: () => void | Promise<void>
  /** Si true, el botón de confirmación usa estilo destructivo (rojo) */
  destructive?: boolean
  className?: string
}

/**
 * ConfirmDialog — AlertDialog de confirmación estándar.
 * Siempre requerido antes de acciones destructivas (eliminar, desactivar, etc.).
 *
 * @example
 * <ConfirmDialog
 *   trigger={<Button variant="destructive">Eliminar alumno</Button>}
 *   title="¿Eliminar alumno?"
 *   description="Esta acción no se puede deshacer. El alumno será eliminado permanentemente."
 *   confirmLabel="Sí, eliminar"
 *   destructive
 *   onConfirm={() => deleteStudent(id)}
 * />
 */
export function ConfirmDialog({
  trigger,
  title,
  description,
  confirmLabel = 'Confirmar',
  cancelLabel = 'Cancelar',
  onConfirm,
  destructive = false,
  className,
}: ConfirmDialogProps) {
  const [loading, setLoading] = React.useState(false)

  async function handleConfirm() {
    setLoading(true)
    try {
      await onConfirm()
    } finally {
      setLoading(false)
    }
  }

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>{trigger}</AlertDialogTrigger>
      <AlertDialogContent className={className}>
        <AlertDialogHeader>
          <div className="flex items-center gap-3 mb-1">
            <div className={cn(
              'flex h-10 w-10 shrink-0 items-center justify-center rounded-xl',
              destructive ? 'bg-red-100 text-xk-danger' : 'bg-xk-accent-light text-xk-accent'
            )}>
              <AlertTriangle className="h-5 w-5" />
            </div>
            <AlertDialogTitle>{title}</AlertDialogTitle>
          </div>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={loading}>{cancelLabel}</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirm}
            disabled={loading}
            className={cn(
              destructive && 'bg-xk-danger hover:bg-red-700'
            )}
          >
            {loading ? 'Procesando...' : confirmLabel}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
