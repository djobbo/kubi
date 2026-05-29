import { NavigationMenu as NavigationMenuPrimitive } from "@base-ui-components/react/navigation-menu"
import { cn } from "@dair/common/src/helpers/ui"

export function NavigationMenu({
  className,
  ...props
}: NavigationMenuPrimitive.Root.Props) {
  return (
    <NavigationMenuPrimitive.Root
      className={cn("relative flex max-w-max flex-1 items-center", className)}
      {...props}
    />
  )
}

export function NavigationMenuList({
  className,
  ...props
}: NavigationMenuPrimitive.List.Props) {
  return (
    <NavigationMenuPrimitive.List
      className={cn("flex flex-1 list-none items-center gap-1 p-0", className)}
      {...props}
    />
  )
}

export function NavigationMenuItem(props: NavigationMenuPrimitive.Item.Props) {
  return <NavigationMenuPrimitive.Item {...props} />
}

const navMenuTriggerClassName = cn(
  "inline-flex h-8 items-center gap-1.5 corner-smooth-md px-3 text-sm text-text-muted outline-none transition-colors",
  "hover:bg-bg-light hover:text-text",
  "focus-visible:ring-2 focus-visible:ring-primary/40",
  "data-popup-open:bg-bg-light data-popup-open:text-text",
  "data-active:bg-bg-light data-active:font-medium data-active:text-text",
)

export function NavigationMenuTrigger({
  className,
  ...props
}: NavigationMenuPrimitive.Trigger.Props) {
  return (
    <NavigationMenuPrimitive.Trigger
      className={cn(navMenuTriggerClassName, className)}
      {...props}
    />
  )
}

export function NavigationMenuIcon({
  className,
  ...props
}: NavigationMenuPrimitive.Icon.Props) {
  return (
    <NavigationMenuPrimitive.Icon
      className={cn(
        "size-4 transition-transform duration-200 data-popup-open:rotate-180",
        className,
      )}
      {...props}
    />
  )
}

export function NavigationMenuContent({
  className,
  ...props
}: NavigationMenuPrimitive.Content.Props) {
  return (
    <NavigationMenuPrimitive.Content
      className={cn(
        "w-max p-2 transition-[opacity,transform] duration-200 ease-out",
        "data-starting-style:opacity-0 data-ending-style:opacity-0",
        className,
      )}
      {...props}
    />
  )
}

export function NavigationMenuLink({
  className,
  ...props
}: NavigationMenuPrimitive.Link.Props) {
  return (
    <NavigationMenuPrimitive.Link
      className={cn(
        "flex w-full items-center gap-2 corner-smooth-md px-3 py-2 text-sm text-text-muted no-underline outline-none transition-colors",
        "hover:bg-bg-light hover:text-text",
        "focus-visible:ring-2 focus-visible:ring-primary/40",
        "data-active:bg-bg-light data-active:font-medium data-active:text-text",
        className,
      )}
      {...props}
    />
  )
}

export function NavigationMenuPortal(
  props: NavigationMenuPrimitive.Portal.Props,
) {
  return <NavigationMenuPrimitive.Portal {...props} />
}

export function NavigationMenuPositioner({
  className,
  sideOffset = 8,
  ...props
}: NavigationMenuPrimitive.Positioner.Props) {
  return (
    <NavigationMenuPrimitive.Positioner
      sideOffset={sideOffset}
      className={cn(
        "z-50 h-(--positioner-height) w-(--positioner-width) max-w-(--available-width)",
        className,
      )}
      {...props}
    />
  )
}

export function NavigationMenuPopup({
  className,
  ...props
}: NavigationMenuPrimitive.Popup.Props) {
  return (
    <NavigationMenuPrimitive.Popup
      className={cn(
        "relative h-(--popup-height) w-(--popup-width) origin-(--transform-origin) overflow-hidden corner-smooth-lg bg-bg shadow-lg outline-1 outline-border",
        "transition-[opacity,transform,width,height] duration-200 ease-out",
        "data-starting-style:scale-95 data-starting-style:opacity-0",
        "data-ending-style:scale-95 data-ending-style:opacity-0",
        className,
      )}
      {...props}
    />
  )
}

export function NavigationMenuViewport({
  className,
  ...props
}: NavigationMenuPrimitive.Viewport.Props) {
  return (
    <NavigationMenuPrimitive.Viewport
      className={cn("relative size-full overflow-hidden", className)}
      {...props}
    />
  )
}

export function NavigationMenuViewportPortal() {
  return (
    <NavigationMenuPortal>
      <NavigationMenuPositioner>
        <NavigationMenuPopup>
          <NavigationMenuViewport />
        </NavigationMenuPopup>
      </NavigationMenuPositioner>
    </NavigationMenuPortal>
  )
}
