import { NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/auth/requireAdmin";
import prisma from "@/lib/prisma";

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const auth = await requireAdminApi();
    if (auth.error) return NextResponse.json({ error: auth.error }, { status: auth.status });

    const body = await req.json();
    const { role } = body;

    if (!role) return NextResponse.json({ error: "Role required" }, { status: 400 });

    // Only SUPERADMIN can promote/demote to ADMIN or SUPERADMIN
    if ((role === "ADMIN" || role === "SUPERADMIN") && auth.user.role !== "SUPERADMIN") {
      return NextResponse.json({ error: "Only SUPERADMIN can assign admin roles." }, { status: 403 });
    }

    const { id } = await params;
    const targetUser = await prisma.user.findUnique({ where: { id } });
    if (!targetUser) return NextResponse.json({ error: "User not found" }, { status: 404 });

    // Cannot demote a SUPERADMIN if you are not a SUPERADMIN (or even if you are, maybe prevent self-demotion?)
    if (targetUser.role === "SUPERADMIN" && auth.user.email !== targetUser.email) {
       return NextResponse.json({ error: "Cannot modify other SUPERADMINs." }, { status: 403 });
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data: { role }
    });

    await prisma.adminActivityLog.create({
      data: {
        adminId: auth.user.id,
        action: "ROLE_CHANGED",
        targetType: "User",
        targetId: id,
        metadata: JSON.stringify({ oldRole: targetUser.role, newRole: role })
      }
    });

    return NextResponse.json({ success: true, user: updatedUser });
  } catch (error) {
    console.error("Admin User Role API Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
