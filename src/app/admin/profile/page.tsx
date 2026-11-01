import { checkAdminAuth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { getProfile } from '@/lib/db';
import ProfileManagerClient from '@/components/admin/ProfileManagerClient';

export const dynamic = 'force-dynamic';

export default async function AdminProfilePage() {
  const isAuth = await checkAdminAuth();
  if (!isAuth) {
    redirect('/admin/login');
  }

  const profile = await getProfile();

  return <ProfileManagerClient initialProfile={profile} />;
}

