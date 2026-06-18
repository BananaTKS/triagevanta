import type { CurrentUser } from "@/lib/dal";
import {
  canManageAssets,
  canManageOnboarding,
  canManageUsers,
  canViewReports,
  canViewSecurity,
} from "@/lib/rbac";
import { Logo } from "@/components/logo";
import { NavLinks, type NavItem } from "@/components/nav-links";
import { RoleBadge } from "@/components/badges";
import { LogoutButton } from "@/components/logout-button";

function navItems(user: CurrentUser): NavItem[] {
  const items: NavItem[] = [
    { href: "/dashboard", label: "Dashboard", icon: "dashboard" },
    { href: "/tickets", label: "Tickets", icon: "tickets" },
    { href: "/kb", label: "Knowledge", icon: "kb" },
    { href: "/notifications", label: "Notifications", icon: "notifications" },
  ];
  if (canManageAssets(user.role)) {
    items.push({ href: "/assets", label: "Assets", icon: "assets" });
  }
  if (canManageOnboarding(user.role)) {
    items.push({ href: "/onboarding", label: "Onboarding", icon: "onboarding" });
  }
  if (canViewReports(user.role)) {
    items.push({ href: "/reports", label: "Reports", icon: "reports" });
  }
  if (canViewSecurity(user.role)) {
    items.push({ href: "/security", label: "Security", icon: "security" });
  }
  if (canManageUsers(user.role)) {
    items.push({ href: "/users", label: "Users", icon: "users" });
  }
  return items;
}

/** Persistent left sidebar (lg and up). */
export function Sidebar({ user }: { user: CurrentUser }) {
  return (
    <aside className="hidden w-60 shrink-0 flex-col border-r border-zinc-200 bg-white lg:flex print:hidden">
      <div className="flex h-14 items-center border-b border-zinc-200 px-4">
        <Logo />
      </div>
      <nav className="flex flex-1 flex-col gap-1 p-3">
        <NavLinks items={navItems(user)} />
      </nav>
      <div className="border-t border-zinc-200 p-3">
        <div className="mb-2 flex items-center justify-between gap-2">
          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-zinc-900">{user.name}</p>
            <p className="truncate text-xs text-zinc-500">{user.email}</p>
          </div>
          <RoleBadge role={user.role} />
        </div>
        <LogoutButton />
      </div>
    </aside>
  );
}

/** Compact top bar + horizontal nav for small screens. */
export function MobileNav({ user }: { user: CurrentUser }) {
  return (
    <header className="border-b border-zinc-200 bg-white lg:hidden print:hidden">
      <div className="flex h-14 items-center justify-between px-4">
        <Logo />
        <div className="flex items-center gap-3">
          <RoleBadge role={user.role} />
          <LogoutButton />
        </div>
      </div>
      <nav className="flex gap-1 overflow-x-auto border-t border-zinc-200 px-3 py-2">
        <NavLinks items={navItems(user)} />
      </nav>
    </header>
  );
}
