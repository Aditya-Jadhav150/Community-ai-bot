import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth/requireAuth";
import { rateLimit } from "@/lib/rateLimit";
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function POST(req: Request) {
  try {
    const { error, session } = await requireAuth();
    if (error) return error;

    // Rate limit: 20 requests per user per minute
    if (!rateLimit(`camera_analyze_${session!.user.id}`, 20, 60000)) {
      return NextResponse.json({ error: "Too many requests" }, { status: 429 });
    }

    const { imageBase64 } = await req.json();
    if (!imageBase64) return NextResponse.json({ error: "Missing image" }, { status: 400 });

    const prompt = `
You are an AI assistant helping citizens report civic infrastructure issues.
Analyze this camera frame and respond ONLY with a JSON object (no markdown, no explanation):
{
  "detected": true/false,
  "category": "POTHOLE" | "GARBAGE" | "WATER_LEAK" | "BROKEN_STREETLIGHT" | "ROAD_DAMAGE" | "DRAINAGE" | "FALLEN_TREE" | "TRAFFIC_SIGNAL" | "OTHER" | null,
  "severity": "CRITICAL" | "HIGH" | "MEDIUM" | "LOW" | null,
  "confidence": 0.0 to 1.0,
  "hint": "Short user-facing hint, max 60 chars. E.g. 'Large pothole detected — move closer for better accuracy' or 'No civic issue visible yet'"
}
Only respond with valid JSON. If no civic issue is detected, set detected to false and category/severity to null.
    `;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [
        {
          role: "user",
          parts: [
            { text: prompt },
            { inlineData: { mimeType: "image/jpeg", data: imageBase64 } }
          ]
        }
      ],
      config: {
        temperature: 0.2,
      }
    });

    const responseText = response.text || "";
    // Clean JSON block if wrapped
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return NextResponse.json(JSON.parse(jsonMatch[0]));
    }
    
    return NextResponse.json({ detected: false, category: null, severity: null, confidence: 0, hint: "Failed to parse AI response" });

  } catch (err) {
    console.error("Frame Analysis Error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
