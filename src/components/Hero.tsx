import Image from 'next/image';
import Link from 'next/link';
import { Calendar, Music, ArrowDown } from 'lucide-react';
import { CelebrityProfile } from '@/types';
import {
  GeoCircle,
  GeoS,
  GeoTriangle,
  GeoSquare,
  OsadOmaiStampBadge
} from '@/components/GeometricDecor';
import { getSiteText } from '@/lib/siteTexts';

export default function Hero({ profile }: { profile: CelebrityProfile }) {
  const t = (id: string) => getSiteText(profile?.siteTexts, id);

  const heroDesc = (t('hero_description') || '').replace(/Ca sĩ/gi, 'Songwriter');
  const heroSubBadge = (t('hero_photo_badge_sub') || '').replace(/SINGER/gi, 'SONGWRITER');
  const rawSticker = t('hero_photo_sticker') || '';
  const heroSticker = rawSticker.includes('NHÀ Ô MAI CHÍNH THỨC') ? 'Offset with OSAD' : (rawSticker || 'Offset with OSAD');
  const rawHeroBtnMusic = t('hero_btn_music') || '';
  const heroBtnMusic = rawHeroBtnMusic.replace(/\s*\(\d+\+?\s*Bài\)/gi, '').replace(/\s*96\+?\s*/gi, '').trim() || 'Kho Âm Nhạc & Show';

  // Use the new BAZAAR portrait image, falling back gracefully
  const avatarSrc =
    profile?.avatarUrl &&
    profile.avatarUrl !== '/images/avt-opt.png' &&
    !profile.avatarUrl.includes('avt.png')
      ? profile.avatarUrl
      : '/images/hero-bazaar.jpg';

  return (
    <section className="relative overflow-hidden py-10 lg:py-16 px-4 sm:px-8 border-b-3 border-black bg-[#fef7ee]">
      {/* Playful Floating Geometric Background Shapes */}
      <div className="absolute top-8 left-6 hidden lg:flex items-center gap-3 opacity-70 -rotate-12 pointer-events-none select-none">
        <GeoCircle className="w-10 h-10" strokeWidth={3.5} color="#DC2626" />
        <GeoS className="w-9 h-9" strokeWidth={3.5} color="#2563EB" />
      </div>

      <div className="absolute top-12 right-12 hidden lg:flex items-center gap-3 opacity-70 rotate-12 pointer-events-none select-none">
        <GeoTriangle className="w-10 h-10" strokeWidth={3.5} color="#16A34A" />
        <GeoSquare className="w-9 h-9" strokeWidth={3.5} color="#D97706" />
      </div>

      <div className="absolute bottom-6 left-1/3 hidden md:block opacity-50 rotate-45 pointer-events-none select-none">
        <GeoS className="w-7 h-7" strokeWidth={3} color="#2563EB" />
      </div>

      <div className="absolute top-1/2 right-10 hidden md:block opacity-60 -rotate-6 pointer-events-none select-none">
        <GeoTriangle className="w-8 h-8" strokeWidth={3} color="#16A34A" />
      </div>

      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-10 items-center relative z-10">
        {/* Left Column: Text & Badges */}
        <div className="lg:col-span-7 xl:col-span-8 space-y-6">
          {/* Top Stickers */}
          <div className="flex flex-wrap items-center gap-2.5">
            <span className="neo-sticker bg-brand-red text-white -rotate-2 text-xs sm:text-sm">
              {t('hero_sticker_hot')}
            </span>
            <span className="neo-sticker bg-brand-yellow text-black rotate-1 text-xs sm:text-sm font-black">
              {t('hero_sticker_fandom')}
            </span>
            <div className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 bg-white rounded-full border-2 border-black shadow-brutal-xs">
              <GeoCircle className="w-3.5 h-3.5" strokeWidth={4} color="#DC2626" />
              <GeoS className="w-3.5 h-3.5" strokeWidth={4} color="#2563EB" />
              <GeoTriangle className="w-3.5 h-3.5" strokeWidth={4} color="#16A34A" />
              <GeoSquare className="w-3.5 h-3.5" strokeWidth={4} color="#D97706" />
            </div>
          </div>

          {/* Main Title */}
          <div>
            <h1 className="text-4xl sm:text-6xl xl:text-7xl font-black text-black tracking-tight leading-[1.05] uppercase font-cocogoose">
              {t('hero_title_prefix')} <br />
              <span className="inline-block bg-brand-yellow px-3 py-1 mt-2 border-3 border-black shadow-brutal rotate-1 text-black">
                {t('hero_title_highlight')}
              </span>
            </h1>
            
            {/* Description */}
            <p className="mt-4 text-base sm:text-lg text-gray-800 font-semibold max-w-2xl lg:max-w-3xl leading-relaxed">
              {heroDesc}
            </p>
          </div>

          {/* Quote Box */}
          <div className="neo-box-sm bg-white p-4 border-l-8 border-l-brand-red max-w-2xl">
            <p className="italic text-sm sm:text-base font-bold text-gray-900">
              &quot;{profile?.quote || t('hero_quote')}&quot;
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <a
              href="#schedule"
              className="neo-btn bg-brand-yellow hover:bg-yellow-400 text-black px-6 py-3 text-base sm:text-lg gap-2"
            >
              <Calendar className="w-5 h-5 text-brand-red" />
              <span>{t('hero_btn_schedule')}</span>
              <ArrowDown className="w-4 h-4" />
            </a>

            <Link
              href="/music"
              className="neo-btn bg-white hover:bg-purple-100 text-black px-5 py-3 text-base sm:text-lg gap-2 border-2 border-black shadow-brutal"
            >
              <Music className="w-5 h-5 text-purple-600" />
              <span>{heroBtnMusic}</span>
            </Link>
          </div>

          {/* Decorative OSAD OMAI Brand Tag Bar */}
          <div className="pt-2 flex flex-wrap items-center gap-3">
            <div className="inline-flex items-center gap-2 bg-white px-3 py-1.5 rounded-xl border-2 border-black shadow-brutal-xs">
              <span className="text-xs font-black uppercase text-gray-900 font-cocogoose tracking-wide">
                OSAD • OMAI
              </span>
              <div className="flex items-center gap-1.5">
                <GeoCircle className="w-4 h-4" strokeWidth={3.8} color="#DC2626" />
                <GeoS className="w-4 h-4" strokeWidth={3.8} color="#2563EB" />
                <GeoTriangle className="w-4 h-4" strokeWidth={3.8} color="#16A34A" />
                <GeoSquare className="w-4 h-4" strokeWidth={3.8} color="#D97706" />
              </div>
            </div>
            <span className="text-xs font-bold text-gray-600 uppercase tracking-wider">
              {t('hero_brand_tag')}
            </span>
          </div>
        </div>

        {/* Right Column: Visual Avatar & Collage */}
        <div className="lg:col-span-5 xl:col-span-4 flex justify-center">
          <div className="relative w-full max-w-[380px] sm:max-w-[420px] aspect-[4/5]">
            {/* Background Block behind photo */}
            <div className="absolute inset-0 bg-brand-yellow rounded-3xl border-3 border-black shadow-brutal-xl rotate-3" />
            
            {/* Photo Card */}
            <div className="absolute inset-0 bg-white rounded-3xl border-3 border-black shadow-brutal overflow-hidden -rotate-2 flex flex-col">
              <div className="relative flex-1 bg-gradient-to-b from-amber-100 to-amber-200">
                <Image
                  src={avatarSrc}
                  alt="Chủ Tịch Mai OSAD"
                  fill
                  priority
                  className="object-cover object-top"
                />
              </div>

              {/* Bottom Badge inside photo */}
              <div className="p-3 bg-white border-t-2 border-black flex items-center justify-between">
                <div>
                  <h4 className="font-black text-base text-black font-cocogoose">
                    {t('hero_photo_badge_title')}
                  </h4>
                  <p className="text-[11px] font-bold text-gray-600">
                    {heroSubBadge}
                  </p>
                </div>
                <div className="w-10 h-10 relative">
                  <Image
                    src="/images/logo 3.png"
                    alt="OSAD mascot"
                    fill
                    className="object-contain"
                  />
                </div>
              </div>
            </div>

            {/* Authentic OSAD OMAI Stamp Badge Pinned Top-Right */}
            <div className="absolute -top-5 -right-5 z-20 rotate-6 hover:rotate-0 transition-transform">
              <OsadOmaiStampBadge />
            </div>

            {/* Floating Tag Bottom-Left */}
            <div className="absolute -bottom-4 -left-4 neo-sticker bg-brand-red text-white rotate-6 text-xs sm:text-sm z-20">
              {heroSticker}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
