'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { Calendar, User, Music, Image as ImageIcon, Heart, Mail } from 'lucide-react';
import { GeoCluster } from '@/components/GeometricDecor';
import { CelebrityProfile } from '@/types';
import { getSiteText } from '@/lib/siteTexts';
import { scrollTabIntoZone } from '@/lib/scrollTabIntoZone';

export default function Navbar({ profile }: { profile?: CelebrityProfile }) {
  const t = (id: string) => getSiteText(profile?.siteTexts, id);
  const pathname = usePathname();
  const [activeSection, setActiveSection] = useState<string>('schedule');
  const mobileNavRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (pathname !== '/') return;

    // Check initial hash
    const initialHash = window.location.hash.replace('#', '');
    if (initialHash && ['schedule', 'about', 'gallery', 'contact'].includes(initialHash)) {
      setActiveSection(initialHash);
    }

    const handleHashChange = () => {
      const h = window.location.hash.replace('#', '');
      if (h && ['schedule', 'about', 'gallery', 'contact'].includes(h)) {
        setActiveSection(h);
      }
    };
    window.addEventListener('hashchange', handleHashChange);

    // Scroll spy for smooth section tracking
    const sectionIds = ['schedule', 'about', 'gallery', 'contact'];
    const handleScroll = () => {
      const scrollPosition = window.scrollY + 220;
      for (let i = sectionIds.length - 1; i >= 0; i--) {
        const el = document.getElementById(sectionIds[i]);
        if (el) {
          const top = el.offsetTop;
          if (scrollPosition >= top) {
            setActiveSection(sectionIds[i]);
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    return () => {
      window.removeEventListener('hashchange', handleHashChange);
      window.removeEventListener('scroll', handleScroll);
    };
  }, [pathname]);

  const musicNavText = 'Âm nhạc/Show';

  const isScheduleActive = pathname === '/' && activeSection === 'schedule';
  const isMusicActive = pathname === '/music';
  const isAboutActive = pathname === '/' && activeSection === 'about';
  const isGalleryActive = pathname === '/' && activeSection === 'gallery';
  const isContactActive = pathname === '/' && activeSection === 'contact';
  const isCornerActive = pathname === '/goc-nho';

  // Active / inactive button styles
  const activeClass = 'bg-brand-yellow hover:bg-yellow-400 text-black font-black shadow-brutal-sm border-2 border-black';
  const inactiveClass = 'bg-white hover:bg-amber-100/70 text-black font-bold border-2 border-black';

  const navItems = [
    {
      key: 'schedule',
      href: '/#schedule',
      label: t('header_nav_schedule'),
      icon: Calendar,
      iconClass: 'text-brand-red',
      active: isScheduleActive,
      onClick: () => setActiveSection('schedule'),
    },
    {
      key: 'music',
      href: '/music',
      label: musicNavText,
      icon: Music,
      iconClass: 'text-purple-700',
      active: isMusicActive,
      onClick: undefined,
    },
    {
      key: 'about',
      href: '/#about',
      label: t('header_nav_about'),
      icon: User,
      iconClass: 'text-brand-blue',
      active: isAboutActive,
      onClick: () => setActiveSection('about'),
    },
    {
      key: 'gallery',
      href: '/#gallery',
      label: t('header_nav_gallery'),
      icon: ImageIcon,
      iconClass: 'text-brand-green',
      active: isGalleryActive,
      onClick: () => setActiveSection('gallery'),
    },
    {
      key: 'contact',
      href: '/#contact',
      label: t('header_nav_contact'),
      icon: Mail,
      iconClass: 'text-brand-red',
      active: isContactActive,
      onClick: () => setActiveSection('contact'),
    },
  ];

  const activeKey = navItems.find((item) => item.active)?.key;

  useEffect(() => {
    const nav = mobileNavRef.current;
    if (!nav || !activeKey) return;
    const tab = nav.querySelector<HTMLElement>(`[data-nav-key="${activeKey}"]`);
    scrollTabIntoZone(nav, tab);
  }, [activeKey, pathname]);

  const renderNavLink = (item: (typeof navItems)[number]) => {
    const Icon = item.icon;
    return (
      <Link
        key={item.key}
        href={item.href}
        data-nav-key={item.key}
        onClick={(event) => {
          item.onClick?.();
          scrollTabIntoZone(mobileNavRef.current, event.currentTarget);
        }}
        className={`neo-btn shrink-0 text-sm px-3.5 py-1.5 flex items-center gap-1.5 whitespace-nowrap transition-all ${
          item.active ? activeClass : inactiveClass
        }`}
      >
        <Icon className={`w-4 h-4 ${item.iconClass}`} />
        <span>{item.label}</span>
      </Link>
    );
  };

  return (
    <header className="sticky top-0 z-50 w-full max-w-full bg-[#faf7f2]/95 backdrop-blur border-b-3 border-black">
      <div className="max-w-7xl mx-auto px-4 sm:px-8 py-3">
        <div className="flex items-center justify-between gap-3 min-w-0">
          <Link href="/" className="flex items-center gap-2 sm:gap-3 group min-w-0">
            <div className="w-11 h-11 shrink-0 relative bg-brand-yellow rounded-xl border-2 border-black shadow-brutal-sm flex items-center justify-center overflow-hidden p-1 group-hover:rotate-6 transition-transform">
              <Image
                src="/images/logo 3.png"
                alt="OwO Logo Mascot"
                width={40}
                height={40}
                className="object-contain"
              />
            </div>
            <div className="min-w-0 flex flex-col justify-center">
              <div className="flex items-center gap-2 leading-none min-w-0">
                <span className="text-xl sm:text-2xl font-black tracking-tight text-black font-cocogoose truncate">
                  {t('header_logo_title')}
                </span>
                <span className="hidden sm:inline-flex text-[10px] sm:text-[11px] bg-brand-red text-white px-2.5 py-0.5 rounded-full border border-black shadow-brutal-xs font-bold uppercase tracking-wider items-center shrink-0">
                  {t('header_logo_badge')}
                </span>
                <GeoCluster className="hidden xl:inline-flex ml-1" />
              </div>
              <span className="text-sm uppercase font-bold text-gray-600 tracking-wider block mt-1 truncate sm:hidden">
                {t('header_logo_badge')}
              </span>
              <span className="hidden sm:block text-[10px] uppercase font-bold text-gray-600 tracking-wider mt-1.5 truncate">
                {t('header_logo_subtitle')}
              </span>
            </div>
          </Link>

          <nav className="hidden md:flex items-center gap-2 shrink-0" aria-label="Mục chính">
            {navItems.map(renderNavLink)}
          </nav>

          <Link
            href="/goc-nho"
            className={`neo-btn shrink-0 text-sm px-3 py-1.5 flex items-center gap-1.5 transition-all ${
              isCornerActive ? activeClass : 'bg-white hover:bg-brand-pink text-black font-bold border-2 border-black'
            }`}
          >
            <Heart className="w-4 h-4 text-brand-red" />
            <span className="sm:hidden">{t('header_nav_corner_short')}</span>
            <span className="hidden sm:inline">{t('header_nav_corner')}</span>
          </Link>
        </div>

        <nav
          ref={mobileNavRef}
          aria-label="Mục chính"
          className="md:hidden mt-3 flex gap-2 overflow-x-auto overscroll-x-contain pb-1 min-w-0"
        >
          {navItems.map(renderNavLink)}
        </nav>
      </div>
    </header>
  );
}
