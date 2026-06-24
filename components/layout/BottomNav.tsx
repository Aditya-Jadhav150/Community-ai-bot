"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Map, PlusCircle, LayoutDashboard, User } from "lucide-react";
import { useSession } from "next-auth/react";

export function BottomNav() {
  const pathname = usePathname();
  const { data: session } = useSession();

  if (pathname === "/login") return null;

  const isAdmin = session?.user && ((session.user as any).role === "ADMIN" || (session.user as any).role === "SUPERADMIN");
  const activeColor = isAdmin ? "text-[#9B5DE5]" : "text-[#00FFE0]";

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-xl border-t border-white/10 pb-safe">
      <div className="flex items-center justify-around h-16 px-2">
        <Link href="/" className={`flex flex-col items-center justify-center w-full h-full space-y-1 ${pathname === "/" ? activeColor : "text-muted-foreground"}`}>
          <Home className="w-5 h-5" />
          <span className="text-[10px] font-medium">Home</span>
        </Link>
        <Link href="/map" className={`flex flex-col items-center justify-center w-full h-full space-y-1 ${pathname === "/map" ? activeColor : "text-muted-foreground"}`}>
          <Map className="w-5 h-5" />
          <span className="text-[10px] font-medium">Map</span>
        </Link>
        
        <Link href="/report" className="flex flex-col items-center justify-center w-full h-full -mt-6">
          <div className="bg-[#00AEFF] p-3 rounded-full shadow-[0_0_15px_rgba(0,174,255,0.5)] border-4 border-black text-white">
            <PlusCircle className="w-7 h-7" />
          </div>
          <span className="text-[10px] font-medium mt-1 text-[#00AEFF]">Report</span>
        </Link>

        {isAdmin ? (
          <Link href="/admin" className={`flex flex-col items-center justify-center w-full h-full space-y-1 ${pathname.startsWith("/admin") ? activeColor : "text-muted-foreground"}`}>
            <LayoutDashboard className="w-5 h-5" />
            <span className="text-[10px] font-medium">Admin</span>
          </Link>
        ) : (
          <Link href="/dashboard" className={`flex flex-col items-center justify-center w-full h-full space-y-1 ${pathname === "/dashboard" ? activeColor : "text-muted-foreground"}`}>
            <LayoutDashboard className="w-5 h-5" />
            <span className="text-[10px] font-medium">Dashboard</span>
          </Link>
        )}

        <Link href="/settings" className={`flex flex-col items-center justify-center w-full h-full space-y-1 ${pathname === "/settings" ? activeColor : "text-muted-foreground"}`}>
          <User className="w-5 h-5" />
          <span className="text-[10px] font-medium">Profile</span>
        </Link>
      </div>
    </nav>
  );
}
