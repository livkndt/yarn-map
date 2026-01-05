import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import Link from 'next/link';
import { Calendar, MapPin, Flag, Plus } from 'lucide-react';

export default async function AdminDashboardPage() {
  const session = await auth();

  if (!session) {
    redirect('/admin');
  }

  return (
    <div className="container mx-auto px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="font-heading text-3xl font-bold text-foreground">
          Admin Dashboard
        </h1>
        <p className="mt-2 text-muted-foreground">
          Welcome back, {session.user?.email || 'Admin'}
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader>
            <div className="flex items-center space-x-2">
              <Calendar className="h-5 w-5 text-primary" />
              <CardTitle>Manage Events</CardTitle>
            </div>
            <CardDescription>Create, edit, and delete events</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild className="w-full">
              <Link href="/admin/events">Manage Events</Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center space-x-2">
              <MapPin className="h-5 w-5 text-primary" />
              <CardTitle>Manage Shops</CardTitle>
            </div>
            <CardDescription>
              Create, edit, and delete yarn shops
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild className="w-full">
              <Link href="/admin/shops">Manage Shops</Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center space-x-2">
              <Plus className="h-5 w-5 text-primary" />
              <CardTitle>Review Submissions</CardTitle>
            </div>
            <CardDescription>
              Review and approve user-submitted events and shops
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild className="w-full">
              <Link href="/admin/submissions">Review Submissions</Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center space-x-2">
              <Flag className="h-5 w-5 text-primary" />
              <CardTitle>View Reports</CardTitle>
            </div>
            <CardDescription>
              Review and manage user-submitted reports
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild className="w-full">
              <Link href="/admin/reports">View Reports</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
