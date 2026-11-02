import Link from 'next/link';
import { Music, Play, ArrowRight, Sparkles } from 'lucide-react';
import { GeoCluster, GeoCircle, GeoTriangle, GeoS } from '@/components/GeometricDecor';
import { CelebrityProfile, SongItem } from '@/types';
import { getSiteText } from '@/lib/siteTexts';

interface FeaturedTrackConfig {
  query: string;
  tag: string;
  color: string;
  fallback: {
    id: string;
    title: string;
    releaseDate: string;
    artists: string;
  };
}

const FEATURED_CONFIGS: FeaturedTrackConfig[] = [
  {
    query: 'người âm phủ',
    tag: 'MEGA HIT',
    color: 'bg-brand-yellow',
    fallback: {
      id: 'song-97',
      title: 'Người Âm Phủ',
      releaseDate: '10/04/2018',
      artists: 'OSAD x VRT',
    },
  },
  {
    query: 'củ lạc',
    tag: 'VIRAL HIT',
    color: 'bg-brand-pink',
    fallback: {
      id: 'song-93',
      title: 'Củ Lạc',
      releaseDate: '01/07/2018',
      artists: 'OSAD & Turn Hirn',
    },
  },
  {
    query: 'như một người rưng',
    tag: 'NEW COLLAB',
    color: 'bg-brand-lightgreen',
    fallback: {
      id: 'song-6',
      title: 'Như Một Người Rưng',
      releaseDate: '27/10/2026',
      artists: 'OSAD ft Hà An Huy',
    },
  },
  {
    query: 'thăng hoa',
    tag: 'ATVNCG',
    color: 'bg-brand-purple',
    fallback: {
      id: 'song-7',
      title: 'Thăng hoa',
      releaseDate: '10/10/2026',
      artists: 'OSAD, Jun Phạm, Hoàng Rob, Hà An Huy...',
    },
  },
  {
    query: 'đang yêu',
    tag: 'SOLO STAGE',
    color: 'bg-brand-lightblue',
    fallback: {
      id: 'song-19',
      title: 'ĐANG YÊU',
      releaseDate: '04/07/2026',
      artists: 'OSAD',
    },
  },
  {
    query: 'và tôi cũng yêu em',
    tag: 'STAGE LIVE',
    color: 'bg-amber-200',
    fallback: {
      id: 'song-10',
      title: 'VÀ TÔI CŨNG YÊU EM',
      releaseDate: '26/09/2026',
      artists: 'OSAD, Hoàng Dũng, Hà An Huy, Đông Hùng...',
    },
  },
];

export default function Discography({
  profile,
  songs = [],
}: {
  profile?: CelebrityProfile;
  songs?: SongItem[];
}) {
  const t = (id: string) => getSiteText(profile?.siteTexts, id);

  const discographyDesc = (t('discography_desc') || '')
    .replace(/96\+?\s*ca\s*khúc/gi, 'các ca khúc')
    .replace(/96\+?\s*bài\s*hát/gi, 'các bài hát');

  const bannerTitle = (t('discography_banner_title') || '')
    .replace(/96\+?\s*BÀI\s*HÁT\s*&\s*66\+?\s*SHOW/gi, 'BÀI HÁT & SHOW')
    .replace(/96\+?\s*/gi, '')
    .replace(/66\+?\s*/gi, '');

  const bannerDesc = (t('discography_banner_desc') || '')
    .replace(/66\+?\s*show/gi, 'các show')
    .replace(/96\+?\s*bài\s*hát/gi, 'các bài hát');

  // Synchronize 6 featured tracks with actual songs in Kho Nhạc
  const featuredTracks = FEATURED_CONFIGS.map((cfg) => {
    const found = songs.find((s) => s.title.toLowerCase().includes(cfg.query.toLowerCase()));
    return {
      id: found?.id || cfg.fallback.id,
      title: found?.title || cfg.fallback.title,
      releaseDate: found?.releaseDate || cfg.fallback.releaseDate,
      artists: found?.artists || cfg.fallback.artists,
      tag: cfg.tag,
      color: cfg.color,
    };
  });

  return (
    <section id="music" className="py-16 sm:py-24 px-4 sm:px-8 border-b-3 border-black bg-[#faf7f2] relative overflow-hidden">
      {/* Background Decors */}
      <div className="absolute top-10 left-8 hidden md:block opacity-40 -rotate-12 pointer-events-none">
        <GeoS className="w-10 h-10" color="#2563EB" />
      </div>
      <div className="absolute bottom-10 right-8 hidden md:block opacity-40 rotate-12 pointer-events-none">
        <GeoTriangle className="w-10 h-10" color="#16A34A" />
      </div>

      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12 space-y-3">
          <div className="inline-flex items-center gap-2">
            <span className="neo-sticker bg-brand-yellow text-black -rotate-1 text-xs sm:text-sm font-black">
              {t('discography_header_tag')}
            </span>
            <GeoCluster className="hidden sm:inline-flex" />
          </div>
          <h2 className="text-3xl sm:text-5xl font-black text-black uppercase font-cocogoose">
            {t('discography_title')}
          </h2>
          <p className="text-gray-700 text-sm sm:text-base font-semibold max-w-xl mx-auto">
            {discographyDesc}
          </p>
        </div>

        {/* Featured Mini Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
          {featuredTracks.map((track, idx) => (
            <div
              key={track.id || idx}
              className={`neo-box p-5 ${track.color} hover:translate-x-1 hover:translate-y-1 hover:shadow-brutal-sm transition-all flex flex-col justify-between`}
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="neo-sticker bg-black text-white text-[10px] font-black">
                    {track.tag}
                  </span>
                  <span className="text-xs font-black text-black border border-black bg-white px-2 py-0.5 rounded-full font-mono">
                    {track.releaseDate}
                  </span>
                </div>

                <h4 className="text-xl font-black text-black uppercase font-cocogoose mb-1 line-clamp-1">
                  {track.title}
                </h4>
                <p className="text-xs font-bold text-gray-800 flex items-center gap-1.5 line-clamp-1">
                  <Music className="w-3.5 h-3.5 text-black shrink-0" />
                  <span>{track.artists}</span>
                </p>
              </div>

              <div className="pt-6">
                <Link
                  href={`/music?song=${track.id}`}
                  className="neo-btn bg-white hover:bg-black hover:text-white text-black text-xs px-3 py-1.5 w-full gap-2 font-black shadow-brutal-sm transition-colors"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>Phát Bài Này</span>
                </Link>
              </div>
            </div>
          ))}
        </div>

        {/* Big Banner Link to /music */}
        <div className="neo-box p-6 sm:p-8 bg-brand-yellow text-center space-y-4 shadow-brutal-lg max-w-3xl mx-auto border-3 border-black">
          <div className="inline-flex items-center gap-2 neo-sticker bg-white text-black text-xs font-black">
            <Sparkles className="w-4 h-4 text-amber-600" />
            {t('discography_banner_tag')}
          </div>
          <h3 className="text-2xl sm:text-3xl font-black text-black uppercase font-cocogoose">
            {bannerTitle}
          </h3>
          <p className="text-xs sm:text-sm font-bold text-gray-800 max-w-lg mx-auto">
            {bannerDesc}
          </p>
          <div>
            <Link
              href="/music"
              className="neo-btn bg-brand-red text-white hover:bg-red-700 px-6 py-3 text-sm sm:text-base font-black gap-2 shadow-brutal"
            >
              <span>{t('discography_banner_btn')}</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
