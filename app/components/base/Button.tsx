import { Link } from "@tanstack/react-router"
import type { AnchorHTMLAttributes, ButtonHTMLAttributes } from "react"

import { cn } from "@/ui/lib/utils"

type ButtonType = "a" | "button"
type ButtonStyle = "primary" | "outline"

export type ButtonProps<Type extends ButtonType> = {
  as?: Type
  buttonStyle?: ButtonStyle
  large?: boolean
} & (Type extends "a"
  ? AnchorHTMLAttributes<HTMLAnchorElement>
  : ButtonHTMLAttributes<HTMLButtonElement>)

export const Button = <Type extends ButtonType = "button">(
  props: ButtonProps<Type>,
) => {
  const {
    as,
    buttonStyle = "primary",
    large,
    className,
    ...buttonProps
  } = props
  const buttonClass = cn(
    "flex font-semibold cursor-pointer items-center justify-center rounded-lg",
    "scale-100 hover:scale-[1.025] transition-transform",
    {
      "shadow-md bg-accent hover:bg-textVar1 hover:text-bgVar2":
        buttonStyle === "primary",
      "border border-bg bg-bgVar2 hover:border-textVar1":
        buttonStyle === "outline",
    },
    {
      "py-1 px-4 text-base": large,
      "py-1 px-3 text-sm": !large,
    },
    className,
  )
  if (as === "a") {
    const { href, ...rest } = buttonProps
    return <Link href={href} className={buttonClass} {...rest} />
  }
  // @ts-expect-error spread type isnt narrowed correctly
  return <button type="button" className={buttonClass} {...buttonProps} />
}
