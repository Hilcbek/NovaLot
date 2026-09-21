// components/layout/SiteHeader.tsx
"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
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
import { useAuthStore, useLogout, useMobileMenuStore } from "@/hooks";
import { cn } from "@/lib/utils";
import {
  Bell,
  ChevronDown,
  Gavel,
  Heart,
  LayoutDashboard,
  LogIn,
  MapPin,
  Menu,
  Package,
  Search,
  Settings,
  Shield,
  Trophy,
  User,
  UserPlus,
} from "lucide-react";
import Link from "next/link";
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
  isAdmin: boolean;
}

interface SiteHeaderProps {
  activePath?: string;
  hasUnreadNotifications?: boolean;
}

export function SiteHeader({
  activePath = "/how-it-works",
  hasUnreadNotifications = true,
}: SiteHeaderProps) {
  const isMobileOpen = useMobileMenuStore((s) => s.isOpen);
  const closeMobileMenu = useMobileMenuStore((s) => s.close);
  const toggleMobileMenu = useMobileMenuStore((s) => s.toggle);

  const authUser = useAuthStore((s) => s.user);
  const logoutMutation = useLogout();

  const user: AuthUser | null = authUser
    ? {
        name: `${authUser.firstName} ${authUser.lastName}`,
        avatarUrl: authUser.avatarUrl ?? undefined,
        isAdmin: authUser.role === "admin",
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
                className="relative hidden rounded-sm p-2 text-foreground/70 hover:bg-muted lg:flex"
              >
                <Bell className="h-5 w-5" />
                {hasUnreadNotifications && (
                  <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-red-500" />
                )}
              </button>

              <DropdownMenu>
                <DropdownMenuTrigger className="hidden items-center gap-1 outline-none lg:flex">
                  <Avatar className="h-9 w-9">
                    <AvatarImage src={user.avatarUrl} alt={user.name} />
                    <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <ChevronDown className="h-4 w-4 text-muted-foreground" />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Account
                  </DropdownMenuLabel>
                  <DropdownMenuItem asChild>
                    <Link href="/account" className="gap-2">
                      <User className="h-4 w-4 text-muted-foreground" />
                      My account
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/account/selling-settings" className="gap-2">
                      <Settings className="h-4 w-4 text-muted-foreground" />
                      Selling settings
                    </Link>
                  </DropdownMenuItem>

                  <DropdownMenuSeparator />

                  <DropdownMenuLabel className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Activity
                  </DropdownMenuLabel>
                  <DropdownMenuItem asChild>
                    <Link href="/account/auctions" className="gap-2">
                      <Package className="h-4 w-4 text-muted-foreground" />
                      My auctions
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/watchlist" className="gap-2">
                      <Heart className="h-4 w-4 text-muted-foreground" />
                      Watchlist
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/bids" className="gap-2">
                      <Trophy className="h-4 w-4 text-muted-foreground" />
                      My bids
                    </Link>
                  </DropdownMenuItem>

                  {user.isAdmin && (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuLabel className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                        Admin
                      </DropdownMenuLabel>
                      <DropdownMenuItem asChild>
                        <Link href="/admin" className="gap-2">
                          <Shield className="h-4 w-4 text-muted-foreground" />
                          Admin dashboard
                        </Link>
                      </DropdownMenuItem>
                    </>
                  )}

                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => logoutMutation.mutate()}
                    disabled={logoutMutation.isPending}
                    className="text-destructive focus:text-destructive"
                  >
                    Log out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <div className="hidden items-center gap-2 lg:flex">
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

          <div className="hidden lg:block">
            <ModeToggle />
          </div>

          {/* Hamburger — everything below lg, plus auth buttons below sm */}
          <Sheet
            open={isMobileOpen}
            onOpenChange={(open) => (open ? toggleMobileMenu() : closeMobileMenu())}
          >
            <SheetTrigger asChild>
              <button
                type="button"
                aria-label="Open menu"
                className="rounded-sm p-2 text-foreground/70 hover:bg-muted lg:hidden"
              >
                <Menu className="h-5 w-5" />
              </button>
            </SheetTrigger>

            <SheetContent
              side="right"
              className="w-[300px] gap-0 p-0 sm:w-[360px]"
            >
              <SheetHeader className="border-b border-border px-5 py-4">
                <SheetTitle className="flex items-center gap-2 font-serif text-xl text-brand-accent">
                  <Gavel className="h-5 w-5" strokeWidth={2} />
                  NovaLot
                </SheetTitle>
              </SheetHeader>

              <div className="flex items-center justify-between border-b border-border px-5 py-3">
                <span className="text-sm text-muted-foreground">Theme</span>
                <ModeToggle />
              </div>

              <div className="flex min-h-0 flex-1 flex-col gap-6 overflow-y-auto px-5 py-5">
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
                      onClick={closeMobileMenu}
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
                      onClick={closeMobileMenu}
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
                {user ? (
                  <>
                    <div className="border-t border-border pt-5">
                      <Button asChild className="w-full">
                        <Link href="/auctions/create" onClick={closeMobileMenu}>
                          Create Auction
                        </Link>
                      </Button>
                    </div>

                    <div className="flex flex-col gap-1">
                      <p className="px-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                        Account
                      </p>
                      <Link
                        href="/account"
                        onClick={closeMobileMenu}
                        className="flex items-center gap-3 rounded-sm px-2 py-2 text-sm hover:bg-muted"
                      >
                        <Avatar className="h-7 w-7">
                          <AvatarImage src={user.avatarUrl} alt={user.name} />
                          <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        My account
                      </Link>
                      <Link
                        href="/account/selling-settings"
                        onClick={closeMobileMenu}
                        className="flex items-center gap-2 rounded-sm px-2 py-2 text-sm text-foreground/80 hover:bg-muted"
                      >
                        <Settings className="h-4 w-4 text-muted-foreground" />
                        Selling settings
                      </Link>
                    </div>

                    <div className="flex flex-col gap-1">
                      <p className="px-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                        Activity
                      </p>
                      <Link
                        href="/account/auctions"
                        onClick={closeMobileMenu}
                        className="flex items-center gap-2 rounded-sm px-2 py-2 text-sm text-foreground/80 hover:bg-muted"
                      >
                        <Package className="h-4 w-4 text-muted-foreground" />
                        My auctions
                      </Link>
                      <Link
                        href="/watchlist"
                        onClick={closeMobileMenu}
                        className="flex items-center gap-2 rounded-sm px-2 py-2 text-sm text-foreground/80 hover:bg-muted"
                      >
                        <Heart className="h-4 w-4 text-muted-foreground" />
                        Watchlist
                      </Link>
                      <Link
                        href="/bids"
                        onClick={closeMobileMenu}
                        className="flex items-center gap-2 rounded-sm px-2 py-2 text-sm text-foreground/80 hover:bg-muted"
                      >
                        <Trophy className="h-4 w-4 text-muted-foreground" />
                        My bids
                      </Link>
                    </div>

                    {user.isAdmin && (
                      <div className="flex flex-col gap-1">
                        <p className="px-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                          Admin
                        </p>
                        <Link
                          href="/admin"
                          onClick={closeMobileMenu}
                          className="flex items-center gap-2 rounded-sm px-2 py-2 text-sm text-foreground/80 hover:bg-muted"
                        >
                          <LayoutDashboard className="h-4 w-4 text-muted-foreground" />
                          Admin dashboard
                        </Link>
                      </div>
                    )}

                    <div className="border-t border-border pt-4">
                      <button
                        type="button"
                        onClick={() => {
                          closeMobileMenu();
                          logoutMutation.mutate();
                        }}
                        disabled={logoutMutation.isPending}
                        className="w-full rounded-sm px-2 py-2 text-left text-sm text-destructive hover:bg-muted disabled:opacity-50"
                      >
                        Log out
                      </button>
                    </div>
                  </>
                ) : (
                  <div className="flex flex-col gap-2 border-t border-border pt-5">
                    <Button variant="outline" asChild className="w-full gap-1.5">
                      <Link href="/sign-in" onClick={closeMobileMenu}>
                        <LogIn className="h-4 w-4" />
                        Sign in
                      </Link>
                    </Button>
                    <Button asChild className="w-full gap-1.5">
                      <Link href="/sign-up" onClick={closeMobileMenu}>
                        <UserPlus className="h-4 w-4" />
                        Sign up
                      </Link>
                    </Button>
                  </div>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}