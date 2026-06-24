"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ShieldCheck, User as UserIcon } from "lucide-react";

const onboardingSchema = z.object({
  username: z.string()
    .min(3, "Username must be at least 3 characters")
    .max(20, "Username must be at most 20 characters")
    .regex(/^[a-zA-Z0-9_]+$/, "Only letters, numbers, and underscores are allowed"),
  displayName: z.string().min(2, "Display name must be at least 2 characters").max(50),
  age: z.coerce.number().min(13, "Must be at least 13").max(120).optional().or(z.literal("")),
  gender: z.enum(["MALE", "FEMALE", "NON_BINARY", "PREFER_NOT_TO_SAY", ""]).optional(),
  city: z.string().max(60).optional(),
});

type OnboardingFormValues = z.infer<typeof onboardingSchema>;

export default function OnboardingPage() {
  const router = useRouter();
  const { data: session, update } = useSession();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const { register, handleSubmit, formState: { errors } } = useForm<OnboardingFormValues>({
    resolver: zodResolver(onboardingSchema),
    defaultValues: {
      displayName: session?.user?.name || "",
      username: "",
      age: "",
      gender: "",
      city: "",
    }
  });

  const onSubmit = async (data: OnboardingFormValues) => {
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/user/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, onboardingComplete: true }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to save profile");
      }

      // Update local session
      await update({ onboardingComplete: true, username: data.username });
      
      router.push("/dashboard");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <ShieldCheck className="mx-auto h-12 w-12 text-[#00AEFF]" />
          <h2 className="mt-6 text-3xl font-extrabold text-foreground">Complete your profile</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Welcome to Community Hero AI! Let's get you set up.
          </p>
        </div>
        <Card className="glass-card p-8">
          <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
            {error && (
              <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-md text-red-500 text-sm">
                {error}
              </div>
            )}
            
            <div>
              <Label htmlFor="username">Username (Required)</Label>
              <Input 
                id="username" 
                placeholder="civic_hero_99" 
                {...register("username")}
                className="mt-1 bg-[#1A1A1A] border-white/10"
              />
              {errors.username && <p className="mt-1 text-sm text-red-500">{errors.username.message}</p>}
            </div>

            <div>
              <Label htmlFor="displayName">Display Name (Required)</Label>
              <Input 
                id="displayName" 
                placeholder="John Doe" 
                {...register("displayName")}
                className="mt-1 bg-[#1A1A1A] border-white/10"
              />
              {errors.displayName && <p className="mt-1 text-sm text-red-500">{errors.displayName.message}</p>}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="age">Age</Label>
                <Input 
                  id="age" 
                  type="number" 
                  placeholder="25" 
                  {...register("age")}
                  className="mt-1 bg-[#1A1A1A] border-white/10"
                />
                {errors.age && <p className="mt-1 text-sm text-red-500">{errors.age.message}</p>}
              </div>

              <div>
                <Label htmlFor="gender">Gender</Label>
                <select 
                  id="gender" 
                  {...register("gender")}
                  className="w-full mt-1 h-10 px-3 py-2 rounded-md bg-[#1A1A1A] border border-white/10 text-sm focus:outline-none focus:ring-2 focus:ring-[#00AEFF]/50"
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
              <Label htmlFor="city">City</Label>
              <Input 
                id="city" 
                placeholder="San Francisco, CA" 
                {...register("city")}
                className="mt-1 bg-[#1A1A1A] border-white/10"
              />
            </div>

            <Button type="submit" className="w-full bg-[#00AEFF] hover:bg-[#00AEFF]/80 text-white" disabled={loading}>
              {loading ? "Saving..." : "Complete Profile"}
            </Button>
          </form>
        </Card>
      </div>
    </div>
  );
}
