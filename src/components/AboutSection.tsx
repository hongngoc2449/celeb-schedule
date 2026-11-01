import Image from 'next/image';
import { CelebrityProfile } from '@/types';
import { Award, Music, Heart, Mic2, Facebook, Instagram, Youtube, ExternalLink, Globe } from 'lucide-react';
import { GeoCircle, GeoS, GeoTriangle, GeoSquare, GeoCluster } from '@/components/GeometricDecor';
import { getSiteText } from '@/lib/siteTexts';

function SpotifyIcon({ className = 'w-5 h-5' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z" />
    </svg>
  );
}

function TikTokIcon({ className = 'w-5 h-5' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 3 15.67 6.34 6.34 0 0 0 9.34 22a6.34 6.34 0 0 0 6.33-6.33V8.89a8.28 8.28 0 0 0 4.84 1.57v-3.45a4.85 4.85 0 0 1-.92-.32z" />
    </svg>
  );
}

export default function AboutSection({ profile }: { profile: CelebrityProfile }) {
  const t = (id: string) => getSiteText(profile?.siteTexts, id);

  const socials = {
    facebook: profile.socialLinks?.facebook || 'https://www.facebook.com/share/1F3py3TZaL/?mibextid=wwXIfr',
    instagram: profile.socialLinks?.instagram || 'https://www.instagram.com/osad_chutich/',
    tiktok: profile.socialLinks?.tiktok || 'https://www.tiktok.com/@osad_official',
    youtube: profile.socialLinks?.youtube || 'https://www.youtube.com/@OSADOfficial',
    spotify: profile.socialLinks?.spotify || 'https://open.spotify.com/artist/4XgN7863Xb3w00Z9zFwz8i',
  };

  return (
    <section id="about" className="py-16 sm:py-24 px-4 sm:px-8 border-b-3 border-black bg-white relative overflow-hidden">
      {/* Background Geometric Icons */}
      <div className="absolute top-10 right-8 hidden md:block opacity-40 rotate-12 pointer-events-none">
        <GeoSquare className="w-10 h-10" color="#EA580C" />
      </div>
      <div className="absolute bottom-10 left-8 hidden md:block opacity-40 -rotate-12 pointer-events-none">
        <GeoCircle className="w-10 h-10" color="#DC2626" />
      </div>

      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12 space-y-3">
          <div className="inline-flex items-center gap-2">
            <span className="neo-sticker bg-brand-pink text-black -rotate-1 text-xs sm:text-sm font-black">
              {t('about_header_tag')}
            </span>
            <GeoCluster className="hidden sm:inline-flex" />
          </div>
          <h2 className="text-3xl sm:text-5xl font-black text-black uppercase font-cocogoose">
            {t('about_section_title')}
          </h2>
          <p className="text-gray-700 text-sm sm:text-base font-semibold max-w-xl mx-auto">
            {t('about_section_desc')}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Left: Graphic Card with Mascot */}
          <div className="lg:col-span-5 flex justify-center">
            <div className="relative w-full max-w-sm aspect-square bg-[#fff8db] border-3 border-black rounded-3xl p-6 shadow-brutal flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="neo-sticker bg-brand-yellow text-black text-xs font-black">
                  OFFSET W OSAD
                </span>
                <span className="text-xs font-black text-brand-red bg-red-100 px-2 py-0.5 rounded border border-black">
                  FANDOM Ô MAI
                </span>
              </div>

              {/* Mascot Logo Center */}
              <div className="flex flex-col items-center justify-center py-2">
                <div className="w-36 h-20 relative mb-1">
                  <Image
                    src="/images/logo 2.png"
                    alt="Logo OFFSET W OSAD"
                    fill
                    className="object-contain"
                  />
                </div>
                <h3 className="text-xl font-black text-black font-cocogoose">{t('about_card_title')}</h3>
                <p className="text-xs font-bold text-brand-red uppercase">{t('about_card_subtitle')}</p>

                {/* Social Icon Pills on Mascot Card */}
                <div className="flex items-center justify-center gap-2 mt-3 pt-2.5 border-t-2 border-black/10 w-full">
                  <a
                    href={socials.facebook}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-8 h-8 rounded-lg bg-[#1877F2] text-white border-2 border-black shadow-brutal-xs flex items-center justify-center hover:scale-110 hover:-translate-y-0.5 transition-all"
                    title="Facebook"
                  >
                    <Facebook className="w-4 h-4 fill-current" />
                  </a>
                  <a
                    href={socials.instagram}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-8 h-8 rounded-lg bg-gradient-to-tr from-[#f09433] via-[#dc2743] to-[#bc1888] text-white border-2 border-black shadow-brutal-xs flex items-center justify-center hover:scale-110 hover:-translate-y-0.5 transition-all"
                    title="Instagram"
                  >
                    <Instagram className="w-4 h-4" />
                  </a>
                  <a
                    href={socials.tiktok}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-8 h-8 rounded-lg bg-black text-white border-2 border-black shadow-brutal-xs flex items-center justify-center hover:scale-110 hover:-translate-y-0.5 transition-all"
                    title="TikTok"
                  >
                    <TikTokIcon className="w-4 h-4" />
                  </a>
                  <a
                    href={socials.youtube}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-8 h-8 rounded-lg bg-[#FF0000] text-white border-2 border-black shadow-brutal-xs flex items-center justify-center hover:scale-110 hover:-translate-y-0.5 transition-all"
                    title="YouTube"
                  >
                    <Youtube className="w-4 h-4" />
                  </a>
                  <a
                    href={socials.spotify}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-8 h-8 rounded-lg bg-[#1DB954] text-black border-2 border-black shadow-brutal-xs flex items-center justify-center hover:scale-110 hover:-translate-y-0.5 transition-all"
                    title="Spotify"
                  >
                    <SpotifyIcon className="w-4 h-4" />
                  </a>
                </div>
              </div>

              <div className="bg-white border-2 border-black rounded-xl p-3 text-center shadow-brutal-sm">
                <p className="text-xs font-bold text-gray-800">
                  &quot;{t('about_card_quote')}&quot;
                </p>
              </div>
            </div>
          </div>

          {/* Right: Bio Details & Badges */}
          <div className="lg:col-span-7 space-y-6">
            <div className="neo-box p-6 sm:p-8 bg-brand-paper space-y-4">
              <h3 className="text-2xl font-black text-black uppercase font-cocogoose flex items-center gap-2">
                <Mic2 className="w-6 h-6 text-brand-red" />
                Về {profile.stageName} ({profile.title})
              </h3>
              <p className="text-sm sm:text-base text-gray-800 font-semibold leading-relaxed">
                {profile.bio}
              </p>

              {/* Key Highlights Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <div className="p-3 bg-white border-2 border-black rounded-xl shadow-brutal-sm flex items-start gap-3">
                  <Award className="w-6 h-6 text-amber-500 shrink-0 mt-0.5" />
                  <div>
                    <h5 className="font-extrabold text-sm text-black">{t('about_highlight_1_title')}</h5>
                    <p className="text-xs font-semibold text-gray-600">{t('about_highlight_1_desc')}</p>
                  </div>
                </div>

                <div className="p-3 bg-white border-2 border-black rounded-xl shadow-brutal-sm flex items-start gap-3">
                  <Music className="w-6 h-6 text-brand-blue shrink-0 mt-0.5" />
                  <div>
                    <h5 className="font-extrabold text-sm text-black">{t('about_highlight_2_title')}</h5>
                    <p className="text-xs font-semibold text-gray-600">{t('about_highlight_2_desc')}</p>
                  </div>
                </div>

                <div className="p-3 bg-white border-2 border-black rounded-xl shadow-brutal-sm flex items-start gap-3">
                  <Heart className="w-6 h-6 text-brand-red shrink-0 mt-0.5" />
                  <div>
                    <h5 className="font-extrabold text-sm text-black">{t('about_highlight_3_title')}</h5>
                    <p className="text-xs font-semibold text-gray-600">{t('about_highlight_3_desc')}</p>
                  </div>
                </div>

                <div className="p-3 bg-white border-2 border-black rounded-xl shadow-brutal-sm flex items-start gap-3">
                  <span className="text-xl">🎹</span>
                  <div>
                    <h5 className="font-extrabold text-sm text-black">{t('about_highlight_4_title')}</h5>
                    <p className="text-xs font-semibold text-gray-600">{t('about_highlight_4_desc')}</p>
                  </div>
                </div>
              </div>

              {/* Official Social Media Channels Grid */}
              <div className="pt-2">
                <div className="p-4 bg-white border-2 border-black rounded-xl shadow-brutal-sm space-y-3">
                  <div className="flex items-center gap-2 border-b border-gray-200 pb-2">
                    <span className="neo-sticker bg-brand-yellow text-black text-[10px] font-black">
                      OFFICIAL SOCIALS
                    </span>
                    <h4 className="font-black text-sm text-black font-cocogoose">
                      {t('about_social_title')}
                    </h4>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
                    {/* Facebook */}
                    <a
                      href={socials.facebook}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2.5 rounded-xl border-2 border-black bg-[#1877F2] text-white flex flex-col items-center justify-center gap-1 shadow-brutal-xs hover:-translate-y-1 hover:shadow-brutal transition-all group"
                      title="Facebook Fanpage"
                    >
                      <Facebook className="w-5 h-5 fill-current group-hover:scale-110 transition-transform" />
                      <span className="text-[11px] font-black tracking-tight">Facebook</span>
                    </a>

                    {/* Instagram */}
                    <a
                      href={socials.instagram}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2.5 rounded-xl border-2 border-black bg-gradient-to-tr from-[#f09433] via-[#dc2743] to-[#bc1888] text-white flex flex-col items-center justify-center gap-1 shadow-brutal-xs hover:-translate-y-1 hover:shadow-brutal transition-all group"
                      title="Instagram @osad_chutich"
                    >
                      <Instagram className="w-5 h-5 group-hover:scale-110 transition-transform" />
                      <span className="text-[11px] font-black tracking-tight">Instagram</span>
                    </a>

                    {/* TikTok */}
                    <a
                      href={socials.tiktok}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2.5 rounded-xl border-2 border-black bg-black text-white flex flex-col items-center justify-center gap-1 shadow-brutal-xs hover:-translate-y-1 hover:shadow-brutal transition-all group"
                      title="TikTok @osad_official"
                    >
                      <TikTokIcon className="w-5 h-5 group-hover:scale-110 transition-transform" />
                      <span className="text-[11px] font-black tracking-tight">TikTok</span>
                    </a>

                    {/* YouTube */}
                    <a
                      href={socials.youtube}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2.5 rounded-xl border-2 border-black bg-[#FF0000] text-white flex flex-col items-center justify-center gap-1 shadow-brutal-xs hover:-translate-y-1 hover:shadow-brutal transition-all group"
                      title="YouTube OSAD Official"
                    >
                      <Youtube className="w-5 h-5 group-hover:scale-110 transition-transform" />
                      <span className="text-[11px] font-black tracking-tight">YouTube</span>
                    </a>

                    {/* Spotify */}
                    <a
                      href={socials.spotify}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2.5 rounded-xl border-2 border-black bg-[#1DB954] text-black flex flex-col items-center justify-center gap-1 shadow-brutal-xs hover:-translate-y-1 hover:shadow-brutal transition-all group"
                      title="Spotify Nghệ Sĩ OSAD"
                    >
                      <SpotifyIcon className="w-5 h-5 group-hover:scale-110 transition-transform" />
                      <span className="text-[11px] font-black tracking-tight">Spotify</span>
                    </a>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
