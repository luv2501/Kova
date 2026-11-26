import type { NextAuthConfig } from "next-auth";
import Google from "next-auth/providers/google";

export const authConfig = {
  providers: [
    Google({
      clientId: process.env.AUTH_GOOGLE_ID,
      clientSecret: process.env.AUTH_GOOGLE_SECRET,
    }),
  ],
  pages: {
    signIn: "/login",
  },
  callbacks: {
    jwt({ token, user, profile }) {
      if (user) {
        token.id = user.id;
        if (user.image) {
          token.picture = user.image;
        }
      }
      if (!token.picture && typeof profile?.picture === "string") {
        token.picture = profile.picture;
      }
      return token;
    },
    session({ session, token }) {
      if (session.user) {
        if (typeof token?.id === "string") {
          session.user.id = token.id;
        }
        if (typeof token?.picture === "string") {
          session.user.image = token.picture;
        }
      }
      return session;
    },
  },
} satisfies NextAuthConfig;
