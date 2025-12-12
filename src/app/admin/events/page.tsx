import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { EventsManagement } from './events-management';

export default async function AdminEventsPage() {
  const session = await auth();

  if (!session) {
    redirect('/admin');
  }

  return <EventsManagement />;
}
