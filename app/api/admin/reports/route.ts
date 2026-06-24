import { NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/auth/requireAdmin";
import prisma from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    const auth = await requireAdminApi();
    if (auth.error) return NextResponse.json({ error: auth.error }, { status: auth.status });

    const reports = await prisma.issue.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        author: {
          select: { username: true, email: true, name: true, avatarUrl: true }
        },
        assignedTo: {
          select: { username: true, email: true, name: true }
        },
        department: {
          select: { name: true }
        }
      }
    });

    return NextResponse.json(reports);
  } catch (error) {
    console.error("Admin Reports API Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
