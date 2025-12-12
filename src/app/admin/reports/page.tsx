import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { ReportsManagement } from './reports-management';

export default async function AdminReportsPage() {
  const session = await auth();

  if (!session) {
    redirect('/admin');
  }

  return <ReportsManagement />;
}
