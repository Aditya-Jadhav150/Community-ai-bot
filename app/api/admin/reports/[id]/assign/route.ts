import { NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/auth/requireAdmin";
import prisma from "@/lib/prisma";

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const auth = await requireAdminApi();
    if (auth.error) return NextResponse.json({ error: auth.error }, { status: auth.status });

    const body = await req.json();
    const { assignedToId, departmentId, assignmentNote } = body;

    const { id } = await params;
    const issue = await prisma.issue.update({
      where: { id },
      data: {
        status: "ASSIGNED",
        assignedToId: assignedToId || null,
        departmentId: departmentId || null,
        assignedAt: new Date(),
        assignedBy: auth.user.id,
      }
    });

    if (assignmentNote) {
      await prisma.adminNote.create({
        data: {
          content: `Assignment Note: ${assignmentNote}`,
          adminId: auth.user.id,
          issueId: issue.id
        }
      });
    }

    await prisma.adminActivityLog.create({
      data: {
        adminId: auth.user.id,
        action: "REPORT_ASSIGNED",
        targetType: "Report",
        targetId: issue.id,
        metadata: JSON.stringify({ assignedToId, departmentId, note: assignmentNote })
      }
    });

    if (issue.authorId) {
      await prisma.notification.create({
        data: {
          userId: issue.authorId,
          type: "REPORT_ASSIGNED",
          message: `Your report #${issue.id.slice(-6)} has been assigned.`
        }
      });
    }

    return NextResponse.json({ success: true, issue });
  } catch (error) {
    console.error("Admin Report Assign API Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
