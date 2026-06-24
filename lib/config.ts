const required = [
  "NEXTAUTH_SECRET",
  "GOOGLE_CLIENT_ID",
  "GOOGLE_CLIENT_SECRET",
  "GEMINI_API_KEY",
  "CLOUDINARY_URL",
  "DATABASE_URL",
];

export function validateConfig() {
  if (typeof window !== "undefined") return;

  required.forEach((key) => {
    if (!process.env[key]) {
      // In development, we might not want to hard crash if some non-critical ones are missing,
      // but the spec demands a throw.
      throw new Error(`Missing required environment variable: ${key}`);
    }
  });
}
