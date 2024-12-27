import { Indicator as ProgressIndicator, Root } from "@radix-ui/react-progress"

interface ProgressProps {
  value: number
  className?: string
  indicatorClassName?: string
}

export const Progress = ({
  value,
  className,
  indicatorClassName,
}: ProgressProps) => {
  return (
    <Root value={value} className={className}>
      <ProgressIndicator
        style={{ width: `${value}%` }}
        className={indicatorClassName}
      />
    </Root>
  )
}
