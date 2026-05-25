import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

export const authOptions: NextAuthOptions = {
  session: { strategy: "jwt" },
  pages: {
    signIn: "/auth/signin",
  },
  providers: [
    CredentialsProvider({
      name: "Email & Password",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;
        const user = await prisma.user.findUnique({
          where: { email: credentials.email.toLowerCase() },
        });
        if (!user) return null;
        const ok = await bcrypt.compare(credentials.password, user.passwordHash);
        if (!ok) return null;
        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.avatarUrl ?? undefined,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, trigger }) {
      if (user) {
        token.id = (user as { id: string }).id;
      }
      // refresh role/kyc on every request — cheap with sqlite
      if (token?.id) {
        const fresh = await prisma.user.findUnique({
          where: { id: token.id as string },
          select: {
            role: true,
            kycStatus: true,
            isAdmin: true,
            avatarUrl: true,
            name: true,
          },
        });
        if (fresh) {
          token.role = fresh.role;
          token.kycStatus = fresh.kycStatus;
          token.isAdmin = fresh.isAdmin;
          token.picture = fresh.avatarUrl ?? token.picture;
          token.name = fresh.name;
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user && token) {
        (session.user as any).id = token.id;
        (session.user as any).role = token.role;
        (session.user as any).kycStatus = token.kycStatus;
        (session.user as any).isAdmin = token.isAdmin;
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
};
