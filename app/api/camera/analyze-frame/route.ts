import { NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";
import { rateLimit } from "@/lib/rateLimit";

const MAX_PAYLOAD_SIZE = 3 * 1024 * 1024; // 3MB limit
const ALLOWED_MIME_TYPES = ["image/jpeg", "image/png", "image/webp"];

// 4. Environment Validation
if (!process.env.GEMINI_API_KEY) {
  console.error("CRITICAL: GEMINI_API_KEY is not defined in environment variables.");
}

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export async function POST(req: Request) {
  try {
    // 1. IP-based Rate Limiting (15 requests per minute for camera stream)
    const ip = req.headers.get("x-forwarded-for") || "unknown";
    if (!rateLimit(ip, 15, 60000)) {
      return NextResponse.json({ error: "Too many requests" }, { status: 429 });
    }

    // Check payload size
    const contentLength = req.headers.get("content-length");
    if (contentLength && parseInt(contentLength, 10) > MAX_PAYLOAD_SIZE) {
      return NextResponse.json({ error: "Payload too large. Maximum size is 3MB." }, { status: 413 });
    }

    const { imageBase64 } = await req.json();
    if (!imageBase64) return NextResponse.json({ error: "Missing image" }, { status: 400 });

    // 2. MIME Validation
    const mimeTypeMatch = imageBase64.match(/data:([a-zA-Z0-9]+\/[a-zA-Z0-9-.+]+).*,.*/);
    const mimeType = mimeTypeMatch ? mimeTypeMatch[1] : "image/jpeg";
    
    if (!ALLOWED_MIME_TYPES.includes(mimeType)) {
      return NextResponse.json({ error: "Invalid image format." }, { status: 415 });
    }

    if (imageBase64.length > 4000000) {
      return NextResponse.json({ error: "Image payload too large." }, { status: 413 });
    }

    const base64Data = imageBase64.split(",")[1] || imageBase64;

    const systemPrompt = `
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

    // 3. Prompt Isolation
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [
        {
          role: "user",
          parts: [
            { inlineData: { mimeType, data: base64Data } }
          ]
        }
      ],
      config: {
        systemInstruction: systemPrompt,
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
