import { Trans } from "@lingui/react/macro"
import { Link } from "@tanstack/react-router"
import {
  BookmarkIcon,
  ChevronsUpDown,
  HistoryIcon,
  LogOutIcon,
} from "lucide-react"

import { useAuth } from "@/features/auth/use-auth"
import { Avatar, AvatarFallback, AvatarImage } from "@/ui/components/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/ui/components/dropdown-menu"
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/ui/components/sidebar"

export const NavUser = () => {
  const { isMobile } = useSidebar()
  const { session, logOut } = useAuth()

  if (!session) {
    return null
  }

  const { user } = session

  const userInitials =
    user.name
      ?.split(" ")
      .map((name) => name[0])
      .slice(0, 3)
      .join("") ?? "??"

  const censoredEmail = user.email?.replace(
    /(.{2})(.*)(?=@)/,
    (_, p1, p2) => p1 + "*".repeat(p2.length),
  )

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent-foreground data-[state=open]:text-sidebar-accent-foreground"
            >
              <Avatar className="h-8 w-8 rounded-lg">
                <AvatarImage src={user.avatarUrl ?? ""} alt={user.name ?? ""} />
                <AvatarFallback className="rounded-lg">
                  {userInitials}
                </AvatarFallback>
              </Avatar>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-semibold">{user.name}</span>
              </div>
              <ChevronsUpDown className="ml-auto size-4" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
            side={isMobile ? "bottom" : "right"}
            align="end"
            sideOffset={4}
          >
            <DropdownMenuLabel className="p-0 font-normal">
              <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                <Avatar className="h-8 w-8 rounded-lg">
                  <AvatarImage
                    src={user.avatarUrl ?? ""}
                    alt={user.name ?? ""}
                  />
                  <AvatarFallback className="rounded-lg">
                    {userInitials}
                  </AvatarFallback>
                </Avatar>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">{user.name}</span>
                  {censoredEmail && (
                    <span className="truncate text-xs">{censoredEmail}</span>
                  )}
                </div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem asChild>
                <Link to="/@me/bookmarks">
                  <BookmarkIcon />
                  <Trans>Bookmarks</Trans>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <HistoryIcon />
                <Trans>History</Trans>
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <a type="button" onClick={logOut}>
                <LogOutIcon />
                <Trans>Sign out</Trans>
              </a>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
