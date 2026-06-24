import { NextResponse } from "next/server";
import { ai, MODEL_NAME } from "@/lib/gemini";

export async function POST(req: Request) {
  try {
    const { imageBase64, text } = await req.json();

    const prompt = `You are an expert civic infrastructure analyst. Analyze the provided image/text and respond with ONLY valid JSON (no markdown, no explanation) in this exact shape:
{
  "issueType": one of [POTHOLE, GARBAGE, WATER_LEAKAGE, STREETLIGHT, ROAD_DAMAGE, DRAINAGE, ILLEGAL_DUMPING, FALLEN_TREE, TRAFFIC_SIGNAL, OTHER],
  "severity": one of [LOW, MEDIUM, HIGH, CRITICAL],
  "confidenceScore": number between 0 and 1,
  "title": "Brief descriptive title",
  "description": "Detailed description of what was detected",
  "estimatedImpact": "Who is affected and how",
  "suggestedDepartment": "Department name responsible",
  "safetyRisk": boolean,
  "explanation": "Human-readable one-sentence explanation"
}`;

    const contents: any[] = [prompt];

    if (text) {
      contents.push(`User description: ${text}`);
    }

    if (imageBase64) {
      const mimeTypeMatch = imageBase64.match(/data:([a-zA-Z0-9]+\/[a-zA-Z0-9-.+]+).*,.*/);
      const mimeType = mimeTypeMatch ? mimeTypeMatch[1] : "image/jpeg";
      const base64Data = imageBase64.split(",")[1] || imageBase64;

      contents.push({
        inlineData: {
          data: base64Data,
          mimeType,
        },
      });
    }

    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: contents,
    });
    
    const responseText = response.text || "";

    const cleanJson = responseText.replace(/```json\n?|```/gi, "").trim();
    const parsed = JSON.parse(cleanJson);

    return NextResponse.json(parsed);
  } catch (error) {
    console.error("AI Analysis Error:", error);
    return NextResponse.json({ error: "Failed to analyze" }, { status: 500 });
  }
}
