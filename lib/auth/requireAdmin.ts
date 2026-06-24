import { requireAdmin as newRequireAdmin } from "./requireAuth";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";

export async function requireAdmin() {
  const session = await getServerSession(authOptions);
  
  if (!session?.user || (session.user.role !== "ADMIN" && session.user.role !== "SUPERADMIN")) {
    redirect("/dashboard");
  }
  
  return session.user;
}

export async function requireAdminApi() {
  const { error, session } = await newRequireAdmin();
  if (error) {
    // Extract the status from the NextResponse if possible, else 403
    return { error: "Forbidden", status: 403 };
  }
  return { user: session!.user };
}
