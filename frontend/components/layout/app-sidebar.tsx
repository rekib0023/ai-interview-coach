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
  Command,
  Dumbbell,
  LayoutDashboard,
  Settings2,
  Target,
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
      title: "Interviews",
      url: "/practice",
      icon: Target,
    },
    {
      title: "Drills",
      url: "/drills",
      icon: Dumbbell,
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
    <Sidebar variant="inset" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <a href="/dashboard">
                <div className="bg-gradient-to-br from-primary to-blue-600 text-white flex aspect-square size-8 items-center justify-center rounded-lg shadow-md shadow-primary/20">
                  <Command className="size-4" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">
                    AI Interview Coach
                  </span>
                  <span className="truncate text-xs text-muted-foreground">
                    Pro Plan
                  </span>
                </div>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
      </SidebarContent>
      <SidebarFooter>
        <UpgradeCard />
      </SidebarFooter>
    </Sidebar>
  );
}
