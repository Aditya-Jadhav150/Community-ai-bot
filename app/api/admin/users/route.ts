import { NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/auth/requireAdmin";
import prisma from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    const auth = await requireAdminApi();
    if (auth.error) return NextResponse.json({ error: auth.error }, { status: auth.status });

    const users = await prisma.user.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        _count: {
          select: { issues: true }
        }
      }
    });

    return NextResponse.json(users);
  } catch (error) {
    console.error("Admin Users GET API Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
