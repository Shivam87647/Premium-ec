"use client";

import * as React from "react";
import { usePathname } from "next/navigation";
import { Menu, X, ExternalLink } from "lucide-react";
import { AdminSidebar } from "./sidebar";
import { AnimatePresence, motion } from "framer-motion";

export function AdminShell({
  children,
  name,
  initials,
  avatarUrl,
}: {
  children: React.ReactNode;
  name: string;
  initials: string;
  avatarUrl?: string | null;
}) {
  const [sidebarOpen, setSidebarOpen] = React.useState(false);
  const pathname = usePathname();

  // Automatically close sidebar drawer when path changes
  React.useEffect(() => {
    setSidebarOpen(false);
  }, [pathname]);

  return (
    <div className="flex h-screen overflow-hidden bg-[#F8F9FA]">
      {/* Desktop Sidebar (hidden on mobile, visible on desktop) */}
      <div className="hidden md:flex md:flex-shrink-0">
        <AdminSidebar />
      </div>

      {/* Mobile Drawer (visible on mobile, animated with Framer Motion) */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.4 }}
              exit={{ opacity: 0 }}
              onClick={() => setSidebarOpen(false)}
              className="fixed inset-0 z-40 bg-black md:hidden"
            />

            {/* Slide-over panel */}
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", bounce: 0, duration: 0.3 }}
              className="fixed inset-y-0 left-0 z-50 w-64 bg-white md:hidden shadow-2xl flex flex-col h-full"
            >
              {/* Header inside mobile drawer to easily close */}
              <div className="flex h-16 shrink-0 items-center justify-between px-6 border-b border-[rgba(0,0,0,0.06)]">
                <span className="font-serif text-lg font-bold tracking-tight text-[#1A1A1A]">
                  Admin Menu
                </span>
                <button
                  onClick={() => setSidebarOpen(false)}
                  className="p-1 rounded-lg hover:bg-[#FAFAFA] text-[#6B6B6B] hover:text-[#1A1A1A] transition-colors cursor-pointer"
                  aria-label="Close sidebar"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Sidebar Content */}
              <div className="flex-1 overflow-y-auto">
                <AdminSidebar isMobile />
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Top Bar Header */}
        <header className="flex h-14 shrink-0 items-center justify-between border-b border-[rgba(0,0,0,0.06)] bg-white px-6 md:px-8">
          {/* Hamburger button on mobile */}
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(true)}
              className="md:hidden p-2 -ml-2 rounded-lg text-[#6B6B6B] hover:text-[#1A1A1A] hover:bg-[#FAFAFA] transition-all cursor-pointer"
              aria-label="Open sidebar"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="md:hidden flex items-center gap-1.5">
              <div className="w-6 h-6 bg-[#1A1A1A] rounded flex items-center justify-center">
                <span className="text-white text-[10px] font-bold">P</span>
              </div>
              <span className="font-serif text-base font-bold tracking-tight text-[#1A1A1A]">
                Admin
              </span>
            </div>
          </div>

          {/* User profile actions */}
          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="text-xs font-semibold text-[#1A1A1A] leading-tight">
                {name}
              </p>
              <p className="text-[10px] text-[#9CA3AF] leading-tight">
                Administrator
              </p>
            </div>
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt={name}
                className="h-8 w-8 rounded-full object-cover ring-2 ring-[rgba(0,0,0,0.04)]"
              />
            ) : (
              <div className="h-8 w-8 rounded-full bg-[#1A1A1A] text-white flex items-center justify-center font-semibold text-[10px] ring-2 ring-[rgba(0,0,0,0.04)]">
                {initials}
              </div>
            )}
          </div>
        </header>

        {/* Dynamic page content */}
        <main className="flex-1 overflow-y-auto p-6 md:p-8 bg-[#F8F9FA]">
          {children}
        </main>
      </div>
    </div>
  );
}
