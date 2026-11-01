'use client';

import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Calendar, Music, Image as ImageIcon, User, LogOut, ExternalLink } from 'lucide-react';

export default function AdminNavClient() {
  const pathname = usePathname();
  const router = useRouter();

  if (pathname === '/admin/login') {
    return null;
  }

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/admin/login');
    router.refresh();
  };

  const navItems = [
    { href: '/admin', label: 'Lịch Trình', icon: Calendar },
    { href: '/admin/songs', label: 'Kho Âm Nhạc', icon: Music },
    { href: '/admin/gallery', label: 'Thư Viện Ảnh', icon: ImageIcon },
    { href: '/admin/profile', label: 'Cập Nhật Profile', icon: User },
  ];

  return (
    <div className="flex flex-wrap items-center gap-2">
      <div className="flex items-center gap-1.5">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`neo-btn text-xs sm:text-sm px-3 py-1.5 gap-1.5 ${
                isActive
                  ? 'bg-brand-yellow font-black'
                  : 'bg-white hover:bg-gray-100 text-black'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </div>

      <div className="h-6 w-[2px] bg-black/20 mx-1 hidden sm:block" />

      <div className="flex items-center gap-2">
        <Link
          href="/"
          target="_blank"
          className="neo-btn bg-white hover:bg-brand-lightblue text-xs sm:text-sm px-3 py-1.5 gap-1.5"
        >
          <ExternalLink className="w-3.5 h-3.5" />
          <span>Xem Web</span>
        </Link>

        <button
          onClick={handleLogout}
          className="neo-btn bg-brand-red text-white hover:bg-red-700 text-xs sm:text-sm px-3 py-1.5 gap-1.5"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Thoát</span>
        </button>
      </div>
    </div>
  );
}
