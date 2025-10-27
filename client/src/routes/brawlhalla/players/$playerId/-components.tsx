import { cn } from "@/ui/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";
import type { ReactNode } from "react";

const tabVariants = cva(
  cn(
    "relative text-sm text-text-muted h-12 flex items-center justify-center px-4",
    "hover:bg-linear-to-b hover:from-bg hover:to-primary/25",
    "after:content-[''] after:absolute after:inset-x-0 after:bottom-0 after:h-0.5 after:border-b after:border-primary-light hover:after:h-px hover:after:-bottom-1 after:transition-all",
    "after:pointer-events-none hover:after:opacity-100"
  ),
  {
    variants: {
      active: {
        true: "after:bg-primary-light",
        false: "after:opacity-0",
      },
      defaultVariants: {
        active: false,
      },
    },
  }
);

type TabProps = React.ComponentProps<"a"> & VariantProps<typeof tabVariants>;

export const Tab = ({ children, className, active, ...props }: TabProps) => {
  return (
    <a className={cn(tabVariants({ active }), className)} {...props}>
      {children}
    </a>
  );
};

const cardVariants = cva("rounded-lg p-4", {
  variants: {
    variant: {
      default: "bg-bg shadow-lg",
      inset: "bg-bg-dark border border-border",
    },
  },
  defaultVariants: {
    variant: "default",
  },
});

type CardProps = React.ComponentProps<"div"> &
  VariantProps<typeof cardVariants>;

export const Card = ({ children, className, variant, ...props }: CardProps) => {
  return (
    <div className={cn(cardVariants({ variant }), className)} {...props}>
      {children}
    </div>
  );
};

const buttonVariants = cva(
  cn(
    "relative group/button cursor-pointer flex items-center justify-center rounded-lg text-text",
    "hover:bg-linear-to-b hover:from-(--button-color-light) hover:to-(--button-color-dark)",
    "active:from-(--button-color-dark) active:to-(--button-color) active:border-(--button-color-dark) active:border-b-(--button-color-dark)",
    "after:content-[''] after:absolute after:inset-0 after:border after:border-(--button-color-light)/25 after:opacity-0 hover:after:opacity-100 hover:after:-inset-1.5 after:transition-all after:rounded-xl"
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
        true: "border border-border",
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
  }
);

type ButtonProps = React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants>;

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
  );
};

type StatsGridProps = React.ComponentProps<"div"> & {
  stats: { title: string; value: ReactNode; description?: string }[];
};

export const StatsGrid = ({ stats, className, ...props }: StatsGridProps) => {
  return (
    <div
      {...props}
      className={cn(
        "grid grid-cols-1 gap-4 @sm:grid-cols-2 @md:grid-cols-3 @xl:grid-cols-4 @5xl:grid-cols-6",
        className
      )}
    >
      {stats.map((stat) => (
        <div key={stat.title} className="flex flex-col">
          <span className="text-xs text-text-muted uppercase">
            {stat.title}
          </span>
          <span>{stat.value}</span>
        </div>
      ))}
    </div>
  );
};

const progressBarVariants = cva(
  "relative w-full h-2 bg-bg-light rounded-full",
  {
    variants: {
      intent: {
        info: "[--bar-color:var(--primary-light)]",
        success: "[--bar-color:var(--success)]",
        danger: "[--bar-color:var(--danger)]",
        warning: "[--bar-color:var(--warning)]",
      },
      size: {
        sm: "h-1",
        md: "h-2",
        lg: "h-3",
        xl: "h-4",
      },
    },
    defaultVariants: {
      intent: "info",
      size: "md",
    },
  }
);

type ProgressBarProps = React.ComponentProps<"div"> &
  VariantProps<typeof progressBarVariants> & {
    value: number;
    max: number;
  };

export const ProgressBar = ({
  value,
  max,
  intent,
  size,
  className,
  ...props
}: ProgressBarProps) => {
  return (
    <div
      className={cn(progressBarVariants({ intent, size }), className)}
      {...props}
    >
      <span
        className="absolute top-0 left-0 h-full rounded-full bg-(--bar-color)"
        style={{ width: `${(value / max) * 100}%` }}
      />
    </div>
  );
};
