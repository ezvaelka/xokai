import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const badgeVariants = cva(
  'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors',
  {
    variants: {
      variant: {
        default:     'bg-xk-accent text-white',
        secondary:   'bg-xk-subtle text-xk-text-secondary',
        success:     'bg-xk-accent-light text-xk-accent-dark',
        warning:     'bg-amber-100 text-amber-700',
        destructive: 'bg-red-100 text-xk-danger',
        outline:     'border border-xk-border text-xk-text-secondary',
      },
    },
    defaultVariants: { variant: 'default' },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />
}

export { Badge, badgeVariants }
