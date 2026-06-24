import NextAuth, { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import prisma from "@/lib/prisma";

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      if (!user.email) return false;
      
      try {
        const existingUser = await prisma.user.findUnique({
          where: { email: user.email },
        });

        if (!existingUser) {
          const isSuperAdmin = user.email === "adityajadhav300405@gmail.com";
          await prisma.user.create({
            data: {
              email: user.email,
              name: user.name || "Unknown",
              image: user.image,
              role: isSuperAdmin ? "SUPERADMIN" : "USER",
            },
          });
        } else if (existingUser.role !== "SUPERADMIN" && user.email === "adityajadhav300405@gmail.com") {
          // Auto-upgrade if they somehow got downgraded or were already created as USER
          await prisma.user.update({
            where: { email: user.email },
            data: { role: "SUPERADMIN" }
          });
        }
        return true;
      } catch (error) {
        console.error("Error during sign in:", error);
        return false;
      }
    },
    async jwt({ token, user, trigger, session }) {
      if (user) {
        const dbUser = await prisma.user.findUnique({
          where: { email: user.email! },
        });
        token.id = dbUser?.id;
        token.role = dbUser?.role ?? "USER";
        token.onboardingComplete = dbUser?.onboardingComplete ?? false;
      }
      
      if (trigger === "update" && session) {
        if (session.onboardingComplete !== undefined) {
          token.onboardingComplete = session.onboardingComplete;
        }
        if (session.username) {
          token.username = session.username;
        }
      }
      
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user = {
          ...session.user,
          id: token.id as string,
          role: token.role as string,
          onboardingComplete: token.onboardingComplete as boolean,
        } as any;
      }
      return session;
    },
  },
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/login",
  },
  debug: true,
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
