"use client";

import { useEffect, useState } from "react";
import { useSession, signOut } from "next-auth/react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { ShieldCheck, CheckCircle, XCircle, AlertTriangle, User as UserIcon } from "lucide-react";
import { useDebounce } from "use-debounce";

const profileSchema = z.object({
  username: z.string().min(3).max(20).regex(/^[a-zA-Z0-9_]+$/),
  displayName: z.string().min(2).max(50),
  age: z.coerce.number().min(13).max(120).optional().or(z.literal("")),
  gender: z.enum(["MALE", "FEMALE", "NON_BINARY", "PREFER_NOT_TO_SAY", ""]).optional(),
  bio: z.string().max(160).optional(),
  city: z.string().max(60).optional(),
});

export default function SettingsPage() {
  const { data: session, update } = useSession();
  const [loading, setLoading] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState("");
  const [userData, setUserData] = useState<any>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [avatarBase64, setAvatarBase64] = useState<string | null>(null);
  
  // Username check
  const [usernameInput, setUsernameInput] = useState("");
  const [debouncedUsername] = useDebounce(usernameInput, 400);
  const [usernameStatus, setUsernameStatus] = useState<"checking" | "available" | "taken" | "invalid" | "idle">("idle");
  const [usernameError, setUsernameError] = useState("");

  const { register, handleSubmit, reset, watch, formState: { errors } } = useForm({
    resolver: zodResolver(profileSchema),
  });

  const bioWatch = watch("bio") || "";

  useEffect(() => {
    // Fetch current user data
    fetch("/api/user/me")
      .then(res => res.json())
      .then(data => {
        if (!data.error) {
          setUserData(data);
          setAvatarPreview(data.avatarUrl || data.image || null);
          reset({
            username: data.username || "",
            displayName: data.displayName || "",
            age: data.age || "",
            gender: data.gender || "",
            bio: data.bio || "",
            city: data.city || "",
          });
          setUsernameInput(data.username || "");
        }
      });
  }, [reset]);

  useEffect(() => {
    if (!debouncedUsername) {
      setUsernameStatus("idle");
      return;
    }
    
    if (userData && debouncedUsername === userData.username) {
      setUsernameStatus("available"); // Same as current
      return;
    }

    if (!/^[a-zA-Z0-9_]{3,20}$/.test(debouncedUsername)) {
      setUsernameStatus("invalid");
      return;
    }

    setUsernameStatus("checking");
    fetch(`/api/user/check-username?username=${debouncedUsername}`)
      .then(res => res.json())
      .then(data => {
        if (data.available) {
          setUsernameStatus("available");
        } else {
          setUsernameStatus("taken");
        }
      })
      .catch(() => setUsernameStatus("idle"));
  }, [debouncedUsername, userData]);

  const onProfileSubmit = async (data: any) => {
    setLoading(true);
    try {
      let finalAvatarUrl = userData.avatarUrl || userData.image;
      
      // Upload avatar if changed
      if (avatarBase64) {
        const uploadRes = await fetch("/api/upload", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ imageBase64: avatarBase64, folder: "avatars" })
        });
        const uploadData = await uploadRes.json();
        if (uploadData.url) {
          finalAvatarUrl = uploadData.url;
        } else {
          throw new Error(uploadData.error || "Image upload failed");
        }
      }

      const res = await fetch("/api/user/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, avatarUrl: finalAvatarUrl }),
      });
      const resData = await res.json();
      
      if (!res.ok) {
        alert(resData.error || "Update failed");
      } else {
        alert("Profile updated successfully!");
        setUserData(resData);
        await update({ username: resData.username });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirmText !== userData?.username) return;
    
    setLoading(true);
    try {
      const res = await fetch("/api/user/me", { method: "DELETE" });
      if (res.ok) {
        signOut({ callbackUrl: "/" });
      }
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  if (!userData) return <div className="p-8 text-center text-muted-foreground">Loading settings...</div>;

  const changesRemaining = 5 - (userData.usernameChangeCount || 0);
  const thirtyDaysInMs = 30 * 24 * 60 * 60 * 1000;
  const isCooldownActive = userData.usernameChangedAt && (Date.now() - new Date(userData.usernameChangedAt).getTime() < thirtyDaysInMs);
  const nextEligibleDate = userData.usernameChangedAt ? new Date(new Date(userData.usernameChangedAt).getTime() + thirtyDaysInMs).toLocaleDateString() : null;

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
                      {userData.displayName?.[0] || userData.name?.[0] || "U"}
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
                        const reader = new FileReader();
                        reader.onloadend = () => {
                          setAvatarPreview(reader.result as string);
                          setAvatarBase64(reader.result as string);
                        };
                        reader.readAsDataURL(file);
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

              <div className="p-4 bg-white/5 border border-white/10 rounded-xl mb-6">
                <Label htmlFor="username">Username</Label>
                <div className="relative mt-2">
                  <Input 
                    id="username" 
                    {...register("username")}
                    onChange={(e) => {
                      register("username").onChange(e);
                      setUsernameInput(e.target.value);
                    }}
                    disabled={changesRemaining <= 0 || isCooldownActive}
                    className="bg-[#1A1A1A] border-white/10 pr-10"
                  />
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    {usernameStatus === "checking" && <div className="w-4 h-4 rounded-full border-2 border-[#00AEFF] border-t-transparent animate-spin" />}
                    {usernameStatus === "available" && <CheckCircle className="w-5 h-5 text-[#30D158]" />}
                    {usernameStatus === "taken" && <XCircle className="w-5 h-5 text-red-500" />}
                    {usernameStatus === "invalid" && <AlertTriangle className="w-5 h-5 text-[#FF9500]" />}
                  </div>
                </div>
                <div className="mt-2 flex justify-between text-xs text-muted-foreground">
                  <span>
                    {isCooldownActive ? `Cooldown active. Next change: ${nextEligibleDate}` : `${changesRemaining} changes remaining.`}
                  </span>
                  {usernameStatus === "taken" && <span className="text-red-500">Username taken</span>}
                  {usernameStatus === "invalid" && <span className="text-[#FF9500]">3-20 chars, no spaces</span>}
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="displayName">Display Name</Label>
                  <Input id="displayName" {...register("displayName")} className="mt-2 bg-[#1A1A1A] border-white/10" />
                  {errors.displayName && <p className="text-red-500 text-xs mt-1">{(errors.displayName as any).message}</p>}
                </div>
                <div>
                  <Label htmlFor="city">City</Label>
                  <Input id="city" {...register("city")} className="mt-2 bg-[#1A1A1A] border-white/10" />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="age">Age</Label>
                  <Input id="age" type="number" {...register("age")} className="mt-2 bg-[#1A1A1A] border-white/10" />
                  {errors.age && <p className="text-red-500 text-xs mt-1">{(errors.age as any).message}</p>}
                </div>
                <div>
                  <Label htmlFor="gender">Gender</Label>
                  <select 
                    id="gender" 
                    {...register("gender")}
                    className="w-full mt-2 h-10 px-3 py-2 rounded-md bg-[#1A1A1A] border border-white/10 text-sm focus:outline-none focus:ring-2 focus:ring-[#00AEFF]/50"
                  >
                    <option value="">Select...</option>
                    <option value="MALE">Male</option>
                    <option value="FEMALE">Female</option>
                    <option value="NON_BINARY">Non-binary</option>
                    <option value="PREFER_NOT_TO_SAY">Prefer not to say</option>
                  </select>
                </div>
              </div>

              <div>
                <Label htmlFor="bio">Bio</Label>
                <Textarea id="bio" {...register("bio")} className="mt-2 bg-[#1A1A1A] border-white/10" rows={3} />
                <div className="mt-1 text-right text-xs text-muted-foreground">{bioWatch.length}/160</div>
              </div>

              <div className="flex justify-end pt-4 border-t border-white/10">
                <Button type="submit" disabled={loading || usernameStatus === "taken" || usernameStatus === "invalid"} className="bg-[#00AEFF] hover:bg-[#00AEFF]/80 text-white">
                  {loading ? "Saving..." : "Save Profile"}
                </Button>
              </div>
            </form>
          </Card>
        </TabsContent>

        <TabsContent value="account">
          <Card className="glass-card p-6 md:p-8 space-y-8">
            <div>
              <h3 className="text-xl font-bold mb-4">Google Account Linked</h3>
              <div className="flex items-center gap-4 p-4 bg-white/5 border border-white/10 rounded-xl">
                {userData.image ? <img src={userData.image} alt="Google" className="w-12 h-12 rounded-full" /> : <UserIcon className="w-12 h-12" />}
                <div>
                  <p className="font-bold">{userData.displayName || "Unknown"}</p>
                  <p className="text-sm text-muted-foreground">{userData.email}</p>
                </div>
              </div>
            </div>

            <div className="pt-8 border-t border-red-500/20">
              <h3 className="text-xl font-bold text-red-500 mb-2">Danger Zone</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Deleting your account is permanent. Your previous reports will remain to ensure public infrastructure data is not lost, but they will be anonymized.
              </p>
              
              {!deleteModalOpen ? (
                <Button variant="destructive" onClick={() => setDeleteModalOpen(true)}>Delete Account</Button>
              ) : (
                <div className="p-4 border border-red-500/50 rounded-xl bg-red-500/10">
                  <p className="text-sm font-bold mb-2">Type "{userData.username}" to confirm:</p>
                  <Input 
                    value={deleteConfirmText}
                    onChange={e => setDeleteConfirmText(e.target.value)}
                    className="mb-4 bg-black/50 border-red-500/50"
                  />
                  <div className="flex gap-4">
                    <Button variant="outline" onClick={() => setDeleteModalOpen(false)}>Cancel</Button>
                    <Button variant="destructive" onClick={handleDeleteAccount} disabled={deleteConfirmText !== userData.username || loading}>
                      {loading ? "Deleting..." : "Permanently Delete"}
                    </Button>
                  </div>
                </div>
              )}
            </div>
            
            <div className="pt-8 border-t border-white/10 flex justify-end">
              <Button variant="outline" onClick={() => signOut({ callbackUrl: "/" })}>Sign Out</Button>
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
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-bold">Community upvotes on my reports</p>
                  <p className="text-sm text-muted-foreground">Daily digest of upvotes and verifications.</p>
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
