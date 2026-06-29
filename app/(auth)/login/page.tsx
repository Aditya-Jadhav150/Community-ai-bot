"use client";

import { useDemoAuth } from "@/context/DemoAuthContext";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ShieldCheck, User, Shield } from "lucide-react";

export default function LoginPage() {
  const { login } = useDemoAuth();

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#00AEFF]/10 via-background to-background" />

      <Card className="glass-card max-w-md w-full p-8 text-center border-white/10">
        <div className="mx-auto bg-[#00AEFF]/20 w-16 h-16 rounded-full flex items-center justify-center mb-6 border border-[#00AEFF]/30">
          <ShieldCheck className="w-8 h-8 text-[#00AEFF]" />
        </div>
        <h1 className="text-3xl font-bold mb-2">Welcome Hero</h1>
        <p className="text-muted-foreground mb-8">Sign in to report and verify issues in your community.</p>

        <div className="space-y-4">
          <Button 
            onClick={() => login("citizen")}
            className="w-full bg-white text-black hover:bg-gray-200 h-14 text-lg rounded-xl flex items-center justify-center gap-3 font-semibold transition-all hover:scale-[1.02]"
          >
            <User className="w-6 h-6 text-[#00AEFF]" />
            Continue as Citizen
          </Button>
          
          <Button 
            onClick={() => login("admin")}
            variant="outline"
            className="w-full bg-black/50 text-white hover:bg-white/10 h-14 text-lg rounded-xl border-white/20 flex items-center justify-center gap-3 font-semibold transition-all hover:scale-[1.02]"
          >
            <Shield className="w-6 h-6 text-[#9B5DE5]" />
            Continue as Admin
          </Button>
        </div>
      </Card>
    </div>
  );
}
