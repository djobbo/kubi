import { cn, type VariantProps, cva } from "@dair/common/src/helpers/ui"
import { Link, type LinkProps } from "@tanstack/react-router"
import type { ComponentProps } from "react"

const buttonVariants = cva(
  cn(
    "relative group/button cursor-pointer flex items-center justify-center corner-smooth-lg text-text",
    "hover:bg-linear-to-b hover:from-(--button-color-light) hover:to-(--button-color-dark)",
    "active:from-(--button-color-dark) active:to-(--button-color) active:border-(--button-color-dark) active:border-b-(--button-color-dark)",
    "after:content-[''] after:absolute after:inset-0 after:border after:border-(--button-color-light)/25 after:opacity-0 hover:after:opacity-100 hover:after:-inset-1.5 after:transition-all after:corner-smooth-xl",
    "transition-all",
  ),
  {
    variants: {
      intent: {
        primary:
          "[--button-color:var(--primary)] [--button-color-dark:var(--primary-dark)] [--button-color-light:var(--primary-light)]",
        secondary:
          "[--button-color:var(--secondary)] [--button-color-dark:var(--secondary-dark)] [--button-color-light:var(--secondary-light)]",
      },
      empty: {
        true: "",
        false:
          "shadow-sm bg-linear-to-b from-(--button-color) to-(--button-color-dark) border border-(--button-color) border-t-(--button-color-light)",
      },
      icon: {
        true: "aspect-square",
        false: "px-4",
      },
      size: {
        sm: "h-6",
        md: "h-8",
        lg: "h-10",
        xl: "h-12",
      },
    },
    defaultVariants: {
      intent: "primary",
      empty: false,
      icon: false,
      size: "md",
    },
  },
)

type ButtonProps = ComponentProps<"button"> &
  VariantProps<typeof buttonVariants>

export const Button = ({
  children,
  className,
  intent,
  empty,
  icon,
  size,
  ...props
}: ButtonProps) => {
  return (
    <button
      className={cn(buttonVariants({ intent, empty, icon, size }), className)}
      {...props}
    >
      {children}
    </button>
  )
}

type LinkButtonProps = LinkProps &
  ComponentProps<"a"> &
  VariantProps<typeof buttonVariants>

export const LinkButton = ({
  children,
  className,
  intent,
  empty,
  icon,
  size,
  ...props
}: LinkButtonProps) => {
  return (
    <Link
      className={cn(buttonVariants({ intent, empty, icon, size }), className)}
      {...props}
    >
      {children}
    </Link>
  )
}
