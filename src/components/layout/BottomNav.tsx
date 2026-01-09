"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BarChart2, Home, LucideIcon, User } from "lucide-react";

import { cn } from "@/lib/utils";

interface NavItemProps {
  icon: LucideIcon;
  href: string;
  exact?: boolean;
  children: React.ReactNode;
}

function NavItem({ icon: Icon, href, exact, children }: NavItemProps) {
  const pathname = usePathname();
  const isActive = exact ? pathname === href : pathname.startsWith(href);
  return (
    <Link href={href}>
      <div
        className={cn(
          "p-4 text-muted-foreground hover:text-foreground flex flex-col items-center gap-1",
          isActive && "text-foreground",
        )}
      >
        <Icon className="size-6" />
        <span className="text-xs">{children}</span>
      </div>
    </Link>
  );
}

export function BottomNav() {
  return (
    <div className="border-t grid grid-cols-[repeat(auto-fit,minmax(0,1fr))]">
      <NavItem icon={Home} href="/">
        Home
      </NavItem>
      <NavItem icon={BarChart2} href="/stats">
        Stats
      </NavItem>
      <NavItem icon={User} href="/profile">
        Profile
      </NavItem>
    </div>
  );
}
