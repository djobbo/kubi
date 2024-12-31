import { css, keyframes } from "@emotion/css"

import { cn } from "@/ui/lib/utils"

const puffAnimations = [
  keyframes`
    0% {
      transform: scale(0);
    }
    100% {
      transform: scale(1);
    }
  `,
  keyframes`
    0% {
      opacity: 1;
    }
    100% {
      opacity: 0;
    }
  `,
] as const

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
    width: ${size};
    height: ${size};
  `

  const puffClass = css`
    position: absolute;
    width: ${size};
    height: ${size};
    border: thick solid ${color};
    border-radius: 50%;
    opacity: 1;
    top: 0;
    left: 0;
    animation-fill-mode: both;
    animation: ${puffAnimations[0]}, ${puffAnimations[1]};
    animation-duration: ${2 / speedMultiplier}s;
    animation-iteration-count: infinite;
    animation-timing-function: cubic-bezier(0.165, 0.84, 0.44, 1),
      cubic-bezier(0.3, 0.61, 0.355, 1);
  `

  return (
    <div
      className={cn(containerClassName, { relative: !className }, className)}
    >
      <span className={puffClass} />
      <span
        className={cn(
          puffClass,
          css`
            animation-delay: -1s;
          `,
        )}
      />
    </div>
  )
}
