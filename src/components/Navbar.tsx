'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { Calendar, User, Music, Image as ImageIcon, Shield } from 'lucide-react';
import { GeoCluster } from '@/components/GeometricDecor';
import { CelebrityProfile } from '@/types';
import { getSiteText } from '@/lib/siteTexts';

export default function Navbar({ profile }: { profile?: CelebrityProfile }) {
  const t = (id: string) => getSiteText(profile?.siteTexts, id);
  const pathname = usePathname();
  const [activeSection, setActiveSection] = useState<string>('schedule');

  useEffect(() => {
    if (pathname !== '/') return;

    // Check initial hash
    const initialHash = window.location.hash.replace('#', '');
    if (initialHash && ['schedule', 'about', 'gallery'].includes(initialHash)) {
      setActiveSection(initialHash);
    }

    const handleHashChange = () => {
      const h = window.location.hash.replace('#', '');
      if (h && ['schedule', 'about', 'gallery'].includes(h)) {
        setActiveSection(h);
      }
    };
    window.addEventListener('hashchange', handleHashChange);

    // Scroll spy for smooth section tracking
    const sectionIds = ['schedule', 'about', 'gallery'];
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

  const rawMusicText = t('header_nav_music');
  const musicNavText =
    !rawMusicText || rawMusicText === 'Âm Nhạc' || rawMusicText === 'Âm Nhạc & Show'
      ? 'Âm nhạc/Show'
      : rawMusicText;

  const isScheduleActive = pathname === '/' && activeSection === 'schedule';
  const isMusicActive = pathname === '/music';
  const isAboutActive = pathname === '/' && activeSection === 'about';
  const isGalleryActive = pathname === '/' && activeSection === 'gallery';
  const isAdminActive = pathname.startsWith('/admin');

  // Active / inactive button styles
  const activeClass = 'bg-brand-yellow hover:bg-yellow-400 text-black font-black shadow-brutal-sm border-2 border-black';
  const inactiveClass = 'bg-white hover:bg-amber-100/70 text-black font-bold border-2 border-black';

  return (
    <header className="sticky top-0 z-50 bg-[#faf7f2]/95 backdrop-blur border-b-3 border-black py-3 px-4 sm:px-8">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Brand / Logo */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-11 h-11 relative bg-brand-yellow rounded-xl border-2 border-black shadow-brutal-sm flex items-center justify-center overflow-hidden p-1 group-hover:rotate-6 transition-transform">
            <Image
              src="/images/logo 3.png"
              alt="OwO Logo Mascot"
              width={40}
              height={40}
              className="object-contain"
            />
          </div>
          <div className="flex flex-col justify-center">
            <div className="flex items-center gap-2 leading-none">
              <span className="text-xl sm:text-2xl font-black tracking-tight text-black font-cocogoose">
                {t('header_logo_title')}
              </span>
              <span className="text-[10px] sm:text-[11px] bg-brand-red text-white px-2.5 py-0.5 rounded-full border border-black shadow-brutal-xs font-bold uppercase tracking-wider inline-flex items-center">
                {t('header_logo_badge')}
              </span>
              <GeoCluster className="hidden xl:inline-flex ml-1" />
            </div>
            <span className="text-[10px] uppercase font-bold text-gray-600 tracking-wider block mt-1.5">
              {t('header_logo_subtitle')}
            </span>
          </div>
        </Link>

        {/* Navigation Links */}
        <nav className="hidden md:flex items-center gap-2">
          <Link
            href="/#schedule"
            onClick={() => setActiveSection('schedule')}
            className={`neo-btn text-sm px-3.5 py-1.5 flex items-center gap-1.5 transition-all ${
              isScheduleActive ? activeClass : inactiveClass
            }`}
          >
            <Calendar className="w-4 h-4 text-brand-red" />
            <span>{t('header_nav_schedule')}</span>
          </Link>

          <Link
            href="/music"
            className={`neo-btn text-sm px-3.5 py-1.5 flex items-center gap-1.5 transition-all ${
              isMusicActive ? activeClass : inactiveClass
            }`}
          >
            <Music className="w-4 h-4 text-purple-700" />
            <span>{musicNavText}</span>
          </Link>

          <Link
            href="/#about"
            onClick={() => setActiveSection('about')}
            className={`neo-btn text-sm px-3.5 py-1.5 flex items-center gap-1.5 transition-all ${
              isAboutActive ? activeClass : inactiveClass
            }`}
          >
            <User className="w-4 h-4 text-brand-blue" />
            <span>{t('header_nav_about')}</span>
          </Link>

          <Link
            href="/#gallery"
            onClick={() => setActiveSection('gallery')}
            className={`neo-btn text-sm px-3.5 py-1.5 flex items-center gap-1.5 transition-all ${
              isGalleryActive ? activeClass : inactiveClass
            }`}
          >
            <ImageIcon className="w-4 h-4 text-brand-green" />
            <span>{t('header_nav_gallery')}</span>
          </Link>
        </nav>

        {/* Admin Link */}
        <div className="flex items-center gap-2">
          <Link
            href="/admin"
            className={`neo-btn text-xs sm:text-sm px-3 py-1.5 flex items-center gap-1.5 transition-all ${
              isAdminActive ? activeClass : 'bg-white hover:bg-brand-red hover:text-white text-black font-bold border-2 border-black'
            }`}
          >
            <Shield className="w-4 h-4" />
            <span>Admin</span>
          </Link>
        </div>
      </div>
    </header>
  );
}
