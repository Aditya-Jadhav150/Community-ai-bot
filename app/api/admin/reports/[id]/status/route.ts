import { NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/auth/requireAdmin";
import prisma from "@/lib/prisma";

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const auth = await requireAdminApi();
    if (auth.error) return NextResponse.json({ error: auth.error }, { status: auth.status });

    const body = await req.json();
    const { status, note } = body;

    if (!status) return NextResponse.json({ error: "Status required" }, { status: 400 });

    const updateData: any = { status };
    if (status === "RESOLVED") updateData.resolvedAt = new Date();
    
    const { id } = await params;
    const issue = await prisma.issue.update({
      where: { id },
      data: updateData
    });

    // Record History & Activity
    await prisma.reportStatusHistory.create({
      data: {
        issueId: issue.id,
        status,
        adminId: auth.user.id,
        note: note || null
      }
    });

    await prisma.adminActivityLog.create({
      data: {
        adminId: auth.user.id,
        action: "STATUS_CHANGED",
        targetType: "Report",
        targetId: issue.id,
        metadata: JSON.stringify({ newStatus: status, note })
      }
    });

    // Notify user
    if (issue.authorId) {
      await prisma.notification.create({
        data: {
          userId: issue.authorId,
          type: "STATUS_UPDATED",
          message: `Your report #${issue.id.slice(-6)} status changed to ${status}.`
        }
      });
    }

    return NextResponse.json({ success: true, issue });
  } catch (error) {
    console.error("Admin Report Status API Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
