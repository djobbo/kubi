import { cn, type VariantProps, cva } from '@dair/common/src/helpers/ui'
import type { ComponentProps } from 'react'

const progressVariants = cva('relative w-full h-2 bg-bg-light rounded-full', {
  variants: {
    intent: {
      info: '[--bar-color:var(--primary-light)]',
      success: '[--bar-color:var(--success)]',
      danger: '[--bar-color:var(--danger)]',
      warning: '[--bar-color:var(--warning)]',
    },
    size: {
      sm: 'h-1',
      md: 'h-2',
      lg: 'h-3',
      xl: 'h-4',
    },
  },
  defaultVariants: {
    intent: 'info',
    size: 'md',
  },
})

type ProgressProps = ComponentProps<'div'> &
  VariantProps<typeof progressVariants> & {
    value: number
    max: number
  }

export const Progress = ({
  value,
  max,
  intent,
  size,
  className,
  ...props
}: ProgressProps) => {
  return (
    <div
      className={cn(progressVariants({ intent, size }), className)}
      {...props}
    >
      <span
        className="absolute top-0 left-0 h-full rounded-full bg-(--bar-color)"
        style={{ width: `${(value / max) * 100}%` }}
      />
    </div>
  )
}
