"use client";

import { useAuth } from "@/contexts/auth-context";
import { NavNotification } from "./nav-notification";
import { NavUser } from "./nav-user";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { LineChart, Settings, Share2 } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export function HeaderActions() {
  const { user, isLoading, logout } = useAuth();

  // Generate user display data
  const userData = user ? {
    name: user.full_name || user.email.split("@")[0],
    email: user.email,
    avatar: "", // TODO: Add profile_image_url to User type when backend supports it
    initials: getInitials(user.full_name || user.email),
    hasUnreadNotifications: true, // TODO: Get from notifications API
  } : null;

  function getInitials(name: string): string {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  }

  if (isLoading) {
    return (
      <div className="flex items-center gap-1">
        <Skeleton className="h-9 w-9 rounded-full" />
        <Separator orientation="vertical" className="mx-2 h-6" />
        <Skeleton className="h-9 w-9 rounded-full" />
      </div>
    );
  }

  if (!userData) {
    return null;
  }

  return (
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
      <NavNotification user={userData} />

      <Separator orientation="vertical" className="mx-2 h-6" />

      {/* User Menu */}
      <NavUser user={userData} onLogout={logout} />
    </div>
  );
}
