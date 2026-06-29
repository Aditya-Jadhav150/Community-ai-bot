"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { User as UserIcon } from "lucide-react";
import { useDemoUser } from "@/hooks/useDemoUser";
import { useDemoAuth } from "@/context/DemoAuthContext";

export default function SettingsPage() {
  const { user } = useDemoUser();
  const { logout } = useDemoAuth();
  const [loading, setLoading] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

  const { register, handleSubmit, reset, watch } = useForm();
  const bioWatch = watch("bio") || "";

  useEffect(() => {
    if (user) {
      setAvatarPreview(user.avatarUrl);
      reset({
        username: user.username || "",
        displayName: user.name || "",
        bio: "Local community hero and active citizen.",
        city: "Pune",
      });
    }
  }, [user, reset]);

  const onProfileSubmit = async (data: any) => {
    setLoading(true);
    // Simulate network delay
    setTimeout(() => {
      setLoading(false);
      alert("Profile updated successfully! (Demo Mode: changes are not persisted to database)");
    }, 800);
  };

  if (!user) return <div className="p-8 text-center text-muted-foreground">Loading settings...</div>;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Settings</h1>

      <Tabs defaultValue="profile" className="w-full">
        <TabsList className="mb-8 p-1 bg-[#111111] border border-white/10 rounded-lg">
          <TabsTrigger value="profile" className="px-6">Profile</TabsTrigger>
          <TabsTrigger value="account" className="px-6">Account</TabsTrigger>
          <TabsTrigger value="notifications" className="px-6">Notifications</TabsTrigger>
        </TabsList>

        <TabsContent value="profile">
          <Card className="glass-card p-6 md:p-8">
            <form onSubmit={handleSubmit(onProfileSubmit)} className="space-y-6">
              
              <div className="flex flex-col sm:flex-row items-center gap-6 p-4 bg-white/5 border border-white/10 rounded-xl mb-6">
                <div className="relative group shrink-0">
                  {avatarPreview ? (
                    <img src={avatarPreview} alt="Avatar" className="w-24 h-24 rounded-full border border-white/20 object-cover" />
                  ) : (
                    <div className="w-24 h-24 rounded-full bg-white/10 flex items-center justify-center font-bold text-3xl">
                      {user.name?.[0] || "U"}
                    </div>
                  )}
                  <label htmlFor="avatar-upload" className="absolute inset-0 bg-black/60 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity">
                    <span className="text-xs font-bold text-white">Upload</span>
                  </label>
                  <input 
                    type="file" 
                    id="avatar-upload" 
                    className="hidden" 
                    accept="image/*"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        const file = e.target.files[0];
                        if (file.size > 5 * 1024 * 1024) {
                          alert("File must be less than 5MB");
                          return;
                        }
                        setAvatarPreview(URL.createObjectURL(file));
                      }
                    }}
                  />
                </div>
                <div className="text-center sm:text-left">
                  <h3 className="font-bold text-lg">Profile Picture</h3>
                  <p className="text-sm text-muted-foreground mb-3">Upload a square image (Max 5MB).</p>
                  <Button type="button" variant="outline" size="sm" onClick={() => document.getElementById('avatar-upload')?.click()}>
                    Choose Image
                  </Button>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="username">Username</Label>
                  <Input id="username" {...register("username")} className="mt-2 bg-[#1A1A1A] border-white/10" />
                </div>
                <div>
                  <Label htmlFor="displayName">Display Name</Label>
                  <Input id="displayName" {...register("displayName")} className="mt-2 bg-[#1A1A1A] border-white/10" />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="city">City</Label>
                  <Input id="city" {...register("city")} className="mt-2 bg-[#1A1A1A] border-white/10" />
                </div>
              </div>

              <div>
                <Label htmlFor="bio">Bio</Label>
                <Textarea id="bio" {...register("bio")} className="mt-2 bg-[#1A1A1A] border-white/10" rows={3} />
                <div className="mt-1 text-right text-xs text-muted-foreground">{bioWatch.length}/160</div>
              </div>

              <div className="flex justify-end pt-4 border-t border-white/10">
                <Button type="submit" disabled={loading} className="bg-[#00AEFF] hover:bg-[#00AEFF]/80 text-white">
                  {loading ? "Saving..." : "Save Profile"}
                </Button>
              </div>
            </form>
          </Card>
        </TabsContent>

        <TabsContent value="account">
          <Card className="glass-card p-6 md:p-8 space-y-8">
            <div>
              <h3 className="text-xl font-bold mb-4">Account Linked</h3>
              <div className="flex items-center gap-4 p-4 bg-white/5 border border-white/10 rounded-xl">
                {user.avatarUrl ? <img src={user.avatarUrl} alt="Google" className="w-12 h-12 rounded-full" /> : <UserIcon className="w-12 h-12" />}
                <div>
                  <p className="font-bold">{user.name || "Unknown"}</p>
                  <p className="text-sm text-muted-foreground">{user.email}</p>
                </div>
              </div>
            </div>

            <div className="pt-8 border-t border-white/10 flex justify-end">
              <Button variant="outline" onClick={logout}>Sign Out</Button>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="notifications">
          <Card className="glass-card p-6 md:p-8">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold">Email Preferences</h3>
              <span className="px-3 py-1 bg-[#9B5DE5]/20 text-[#9B5DE5] text-xs font-bold rounded-full border border-[#9B5DE5]/50">Coming Soon</span>
            </div>
            
            <div className="space-y-6 opacity-50 pointer-events-none">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-bold">Email digest of my reports' status</p>
                  <p className="text-sm text-muted-foreground">Receive a weekly summary of updates.</p>
                </div>
                <div className="w-12 h-6 bg-white/20 rounded-full" />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-bold">Notify me when my report is assigned</p>
                  <p className="text-sm text-muted-foreground">Immediate alert when a worker is assigned.</p>
                </div>
                <div className="w-12 h-6 bg-white/20 rounded-full" />
              </div>
            </div>
          </Card>
        </TabsContent>

      </Tabs>
    </div>
  );
}
