import * as React from "react";
import { AdminSidebar } from "@/components/admin/sidebar";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/admin-login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, email, avatar_url")
    .eq("id", user.id)
    .single();

  const name = profile?.full_name || user.email || "Admin User";
  const initials = name
    .split(" ")
    .map((n: string) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="flex h-screen overflow-hidden bg-[#F8F9FA]">
      <AdminSidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Top Bar */}
        <header className="flex h-14 shrink-0 items-center justify-between border-b border-[rgba(0,0,0,0.06)] bg-white px-8">
          <div />
          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="text-xs font-semibold text-[#1A1A1A] leading-tight">{name}</p>
              <p className="text-[10px] text-[#9CA3AF] leading-tight">Administrator</p>
            </div>
            {profile?.avatar_url ? (
              <img
                src={profile.avatar_url}
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
        <main className="flex-1 overflow-y-auto p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
