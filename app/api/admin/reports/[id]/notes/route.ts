import { NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/auth/requireAdmin";
import prisma from "@/lib/prisma";

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const auth = await requireAdminApi();
    if (auth.error) return NextResponse.json({ error: auth.error }, { status: auth.status });

    const body = await req.json();
    const { content } = body;

    if (!content) return NextResponse.json({ error: "Content required" }, { status: 400 });

    const { id } = await params;
    const note = await prisma.adminNote.create({
      data: {
        content,
        adminId: auth.user.id,
        issueId: id
      }
    });

    await prisma.adminActivityLog.create({
      data: {
        adminId: auth.user.id,
        action: "NOTE_ADDED",
        targetType: "Report",
        targetId: id,
        metadata: JSON.stringify({ noteId: note.id })
      }
    });

    return NextResponse.json({ success: true, note });
  } catch (error) {
    console.error("Admin Report Note API Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
