import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { issueType } = await req.json();

    const lookupTable: Record<string, any> = {
      POTHOLE: {
        recommendedFix: "Asphalt patch crew needed.",
        estimatedCost: "₹500–₹2000",
        estimatedDuration: "3–5 days",
        requiredResources: ["Asphalt mix", "Roller", "Crew of 3"],
        preventionTips: ["Regular road surface sealing"],
      },
      GARBAGE: {
        recommendedFix: "Dispatch sanitation truck.",
        estimatedCost: "₹200–₹500",
        estimatedDuration: "1–2 days",
        requiredResources: ["Garbage truck", "Sanitation workers"],
        preventionTips: ["Install more public bins"],
      },
      // Fallback
      OTHER: {
        recommendedFix: "General maintenance assessment.",
        estimatedCost: "TBD",
        estimatedDuration: "TBD",
        requiredResources: ["Inspector"],
        preventionTips: ["Regular monitoring"],
      }
    };

    const advice = lookupTable[issueType] || lookupTable.OTHER;

    return NextResponse.json(advice);
  } catch (error) {
    return NextResponse.json({ error: "Failed to get resolution advice" }, { status: 500 });
  }
}
