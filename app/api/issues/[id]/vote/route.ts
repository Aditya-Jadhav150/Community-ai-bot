import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { calculatePriorityScore } from "@/lib/priority";

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const { type, userId } = await req.json();

    // Upsert vote
    await prisma.vote.upsert({
      where: {
        userId_issueId: {
          userId,
          issueId: id,
        },
      },
      update: { type },
      create: { type, userId, issueId: id },
    });

    // Recalculate priority score
    const issue = await prisma.issue.findUnique({
      where: { id },
      include: { votes: true }
    });

    if (issue) {
      const upvotes = issue.votes.filter((v: any) => v.type === "UPVOTE").length;
      const verifications = issue.votes.filter((v: any) => v.type === "VERIFY").length;
      
      const newPriority = calculatePriorityScore(issue.severity, upvotes, verifications);

      await prisma.issue.update({
        where: { id },
        data: {
          upvotes,
          verifications,
          priorityScore: newPriority
        }
      });
      
      // Award XP to user
      await prisma.user.update({
        where: { id: userId },
        data: { xp: { increment: type === "VERIFY" ? 5 : 1 } }
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Vote Error:", error);
    return NextResponse.json({ error: "Failed to vote" }, { status: 500 });
  }
}
