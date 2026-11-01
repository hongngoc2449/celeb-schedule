import Image from 'next/image';
import Link from 'next/link';
import { CelebrityProfile } from '@/types';
import { getSiteText } from '@/lib/siteTexts';

export default function Footer({ profile }: { profile?: CelebrityProfile }) {
  const t = (id: string) => getSiteText(profile?.siteTexts, id);

  return (
    <footer className="border-t-3 border-black bg-white py-10 px-4 sm:px-8">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 relative bg-brand-yellow rounded-xl border-2 border-black shadow-brutal-sm flex items-center justify-center overflow-hidden p-1">
            <Image
              src="/images/logo 3.png"
              alt="OwO Logo Mascot"
              width={36}
              height={36}
              className="object-contain"
            />
          </div>
          <div>
            <span className="text-lg font-black tracking-tight text-black font-cocogoose">
              OFFSET W OSAD • FANDOM Ô MAI
            </span>
            <p className="text-[11px] font-bold text-gray-500">
              {t('footer_copyright')}
            </p>
          </div>
        </div>

        {/* Links & Disclaimer */}
        <div className="flex flex-col md:items-end gap-2">
          <div className="flex flex-wrap items-center justify-center gap-3 text-xs font-bold text-gray-600">
            <Link href="/#schedule" className="hover:text-black hover:underline">Lịch Trình</Link>
            <span>•</span>
            <Link href="/music" className="text-purple-700 hover:underline font-black">Âm nhạc/Show</Link>
            <span>•</span>
            <Link href="/#about" className="hover:text-black hover:underline">Tiểu Sử</Link>
            <span>•</span>
            <Link href="/#gallery" className="hover:text-black hover:underline">Thư Viện Ảnh</Link>
            <span>•</span>
            <Link href="/#contact" className="hover:text-black hover:underline">Liên Hệ Blog</Link>
            <span>•</span>
            <Link href="/admin" className="text-brand-red hover:underline font-black">
              Admin
            </Link>
          </div>
          <p className="text-[11px] italic font-semibold text-gray-500">
            &quot;{t('footer_quote')}&quot;
          </p>
        </div>
      </div>
    </footer>
  );
}
