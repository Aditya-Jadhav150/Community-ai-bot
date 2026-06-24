import { NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/auth/requireAdmin";
import prisma from "@/lib/prisma";

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const auth = await requireAdminApi();
    if (auth.error) return NextResponse.json({ error: auth.error }, { status: auth.status });

    const { id } = await params;
    const issue = await prisma.issue.findUnique({
      where: { id: id },
      include: {
        author: { select: { username: true, email: true, name: true, avatarUrl: true, city: true, createdAt: true } },
        assignedTo: { select: { username: true, email: true, name: true } },
        department: true,
        adminNotes: {
          include: { admin: { select: { name: true, role: true } } },
          orderBy: { createdAt: "desc" }
        },
        statusHistory: {
          orderBy: { createdAt: "desc" }
        },
        comments: {
          include: { user: { select: { name: true, image: true, avatarUrl: true } } },
          orderBy: { createdAt: "desc" }
        }
      }
    });

    if (!issue) return NextResponse.json({ error: "Report not found" }, { status: 404 });

    return NextResponse.json(issue);
  } catch (error) {
    console.error("Admin Report GET API Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const auth = await requireAdminApi();
    if (auth.error) return NextResponse.json({ error: auth.error }, { status: auth.status });

    const { id } = await params;
    const issue = await prisma.issue.update({
      where: { id },
      data: { status: "DELETED" }
    });

    await prisma.adminActivityLog.create({
      data: {
        adminId: auth.user.id,
        action: "DELETED",
        targetType: "Report",
        targetId: id,
        metadata: JSON.stringify({ reason: "Admin soft-deleted" })
      }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Admin Report DELETE Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
