import { NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/auth/requireAdmin";
import prisma from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    const auth = await requireAdminApi();
    if (auth.error) return NextResponse.json({ error: auth.error }, { status: auth.status });

    const departments = await prisma.department.findMany({
      include: {
        _count: {
          select: { issues: true }
        }
      },
      orderBy: { name: "asc" }
    });

    return NextResponse.json(departments);
  } catch (error) {
    console.error("Admin Departments GET API Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const auth = await requireAdminApi();
    if (auth.error) return NextResponse.json({ error: auth.error }, { status: auth.status });

    const body = await req.json();
    const { name } = body;

    if (!name) return NextResponse.json({ error: "Department name required" }, { status: 400 });

    const department = await prisma.department.create({
      data: { name }
    });

    await prisma.adminActivityLog.create({
      data: {
        adminId: auth.user.id,
        action: "DEPARTMENT_CREATED",
        targetType: "Department",
        targetId: department.id,
        metadata: JSON.stringify({ name })
      }
    });

    return NextResponse.json({ success: true, department });
  } catch (error) {
    console.error("Admin Departments POST API Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
