import { cookies } from "next/headers";

import { AppSidebar } from "@/components/layout/app-sidebar";
import { HeaderActions } from "@/components/layout/header-actions";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Search } from "lucide-react";

export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const defaultOpen = cookieStore.get("sidebar_state")?.value === "true";

  return (
    <SidebarProvider defaultOpen={defaultOpen}>
      <AppSidebar />
      <SidebarInset>
        {/* Header */}
        <header className="sticky top-0 z-20 flex h-16 shrink-0 items-center border-b border-white/10 bg-background/80 backdrop-blur-xl">
          <div className="flex w-full items-center gap-2 px-4">
            {/* Left Section - Sidebar Toggle + Search */}
            <div className="flex flex-1 items-center gap-2">
              <SidebarTrigger className="-ml-1 hover:bg-white/5" />
              <Separator
                orientation="vertical"
                className="mr-2 h-6 bg-white/10"
              />

              {/* Search Bar */}
              <div className="relative w-full max-w-md">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search interviews, questions, topics..."
                  className="h-9 w-full pl-9 pr-4 bg-white/5 border-white/10 focus-visible:ring-1 focus-visible:ring-primary/50 focus-visible:border-primary/50 placeholder:text-muted-foreground/70"
                />
              </div>
            </div>

            {/* Right Section - Actions + User (Client Component) */}
            <HeaderActions />
          </div>
        </header>

        {/* Main Content */}
        <main className="relative flex flex-1 flex-col gap-4 p-4 pt-6 lg:gap-6 lg:p-6">
          {/* Background decorations */}
          <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
            <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-primary/5 blur-[120px] rounded-full" />
            <div className="absolute bottom-0 left-1/4 w-[400px] h-[400px] bg-accent/5 blur-[120px] rounded-full" />
            <div className="absolute inset-0 bg-grid opacity-20" />
          </div>

          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
