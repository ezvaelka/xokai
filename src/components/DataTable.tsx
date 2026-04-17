'use client'

import * as React from 'react'
import { Search, ChevronLeft, ChevronRight } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { EmptyState } from '@/components/EmptyState'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'

// ─── Types ───────────────────────────────────────────────────────────────────

export interface Column<T> {
  key: keyof T | string
  header: string
  cell?: (row: T) => React.ReactNode
  className?: string
}

interface DataTableProps<T> {
  data: T[]
  columns: Column<T>[]
  searchPlaceholder?: string
  searchFn?: (row: T, query: string) => boolean
  /** Default: 20 — alineado con CLAUDE.md */
  pageSize?: number
  filters?: React.ReactNode
  actions?: React.ReactNode
  emptyTitle?: string
  emptyDescription?: string
  emptyIcon?: React.ReactNode
  emptyAction?: React.ReactNode
  className?: string
  rowKey?: (row: T) => string | number
  /** Muestra skeleton rows durante la carga */
  loading?: boolean
}

// ─── Skeleton row ─────────────────────────────────────────────────────────────

function SkeletonRows({ columns, rows = 5 }: { columns: number; rows?: number }) {
  return (
    <>
      {Array.from({ length: rows }).map((_, i) => (
        <tr key={i} className="border-b border-xk-border last:border-0">
          {Array.from({ length: columns }).map((_, j) => (
            <td key={j} className="px-4 py-3.5">
              <Skeleton className={cn('h-4 rounded', j === 0 ? 'w-36' : j === columns - 1 ? 'w-16' : 'w-24')} />
            </td>
          ))}
        </tr>
      ))}
    </>
  )
}

// ─── Hook: debounce ───────────────────────────────────────────────────────────

function useDebounce<T>(value: T, delay = 300): T {
  const [debounced, setDebounced] = React.useState(value)
  React.useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delay)
    return () => clearTimeout(id)
  }, [value, delay])
  return debounced
}

// ─── DataTable ────────────────────────────────────────────────────────────────

export function DataTable<T extends object>({
  data,
  columns,
  searchPlaceholder = 'Buscar...',
  searchFn,
  pageSize = 20,
  filters,
  actions,
  emptyTitle = 'Sin resultados',
  emptyDescription = 'No se encontraron registros.',
  emptyIcon,
  emptyAction,
  className,
  rowKey,
  loading = false,
}: DataTableProps<T>) {
  const [rawQuery, setRawQuery] = React.useState('')
  const [page, setPage] = React.useState(1)
  const query = useDebounce(rawQuery)

  const filtered = React.useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q || !searchFn) return data
    return data.filter((row) => searchFn(row, q))
  }, [data, query, searchFn])

  React.useEffect(() => { setPage(1) }, [query])

  const totalPages  = Math.max(1, Math.ceil(filtered.length / pageSize))
  const safePage    = Math.min(page, totalPages)
  const paginated   = filtered.slice((safePage - 1) * pageSize, safePage * pageSize)
  const startRecord = filtered.length === 0 ? 0 : (safePage - 1) * pageSize + 1
  const endRecord   = Math.min(safePage * pageSize, filtered.length)

  function getCellValue(row: T, col: Column<T>): React.ReactNode {
    if (col.cell) return col.cell(row)
    const val = row[col.key as keyof T]
    if (val === null || val === undefined) return '—'
    if (typeof val === 'boolean') return val ? 'Sí' : 'No'
    return String(val)
  }

  return (
    <div className={cn('rounded-xl border border-xk-border bg-xk-card overflow-hidden', className)}>

      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-3 px-4 py-3 border-b border-xk-border bg-xk-card">
        {searchFn && (
          <div className="relative flex-1 min-w-[180px] max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-xk-text-muted pointer-events-none" />
            <Input
              value={rawQuery}
              onChange={(e) => setRawQuery(e.target.value)}
              placeholder={searchPlaceholder}
              className="pl-9 h-8 text-sm"
            />
          </div>
        )}
        {filters && <div className="flex items-center gap-2">{filters}</div>}
        {actions && <div className="ml-auto flex items-center gap-2">{actions}</div>}
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-xk-border bg-xk-subtle/60">
              {columns.map((col) => (
                <th
                  key={String(col.key)}
                  className={cn(
                    'px-4 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wider text-xk-text-secondary',
                    col.className,
                  )}
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-xk-border/60">
            {loading ? (
              <SkeletonRows columns={columns.length} rows={5} />
            ) : paginated.length === 0 ? (
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
                      className={cn('px-4 py-3 text-xk-text', col.className)}
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

      {/* Pagination */}
      {!loading && filtered.length > 0 && (
        <div className="flex items-center justify-between px-4 py-2.5 border-t border-xk-border bg-xk-subtle/30">
          <p className="text-xs text-xk-text-muted">
            {startRecord}–{endRecord} de {filtered.length} resultados
          </p>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={safePage === 1}
              className="h-7 w-7"
            >
              <ChevronLeft className="h-3.5 w-3.5" />
            </Button>
            <span className="px-2 text-xs font-medium text-xk-text-secondary tabular-nums">
              {safePage} / {totalPages}
            </span>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={safePage === totalPages}
              className="h-7 w-7"
            >
              <ChevronRight className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
