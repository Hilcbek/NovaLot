// components/layout/SiteHeader.tsx
"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useAuthStore, useLogout } from "@/hooks";
import { cn } from "@/lib/utils";
import {
  Bell,
  ChevronDown,
  Gavel,
  LogIn,
  MapPin,
  Menu,
  Search,
  UserPlus,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { ModeToggle } from "./mode-toggler";
const CATEGORIES = [
  "Fine Watches",
  "Fine Art",
  "Fine Jewelry",
  "Classic Cars",
  "Rare Wine & Spirits",
];

const LOCATIONS = ["New York", "Los Angeles", "London", "Miami"];

const NAV_LINKS = [
  { label: "Browse", href: "/browse" },
  { label: "How It Works", href: "/how-it-works" },
];

interface AuthUser {
  name: string;
  avatarUrl?: string;
}

interface SiteHeaderProps {
  activePath?: string;
  user?: AuthUser | null;
  hasUnreadNotifications?: boolean;
}

export function SiteHeader({
  activePath = "/how-it-works",
  hasUnreadNotifications = true,
}: SiteHeaderProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

  const authUser = useAuthStore((s) => s.user);
  const logoutMutation = useLogout();

  const user = authUser
    ? {
        name: `${authUser.firstName} ${authUser.lastName}`,
        avatarUrl: authUser.avatarUrl ?? undefined,
      }
    : null;
  return (
    <header className="border-b border-border bg-background">
      <div className="flex h-16 items-center gap-4 px-4 sm:h-20 sm:gap-6 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link href="/" className="flex shrink-0 items-center gap-2">
          <Gavel
            className="h-5 w-5 text-brand-accent sm:h-6 sm:w-6"
            strokeWidth={2}
          />
          <span className="font-serif text-xl text-brand-accent sm:text-2xl">
            NovaLot
          </span>
        </Link>

        {/* Primary nav — desktop only */}
        <nav className="hidden items-center gap-7 text-sm font-medium text-foreground/80 lg:flex">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "pb-1 transition-colors hover:text-foreground",
                activePath === link.href &&
                  "text-foreground border-b-2 border-brand-accent",
              )}
            >
              {link.label}
            </Link>
          ))}

          <DropdownMenu>
            <DropdownMenuTrigger className="flex items-center gap-1 outline-none hover:text-foreground">
              Categories
              <ChevronDown className="h-4 w-4" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-48">
              {CATEGORIES.map((category) => (
                <DropdownMenuItem key={category} asChild>
                  <Link
                    href={`/categories/${category.toLowerCase().replace(/\s+/g, "-")}`}
                  >
                    {category}
                  </Link>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </nav>

        {/* Search — hidden below lg, shown as icon-trigger on md/sm inside the sheet instead */}
        <div className="relative ml-2 hidden max-w-md flex-1 lg:block">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Search auctions..." className="pl-9" />
        </div>

        {/* Right cluster */}
        <div className="ml-auto flex items-center gap-1.5 sm:gap-3">
          {/* Location — desktop only, moves into sheet below lg */}
          <DropdownMenu>
            <DropdownMenuTrigger className="hidden items-center gap-1.5 rounded-sm border border-border px-3 py-2 text-sm text-foreground outline-none hover:bg-muted lg:flex">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              New York
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {LOCATIONS.map((location) => (
                <DropdownMenuItem key={location}>{location}</DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {user ? (
            <>
              {/* Create Auction — icon-only on mobile, full label from sm up */}
              <Button asChild size="sm" className="shrink-0 sm:h-10 sm:px-4">
                <Link href="/auctions/create">
                  <span className="hidden sm:inline">Create Auction</span>
                  <span className="sm:hidden">Create</span>
                </Link>
              </Button>

              <button
                type="button"
                aria-label="Notifications"
                className="relative hidden rounded-sm p-2 text-foreground/70 hover:bg-muted sm:flex"
              >
                <Bell className="h-5 w-5" />
                {hasUnreadNotifications && (
                  <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-red-500" />
                )}
              </button>

              <DropdownMenu>
                <DropdownMenuTrigger className="hidden items-center gap-1 outline-none sm:flex">
                  <Avatar className="h-9 w-9">
                    <AvatarImage src={user.avatarUrl} alt={user.name} />
                    <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <ChevronDown className="h-4 w-4 text-muted-foreground" />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem asChild>
                    <Link href="/account">My account</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/watchlist">Watchlist</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/bids">My bids</Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => logoutMutation.mutate()}
                    disabled={logoutMutation.isPending}
                  >
                    Log out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <div className="hidden items-center gap-2 sm:flex">
              <Button
                variant="outline"
                size="sm"
                asChild
                className="h-9 gap-1.5 px-3.5"
              >
                <Link href="/sign-in">
                  <LogIn className="h-4 w-4" />
                  Sign in
                </Link>
              </Button>
              <Button size="sm" asChild className="h-9 gap-1.5 px-3.5">
                <Link href="/sign-up">
                  <UserPlus className="h-4 w-4" />
                  Sign up
                </Link>
              </Button>
            </div>
          )}

          <div className="hidden sm:block">
            <ModeToggle />
          </div>

          {/* Hamburger — everything below lg, plus auth buttons below sm */}
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild>
              <button
                type="button"
                aria-label="Open menu"
                className="rounded-sm p-2 text-foreground/70 hover:bg-muted lg:hidden"
              >
                <Menu className="h-5 w-5" />
              </button>
            </SheetTrigger>

            <SheetContent side="right" className="w-[300px] p-0 sm:w-[360px]">
              <SheetHeader className="border-b border-border px-5 py-4">
                <SheetTitle className="flex items-center gap-2 font-serif text-xl text-brand-accent">
                  <Gavel className="h-5 w-5" strokeWidth={2} />
                  NovaLot
                </SheetTitle>
              </SheetHeader>

              <div className="flex flex-col gap-6 px-5 py-5">
                {/* Search */}
                <div className="relative">
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input placeholder="Search auctions..." className="pl-9" />
                </div>

                {/* Nav links */}
                <div className="flex flex-col gap-1">
                  {NAV_LINKS.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={() => setMobileOpen(false)}
                      className={cn(
                        "rounded-sm px-2 py-2.5 text-sm font-medium text-foreground/80 hover:bg-muted",
                        activePath === link.href && "text-brand-accent",
                      )}
                    >
                      {link.label}
                    </Link>
                  ))}
                </div>

                {/* Categories */}
                <div className="flex flex-col gap-1">
                  <p className="px-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Categories
                  </p>
                  {CATEGORIES.map((category) => (
                    <Link
                      key={category}
                      href={`/categories/${category.toLowerCase().replace(/\s+/g, "-")}`}
                      onClick={() => setMobileOpen(false)}
                      className="rounded-sm px-2 py-2 text-sm text-foreground/80 hover:bg-muted"
                    >
                      {category}
                    </Link>
                  ))}
                </div>

                {/* Location */}
                <div className="flex flex-col gap-1">
                  <p className="px-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Location
                  </p>
                  {LOCATIONS.map((location) => (
                    <button
                      key={location}
                      type="button"
                      className="flex items-center gap-2 rounded-sm px-2 py-2 text-left text-sm text-foreground/80 hover:bg-muted"
                    >
                      <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
                      {location}
                    </button>
                  ))}
                </div>

                {/* Auth / account actions */}
                <div className="flex flex-col gap-2 border-t border-border pt-5">
                  {user ? (
                    <>
                      <Button asChild className="w-full">
                        <Link
                          href="/auctions/create"
                          onClick={() => setMobileOpen(false)}
                        >
                          Create Auction
                        </Link>
                      </Button>
                      <Link
                        href="/account"
                        onClick={() => setMobileOpen(false)}
                        className="flex items-center gap-3 rounded-sm px-2 py-2 text-sm hover:bg-muted"
                      >
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={user.avatarUrl} alt={user.name} />
                          <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        My account
                      </Link>
                      <Link
                        href="/watchlist"
                        onClick={() => setMobileOpen(false)}
                        className="rounded-sm px-2 py-2 text-sm hover:bg-muted"
                      >
                        Watchlist
                      </Link>
                      <Link
                        href="/bids"
                        onClick={() => setMobileOpen(false)}
                        className="rounded-sm px-2 py-2 text-sm hover:bg-muted"
                      >
                        My bids
                      </Link>
                      <button
                        type="button"
                        onClick={() => {
                          setMobileOpen(false);
                          logoutMutation.mutate();
                        }}
                        disabled={logoutMutation.isPending}
                        className="rounded-sm px-2 py-2 text-left text-sm text-destructive hover:bg-muted disabled:opacity-50"
                      >
                        Log out
                      </button>
                    </>
                  ) : (
                    <>
                      <Button
                        variant="outline"
                        asChild
                        className="w-full gap-1.5"
                      >
                        <Link
                          href="/sign-in"
                          onClick={() => setMobileOpen(false)}
                        >
                          <LogIn className="h-4 w-4" />
                          Sign in
                        </Link>
                      </Button>
                      <Button asChild className="w-full gap-1.5">
                        <Link
                          href="/sign-up"
                          onClick={() => setMobileOpen(false)}
                        >
                          <UserPlus className="h-4 w-4" />
                          Sign up
                        </Link>
                      </Button>
                    </>
                  )}
                </div>

                <div className="flex items-center justify-between border-t border-border pt-5">
                  <span className="text-sm text-muted-foreground">Theme</span>
                  <ModeToggle />
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}