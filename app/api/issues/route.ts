import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { calculatePriorityScore } from "@/lib/priority";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { title, description, type, severity, latitude, longitude, address, mediaUrls, aiAnalysis, confidenceScore, authorId } = body;

    const priorityScore = calculatePriorityScore(severity, 0, 0);

    const issue = await prisma.issue.create({
      data: {
        title,
        description,
        type,
        severity,
        latitude,
        longitude,
        address,
        mediaUrls: mediaUrls || [], // Native array
        aiAnalysis: aiAnalysis ? JSON.stringify(aiAnalysis) : null,
        confidenceScore,
        priorityScore,
        authorId: authorId || null, // Allow anonymous reporting
      },
    });

    return NextResponse.json(issue);
  } catch (error) {
    console.error("Error creating issue:", error);
    return NextResponse.json({ error: "Failed to create issue" }, { status: 500 });
  }
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const type = searchParams.get("type");
    const severity = searchParams.get("severity");

    const where: any = {};
    if (type) where.type = type;
    if (severity) where.severity = severity;

    const issues = await prisma.issue.findMany({
      where,
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(issues);
  } catch (error) {
    console.error("Error fetching issues:", error);
    return NextResponse.json({ error: "Failed to fetch issues" }, { status: 500 });
  }
}
