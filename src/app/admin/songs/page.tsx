import { checkAdminAuth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { getSongs, getShows } from '@/lib/db';
import SongsManagerClient from '@/components/admin/SongsManagerClient';

export const dynamic = 'force-dynamic';

export default async function AdminSongsPage() {
  const isAuth = await checkAdminAuth();
  if (!isAuth) {
    redirect('/admin/login');
  }

  const [songs, shows] = await Promise.all([getSongs(), getShows()]);

  return <SongsManagerClient initialSongs={songs} initialShows={shows} />;
}

