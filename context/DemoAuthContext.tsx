"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { DemoUser } from "@/lib/demoData/users";
import { getDemoUser, demoLogin, demoLogout } from "@/lib/demoAuth";
import { useRouter, usePathname } from "next/navigation";

interface DemoAuthContextType {
  user: DemoUser | null;
  login: (role: "citizen" | "admin") => void;
  logout: () => void;
  updateUser: (updates: Partial<DemoUser>) => void;
  isLoading: boolean;
}

const DemoAuthContext = createContext<DemoAuthContextType | null>(null);

export const DemoAuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<DemoUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    setUser(getDemoUser());
    setIsLoading(false);
  }, []);

  // Protected route enforcement
  useEffect(() => {
    if (isLoading) return;
    
    // Public routes that don't need auth
    const publicRoutes = ["/", "/login"];
    const isPublicRoute = publicRoutes.includes(pathname);
    
    if (!user && !isPublicRoute) {
      router.push("/login");
    }
  }, [user, isLoading, pathname, router]);

  const login = (role: "citizen" | "admin") => {
    demoLogin(role);
    setUser(getDemoUser());
    router.push(role === "admin" ? "/admin" : "/dashboard");
  };

  const logout = () => {
    demoLogout();
    setUser(null);
    router.push("/");
  };

  const updateUser = (updates: Partial<DemoUser>) => {
    if (!user) return;
    const updatedUser = { ...user, ...updates };
    setUser(updatedUser);
    localStorage.setItem("cha_demo_user", JSON.stringify(updatedUser));
  };

  return (
    <DemoAuthContext.Provider value={{ user, login, logout, updateUser, isLoading }}>
      {children}
    </DemoAuthContext.Provider>
  );
};

export const useDemoAuth = () => {
  const context = useContext(DemoAuthContext);
  if (!context) throw new Error("useDemoAuth must be used within DemoAuthProvider");
  return context;
};
