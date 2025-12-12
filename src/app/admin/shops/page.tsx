import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { ShopsManagement } from './shops-management';

export default async function AdminShopsPage() {
  const session = await auth();

  if (!session) {
    redirect('/admin');
  }

  return <ShopsManagement />;
}
