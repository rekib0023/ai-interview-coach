"use client";

import { ChevronRight, type LucideIcon } from "lucide-react";
import { usePathname } from "next/navigation";

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  SidebarGroup,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";

export function NavMain({
  items,
}: {
  items: {
    title: string;
    url: string;
    icon: LucideIcon;
    isActive?: boolean;
    items?: {
      title: string;
      url: string;
    }[];
  }[];
}) {
  const pathname = usePathname();

  return (
    <SidebarGroup>
      <SidebarMenu className="space-y-1">
        {items.map((item) => {
          // Check if the current path matches the item URL or is a sub-path
          // Special handling for dashboard to avoid matching everything if dashboard url is "/"
          const isCurrentItemActive =
            item.url === "/"
              ? pathname === "/"
              : pathname === item.url || pathname?.startsWith(item.url + "/");

          return (
            <Collapsible
              key={item.title}
              asChild
              defaultOpen={item.isActive || isCurrentItemActive}
            >
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  tooltip={item.title}
                  className={cn(
                    "group/nav transition-all duration-200",
                    "hover:bg-white/5 hover:text-foreground",
                    isCurrentItemActive &&
                      "bg-primary/10 text-primary border-l-2 border-primary"
                  )}
                >
                  <a href={item.url}>
                    <item.icon
                      className={cn(
                        "transition-colors",
                        isCurrentItemActive
                          ? "text-primary"
                          : "text-muted-foreground group-hover/nav:text-foreground"
                      )}
                    />
                    <span
                      className={cn(
                        "transition-colors font-medium",
                        isCurrentItemActive
                          ? "text-primary"
                          : "group-hover/nav:text-foreground"
                      )}
                    >
                      {item.title}
                    </span>
                  </a>
                </SidebarMenuButton>
                {item.items?.length ? (
                  <>
                    <CollapsibleTrigger asChild>
                      <SidebarMenuAction className="data-[state=open]:rotate-90 hover:bg-white/5">
                        <ChevronRight />
                        <span className="sr-only">Toggle</span>
                      </SidebarMenuAction>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <SidebarMenuSub>
                        {item.items?.map((subItem) => {
                          const isSubItemActive =
                            pathname === subItem.url ||
                            pathname?.startsWith(subItem.url + "/");
                          return (
                            <SidebarMenuSubItem key={subItem.title}>
                              <SidebarMenuSubButton
                                asChild
                                className={cn(
                                  "hover:bg-white/5",
                                  isSubItemActive &&
                                    "bg-white/5 text-primary font-medium"
                                )}
                              >
                                <a href={subItem.url}>
                                  <span>{subItem.title}</span>
                                </a>
                              </SidebarMenuSubButton>
                            </SidebarMenuSubItem>
                          );
                        })}
                      </SidebarMenuSub>
                    </CollapsibleContent>
                  </>
                ) : null}
              </SidebarMenuItem>
            </Collapsible>
          );
        })}
      </SidebarMenu>
    </SidebarGroup>
  );
}
