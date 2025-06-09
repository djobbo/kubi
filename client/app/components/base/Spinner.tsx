import { css, cva } from "@/panda/css"
import { cn } from "@/ui/lib/utils"
import {
  PUFF_SPINNER_ANIMATION_1_NAME,
  PUFF_SPINNER_ANIMATION_2_NAME,
} from "~/panda.config"

interface SpinnerProps {
  className?: string
  size?: string
  speedMultiplier?: number
  color?: string
}

export const Spinner = ({
  className,
  size = "2rem",
  speedMultiplier = 1,
  color = "white",
}: SpinnerProps) => {
  const containerClass = css({
    width: size,
    height: size,
  })

  const puffClass = cva({
    base: {
      position: "absolute",
      width: size,
      height: size,
      border: `thick solid ${color}`,
      borderRadius: "50%",
      opacity: 1,
      top: 0,
      left: 0,
      animationFillMode: "both",
      animation: `${PUFF_SPINNER_ANIMATION_1_NAME}, ${PUFF_SPINNER_ANIMATION_2_NAME}`,
      animationDuration: `${2 / speedMultiplier}s`,
      animationIterationCount: "infinite",
      animationTimingFunction:
        "cubic-bezier(0.165, 0.84, 0.44, 1), cubic-bezier(0.3, 0.61, 0.355, 1)",
    },
    variants: {
      part: {
        first: {
          animationDelay: "-1s",
        },
      },
    },
  })

  return (
    <div className={cn(containerClass, { relative: !className }, className)}>
      <span className={puffClass({})} />
      <span className={puffClass({ part: "first" })} />
    </div>
  )
}
