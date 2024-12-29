import { css } from "@emotion/css"

import { cn } from "@/ui/lib/utils"
import { keyframes, styled } from "@/ui/theme"

const puff = [
  keyframes({
    "0%": { transform: "scale(0)" },
    "100%": { transform: "scale(1.0)" },
  }),
  keyframes({
    "0%": { opacity: 1 },
    "100%": { opacity: 0 },
  }),
]

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
  const containerClassName = css`
    height: ${size};
    width: ${size};
  `

  const Puff = styled("span", {
    position: "absolute",
    height: size,
    width: size,
    // eslint-disable-next-line lingui/no-unlocalized-strings
    border: `thick solid ${color}`,
    borderRadius: `50%`,
    opacity: 1,
    top: 0,
    left: 0,
    animationFillMode: "both",
    animation: `${puff[0]}, ${puff[1]}`,
    animationDuration: `${2 / speedMultiplier}s`,
    animationIterationCount: "infinite",
    animationTimingFunction:
      // eslint-disable-next-line lingui/no-unlocalized-strings
      "cubic-bezier(0.165, 0.84, 0.44, 1), cubic-bezier(0.3, 0.61, 0.355, 1)",
    variants: {
      first: {
        true: {
          animationDelay: "0s",
        },
        false: {
          animationDelay: "-1s",
        },
      },
    },
    defaultVariants: {
      first: false,
    },
  })

  return (
    <div
      className={cn(containerClassName, { relative: !className }, className)}
    >
      <Puff first />
      <Puff />
    </div>
  )
}
