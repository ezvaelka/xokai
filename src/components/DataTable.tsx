'use client'

import * as React from 'react'
import { Search, ChevronLeft, ChevronRight } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { EmptyState } from '@/components/EmptyState'
import { cn } from '@/lib/utils'

// ─── Types ───────────────────────────────────────────────────────────────────

export interface Column<T> {
  key: keyof T | string
  header: string
  /** Render personalizado. Si no se pasa, se usa el valor directo */
  cell?: (row: T) => React.ReactNode
  className?: string
}

interface DataTableProps<T> {
  /** Datos completos (sin paginar) */
  data: T[]
  columns: Column<T>[]
  /** Placeholder del input de búsqueda */
  searchPlaceholder?: string
  /** Función que indica si una fila coincide con la búsqueda */
  searchFn?: (row: T, query: string) => boolean
  /** Registros por página. Default: 10 */
  pageSize?: number
  /** Slot para filtros adicionales (dropdowns, etc.) junto al search */
  filters?: React.ReactNode
  /** Slot para acciones globales (botón "Nuevo", exportar, etc.) */
  actions?: React.ReactNode
  /** Mensaje vacío cuando no hay datos */
  emptyTitle?: string
  emptyDescription?: string
  emptyIcon?: React.ReactNode
  emptyAction?: React.ReactNode
  className?: string
  /** Key única por fila. Si no se pasa se usa el índice */
  rowKey?: (row: T) => string | number
}

/**
 * DataTable — tabla genérica con búsqueda, filtros y paginación.
 * Toda la lógica corre en el cliente (datos ya vienen del server component).
 *
 * @example
 * <DataTable
 *   data={students}
 *   columns={[
 *     { key: 'first_name', header: 'Nombre' },
 *     { key: 'active', header: 'Estado', cell: (s) => <StatusBadge type="active" value={s.active} /> },
 *   ]}
 *   searchPlaceholder="Buscar alumno..."
 *   searchFn={(s, q) => `${s.first_name} ${s.last_name}`.toLowerCase().includes(q)}
 *   emptyTitle="Sin alumnos"
 *   emptyDescription="Agrega el primer alumno para comenzar."
 * />
 */
export function DataTable<T extends object>({
  data,
  columns,
  searchPlaceholder = 'Buscar...',
  searchFn,
  pageSize = 10,
  filters,
  actions,
  emptyTitle = 'Sin resultados',
  emptyDescription = 'No se encontraron registros.',
  emptyIcon,
  emptyAction,
  className,
  rowKey,
}: DataTableProps<T>) {
  const [query, setQuery] = React.useState('')
  const [page, setPage] = React.useState(1)

  // Filter
  const filtered = React.useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q || !searchFn) return data
    return data.filter((row) => searchFn(row, q))
  }, [data, query, searchFn])

  // Reset page on filter change
  React.useEffect(() => { setPage(1) }, [query])

  // Paginate
  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize))
  const safePage   = Math.min(page, totalPages)
  const paginated  = filtered.slice((safePage - 1) * pageSize, safePage * pageSize)

  const startRecord = filtered.length === 0 ? 0 : (safePage - 1) * pageSize + 1
  const endRecord   = Math.min(safePage * pageSize, filtered.length)

  function getCellValue(row: T, col: Column<T>): React.ReactNode {
    if (col.cell) return col.cell(row)
    const key = col.key as keyof T
    const val = row[key]
    if (val === null || val === undefined) return '—'
    if (typeof val === 'boolean') return val ? 'Sí' : 'No'
    return String(val)
  }

  return (
    <div className={cn('rounded-2xl border border-xk-border bg-xk-card shadow-sm overflow-hidden', className)}>

      {/* ── Toolbar ─────────────────────────────────────────────────────── */}
      <div className="flex flex-wrap items-center gap-3 p-4 border-b border-xk-border">
        {searchFn && (
          <div className="relative flex-1 min-w-[200px] max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-xk-text-muted pointer-events-none" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={searchPlaceholder}
              className="pl-9"
            />
          </div>
        )}
        {filters && <div className="flex items-center gap-2">{filters}</div>}
        {actions && <div className="ml-auto flex items-center gap-2">{actions}</div>}
      </div>

      {/* ── Table ───────────────────────────────────────────────────────── */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-xk-border bg-xk-subtle">
              {columns.map((col) => (
                <th
                  key={String(col.key)}
                  className={cn(
                    'px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-xk-text-secondary',
                    col.className
                  )}
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-xk-border">
            {paginated.length === 0 ? (
              <tr>
                <td colSpan={columns.length}>
                  <EmptyState
                    icon={emptyIcon}
                    title={emptyTitle}
                    description={emptyDescription}
                    action={emptyAction}
                  />
                </td>
              </tr>
            ) : (
              paginated.map((row, i) => (
                <tr
                  key={rowKey ? rowKey(row) : i}
                  className="hover:bg-xk-subtle/50 transition-colors"
                >
                  {columns.map((col) => (
                    <td
                      key={String(col.key)}
                      className={cn('px-4 py-3.5 text-xk-text', col.className)}
                    >
                      {getCellValue(row, col)}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* ── Pagination ──────────────────────────────────────────────────── */}
      {filtered.length > 0 && (
        <div className="flex items-center justify-between px-4 py-3 border-t border-xk-border">
          <p className="text-xs text-xk-text-muted">
            {startRecord}–{endRecord} de {filtered.length} registros
          </p>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={safePage === 1}
              className="h-8 w-8"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="px-2 text-xs font-medium text-xk-text-secondary">
              {safePage} / {totalPages}
            </span>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={safePage === totalPages}
              className="h-8 w-8"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
