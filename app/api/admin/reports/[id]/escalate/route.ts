import { NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/auth/requireAdmin";
import prisma from "@/lib/prisma";

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const auth = await requireAdminApi();
    if (auth.error) return NextResponse.json({ error: auth.error }, { status: auth.status });

    const { id } = await params;
    const issue = await prisma.issue.update({
      where: { id },
      data: {
        isEscalated: true,
        severity: "CRITICAL",
        status: "ESCALATED",
      }
    });

    await prisma.adminActivityLog.create({
      data: {
        adminId: auth.user.id,
        action: "REPORT_ESCALATED",
        targetType: "Report",
        targetId: issue.id,
        metadata: JSON.stringify({ reason: "Admin manually escalated" })
      }
    });

    if (issue.authorId) {
      await prisma.notification.create({
        data: {
          userId: issue.authorId,
          type: "REPORT_ESCALATED",
          message: `Your report #${issue.id.slice(-6)} has been escalated for urgent attention.`
        }
      });
    }

    return NextResponse.json({ success: true, issue });
  } catch (error) {
    console.error("Admin Report Escalate API Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
