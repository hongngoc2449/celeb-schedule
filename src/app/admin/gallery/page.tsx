import { checkAdminAuth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { getGallery } from '@/lib/db';
import GalleryManagerClient from '@/components/admin/GalleryManagerClient';

export const dynamic = 'force-dynamic';

export default async function AdminGalleryPage() {
  const isAuth = await checkAdminAuth();
  if (!isAuth) {
    redirect('/admin/login');
  }

  const gallery = await getGallery();

  return <GalleryManagerClient initialGallery={gallery} />;
}

