'use client';

import { useState, useMemo, useRef } from 'react';
import { SongItem, CelebrityProfile } from '@/types';
import { getSiteText } from '@/lib/siteTexts';
import {
  Music,
  Play,
  Pause,
  SkipForward,
  SkipBack,
  Search,
  ExternalLink,
  Sparkles,
  Calendar,
  User,
  Volume2,
  Share2,
  Check,
  Disc3,
  Shuffle
} from 'lucide-react';
import Link from 'next/link';
import { OxadOmaiStampBadge, GeoCluster } from '@/components/GeometricDecor';

interface Props {
  songs: SongItem[];
  profile?: CelebrityProfile;
}

export default function MusicPlayerPage({ songs, profile }: Props) {
  const t = (id: string) => getSiteText(profile?.siteTexts, id);
  // Current playing song (default to first song)
  const [currentSongIndex, setCurrentSongIndex] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [search, setSearch] = useState('');
  const [activeFilter, setActiveFilter] = useState<'ALL' | 'ATVNCG' | 'COLLAB' | 'SOLO'>('ALL');
  const [copiedLink, setCopiedLink] = useState(false);

  const playerRef = useRef<HTMLDivElement>(null);
  const currentSong = songs[currentSongIndex] || songs[0];

  // Filtering
  const filteredSongs = useMemo(() => {
    return songs.filter((song) => {
      // Filter tab
      if (activeFilter === 'ATVNCG') {
        const isATVNCG =
          song.title.toLowerCase().includes('anh trai') ||
          song.artists.toLowerCase().includes('anh trai') ||
          song.title.toLowerCase().includes('thăng hoa') ||
          song.artists.includes('Jun Phạm') ||
          song.artists.includes('Hoàng Dũng') ||
          song.artists.includes('Đông Hùng');
        if (!isATVNCG) return false;
      } else if (activeFilter === 'COLLAB') {
        const isCollab =
          song.artists.toLowerCase().includes('ft') ||
          song.artists.includes(',') ||
          song.artists.includes('&');
        if (!isCollab) return false;
      } else if (activeFilter === 'SOLO') {
        const isSolo =
          !song.artists.toLowerCase().includes('ft') &&
          !song.artists.includes(',') &&
          !song.artists.includes('&');
        if (!isSolo) return false;
      }

      // Search
      if (search.trim()) {
        const q = search.toLowerCase();
        const matchTitle = song.title.toLowerCase().includes(q);
        const matchArtist = song.artists.toLowerCase().includes(q);
        const matchDate = song.releaseDate.includes(q);
        if (!matchTitle && !matchArtist && !matchDate) return false;
      }

      return true;
    });
  }, [songs, activeFilter, search]);

  const handlePlaySong = (song: SongItem) => {
    const idx = songs.findIndex((s) => s.id === song.id);
    if (idx !== -1) {
      setCurrentSongIndex(idx);
      setIsPlaying(true);
      // On mobile, scroll up to player
      if (window.innerWidth < 1024 && playerRef.current) {
        playerRef.current.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  const handleNext = () => {
    setCurrentSongIndex((prev) => (prev + 1) % songs.length);
    setIsPlaying(true);
  };

  const handlePrev = () => {
    setCurrentSongIndex((prev) => (prev - 1 + songs.length) % songs.length);
    setIsPlaying(true);
  };

  const handleShuffle = () => {
    const randomIdx = Math.floor(Math.random() * songs.length);
    setCurrentSongIndex(randomIdx);
    setIsPlaying(true);
  };

  const handleCopySongLink = () => {
    if (currentSong.youtubeUrl) {
      navigator.clipboard.writeText(currentSong.youtubeUrl);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  return (
    <div className="py-8 sm:py-12 px-3 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-8">
      {/* Top Header / Breadcrumb */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b-3 border-black pb-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Link
              href="/"
              className="neo-btn bg-white hover:bg-gray-100 text-xs px-2.5 py-1"
            >
              ← Trang Chủ
            </Link>
            <span className="neo-sticker bg-brand-yellow text-black text-xs font-black">
              🍬 FANDOM Ô MAI
            </span>
            <GeoCluster className="hidden md:inline-flex" />
          </div>
          <h1 className="text-3xl sm:text-5xl font-black text-black uppercase font-cocogoose tracking-tight">
            {t('music_page_title')}
          </h1>
          <p className="text-xs sm:text-sm font-bold text-gray-700 mt-1 max-w-2xl">
            {t('music_page_desc')}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden lg:block">
            <OxadOmaiStampBadge className="scale-90" />
          </div>
          <button
            onClick={handleShuffle}
            className="neo-btn bg-brand-purple hover:bg-purple-300 text-black text-xs sm:text-sm px-3.5 py-2 font-black gap-1.5 shadow-brutal"
          >
            <Shuffle className="w-4 h-4" />
            <span>Phát Ngẫu Nhiên</span>
          </button>
        </div>
      </div>

      {/* ============================================================== */}
      {/* INTEGRATED YOUTUBE MEDIA PLAYER (STICKY ON TOP)                */}
      {/* ============================================================== */}
      <div ref={playerRef} className="neo-box p-4 sm:p-6 bg-white border-3 border-black shadow-brutal-xl">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          {/* Left: YouTube Embed Player (7 cols) */}
          <div className="lg:col-span-7">
            <div className="relative aspect-video w-full rounded-2xl overflow-hidden border-3 border-black bg-black shadow-brutal">
              {currentSong?.youtubeId ? (
                <iframe
                  src={`https://www.youtube.com/embed/${currentSong.youtubeId}?autoplay=1&enablejsapi=1`}
                  title={currentSong.title}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="w-full h-full border-0"
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center text-white bg-gray-900 space-y-3">
                  <Disc3 className="w-12 h-12 text-brand-yellow animate-spin" />
                  <h4 className="font-black text-base font-cocogoose">
                    {currentSong?.title}
                  </h4>
                  <p className="text-xs text-gray-400">
                    Bản audio phát hành trên nền tảng nhạc số
                  </p>
                  {currentSong?.youtubeUrl && (
                    <a
                      href={currentSong.youtubeUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="neo-btn bg-brand-red text-white text-xs px-3 py-1.5 gap-1.5"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      Mở Liên Kết Ngoài
                    </a>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Right: Now Playing Info & Controls (5 cols) */}
          <div className="lg:col-span-5 space-y-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="neo-sticker bg-brand-red text-white text-[10px] font-black uppercase">
                  ĐANG PHÁT (#{currentSong?.stt})
                </span>
                {currentSong?.releaseDate && (
                  <span className="text-[11px] font-black text-gray-600 bg-gray-100 border border-black px-2 py-0.5 rounded">
                    🗓️ {currentSong.releaseDate}
                  </span>
                )}
              </div>

              <h2 className="text-2xl sm:text-3xl font-black text-black font-cocogoose uppercase leading-tight pt-1">
                {currentSong?.title}
              </h2>

              <p className="text-sm font-extrabold text-brand-blue flex items-center gap-1.5">
                <User className="w-4 h-4 text-black" />
                <span>{currentSong?.artists}</span>
              </p>
            </div>

            {/* Playback Control Buttons */}
            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={handlePrev}
                className="neo-btn bg-white hover:bg-gray-100 p-3 shadow-brutal-sm"
                title="Bài trước đó"
              >
                <SkipBack className="w-5 h-5" />
              </button>

              <button
                onClick={() => setIsPlaying(!isPlaying)}
                className="neo-btn bg-brand-yellow hover:bg-yellow-400 text-black px-6 py-3 font-black text-sm gap-2 shadow-brutal flex-1"
              >
                <Volume2 className="w-5 h-5 text-brand-red" />
                <span>Đang Thưởng Thức</span>
              </button>

              <button
                onClick={handleNext}
                className="neo-btn bg-white hover:bg-gray-100 p-3 shadow-brutal-sm"
                title="Bài tiếp theo"
              >
                <SkipForward className="w-5 h-5" />
              </button>
            </div>

            {/* Action Tools */}
            <div className="flex items-center gap-2 pt-1">
              <button
                onClick={handleCopySongLink}
                className="neo-btn bg-white hover:bg-brand-pink text-xs px-3 py-1.5 font-bold gap-1.5 flex-1"
              >
                {copiedLink ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-green-700" />
                    <span>Đã Copy Link!</span>
                  </>
                ) : (
                  <>
                    <Share2 className="w-3.5 h-3.5" />
                    <span>Chia Sẻ Link</span>
                  </>
                )}
              </button>

              {currentSong?.youtubeUrl && (
                <a
                  href={currentSong.youtubeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="neo-btn bg-brand-paper hover:bg-gray-100 text-xs px-3 py-1.5 font-bold gap-1.5"
                >
                  <ExternalLink className="w-3.5 h-3.5 text-brand-red" />
                  <span>YouTube</span>
                </a>
              )}
            </div>

            {/* Fandom tip */}
            <div className="p-2.5 bg-pink-50 border border-pink-300 rounded-lg text-[11px] font-bold text-pink-900 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-brand-red shrink-0" />
              <span>Gia đình Ô Mai cùng nhau cày view cho Chủ Tịch Mai OSAD nhé!</span>
            </div>
          </div>
        </div>
      </div>

      {/* ============================================================== */}
      {/* FILTER & SEARCH BAR                                            */}
      {/* ============================================================== */}
      <div className="neo-box p-4 bg-white flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Filter Pills */}
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          <button
            onClick={() => setActiveFilter('ALL')}
            className={`neo-btn px-3 py-1.5 text-xs font-black ${
              activeFilter === 'ALL'
                ? 'bg-black text-white'
                : 'bg-white text-black hover:bg-gray-100'
            }`}
          >
            Tất Cả ({songs.length})
          </button>
          <button
            onClick={() => setActiveFilter('ATVNCG')}
            className={`neo-btn px-3 py-1.5 text-xs font-black ${
              activeFilter === 'ATVNCG'
                ? 'bg-brand-yellow text-black'
                : 'bg-white text-black hover:bg-amber-100'
            }`}
          >
            ⭐ Anh Trai VNCG
          </button>
          <button
            onClick={() => setActiveFilter('COLLAB')}
            className={`neo-btn px-3 py-1.5 text-xs font-black ${
              activeFilter === 'COLLAB'
                ? 'bg-brand-lightblue text-black'
                : 'bg-white text-black hover:bg-blue-100'
            }`}
          >
            🤝 Hợp Tác (Collab)
          </button>
          <button
            onClick={() => setActiveFilter('SOLO')}
            className={`neo-btn px-3 py-1.5 text-xs font-black ${
              activeFilter === 'SOLO'
                ? 'bg-brand-pink text-black'
                : 'bg-white text-black hover:bg-pink-100'
            }`}
          >
            🎤 Solo
          </button>
        </div>

        {/* Search Input */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Tìm bài hát, nghệ sĩ collab..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="neo-input pl-9 pr-3 py-1.5 text-xs w-full"
          />
        </div>
      </div>

      {/* ============================================================== */}
      {/* FULL TRACKLIST TABLE                                           */}
      {/* ============================================================== */}
      <div className="neo-box bg-white overflow-hidden border-3 border-black">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-100 border-b-2 border-black text-[11px] font-black uppercase text-gray-700 font-cocogoose">
                <th className="p-3.5 w-14 text-center">STT</th>
                <th className="p-3.5">Tên Sản Phẩm Âm Nhạc</th>
                <th className="p-3.5">Nghệ Sĩ Biểu Diễn</th>
                <th className="p-3.5">Ngày Phát Hành</th>
                <th className="p-3.5 text-right">Phát Nhạc</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 text-xs font-bold text-gray-800">
              {filteredSongs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-gray-400 italic">
                    Không tìm thấy bài hát nào phù hợp với tìm kiếm.
                  </td>
                </tr>
              ) : (
                filteredSongs.map((song) => {
                  const isCurrent = currentSong?.id === song.id;
                  return (
                    <tr
                      key={song.id}
                      onClick={() => handlePlaySong(song)}
                      className={`cursor-pointer transition-colors ${
                        isCurrent
                          ? 'bg-amber-100 font-black'
                          : 'hover:bg-amber-50/60'
                      }`}
                    >
                      {/* STT */}
                      <td className="p-3.5 text-center text-gray-500 font-mono text-xs">
                        {isCurrent ? (
                          <span className="inline-block w-2.5 h-2.5 bg-brand-red rounded-full animate-ping" />
                        ) : (
                          song.stt
                        )}
                      </td>

                      {/* Title */}
                      <td className="p-3.5">
                        <div className="flex items-center gap-2">
                          <span className={`text-sm uppercase font-cocogoose ${isCurrent ? 'text-brand-red font-black' : 'text-black font-extrabold'}`}>
                            {song.title}
                          </span>
                          {isCurrent && (
                            <span className="neo-sticker bg-brand-red text-white text-[9px] px-1 py-0.2">
                              PLAYING
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Artists */}
                      <td className="p-3.5 text-gray-700 font-semibold">
                        {song.artists}
                      </td>

                      {/* Release Date */}
                      <td className="p-3.5 whitespace-nowrap text-gray-500">
                        {song.releaseDate || '—'}
                      </td>

                      {/* Action */}
                      <td className="p-3.5 text-right whitespace-nowrap">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handlePlaySong(song);
                          }}
                          className={`neo-btn text-xs px-3 py-1 gap-1.5 ${
                            isCurrent
                              ? 'bg-brand-red text-white font-black'
                              : 'bg-white hover:bg-brand-yellow text-black'
                          }`}
                        >
                          <Play className="w-3.5 h-3.5 fill-current" />
                          <span>{isCurrent ? 'Đang phát' : 'Nghe'}</span>
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

