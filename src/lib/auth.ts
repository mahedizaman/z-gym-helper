import NextAuth from 'next-auth';
import Google from 'next-auth/providers/google';
import { userService } from '@/server/services/user.service';

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Google({
      clientId:
        process.env.AUTH_GOOGLE_ID ||
        process.env.GOOGLE_CLIENT_ID ||
        'placeholder-client-id',
      clientSecret:
        process.env.AUTH_GOOGLE_SECRET ||
        process.env.GOOGLE_CLIENT_SECRET ||
        'placeholder-client-secret',
    }),
  ],
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === 'google' && user.email) {
        try {
          const dbUser = await userService.findOrCreateFromGoogle({
            email: user.email,
            name: user.name || undefined,
            image: user.image || undefined,
          });
          if (dbUser) {
            user.id = dbUser._id.toString();
            user.role = dbUser.role;
          }
        } catch (err) {
          console.error('Error during signIn callback in database:', err);
        }
      }
      return true;
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = (token.id as string) || (token.sub as string);
        session.user.role = (token.role as 'user' | 'admin') || 'user';
      }
      return session;
    },
  },
  pages: {
    signIn: '/login',
  },
  secret:
    process.env.AUTH_SECRET ||
    process.env.NEXTAUTH_SECRET ||
    'zgym-fallback-secret-for-development-32chars',
});
