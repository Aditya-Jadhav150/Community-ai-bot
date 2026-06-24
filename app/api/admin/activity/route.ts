import { NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/auth/requireAdmin";
import prisma from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    const auth = await requireAdminApi();
    if (auth.error) return NextResponse.json({ error: auth.error }, { status: auth.status });

    const logs = await prisma.adminActivityLog.findMany({
      orderBy: { createdAt: "desc" },
      take: 100, // Limit to recent 100 for performance
      include: {
        admin: {
          select: { name: true, email: true, role: true, image: true }
        }
      }
    });

    return NextResponse.json(logs);
  } catch (error) {
    console.error("Admin Activity GET API Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
