import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { v2 as cloudinary } from "cloudinary";

// Ensure cloudinary is configured using the CLOUDINARY_URL from env automatically
// or we can configure it explicitly if needed, but the SDK handles CLOUDINARY_URL by default.
// Let's explicitly configure it just in case:
if (process.env.CLOUDINARY_URL) {
  cloudinary.config({
    secure: true
  });
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { imageBase64, folder } = await req.json();

    if (!imageBase64) {
      return NextResponse.json({ error: "No image provided" }, { status: 400 });
    }

    // 10MB limit check
    // Base64 string length roughly equals 4/3 of the actual file size in bytes
    const approximateSize = (imageBase64.length * 3) / 4;
    if (approximateSize > 10 * 1024 * 1024) {
      return NextResponse.json({ error: "File exceeds 10MB limit" }, { status: 400 });
    }

    // Server-side magic byte MIME validation using file-type
    const { fileTypeFromBuffer } = await import("file-type");
    // Extract base64 payload (strip data:image/jpeg;base64, prefix if present)
    const base64Data = imageBase64.includes(",") ? imageBase64.split(",")[1] : imageBase64;
    const buffer = Buffer.from(base64Data, "base64");
    
    const type = await fileTypeFromBuffer(buffer);
    if (!type || !["image/jpeg", "image/png", "image/webp"].includes(type.mime)) {
      return NextResponse.json({ error: "Invalid file type. Only JPEG, PNG, and WebP are allowed." }, { status: 400 });
    }

    // Upload to cloudinary
    const uploadResult = await cloudinary.uploader.upload(imageBase64, {
      folder: folder || "community_hero",
      transformation: [
        { width: 500, height: 500, crop: "limit" }, // limit size for basic compression
        { quality: "auto", fetch_format: "auto" }
      ]
    });

    return NextResponse.json({ url: uploadResult.secure_url });
  } catch (error: any) {
    console.error("Upload API Error:", error);
    return NextResponse.json({ error: error.message || "Upload failed" }, { status: 500 });
  }
}
