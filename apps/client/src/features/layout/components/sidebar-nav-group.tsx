import {
  isNavGroupActive,
  type AppNavGroup,
} from "@/features/layout/nav-links"
import {
  SidebarMenuItem,
  SidebarNavLink,
  sidebarMenuButtonVariants,
} from "@/shared/components/sidebar"
import { cn } from "@dair/common/src/helpers/ui"
import { Collapsible } from "@base-ui-components/react/collapsible"
import { useMatchRoute } from "@tanstack/react-router"
import { ChevronRightIcon } from "lucide-react"

const collapsiblePanelClassName = cn(
  "h-(--collapsible-panel-height) overflow-hidden",
  "transition-[height] duration-150 ease-out",
  "data-ending-style:h-0 data-starting-style:h-0",
)

export function SidebarNavGroup({ group }: { group: AppNavGroup }) {
  const matchRoute = useMatchRoute()
  const isActive = isNavGroupActive(matchRoute, group)
  const GroupIcon = group.icon

  return (
    <SidebarMenuItem>
      <div className="group-data-[collapsible=icon]:hidden">
        <Collapsible.Root defaultOpen={isActive} className="group/collapsible">
          <Collapsible.Trigger
            className={cn(
              sidebarMenuButtonVariants({ isActive }),
              "group/trigger w-full",
            )}
          >
            <GroupIcon />
            <span>{group.label}</span>
            <ChevronRightIcon className="ml-auto size-4 shrink-0 transition-transform duration-150 group-data-panel-open/trigger:rotate-90" />
          </Collapsible.Trigger>
          <Collapsible.Panel className={collapsiblePanelClassName}>
            <ul className="mx-2 flex flex-col gap-1 border-l border-border py-0.5 pl-2">
              {group.items.map((item) => {
                const ItemIcon = item.icon
                return (
                  <li key={item.tooltip}>
                    <SidebarNavLink
                      to={item.to}
                      params={item.params}
                      activeOptions={item.activeOptions}
                      tooltip={item.tooltip}
                      className="h-7 py-1"
                    >
                      <ItemIcon />
                      <span>{item.label}</span>
                    </SidebarNavLink>
                  </li>
                )
              })}
            </ul>
          </Collapsible.Panel>
        </Collapsible.Root>
      </div>

      <div className="hidden flex-col gap-1 group-data-[collapsible=icon]:flex">
        {group.items.map((item) => {
          const ItemIcon = item.icon
          return (
            <SidebarNavLink
              key={item.tooltip}
              to={item.to}
              params={item.params}
              activeOptions={item.activeOptions}
              tooltip={item.tooltip}
            >
              <ItemIcon />
              <span>{item.label}</span>
            </SidebarNavLink>
          )
        })}
      </div>
    </SidebarMenuItem>
  )
}
