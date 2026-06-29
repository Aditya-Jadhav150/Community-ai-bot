"use client";

import Link from "next/link";
import { ShieldCheck, LayoutDashboard, FileText, Users, Briefcase, Activity, ArrowLeft } from "lucide-react";
import { AdminNavLink } from "@/components/layout/AdminNavLink";
import { useDemoUser } from "@/hooks/useDemoUser";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useDemoUser();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return; // Wait for auth to load
    if (!user || (user.role !== "ADMIN" && user.role !== "SUPERADMIN")) {
      router.replace("/dashboard");
    }
  }, [user, isLoading, router]);

  if (isLoading || !user || (user.role !== "ADMIN" && user.role !== "SUPERADMIN")) return null;

  return (
    <div className="min-h-screen bg-[#050505] text-foreground flex flex-col md:flex-row">
      {/* Sidebar */}
      <aside className="w-full md:w-64 border-r border-white/10 bg-[#0A0A0A] p-4 flex flex-col justify-between hidden md:flex min-h-screen shrink-0 sticky top-0">
        <div>
          <div className="flex items-center gap-2 px-2 mb-8 mt-2">
            <ShieldCheck className="w-8 h-8 text-[#9B5DE5]" />
            <div>
              <h1 className="font-bold text-lg leading-tight">Community Hero</h1>
              <span className="text-xs text-[#9B5DE5] font-semibold uppercase tracking-wider">Admin Panel</span>
            </div>
          </div>

          <nav className="space-y-1">
            <AdminNavLink href="/admin" icon={<LayoutDashboard className="w-5 h-5" />} label="Overview" />
            <AdminNavLink href="/admin/reports" icon={<FileText className="w-5 h-5" />} label="Reports" />
            <AdminNavLink href="/admin/users" icon={<Users className="w-5 h-5" />} label="Users" />
            <AdminNavLink href="/admin/workers" icon={<Briefcase className="w-5 h-5" />} label="Workers & Depts" />
            <AdminNavLink href="/admin/activity" icon={<Activity className="w-5 h-5" />} label="Activity Log" />
          </nav>
        </div>

        <div className="space-y-4">
          <div className="px-4 py-3 bg-white/5 rounded-xl border border-white/10">
            <p className="text-sm font-semibold truncate">{user.name}</p>
            <p className="text-xs text-[#9B5DE5] font-bold">{user.role}</p>
          </div>
          
          <Link href="/dashboard" className="flex items-center gap-2 px-4 py-2 text-sm text-muted-foreground hover:text-white transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back to App
          </Link>
        </div>
      </aside>

      {/* Mobile Header (simplified for admin) */}
      <header className="md:hidden flex items-center justify-between p-4 border-b border-white/10 bg-[#0A0A0A]">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-6 h-6 text-[#9B5DE5]" />
          <span className="font-bold">Admin Panel</span>
        </div>
        <Link href="/dashboard" className="text-xs text-muted-foreground flex items-center gap-1">
          <ArrowLeft className="w-3 h-3" /> App
        </Link>
      </header>

      {/* Main Content */}
      <main className="flex-1 min-w-0 overflow-x-hidden p-4 md:p-8">
        {children}
      </main>
    </div>
  );
}


