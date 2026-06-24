import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import prisma from "@/lib/prisma";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function PATCH(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { username, displayName, age, gender, bio, city, avatarUrl, onboardingComplete } = body;

    // Fetch current user
    const currentUser = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    if (!currentUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const updates: any = {
      displayName,
      age: age ? parseInt(age) : null,
      gender: gender || null,
      bio,
      city,
      avatarUrl,
    };

    if (onboardingComplete) {
      updates.onboardingComplete = true;
    }

    // Handle Username Logic
    if (username && username !== currentUser.username) {
      // 1. Check format
      if (!/^[a-zA-Z0-9_]{3,20}$/.test(username)) {
        return NextResponse.json({ error: "Invalid username format." }, { status: 400 });
      }

      // 2. Check if username is taken
      const existing = await prisma.user.findUnique({ where: { username } });
      if (existing) {
        return NextResponse.json({ error: "Username is already taken." }, { status: 400 });
      }

      // 3. Check Lifetime Cap
      if (currentUser.usernameChangeCount >= 5) {
        return NextResponse.json({ error: "Maximum username changes (5) reached." }, { status: 429 });
      }

      // 4. Check Cooldown (30 days)
      if (currentUser.usernameChangedAt) {
        const thirtyDaysInMs = 30 * 24 * 60 * 60 * 1000;
        const timeSinceLastChange = Date.now() - currentUser.usernameChangedAt.getTime();
        
        if (timeSinceLastChange < thirtyDaysInMs) {
          const nextEligibleDate = new Date(currentUser.usernameChangedAt.getTime() + thirtyDaysInMs);
          const formattedDate = nextEligibleDate.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
          return NextResponse.json({ 
            error: `You can next change your username on ${formattedDate}.` 
          }, { status: 429 });
        }
      }

      // Apply username changes
      updates.username = username;
      updates.usernameChangedAt = new Date();
      updates.usernameChangeCount = currentUser.usernameChangeCount + 1;
    }

    const updatedUser = await prisma.user.update({
      where: { email: session.user.email },
      data: updates,
    });

    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error("Profile update error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
