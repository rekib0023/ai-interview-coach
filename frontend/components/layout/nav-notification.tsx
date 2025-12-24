import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Bell } from "lucide-react";

export function NavNotification({
  user,
}: {
  user: {
    name: string;
    email: string;
    avatar: string;
    initials: string;
    hasUnreadNotifications: boolean;
  };
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="h-9 w-9 relative"
          aria-label="Notifications"
        >
          <Bell className="h-4 w-4" />
          {user.hasUnreadNotifications && (
            <span className="absolute right-1 top-1 flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-primary" />
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <DropdownMenuLabel>Notifications</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <div className="flex flex-col gap-2 p-2">
          {/* Notification Items */}
          <div className="flex flex-col gap-1 rounded-md p-2 hover:bg-muted">
            <p className="text-sm font-medium">Interview completed</p>
            <p className="text-xs text-muted-foreground">
              You scored 85% on your last coding interview
            </p>
            <p className="text-xs text-muted-foreground">2 hours ago</p>
          </div>
          <div className="flex flex-col gap-1 rounded-md p-2 hover:bg-muted">
            <p className="text-sm font-medium">New feature available</p>
            <p className="text-xs text-muted-foreground">
              System design mode is now live!
            </p>
            <p className="text-xs text-muted-foreground">1 day ago</p>
          </div>
        </div>
        <DropdownMenuSeparator />
        <DropdownMenuItem className="justify-center cursor-pointer">
          View all notifications
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
