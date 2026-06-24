import { NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/auth/requireAdmin";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const auth = await requireAdminApi();
    if (auth.error) return NextResponse.json({ error: auth.error }, { status: auth.status });

    const now = new Date();
    const sub24h = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const sub7d = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const sub30d = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    // Basic Counts
    const totalReports = await prisma.issue.count();
    const totalUsers = await prisma.user.count();

    const [openCount, inProgressCount, resolvedCount] = await Promise.all([
      prisma.issue.count({ where: { status: "REPORTED" } }),
      prisma.issue.count({ where: { status: { in: ["ASSIGNED", "IN_PROGRESS", "ESCALATED"] } } }),
      prisma.issue.count({ where: { status: "RESOLVED" } })
    ]);

    const [reports24h, reports7d, reports30d] = await Promise.all([
      prisma.issue.count({ where: { createdAt: { gte: sub24h } } }),
      prisma.issue.count({ where: { createdAt: { gte: sub7d } } }),
      prisma.issue.count({ where: { createdAt: { gte: sub30d } } })
    ]);

    // Average time to resolution
    const resolvedIssues = await prisma.issue.findMany({
      where: { status: "RESOLVED", resolvedAt: { not: null } },
      select: { createdAt: true, resolvedAt: true }
    });

    let avgResolutionDays = 0;
    if (resolvedIssues.length > 0) {
      const totalMs = resolvedIssues.reduce((acc, issue) => {
        return acc + (issue.resolvedAt!.getTime() - issue.createdAt.getTime());
      }, 0);
      avgResolutionDays = totalMs / resolvedIssues.length / (1000 * 60 * 60 * 24);
    }

    // Top Categories & Pie Chart Data
    const categoryGroup = await prisma.issue.groupBy({
      by: ['type'],
      _count: { type: true },
      orderBy: { _count: { type: 'desc' } }
    });
    const topCategories = categoryGroup.slice(0, 3).map(g => ({ type: g.type, count: g._count.type }));
    const pieData = categoryGroup.map(g => ({ name: g.type, value: g._count.type }));

    // Volume over last 30 days (Line Chart Data)
    // Prisma doesn't natively do "group by date" easily across varying dialects, so we fetch the last 30 days and group in JS.
    const recentIssues = await prisma.issue.findMany({
      where: { createdAt: { gte: sub30d } },
      select: { createdAt: true }
    });

    const volumeMap = new Map<string, number>();
    for (let i = 29; i >= 0; i--) {
      const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      volumeMap.set(d.toLocaleDateString("en-US", { month: "short", day: "numeric" }), 0);
    }

    recentIssues.forEach(issue => {
      const dateStr = issue.createdAt.toLocaleDateString("en-US", { month: "short", day: "numeric" });
      if (volumeMap.has(dateStr)) {
        volumeMap.set(dateStr, volumeMap.get(dateStr)! + 1);
      }
    });

    const lineData = Array.from(volumeMap.entries()).map(([date, count]) => ({ date, count }));

    return NextResponse.json({
      totalReports,
      totalUsers,
      statusBreakdown: { open: openCount, inProgress: inProgressCount, resolved: resolvedCount },
      timeBreakdown: { last24h: reports24h, last7d: reports7d, last30d: reports30d },
      avgResolutionDays: avgResolutionDays.toFixed(1),
      topCategories,
      charts: {
        lineData,
        pieData
      }
    });
  } catch (error) {
    console.error("Overview API Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
