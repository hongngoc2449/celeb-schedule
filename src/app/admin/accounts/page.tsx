import { checkAdminAuth, getAdminSession } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { getAdminUsers } from '@/lib/db';
import AccountsManagerClient from '@/components/admin/AccountsManagerClient';

export const dynamic = 'force-dynamic';

export default async function AdminAccountsPage() {
  const isAuth = await checkAdminAuth();
  if (!isAuth) {
    redirect('/admin/login');
  }

  const session = await getAdminSession();
  const users = await getAdminUsers();

  return (
    <AccountsManagerClient
      initialUsers={users}
      currentUsername={session?.user || 'admin'}
    />
  );
}

