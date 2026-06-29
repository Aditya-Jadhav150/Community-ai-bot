"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ShieldCheck, LogOut, Map, LayoutDashboard, PlusCircle } from "lucide-react";
import { usePathname } from "next/navigation";
import { useDemoUser } from "@/hooks/useDemoUser";
import { useDemoAuth } from "@/context/DemoAuthContext";

export function TopNav() {
  const { user } = useDemoUser();
  const { logout } = useDemoAuth();
  const pathname = usePathname();

  // Hide nav on login
  if (pathname === "/login") return null;

  return (
    <header className="fixed top-0 w-full z-50 border-b border-white/10 bg-[#050505]/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <ShieldCheck className="w-6 h-6 text-[#00AEFF]" />
          <span className="font-bold text-lg hidden sm:inline-block">Community Hero AI</span>
        </Link>

        <nav className="hidden md:flex items-center gap-6">
          <Link href="/dashboard" className="text-sm font-medium hover:text-[#00AEFF] transition-colors flex items-center gap-1">
            <LayoutDashboard className="w-4 h-4" /> Dashboard
          </Link>
          <Link href="/map" className="text-sm font-medium hover:text-[#00AEFF] transition-colors flex items-center gap-1">
            <Map className="w-4 h-4" /> Map
          </Link>
          {(user?.role === "ADMIN" || user?.role === "SUPERADMIN") && (
            <Link href="/admin" className="text-sm font-bold text-[#9B5DE5] hover:text-[#9B5DE5]/80 transition-colors flex items-center gap-1">
              <ShieldCheck className="w-4 h-4" /> Admin Panel
            </Link>
          )}
          {(!user || (user.role !== "ADMIN" && user.role !== "SUPERADMIN")) && (
            <Link href="/report">
              <Button size="sm" className="bg-[#00AEFF] hover:bg-[#00AEFF]/80 text-white rounded-full shadow-[0_0_15px_rgba(0,174,255,0.3)]">
                <PlusCircle className="w-4 h-4 mr-1" /> Report
              </Button>
            </Link>
          )}
        </nav>

        <div className="flex items-center gap-4">
          {user ? (
            <div className="flex items-center gap-3">
              <div className="flex flex-col items-end hidden sm:flex">
                <span className="text-sm font-semibold">{user.name}</span>
                <span className="text-xs font-bold uppercase tracking-wider">
                  {(user.role === "ADMIN" || user.role === "SUPERADMIN") ? (
                    <span className="text-[#9B5DE5]">{user.role}</span>
                  ) : (
                    <span className="text-[#00FFE0]">{user.level || "CITIZEN"}</span>
                  )}
                </span>
              </div>
              <Link href="/settings" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
                {user.avatarUrl ? (
                  <img src={user.avatarUrl} alt="Avatar" className="w-8 h-8 rounded-full border border-white/20" />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-white/10 border border-white/20 flex items-center justify-center">
                    <span className="text-xs font-bold">{(user.name || "U")[0]}</span>
                  </div>
                )}
              </Link>
              <Button variant="ghost" size="icon" onClick={() => logout()}>
                <LogOut className="w-4 h-4" />
              </Button>
            </div>
          ) : (
            <Link href="/login">
              <Button variant="outline" size="sm" className="rounded-full">Sign In</Button>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
