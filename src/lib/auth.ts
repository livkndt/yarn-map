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

        const email = String(credentials.email);
        const password = String(credentials.password);

        const adminEmail = process.env.ADMIN_EMAIL;
        const adminPassword = process.env.ADMIN_PASSWORD;

        if (!adminEmail) {
          logger.error('ADMIN_EMAIL not configured');
          throw new Error('ADMIN_EMAIL not configured');
        }

        if (!adminPassword) {
          logger.error('ADMIN_PASSWORD not configured');
          throw new Error('ADMIN_PASSWORD not configured');
        }

        // Check that email matches the configured admin email (case-insensitive)
        const emailMatches =
          email.toLowerCase().trim() === adminEmail.toLowerCase().trim();

        // Check that password matches
        const passwordMatches = password === adminPassword;

        // Both email and password must match
        if (emailMatches && passwordMatches) {
          logger.info('Admin login successful', { email });

          await logAudit({
            action: 'auth.login_success',
            userId: 'admin',
            metadata: { email },
          });

          return {
            id: 'admin',
            email,
            name: 'Admin',
          };
        }

        logger.warn('Admin login failed', {
          email,
          reason: emailMatches ? 'invalid_password' : 'invalid_email',
        });

        await logAudit({
          action: 'auth.login_failure',
          metadata: {
            email,
            reason: emailMatches ? 'invalid_password' : 'invalid_email',
          },
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
