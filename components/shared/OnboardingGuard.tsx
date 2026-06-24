"use client";

import { useSession } from "next-auth/react";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";

export function OnboardingGuard() {
  const { data: session, status } = useSession();
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (status === "authenticated" && session?.user) {
      const user = session.user as any;
      if (!user.onboardingComplete && pathname !== "/settings/onboarding" && pathname !== "/api/auth/signout") {
        router.replace("/settings/onboarding");
      }
    }
  }, [session, status, pathname, router]);

  return null;
}
