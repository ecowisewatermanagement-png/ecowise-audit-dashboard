import {
  LayoutDashboard,
  ClipboardList,
  BarChart3,
  Settings2,
  Building2,
  Users,
  type LucideIcon,
} from "lucide-react";

export interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
  adminOnly?: boolean;
}

export const NAV_ITEMS: NavItem[] = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Audits", href: "/audits", icon: ClipboardList },
  { label: "Analytics", href: "/analytics", icon: BarChart3 },
  { label: "Communities", href: "/communities", icon: Building2, adminOnly: true },
  { label: "Clients", href: "/clients", icon: Users, adminOnly: true },
  { label: "Settings", href: "/settings", icon: Settings2 },
];
