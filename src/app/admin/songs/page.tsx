import { checkAdminAuth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { getSongs } from '@/lib/db';
import SongsManagerClient from '@/components/admin/SongsManagerClient';

export const dynamic = 'force-dynamic';

export default async function AdminSongsPage() {
  const isAuth = await checkAdminAuth();
  if (!isAuth) {
    redirect('/admin/login');
  }

  const songs = await getSongs();

  return <SongsManagerClient initialSongs={songs} />;
}

