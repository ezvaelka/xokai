import * as React from 'react'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'

interface LoadingSkeletonProps {
  /** Número de filas de skeleton a renderizar (para simular tablas) */
  rows?: number
  /** Mostrar encabezado (útil para tablas) */
  header?: boolean
  className?: string
}

/**
 * LoadingSkeleton — skeleton genérico para tablas y listas.
 * Usa Skeleton de shadcn para cumplir el estándar de diseño.
 */
export function LoadingSkeleton({ rows = 5, header = true, className }: LoadingSkeletonProps) {
  return (
    <div className={cn('w-full', className)}>
      {/* Page header skeleton */}
      <div className="flex items-center justify-between mb-7">
        <div className="space-y-2">
          <Skeleton className="h-7 w-48" />
          <Skeleton className="h-4 w-72" />
        </div>
        <Skeleton className="h-9 w-32 rounded-xl" />
      </div>

      {/* Card skeleton */}
      <div className="rounded-2xl border border-xk-border bg-xk-card shadow-sm overflow-hidden">
        {/* Toolbar */}
        <div className="flex items-center gap-3 p-4 border-b border-xk-border">
          <Skeleton className="h-9 w-64 rounded-xl" />
          <Skeleton className="h-9 w-24 rounded-xl" />
        </div>

        {/* Table header */}
        {header && (
          <div className="flex items-center gap-4 px-4 py-3 bg-xk-subtle border-b border-xk-border">
            <Skeleton className="h-4 w-4" />
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-4 w-24 ml-auto" />
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-4 w-16" />
          </div>
        )}

        {/* Rows */}
        <div className="divide-y divide-xk-border">
          {Array.from({ length: rows }).map((_, i) => (
            <div key={i} className="flex items-center gap-4 px-4 py-3.5">
              <Skeleton className="h-4 w-4 shrink-0" />
              <div className="flex items-center gap-3 min-w-0 flex-1">
                <Skeleton className="h-8 w-8 rounded-full shrink-0" />
                <div className="space-y-1.5 flex-1">
                  <Skeleton className="h-4 w-40" />
                  <Skeleton className="h-3 w-24" />
                </div>
              </div>
              <Skeleton className="h-6 w-16 rounded-full" />
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-8 w-8 rounded-lg" />
            </div>
          ))}
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between px-4 py-3 border-t border-xk-border">
          <Skeleton className="h-4 w-32" />
          <div className="flex gap-1">
            <Skeleton className="h-8 w-8 rounded-lg" />
            <Skeleton className="h-8 w-8 rounded-lg" />
            <Skeleton className="h-8 w-8 rounded-lg" />
          </div>
        </div>
      </div>
    </div>
  )
}

/**
 * CardSkeleton — skeleton simple para cards individuales.
 */
export function CardSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn('rounded-2xl border border-xk-border bg-xk-card p-5 shadow-sm space-y-3', className)}>
      <Skeleton className="h-5 w-32" />
      <Skeleton className="h-10 w-24" />
      <Skeleton className="h-4 w-48" />
    </div>
  )
}
