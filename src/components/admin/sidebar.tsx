"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { 
  LayoutDashboard, 
  Package, 
  Tags, 
  ShoppingCart, 
  Users, 
  Ticket, 
  Settings, 
  Search, 
  Image as ImageIcon,
  BarChart3,
  ExternalLink,
  ChevronRight,
  MessageSquare,
  ShieldAlert,
} from "lucide-react";

const storeNav = [
  { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { name: "Products", href: "/admin/products", icon: Package },
  { name: "Categories", href: "/admin/categories", icon: Tags },
  { name: "Orders", href: "/admin/orders", icon: ShoppingCart },
  { name: "Customers", href: "/admin/customers", icon: Users },
  { name: "Coupons", href: "/admin/coupons", icon: Ticket },
];

const contentNav = [
  { name: "Media", href: "/admin/media", icon: ImageIcon },
  { name: "Reviews", href: "/admin/reviews", icon: MessageSquare },
  { name: "SEO", href: "/admin/seo", icon: Search },
  { name: "Settings", href: "/admin/settings", icon: Settings },
  { name: "Diagnostics", href: "/admin/errors", icon: ShieldAlert },
];

const insightsNav = [
  { name: "Analytics", href: "/admin/analytics", icon: BarChart3 },
];

function NavSection({ label, items }: { label: string; items: typeof storeNav }) {
  const pathname = usePathname();

  return (
    <div className="mb-6">
      <p className="px-4 mb-2 text-[10px] font-semibold uppercase tracking-[0.12em] text-[#9CA3AF]">
        {label}
      </p>
      <div className="space-y-0.5">
        {items.map((item) => {
          const isActive = pathname === item.href || 
            (item.href !== "/admin" && pathname.startsWith(`${item.href}/`));
          
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`group relative flex items-center gap-3 rounded-lg px-4 py-2.5 text-[13px] font-medium transition-all duration-150 ${
                isActive
                  ? "bg-[#F5F5F0] text-[#1A1A1A]"
                  : "text-[#6B6B6B] hover:bg-[#FAFAFA] hover:text-[#1A1A1A]"
              }`}
            >
              {/* Active Indicator */}
              {isActive && (
                <motion.div
                  layoutId="admin-nav-indicator"
                  className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 bg-[#1A1A1A] rounded-r-full"
                  transition={{ type: "spring", stiffness: 350, damping: 30 }}
                />
              )}
              
              <item.icon
                className={`h-4 w-4 flex-shrink-0 transition-colors ${
                  isActive ? "text-[#1A1A1A]" : "text-[#9CA3AF] group-hover:text-[#6B6B6B]"
                }`}
                aria-hidden="true"
              />
              <span className="flex-1">{item.name}</span>
              
              {isActive && (
                <ChevronRight className="w-3 h-3 text-[#C4C4C4]" />
              )}
            </Link>
          );
        })}
      </div>
    </div>
  );
}

export function AdminSidebar({ isMobile = false }: { isMobile?: boolean }) {
  return (
    <div className={`flex h-full w-full md:w-64 flex-col bg-white ${!isMobile ? "border-r border-[rgba(0,0,0,0.06)]" : ""}`}>
      {/* Brand */}
      {!isMobile && (
        <div className="flex h-16 shrink-0 items-center px-6 border-b border-[rgba(0,0,0,0.06)]">
          <Link href="/admin" className="flex items-center gap-2">
            <div className="w-7 h-7 bg-[#1A1A1A] rounded-lg flex items-center justify-center">
              <span className="text-white text-xs font-bold">P</span>
            </div>
            <span className="font-serif text-lg font-bold tracking-tight text-[#1A1A1A]">
              Admin
            </span>
          </Link>
        </div>
      )}

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto py-5 px-3">
        <NavSection label="Store" items={storeNav} />
        <NavSection label="Content" items={contentNav} />
        <NavSection label="Insights" items={insightsNav} />
      </div>

      {/* Bottom */}
      <div className="border-t border-[rgba(0,0,0,0.06)] p-3">
        <Link
          href="/"
          target="_blank"
          className="flex items-center justify-center gap-2 w-full rounded-lg border border-[rgba(0,0,0,0.08)] bg-[#FAFAFA] px-4 py-2.5 text-xs font-semibold text-[#6B6B6B] hover:text-[#1A1A1A] hover:bg-[#F5F5F0] transition-all cursor-pointer"
        >
          <ExternalLink className="w-3.5 h-3.5" />
          View Storefront
        </Link>
      </div>
    </div>
  );
}
