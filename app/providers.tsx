"use client";

import { DemoAuthProvider } from "@/context/DemoAuthContext";
import { DemoDataProvider } from "@/context/DemoDataContext";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <DemoAuthProvider>
      <DemoDataProvider>
        {children}
      </DemoDataProvider>
    </DemoAuthProvider>
  );
}
