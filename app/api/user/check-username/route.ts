import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import prisma from "@/lib/prisma";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const username = searchParams.get("username");

    if (!username) {
      return NextResponse.json({ available: false, error: "Username required" }, { status: 400 });
    }

    if (!/^[a-zA-Z0-9_]{3,20}$/.test(username)) {
      return NextResponse.json({ available: false, error: "Invalid format" }, { status: 400 });
    }

    const existingUser = await prisma.user.findUnique({
      where: { username }
    });

    // It's available if no user has it, OR if the current user already has it
    const isAvailable = !existingUser || existingUser.email === session.user.email;

    return NextResponse.json({ available: isAvailable });
  } catch (error) {
    console.error("Username check error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
