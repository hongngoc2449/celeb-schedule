'use client';

import { useEffect, useRef } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Calendar, Music, Image as ImageIcon, User, LogOut, ExternalLink, KeyRound } from 'lucide-react';
import { scrollTabIntoZone } from '@/lib/scrollTabIntoZone';

export default function AdminNavClient() {
  const pathname = usePathname();
  const router = useRouter();
  const navRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const nav = navRef.current;
    if (!nav) return;
    const tab = nav.querySelector<HTMLElement>('[data-active="true"]');
    scrollTabIntoZone(nav, tab);
  }, [pathname]);

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
    { href: '/admin/songs', label: 'Âm Nhạc & Show', icon: Music },
    { href: '/admin/gallery', label: 'Thư Viện Ảnh', icon: ImageIcon },
    { href: '/admin/profile', label: 'Cập Nhật Profile', icon: User },
    { href: '/admin/accounts', label: 'Tài Khoản & Mật Khẩu', icon: KeyRound },
  ];

  return (
    <div className="flex w-full min-w-0 flex-col gap-2 md:w-auto md:flex-row md:flex-wrap md:items-center">
      <nav
        ref={navRef}
        aria-label="Mục quản trị"
        className="flex gap-2 overflow-x-auto overscroll-x-contain pb-1 min-w-0 md:flex-wrap md:overflow-visible md:pb-0"
      >
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              data-active={isActive ? 'true' : 'false'}
              onClick={(event) => scrollTabIntoZone(navRef.current, event.currentTarget)}
              className={`neo-btn shrink-0 whitespace-nowrap text-sm px-3 py-1.5 gap-1.5 ${
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
      </nav>

      <div className="hidden md:block h-6 w-[2px] bg-black/20 mx-1" />

      <div className="flex items-center gap-2 shrink-0">
        <Link
          href="/"
          target="_blank"
          className="neo-btn bg-white hover:bg-brand-lightblue text-sm px-3 py-1.5 gap-1.5"
        >
          <ExternalLink className="w-3.5 h-3.5" />
          <span>Xem Web</span>
        </Link>

        <button
          onClick={handleLogout}
          className="neo-btn bg-brand-red text-white hover:bg-red-700 text-sm px-3 py-1.5 gap-1.5"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Thoát</span>
        </button>
      </div>
    </div>
  );
}
