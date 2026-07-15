"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import type { ClientType } from "@/types/database";

export function ClientNav({ clientType }: { clientType: ClientType | null }) {
  const pathname = usePathname();

  const items =
    clientType === "hoa_director"
      ? [
          { label: "Community", href: "/community" },
          { label: "All Audits", href: "/community/audits" },
        ]
      : [
          { label: "Community", href: "/community" },
          { label: "My Home", href: "/my-home" },
        ];

  return (
    <nav className="flex items-center gap-1">
      {items.map((item) => {
        const isActive =
          item.href === "/community"
            ? pathname === "/community"
            : pathname.startsWith(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
              isActive
                ? "bg-primary/10 text-primary"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
