import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import {
  BookOpen,
  Clock,
  LayoutDashboard,
  LogOut,
  Settings,
  Trophy,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

// Sidebar navigation items
const sidebarNavItems = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "History", href: "/dashboard/history", icon: Clock },
  { name: "Learning Path", href: "/dashboard/learning", icon: BookOpen },
  { name: "Settings", href: "/dashboard/settings", icon: Settings },
];

interface SidebarProps {
  user: {
    full_name?: string;
    email?: string;
  } | null;
  onLogout: () => void;
}

export function Sidebar({ user, onLogout }: SidebarProps) {
  const pathname = usePathname();
  const firstName = user?.full_name?.split(" ")[0] || "there";

  return (
    <aside className="hidden lg:flex lg:flex-col lg:w-64 lg:fixed lg:inset-y-0 bg-white border-r border-stone-200">
      {/* User Profile Section */}
      <div className="p-6 border-b border-stone-200">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-semibold">
            {firstName.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-stone-900 truncate">
              {user?.full_name || user?.email || "User"}
            </p>
            <p className="text-xs text-stone-500">Free Plan</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        {sidebarNavItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200",
                isActive
                  ? "bg-blue-600 text-white shadow-md shadow-blue-200"
                  : "text-stone-600 hover:bg-stone-100 hover:text-stone-900"
              )}
            >
              <item.icon
                className={cn(
                  "h-5 w-5",
                  isActive ? "text-white" : "text-stone-500"
                )}
              />
              {item.name}
            </Link>
          );
        })}
      </nav>

      {/* Weekly Goal */}
      <div className="p-6 mt-auto">
        <div className="bg-stone-50 rounded-xl p-5 border border-stone-100">
          <div className="flex items-center gap-2 mb-3">
            <div className="p-1.5 bg-yellow-100 rounded-md">
              <Trophy className="h-4 w-4 text-yellow-600" />
            </div>
            <span className="text-sm font-semibold text-stone-900">
              Weekly Goal
            </span>
          </div>
          <Progress value={75} className="h-2.5 mb-3 bg-stone-200" />
          <div className="flex justify-between items-center text-xs">
            <span className="text-stone-600 font-medium">3/4 Completed</span>
            <span className="text-blue-600 font-semibold">75%</span>
          </div>
        </div>
      </div>

      {/* Logout */}
      <div className="p-4 border-t border-stone-200">
        <Button
          variant="ghost"
          className="w-full justify-start text-stone-600 hover:text-stone-900 hover:bg-stone-100"
          onClick={onLogout}
        >
          <LogOut className="h-4 w-4 mr-3" />
          Logout
        </Button>
      </div>
    </aside>
  );
}
