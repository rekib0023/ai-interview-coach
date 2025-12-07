import { cookies } from "next/headers";

import { AppSidebar } from "@/components/layout/app-sidebar";
import { NavNotification } from "@/components/layout/nav-notification";
import { NavUser } from "@/components/layout/nav-user";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import {
  LineChart,
  Search,
  Settings,
  Share2
} from "lucide-react";

export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const defaultOpen = cookieStore.get("sidebar_state")?.value === "true";

  // TODO: Get user data from session/auth
  const user = {
    name: "Rekib Ahmed",
    email: "rkb.ra0025@gmail.com",
    avatar: "",
    initials: "RA",
    hasUnreadNotifications: true,
  };

  return (
    <SidebarProvider defaultOpen={defaultOpen}>
      <AppSidebar />
      <SidebarInset>
        {/* Header */}
        <header className="sticky top-0 z-20 flex h-16 shrink-0 items-center border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
          <div className="flex w-full items-center gap-2 px-4">
            {/* Left Section - Sidebar Toggle + Search */}
            <div className="flex flex-1 items-center gap-2">
              <SidebarTrigger className="-ml-1" />
              <Separator orientation="vertical" className="mr-2 h-6" />

              {/* Search Bar */}
              <div className="relative w-full max-w-md">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search interviews, questions, topics..."
                  className="h-9 w-full pl-9 pr-4 bg-muted/50 border-0 focus-visible:ring-1 focus-visible:ring-ring"
                />
              </div>
            </div>

            {/* Right Section - Actions + User */}
            <div className="flex items-center gap-1">
              {/* Share Button */}
              <Button
                variant="ghost"
                size="icon"
                className="h-9 w-9"
                aria-label="Share"
              >
                <Share2 className="h-4 w-4" />
              </Button>

              {/* Settings Button */}
              <Button
                variant="ghost"
                size="icon"
                className="h-9 w-9"
                aria-label="Settings"
              >
                <Settings className="h-4 w-4" />
              </Button>

              {/* Analytics Button */}
              <Button
                variant="ghost"
                size="icon"
                className="h-9 w-9"
                aria-label="Analytics"
              >
                <LineChart className="h-4 w-4" />
              </Button>

              {/* Notifications Dropdown */}
              <NavNotification user={user} />

              <Separator orientation="vertical" className="mx-2 h-6" />

              {/* User Menu */}
              <NavUser user={user} />
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex flex-1 flex-col gap-4 p-4 pt-6 lg:gap-6 lg:p-6">
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
