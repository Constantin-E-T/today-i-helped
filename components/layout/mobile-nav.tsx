"use client";

import * as React from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { UserAvatar } from "@/components/ui/user-avatar";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import {
  Menu,
  Home,
  Users,
  Trophy,
  Settings,
  LogOut,
  Sparkles,
  Heart,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface MobileNavProps {
  username: string;
  onSignOut?: () => void;
}

interface NavItem {
  title: string;
  href: string;
  icon: React.ElementType;
  description?: string;
}

const navigationItems: NavItem[] = [
  {
    title: "Home",
    href: "/",
    icon: Home,
    description: "Discover challenges to complete",
  },
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: Heart,
    description: "Your personal journey",
  },
  {
    title: "Action Flow",
    href: "/action-flow",
    icon: Sparkles,
    description: "Browse or create actions",
  },
  {
    title: "Feed",
    href: "/feed",
    icon: Users,
    description: "See what others are doing",
  },
  {
    title: "Achievements",
    href: "/achievements",
    icon: Trophy,
    description: "Track your progress",
  },
  {
    title: "Settings",
    href: "/settings",
    icon: Settings,
    description: "Manage your account",
  },
];

/**
 * MobileNav Component
 * Responsive navigation drawer for mobile devices
 * - Slides in from left with smooth animation
 * - Shows user avatar and username
 * - Includes navigation links
 * - Theme toggle
 * - Sign out option
 * - Closes automatically on route change
 */
export function MobileNav({ username, onSignOut }: MobileNavProps) {
  const [open, setOpen] = React.useState(false);
  const pathname = usePathname();

  // Close drawer when route changes
  React.useEffect(() => {
    setOpen(false);
  }, [pathname]);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden"
          aria-label="Open navigation menu"
        >
          <Menu className="h-5 w-5" />
          <span className="sr-only">Toggle navigation menu</span>
        </Button>
      </SheetTrigger>

      <SheetContent side="left" className="w-[300px] sm:w-[350px] p-0">
        {/* User Profile Header */}
        <SheetHeader className="p-6 pb-4 text-left">
          <Link href={`/profile/${username}`} className="flex items-center gap-3 hover:opacity-80 transition-opacity">
            <UserAvatar username={username} size="lg" />
            <div className="flex flex-col min-w-0">
              <SheetTitle className="text-base font-semibold truncate">
                {username}
              </SheetTitle>
              <SheetDescription className="text-xs">
                Keep spreading kindness
              </SheetDescription>
            </div>
          </Link>
        </SheetHeader>

        <Separator />

        {/* Navigation Links */}
        <nav className="flex flex-col gap-1 p-4">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-3 text-sm transition-colors",
                  "hover:bg-accent hover:text-accent-foreground",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                  "min-h-[44px]", // Touch-friendly minimum height
                  isActive
                    ? "bg-accent text-accent-foreground font-medium"
                    : "text-muted-foreground"
                )}
              >
                <Icon className="h-5 w-5 shrink-0" />
                <div className="flex flex-col min-w-0">
                  <span className="truncate">{item.title}</span>
                  {item.description && (
                    <span className="text-xs text-muted-foreground/80 dark:text-muted-foreground/90 truncate">
                      {item.description}
                    </span>
                  )}
                </div>
              </Link>
            );
          })}
        </nav>

        <Separator />

        {/* Bottom Actions */}
        <div className="p-4 space-y-3">
          {/* Theme Toggle */}
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Theme</span>
            <ThemeToggle />
          </div>

          <Separator />

          {/* Sign Out */}
          {onSignOut && (
            <Button
              variant="ghost"
              className="w-full justify-start gap-3 text-muted-foreground hover:text-foreground min-h-[44px]"
              onClick={() => {
                setOpen(false);
                onSignOut();
              }}
            >
              <LogOut className="h-5 w-5" />
              <span>Sign Out</span>
            </Button>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
