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

    const currentUser = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: {
        id: true,
        username: true,
        displayName: true,
        email: true,
        age: true,
        gender: true,
        bio: true,
        city: true,
        avatarUrl: true,
        image: true,
        usernameChangedAt: true,
        usernameChangeCount: true,
        createdAt: true,
      }
    });

    if (!currentUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json(currentUser);
  } catch (error) {
    console.error("GET user/me error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const currentUser = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    if (!currentUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Soft delete
    await prisma.user.update({
      where: { id: currentUser.id },
      data: {
        deletedAt: new Date(),
        name: "Deleted User",
        email: `deleted_${currentUser.id}@example.com`,
        displayName: "Deleted User",
        image: null,
        avatarUrl: null,
      }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE user/me error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
