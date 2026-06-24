"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export function AdminNavLink({ href, icon, label }: { href: string; icon: React.ReactNode; label: string }) {
  const pathname = usePathname();
  const isActive = pathname === href || (href !== "/admin" && pathname?.startsWith(href));

  return (
    <Link 
      href={href} 
      className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors group ${
        isActive 
          ? "bg-white/10 text-white border-l-2 border-[#9B5DE5] pl-2.5" 
          : "text-muted-foreground hover:text-white hover:bg-white/5"
      }`}
    >
      <span className={`${isActive ? "text-[#9B5DE5]" : "text-muted-foreground group-hover:text-[#9B5DE5]"} transition-colors`}>
        {icon}
      </span>
      {label}
    </Link>
  );
}
