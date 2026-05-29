import { Dialog } from "@base-ui-components/react/dialog"
import { cn, cva, type VariantProps } from "@dair/common/src/helpers/ui"
import { Link, type LinkProps } from "@tanstack/react-router"
import { PanelLeftIcon } from "lucide-react"
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ComponentProps,
  type CSSProperties,
  type ReactNode,
} from "react"
import { useIsMobile } from "@/shared/hooks/use-is-mobile"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/shared/components/tooltip"

const SIDEBAR_COOKIE_NAME = "sidebar_state"
const SIDEBAR_COOKIE_MAX_AGE = 60 * 60 * 24 * 7
const SIDEBAR_KEYBOARD_SHORTCUT = "b"

type SidebarContextValue = {
  state: "expanded" | "collapsed"
  open: boolean
  setOpen: (open: boolean) => void
  openMobile: boolean
  setOpenMobile: (open: boolean) => void
  isMobile: boolean
  toggleSidebar: () => void
}

const SidebarContext = createContext<SidebarContextValue | null>(null)

function useSidebar() {
  const context = useContext(SidebarContext)
  if (!context) {
    throw new Error("useSidebar must be used within a SidebarProvider.")
  }
  return context
}

export function SidebarProvider({
  defaultOpen = true,
  open: openProp,
  onOpenChange: setOpenProp,
  className,
  style,
  children,
  ...props
}: ComponentProps<"div"> & {
  defaultOpen?: boolean
  open?: boolean
  onOpenChange?: (open: boolean) => void
}) {
  const isMobile = useIsMobile()
  const [openMobile, setOpenMobile] = useState(false)
  const [_open, _setOpen] = useState(defaultOpen)
  const open = openProp ?? _open

  const setOpen = useCallback(
    (value: boolean | ((value: boolean) => boolean)) => {
      const openState = typeof value === "function" ? value(open) : value
      if (setOpenProp) {
        setOpenProp(openState)
      } else {
        _setOpen(openState)
      }
      document.cookie = `${SIDEBAR_COOKIE_NAME}=${openState}; path=/; max-age=${SIDEBAR_COOKIE_MAX_AGE}`
    },
    [setOpenProp, open],
  )

  const toggleSidebar = useCallback(() => {
    return isMobile
      ? setOpenMobile((current) => !current)
      : setOpen((current) => !current)
  }, [isMobile, setOpen])

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (
        event.key === SIDEBAR_KEYBOARD_SHORTCUT &&
        (event.metaKey || event.ctrlKey)
      ) {
        event.preventDefault()
        toggleSidebar()
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [toggleSidebar])

  const state = open ? "expanded" : "collapsed"

  const contextValue = useMemo<SidebarContextValue>(
    () => ({
      state,
      open,
      setOpen,
      isMobile,
      openMobile,
      setOpenMobile,
      toggleSidebar,
    }),
    [state, open, setOpen, isMobile, openMobile, toggleSidebar],
  )

  return (
    <SidebarContext.Provider value={contextValue}>
      <TooltipProvider>
        <div
          data-slot="sidebar-wrapper"
          style={
            {
              "--sidebar-width": "var(--sidebar-expanded-width)",
              "--sidebar-width-icon": "var(--sidebar-minimized-width)",
              ...style,
            } as CSSProperties
          }
          className={cn(
            "group/sidebar-wrapper relative flex min-h-svh w-full",
            className,
          )}
          {...props}
        >
          {children}
        </div>
      </TooltipProvider>
    </SidebarContext.Provider>
  )
}

export function Sidebar({
  side = "left",
  variant = "sidebar",
  collapsible = "offcanvas",
  className,
  children,
  ...props
}: ComponentProps<"div"> & {
  side?: "left" | "right"
  variant?: "sidebar" | "floating" | "inset"
  collapsible?: "offcanvas" | "icon" | "none"
}) {
  const { isMobile, state, openMobile, setOpenMobile } = useSidebar()

  if (collapsible === "none") {
    return (
      <div
        data-slot="sidebar"
        className={cn(
          "flex h-full w-(--sidebar-width) flex-col bg-bg text-text",
          className,
        )}
        {...props}
      >
        {children}
      </div>
    )
  }

  if (isMobile) {
    return (
      <Dialog.Root open={openMobile} onOpenChange={setOpenMobile}>
        <Dialog.Portal>
          <Dialog.Backdrop className="fixed inset-0 z-40 bg-bg-root/80 transition-opacity duration-150 data-ending-style:opacity-0 data-starting-style:opacity-0" />
          <Dialog.Popup
            data-slot="sidebar"
            data-mobile="true"
            className={cn(
              "fixed inset-y-0 z-50 flex w-(--sidebar-width) flex-col bg-bg text-text shadow-lg outline-none",
              "transition-transform duration-200 ease-linear data-ending-style:opacity-0 data-starting-style:opacity-0",
              side === "left"
                ? "left-0 data-ending-style:-translate-x-full data-starting-style:-translate-x-full"
                : "right-0 data-ending-style:translate-x-full data-starting-style:translate-x-full",
              className,
            )}
          >
            <div className="relative flex h-full w-full flex-col overflow-hidden">
              {children}
            </div>
          </Dialog.Popup>
        </Dialog.Portal>
      </Dialog.Root>
    )
  }

  const isFloating = variant === "floating" || variant === "inset"

  return (
    <div
      className="group peer hidden text-text md:block"
      data-state={state}
      data-collapsible={state === "collapsed" ? collapsible : ""}
      data-variant={variant}
      data-side={side}
      data-slot="sidebar"
    >
      <div
        data-slot="sidebar-gap"
        className={cn(
          "relative w-(--sidebar-width) bg-transparent transition-[width] duration-200 ease-linear",
          "group-data-[collapsible=offcanvas]:w-0",
          isFloating
            ? "group-data-[collapsible=icon]:w-[calc(var(--sidebar-width-icon)+1rem)]"
            : "group-data-[collapsible=icon]:w-(--sidebar-width-icon)",
        )}
      />
      <div
        data-slot="sidebar-container"
        data-side={side}
        className={cn(
          "fixed inset-y-0 z-10 hidden h-svh w-(--sidebar-width) transition-[left,right,width] duration-200 ease-linear md:flex",
          side === "left"
            ? "left-0 group-data-[collapsible=offcanvas]:-left-(--sidebar-width)"
            : "right-0 group-data-[collapsible=offcanvas]:-right-(--sidebar-width)",
          isFloating
            ? "p-2 group-data-[collapsible=icon]:w-[calc(var(--sidebar-width-icon)+1rem+2px)]"
            : "group-data-[collapsible=icon]:w-(--sidebar-width-icon)",
          !isFloating &&
            (side === "left"
              ? "border-r border-border"
              : "border-l border-border"),
          className,
        )}
        {...props}
      >
        <div
          data-sidebar="sidebar"
          data-slot="sidebar-inner"
          className={cn(
            "relative flex size-full flex-col overflow-hidden",
            isFloating &&
              "corner-smooth-xl bg-bg shadow-lg outline-1 outline-border",
            !isFloating && "bg-bg",
          )}
        >
          {children}
        </div>
      </div>
    </div>
  )
}

export function SidebarRail({ className, ...props }: ComponentProps<"button">) {
  const { toggleSidebar } = useSidebar()

  return (
    <button
      type="button"
      data-slot="sidebar-rail"
      aria-label="Toggle sidebar"
      tabIndex={-1}
      title="Toggle sidebar"
      onClick={toggleSidebar}
      className={cn(
        "absolute inset-y-0 z-20 hidden w-4 -translate-x-1/2 transition-all ease-linear sm:flex",
        "group-data-[side=left]:-right-4 group-data-[side=right]:left-0",
        "[[data-side=left][data-state=collapsed]_&]:cursor-e-resize",
        "[[data-side=right][data-state=collapsed]_&]:cursor-w-resize",
        "hover:after:bg-border after:absolute after:inset-y-0 after:left-1/2 after:w-px",
        className,
      )}
      {...props}
    />
  )
}

export function SidebarTrigger({
  className,
  onClick,
  ...props
}: ComponentProps<"button">) {
  const { toggleSidebar } = useSidebar()

  return (
    <button
      type="button"
      data-slot="sidebar-trigger"
      className={cn(
        "flex size-8 shrink-0 items-center justify-center corner-smooth-md text-text-muted",
        "hover:bg-bg-light hover:text-text",
        className,
      )}
      onClick={(event) => {
        onClick?.(event)
        toggleSidebar()
      }}
      {...props}
    >
      <PanelLeftIcon className="size-4" />
      <span className="sr-only">Toggle sidebar</span>
    </button>
  )
}

export function SidebarInset({ className, ...props }: ComponentProps<"main">) {
  return (
    <main
      data-slot="sidebar-inset"
      className={cn(
        "relative flex min-h-svh w-full flex-1 flex-col bg-bg-root",
        className,
      )}
      {...props}
    />
  )
}

export function SidebarHeader({ className, ...props }: ComponentProps<"div">) {
  return (
    <div
      data-slot="sidebar-header"
      className={cn("flex flex-col gap-2 p-2", className)}
      {...props}
    />
  )
}

function SidebarFooter({ className, ...props }: ComponentProps<"div">) {
  return (
    <div
      data-slot="sidebar-footer"
      className={cn("flex flex-col gap-2 p-2", className)}
      {...props}
    />
  )
}

export function SidebarContent({ className, ...props }: ComponentProps<"div">) {
  return (
    <div
      data-slot="sidebar-content"
      className={cn(
        "flex min-h-0 flex-1 flex-col gap-2 overflow-auto p-2",
        "group-data-[collapsible=icon]:overflow-hidden",
        className,
      )}
      {...props}
    />
  )
}

export function SidebarGroup({ className, ...props }: ComponentProps<"div">) {
  return (
    <div
      data-slot="sidebar-group"
      className={cn("relative flex w-full min-w-0 flex-col p-2", className)}
      {...props}
    />
  )
}

export function SidebarMenu({ className, ...props }: ComponentProps<"ul">) {
  return (
    <ul
      data-slot="sidebar-menu"
      className={cn("flex w-full min-w-0 flex-col gap-1", className)}
      {...props}
    />
  )
}

export function SidebarMenuItem({ className, ...props }: ComponentProps<"li">) {
  return (
    <li
      data-slot="sidebar-menu-item"
      className={cn("group/menu-item relative", className)}
      {...props}
    />
  )
}

export const sidebarMenuButtonVariants = cva(
  cn(
    "flex w-full items-center gap-2 overflow-hidden corner-smooth-md p-2 text-left text-sm text-text-muted",
    "outline-none transition-colors hover:bg-bg-light hover:text-text",
    "focus-visible:ring-2 focus-visible:ring-primary/40",
    "[&>svg]:size-4 [&>svg]:shrink-0 [&>span]:truncate",
    "group-data-[collapsible=icon]:size-8! group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:p-2!",
    "group-data-[collapsible=icon]:[&>span]:hidden",
  ),
  {
    variants: {
      isActive: {
        true: "bg-bg-light font-medium text-text",
        false: "",
      },
    },
    defaultVariants: {
      isActive: false,
    },
  },
)

function SidebarMenuButton({
  className,
  isActive,
  ...props
}: ComponentProps<"button"> & VariantProps<typeof sidebarMenuButtonVariants>) {
  return (
    <button
      type="button"
      data-slot="sidebar-menu-button"
      className={cn(sidebarMenuButtonVariants({ isActive }), className)}
      {...props}
    />
  )
}

export function SidebarNavLink({
  tooltip,
  className,
  children,
  activeProps,
  ...props
}: LinkProps & {
  tooltip: string
  children: ReactNode
}) {
  const { state, isMobile } = useSidebar()

  const link = (
    <Link
      data-slot="sidebar-menu-button"
      className={cn(sidebarMenuButtonVariants(), className)}
      activeProps={
        activeProps ?? {
          className: sidebarMenuButtonVariants({ isActive: true }),
        }
      }
      {...props}
    >
      {children}
    </Link>
  )

  if (!isMobile && state === "collapsed") {
    return (
      <Tooltip>
        <TooltipTrigger render={link} />
        <TooltipContent>{tooltip}</TooltipContent>
      </Tooltip>
    )
  }

  return link
}
