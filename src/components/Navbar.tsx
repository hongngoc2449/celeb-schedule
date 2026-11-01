'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Calendar, User, Music, Image as ImageIcon, Shield } from 'lucide-react';
import { GeoCluster } from '@/components/GeometricDecor';

export default function Navbar() {
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
                OwO
              </span>
              <span className="text-[10px] sm:text-[11px] bg-brand-red text-white px-2.5 py-0.5 rounded-full border border-black shadow-brutal-xs font-bold uppercase tracking-wider inline-flex items-center">
                BẢO TRỢ KÍP NỔ
              </span>
              <GeoCluster className="hidden xl:inline-flex ml-1" />
            </div>
            <span className="text-[10px] uppercase font-bold text-gray-600 tracking-wider block mt-1.5">
              Offset with OSAD • Fandom Ô Mai
            </span>
          </div>
        </Link>

        {/* Navigation Links */}
        <nav className="hidden md:flex items-center gap-2">
          <Link
            href="/#schedule"
            className="neo-btn bg-white hover:bg-brand-yellow text-black text-sm px-3.5 py-1.5 flex items-center gap-1.5"
          >
            <Calendar className="w-4 h-4 text-brand-red" />
            Lịch Trình
          </Link>
          <Link
            href="/music"
            className="neo-btn bg-brand-yellow hover:bg-yellow-400 text-black text-sm px-3.5 py-1.5 flex items-center gap-1.5 font-black shadow-brutal-sm"
          >
            <Music className="w-4 h-4 text-purple-700" />
            Âm Nhạc (96+ Hit)
          </Link>
          <Link
            href="/#about"
            className="neo-btn bg-white hover:bg-brand-pink text-black text-sm px-3.5 py-1.5 flex items-center gap-1.5"
          >
            <User className="w-4 h-4 text-brand-blue" />
            Tiểu Sử
          </Link>
          <Link
            href="/#gallery"
            className="neo-btn bg-white hover:bg-brand-lightgreen text-black text-sm px-3.5 py-1.5 flex items-center gap-1.5"
          >
            <ImageIcon className="w-4 h-4 text-brand-green" />
            Thư Viện
          </Link>
        </nav>

        {/* Admin Link */}
        <div className="flex items-center gap-2">
          <Link
            href="/admin"
            className="neo-btn bg-white hover:bg-brand-red hover:text-white text-black text-xs sm:text-sm px-3 py-1.5 flex items-center gap-1.5"
          >
            <Shield className="w-4 h-4" />
            <span>Admin</span>
          </Link>
        </div>
      </div>
    </header>
  );
}
