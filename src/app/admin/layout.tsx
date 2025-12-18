import { auth, signOut } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b bg-background">
        <div className="container mx-auto px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <Link href="/admin/dashboard">
              <h1 className="font-heading text-xl font-bold text-primary">
                Yarn Map Admin
              </h1>
            </Link>
            {session && (
              <div className="flex items-center gap-4">
                <nav className="hidden items-center gap-4 md:flex">
                  <Link
                    href="/admin/events"
                    className="text-sm font-medium hover:text-primary"
                  >
                    Events
                  </Link>
                  <Link
                    href="/admin/shops"
                    className="text-sm font-medium hover:text-primary"
                  >
                    Shops
                  </Link>
                  <Link
                    href="/admin/reports"
                    className="text-sm font-medium hover:text-primary"
                  >
                    Reports
                  </Link>
                </nav>
                <form
                  action={async () => {
                    'use server';
                    await signOut({ redirectTo: '/admin' });
                  }}
                >
                  <Button type="submit" variant="outline" size="sm">
                    Sign Out
                  </Button>
                </form>
              </div>
            )}
          </div>
        </div>
      </header>
      <main className="flex-1">{children}</main>
    </div>
  );
}
