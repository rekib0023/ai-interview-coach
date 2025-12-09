"use client";

import { NavMain } from "@/components/layout/nav-main";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import {
  BookOpen,
  Clock,
  Code2,
  LayoutDashboard,
  Settings2,
  Sparkles,
} from "lucide-react";
import * as React from "react";
import { UpgradeCard } from "./upgrade-card";

const data = {
  user: {
    name: "shadcn",
    email: "m@example.com",
    avatar: "/avatars/shadcn.jpg",
  },
  navMain: [
    {
      title: "Dashboard",
      url: "/dashboard",
      icon: LayoutDashboard,
      isActive: true,
    },
    {
      title: "History",
      url: "/dashboard/history",
      icon: Clock,
    },
    {
      title: "Learning Path",
      url: "/dashboard/learning",
      icon: BookOpen,
    },
    {
      title: "Settings",
      url: "/dashboard/settings",
      icon: Settings2,
    },
  ],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar
      variant="inset"
      className="border-white/10 bg-sidebar/50 backdrop-blur-xl"
      {...props}
    >
      <SidebarHeader className="border-b border-white/5 pb-4">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <a href="/dashboard" className="group">
                <div className="flex aspect-square size-9 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-accent shadow-lg shadow-primary/25 group-hover:shadow-primary/40 transition-all">
                  <Code2 className="size-5 text-white" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent group-hover:from-primary group-hover:to-accent transition-all">
                    AI Interview Coach
                  </span>
                  <span className="truncate text-xs text-muted-foreground flex items-center gap-1">
                    <Sparkles className="h-3 w-3 text-primary" />
                    Pro Plan
                  </span>
                </div>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent className="pt-4">
        <NavMain items={data.navMain} />
      </SidebarContent>
      <SidebarFooter className="border-t border-white/5 pt-4">
        <UpgradeCard />
      </SidebarFooter>
    </Sidebar>
  );
}
