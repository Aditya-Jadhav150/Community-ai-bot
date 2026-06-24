import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { latitude, longitude, type } = await req.json();

    // Stubbed Haversine DB query logic as per spec
    // Returns mock response
    return NextResponse.json({
      isDuplicate: false,
      duplicateOfId: null,
      similarityScore: 0,
    });
  } catch (error) {
    return NextResponse.json({ error: "Failed to check duplicates" }, { status: 500 });
  }
}
