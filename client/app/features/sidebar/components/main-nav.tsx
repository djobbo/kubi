import { Link, useRouterState } from '@tanstack/react-router';
import { DotIcon } from 'lucide-react';

import { navConfig } from '@/config/nav';
import {
  SidebarGroup,
  SidebarMenu,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '@/ui/components/sidebar';
import { cn } from '@/ui/lib/utils';

export const MainNav = () => {
  const router = useRouterState();
  const sidebar = useSidebar();

  return (
    <SidebarGroup>
      <SidebarMenu>
        {navConfig().sidebar.map((item) => {
          const isActive = item.isActive?.(router.location.pathname) ?? false;

          return (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton tooltip={item.title} asChild>
                <Link
                  to={item.to}
                  target={item.target}
                  className={cn({
                    border: isActive && sidebar.state === 'collapsed',
                  })}
                >
                  {item.Icon && <item.Icon />}
                  <span className="truncate">{item.title}</span>
                </Link>
              </SidebarMenuButton>
              {isActive && (
                <SidebarMenuBadge>
                  <DotIcon />
                </SidebarMenuBadge>
              )}
            </SidebarMenuItem>
          );

          // TODO: Implement when we have a use case for it
          // return (
          //   <Collapsible
          //     key={item.title}
          //     asChild
          //     defaultOpen={isActive}
          //     className="group/collapsible"
          //   >
          //     <SidebarMenuItem>
          //       <CollapsibleTrigger asChild>
          //         <SidebarMenuButton tooltip={item.title}>
          //           {item.Icon && <item.Icon />}
          //           <span className="truncate">{item.title}</span>
          //           <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
          //         </SidebarMenuButton>
          //       </CollapsibleTrigger>
          //       <CollapsibleContent>
          //         <SidebarMenuSub>
          //           {item.items?.map((subItem) => (
          //             <SidebarMenuSubItem key={subItem.title}>
          //               <SidebarMenuSubButton asChild>
          //                 <Link to={subItem.to} params={subItem.toParams}>
          //                   <span>{subItem.title}</span>
          //                 </Link>
          //               </SidebarMenuSubButton>
          //             </SidebarMenuSubItem>
          //           ))}
          //         </SidebarMenuSub>
          //       </CollapsibleContent>
          //     </SidebarMenuItem>
          //   </Collapsible>
          // )
        })}
      </SidebarMenu>
    </SidebarGroup>
  );
};
