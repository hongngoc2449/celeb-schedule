import { checkAdminAuth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { Calendar, Image as ImageIcon, User, LogOut, ExternalLink, ShieldCheck } from 'lucide-react';
import AdminNavClient from '@/components/admin/AdminNavClient';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const isAuth = await checkAdminAuth();

  return (
    <div className="min-h-screen bg-[#f3ede2] flex flex-col">
      {/* Top Admin Header */}
      <header className="bg-white border-b-3 border-black py-3 px-4 sm:px-8 sticky top-0 z-40 w-full max-w-full">
        <div className="max-w-7xl mx-auto flex flex-col gap-3 min-w-0 md:flex-row md:flex-wrap md:items-center md:justify-between">
          <div className="flex items-center gap-3">
            <Link href="/admin" className="flex items-center gap-2">
              <div className="w-9 h-9 bg-brand-yellow rounded-lg border-2 border-black p-1 flex items-center justify-center">
                <Image
                  src="/images/logo 3.png"
                  alt="OSAD"
                  width={30}
                  height={30}
                  className="object-contain"
                />
              </div>
              <div>
                <span className="font-black text-base text-black font-cocogoose">
                  ADMIN PORTAL
                </span>
                <span className="block text-[10px] font-bold text-brand-red">
                  Chủ Tịch Mai Management
                </span>
              </div>
            </Link>
          </div>

          <AdminNavClient />
        </div>
      </header>

      {/* Main Admin Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-8">
        {children}
      </main>
    </div>
  );
}

