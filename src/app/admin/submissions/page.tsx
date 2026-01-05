import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { SubmissionsManagement } from './submissions-management';

export default async function AdminSubmissionsPage() {
  const session = await auth();

  if (!session) {
    redirect('/admin');
  }

  return <SubmissionsManagement />;
}
