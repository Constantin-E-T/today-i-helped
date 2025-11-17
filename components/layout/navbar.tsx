"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { MobileNav } from "@/components/layout/mobile-nav";
import { UserAvatar } from "@/components/ui/user-avatar";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Home,
  Users,
  Trophy,
  Settings,
  LogOut,
  Heart,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface NavbarProps {
  username: string;
  onSignOut?: () => void;
}

interface NavItem {
  title: string;
  href: string;
  icon: React.ElementType;
}

const navigationItems: NavItem[] = [
  { title: "Home", href: "/", icon: Home },
  { title: "Action Flow", href: "/action-flow", icon: Sparkles },
  { title: "Feed", href: "/feed", icon: Users },
  { title: "Achievements", href: "/achievements", icon: Trophy },
  { title: "Settings", href: "/settings", icon: Settings },
];

/**
 * Navbar Component
 * Mobile-first responsive navigation bar
 * - Mobile: Hamburger menu + logo + avatar
 * - Desktop: Full horizontal navigation with all links
 * - Sticky positioning with backdrop blur
 * - User dropdown menu on desktop
 */
export function Navbar({ username, onSignOut }: NavbarProps) {
  const pathname = usePathname();

  return (
    <header className="fixed top-0 left-0 right-0 z-50 w-full border-b bg-background/80 backdrop-blur-md supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 max-w-screen-2xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Left Section */}
        <div className="flex items-center gap-3 md:gap-6">
          {/* Mobile Navigation Trigger */}
          <MobileNav username={username} onSignOut={onSignOut} />

          {/* Logo/Brand */}
          <Link
            href="/"
            className="flex items-center gap-2 transition-opacity hover:opacity-80"
          >
            <Heart className="h-6 w-6 text-primary fill-primary" />
            <h1 className="text-base sm:text-lg md:text-xl font-semibold text-foreground">
              Today I Helped
            </h1>
          </Link>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center gap-1 ml-6">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;

              return (
                <Link key={item.href} href={item.href}>
                  <Button
                    variant={isActive ? "secondary" : "ghost"}
                    size="sm"
                    className={cn("gap-2", isActive && "font-medium")}
                  >
                    <Icon className="h-4 w-4" />
                    <span className="hidden lg:inline">{item.title}</span>
                  </Button>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Theme Toggle - Desktop Only */}
          <div className="hidden md:block">
            <ThemeToggle />
          </div>

          {/* User Menu - Desktop */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="hidden md:flex items-center gap-2 h-10"
              >
                <UserAvatar username={username} size="sm" />
                <span className="hidden lg:inline text-sm font-medium max-w-[120px] truncate">
                  {username}
                </span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">{username}</p>
                  <p className="text-xs leading-none text-muted-foreground">
                    Keep spreading kindness
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/settings" className="cursor-pointer">
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Settings</span>
                </Link>
              </DropdownMenuItem>
              {onSignOut && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={onSignOut}
                    className="cursor-pointer"
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Sign Out</span>
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Avatar Only - Mobile */}
          <div className="md:hidden">
            <UserAvatar username={username} size="sm" />
          </div>
        </div>
      </div>
    </header>
  );
}
