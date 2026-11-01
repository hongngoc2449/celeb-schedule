import { checkAdminAuth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { getSchedules } from '@/lib/db';
import ScheduleManagerClient from '@/components/admin/ScheduleManagerClient';

export const dynamic = 'force-dynamic';

export default async function AdminSchedulesPage() {
  const isAuth = await checkAdminAuth();
  if (!isAuth) {
    redirect('/admin/login');
  }

  const schedules = await getSchedules();

  return <ScheduleManagerClient initialSchedules={schedules} />;
}

