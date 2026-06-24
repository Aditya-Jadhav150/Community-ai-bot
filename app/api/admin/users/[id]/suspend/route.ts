import { NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/auth/requireAdmin";
import prisma from "@/lib/prisma";

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const auth = await requireAdminApi();
    if (auth.error) return NextResponse.json({ error: auth.error }, { status: auth.status });

    const body = await req.json();
    const { action, days } = body; // action: "suspend" | "unsuspend"

    const { id } = await params;
    const targetUser = await prisma.user.findUnique({ where: { id: id } });
    if (!targetUser) return NextResponse.json({ error: "User not found" }, { status: 404 });

    if (targetUser.role === "SUPERADMIN") {
      return NextResponse.json({ error: "Cannot suspend a SUPERADMIN." }, { status: 403 });
    }

    let suspendedUntil = null;
    if (action === "suspend") {
      const d = days ? parseInt(days) : 7;
      suspendedUntil = new Date(Date.now() + d * 24 * 60 * 60 * 1000);
    }

    const updatedUser = await prisma.user.update({
      where: { id: id },
      data: { suspendedUntil }
    });

    await prisma.adminActivityLog.create({
      data: {
        adminId: auth.user.id,
        action: action === "suspend" ? "USER_SUSPENDED" : "USER_UNSUSPENDED",
        targetType: "User",
        targetId: id,
        metadata: JSON.stringify({ suspendedUntil })
      }
    });

    return NextResponse.json({ success: true, user: updatedUser });
  } catch (error) {
    console.error("Admin User Suspend API Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
