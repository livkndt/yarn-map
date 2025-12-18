import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import { PrismaAdapter } from '@auth/prisma-adapter';
import { db } from './db';
import { logger } from './logger';
import { logAudit } from './audit';

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: PrismaAdapter(db),
  trustHost: true, // Required for production deployments on Netlify/Vercel
  session: {
    strategy: 'jwt',
  },
  pages: {
    signIn: '/admin',
  },
  providers: [
    Credentials({
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const adminPassword = process.env.ADMIN_PASSWORD;
        if (!adminPassword) {
          logger.error('ADMIN_PASSWORD not configured');
          throw new Error('ADMIN_PASSWORD not configured');
        }

        // Simple password check - in production, use proper hashing
        if (credentials.password === adminPassword) {
          logger.info('Admin login successful', { email: credentials.email });

          await logAudit({
            action: 'auth.login_success',
            userId: 'admin',
            metadata: { email: credentials.email },
          });

          return {
            id: 'admin',
            email: credentials.email as string,
            name: 'Admin',
          };
        }

        logger.warn('Admin login failed', { email: credentials.email });

        await logAudit({
          action: 'auth.login_failure',
          metadata: { email: credentials.email },
        });

        return null;
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
      }
      return session;
    },
  },
});
