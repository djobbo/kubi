import type { ImgHTMLAttributes } from "react"

import { cn } from "@/ui/lib/utils"

type ImageProps = ImgHTMLAttributes<HTMLImageElement> & {
  containerClassName?: string
  Container?: "div" | "span"
  position?: "absolute" | "relative" | "fixed" | string
}

export const Image = ({
  containerClassName,
  Container = "div",
  position = "relative",
  ...props
}: ImageProps) => {
  return (
    <Container className={cn(position, containerClassName)}>
      <img {...props} />
    </Container>
  )
}
