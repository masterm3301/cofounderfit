import NextAuth from "next-auth";
import LinkedIn from "next-auth/providers/linkedin";
import { getDb } from "./db";
import { upsertUserFromLinkedInProfile } from "./onboarding";

export const { handlers, auth, signIn, signOut } = NextAuth({
  // Auth.js only auto-trusts the host on Vercel; self-hosting on Cloudflare
  // means the incoming Host header (co-founder.fit) must be trusted explicitly.
  trustHost: true,
  providers: [
    LinkedIn({
      clientId: process.env.AUTH_LINKEDIN_ID,
      clientSecret: process.env.AUTH_LINKEDIN_SECRET,
    }),
  ],
  callbacks: {
    async signIn({ profile }) {
      if (!profile?.sub || !profile.email || !profile.name) return false;
      await upsertUserFromLinkedInProfile({
        sub: profile.sub,
        email: profile.email,
        name: profile.name,
        picture: profile.picture as string | undefined,
      });
      return true;
    },
    async jwt({ token, profile }) {
      // `profile` is only present on the initial sign-in call. LinkedIn's `sub` is
      // NOT our Prisma User.id (that's a separate cuid) — look up the internal id
      // so `token.sub` (and later session.user.id) matches what getProfile/getProject
      // expect everywhere else in the app.
      if (profile?.sub) {
        const user = await getDb().user.findUnique({ where: { linkedinId: profile.sub } });
        if (user) {
          token.sub = user.id;
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user && token.sub) {
        session.user.id = token.sub;
      }
      return session;
    },
  },
  pages: {
    error: "/auth/error",
  },
});
