'use client';

import { useState, useMemo, useRef, useEffect } from 'react';
import { SongItem, ShowItem, CelebrityProfile } from '@/types';
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
  Shuffle,
  Tv,
  Newspaper,
  Radio,
  Film,
  Video
} from 'lucide-react';
import Link from 'next/link';
import { OxadOmaiStampBadge, GeoCluster } from '@/components/GeometricDecor';

interface Props {
  songs: SongItem[];
  shows?: ShowItem[];
  profile?: CelebrityProfile;
}

export default function MusicPlayerPage({ songs, shows = [], profile }: Props) {
  const t = (id: string) => getSiteText(profile?.siteTexts, id);

  // Main Tabs: 'MUSIC' (Sản phẩm âm nhạc) vs 'SHOWS' (Show / Talkshow)
  const [mainTab, setMainTab] = useState<'MUSIC' | 'SHOWS'>('MUSIC');

  // Check URL query param for default tab
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const tabParam = params.get('tab');
      if (tabParam === 'shows' || tabParam === 'talkshow') {
        setMainTab('SHOWS');
      }
    }
  }, []);

  // --- SONGS STATE ---
  const [currentSongIndex, setCurrentSongIndex] = useState<number>(0);
  const [isPlayingSong, setIsPlayingSong] = useState<boolean>(true);
  const [searchSong, setSearchSong] = useState('');
  const [songFilter, setSongFilter] = useState<'ALL' | 'ATVNCG' | 'COLLAB' | 'SOLO'>('ALL');

  // --- SHOWS STATE ---
  const [currentShowIndex, setCurrentShowIndex] = useState<number>(0);
  const [searchShow, setSearchShow] = useState('');
  const [showFilter, setShowFilter] = useState<'ALL' | 'YOUTUBE' | 'ARTICLE' | 'SEARCH'>('ALL');

  const [copiedLink, setCopiedLink] = useState(false);
  const playerRef = useRef<HTMLDivElement>(null);

  const currentSong = songs[currentSongIndex] || songs[0];
  const currentShow = shows[currentShowIndex] || shows[0];

  // Filtering Songs
  const filteredSongs = useMemo(() => {
    return songs.filter((song) => {
      if (songFilter === 'ATVNCG') {
        const isATVNCG =
          song.title.toLowerCase().includes('anh trai') ||
          song.artists.toLowerCase().includes('anh trai') ||
          song.title.toLowerCase().includes('thăng hoa') ||
          song.artists.includes('Jun Phạm') ||
          song.artists.includes('Hoàng Dũng') ||
          song.artists.includes('Đông Hùng');
        if (!isATVNCG) return false;
      } else if (songFilter === 'COLLAB') {
        const isCollab =
          song.artists.toLowerCase().includes('ft') ||
          song.artists.includes(',') ||
          song.artists.includes('&');
        if (!isCollab) return false;
      } else if (songFilter === 'SOLO') {
        const isSolo =
          !song.artists.toLowerCase().includes('ft') &&
          !song.artists.includes(',') &&
          !song.artists.includes('&');
        if (!isSolo) return false;
      }

      if (searchSong.trim()) {
        const q = searchSong.toLowerCase();
        const matchTitle = song.title.toLowerCase().includes(q);
        const matchArtist = song.artists.toLowerCase().includes(q);
        const matchDate = song.releaseDate.includes(q);
        if (!matchTitle && !matchArtist && !matchDate) return false;
      }

      return true;
    });
  }, [songs, songFilter, searchSong]);

  // Filtering Shows
  const filteredShows = useMemo(() => {
    return shows.filter((show) => {
      if (showFilter !== 'ALL' && show.category !== showFilter) {
        return false;
      }
      if (searchShow.trim()) {
        const q = searchShow.toLowerCase();
        const matchTitle = show.title.toLowerCase().includes(q);
        const matchDate = show.date.toLowerCase().includes(q);
        const matchLink = show.link.toLowerCase().includes(q);
        if (!matchTitle && !matchDate && !matchLink) return false;
      }
      return true;
    });
  }, [shows, showFilter, searchShow]);

  // Song handlers
  const handlePlaySong = (song: SongItem) => {
    const idx = songs.findIndex((s) => s.id === song.id);
    if (idx !== -1) {
      setCurrentSongIndex(idx);
      setIsPlayingSong(true);
      if (window.innerWidth < 1024 && playerRef.current) {
        playerRef.current.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  const handleNextSong = () => {
    setCurrentSongIndex((prev) => (prev + 1) % songs.length);
    setIsPlayingSong(true);
  };

  const handlePrevSong = () => {
    setCurrentSongIndex((prev) => (prev - 1 + songs.length) % songs.length);
    setIsPlayingSong(true);
  };

  const handleShuffleSong = () => {
    const randomIdx = Math.floor(Math.random() * songs.length);
    setCurrentSongIndex(randomIdx);
    setIsPlayingSong(true);
  };

  // Show handlers
  const handlePlayShow = (show: ShowItem) => {
    const idx = shows.findIndex((s) => s.id === show.id);
    if (idx !== -1) {
      setCurrentShowIndex(idx);
      if (window.innerWidth < 1024 && playerRef.current) {
        playerRef.current.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  const handleNextShow = () => {
    setCurrentShowIndex((prev) => (prev + 1) % shows.length);
  };

  const handlePrevShow = () => {
    setCurrentShowIndex((prev) => (prev - 1 + shows.length) % shows.length);
  };

  const handleCopyLink = () => {
    const link =
      mainTab === 'MUSIC'
        ? currentSong?.youtubeUrl
        : currentShow?.youtubeUrl || currentShow?.link;
    if (link) {
      navigator.clipboard.writeText(link);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  // Helper for Show link
  const getShowWatchUrl = (show: ShowItem) => {
    if (show.youtubeUrl) return show.youtubeUrl;
    if (show.link.startsWith('http')) return show.link;
    return `https://www.youtube.com/results?search_query=${encodeURIComponent(
      show.searchQuery || show.title + ' OSAD'
    )}`;
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
            KHO ÂM NHẠC &amp; SHOW CỦA OSAD
          </h1>
          <p className="text-xs sm:text-sm font-bold text-gray-700 mt-1 max-w-2xl">
            Tổng hợp đầy đủ <strong className="text-brand-red">{songs.length}</strong> bài hát và{' '}
            <strong className="text-brand-blue">{shows.length}</strong> show, talkshow, phỏng vấn của Chủ Tịch Mai (Mai Quang Nam).
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden lg:block">
            <OxadOmaiStampBadge className="scale-90" />
          </div>
          {mainTab === 'MUSIC' ? (
            <button
              onClick={handleShuffleSong}
              className="neo-btn bg-brand-purple hover:bg-purple-300 text-black text-xs sm:text-sm px-3.5 py-2 font-black gap-1.5 shadow-brutal"
            >
              <Shuffle className="w-4 h-4" />
              <span>Phát Ngẫu Nhiên</span>
            </button>
          ) : (
            <button
              onClick={handleNextShow}
              className="neo-btn bg-brand-yellow hover:bg-yellow-400 text-black text-xs sm:text-sm px-3.5 py-2 font-black gap-1.5 shadow-brutal"
            >
              <SkipForward className="w-4 h-4" />
              <span>Show Tiếp Theo</span>
            </button>
          )}
        </div>
      </div>

      {/* ============================================================== */}
      {/* 2 MAIN TABS: SẢN PHẨM ÂM NHẠC vs SHOW & TALKSHOW               */}
      {/* ============================================================== */}
      <div className="flex flex-wrap items-center gap-3 pt-1">
        <button
          onClick={() => setMainTab('MUSIC')}
          className={`neo-btn px-5 py-3 text-sm sm:text-base font-black gap-2 transition-all ${
            mainTab === 'MUSIC'
              ? 'bg-brand-yellow text-black border-3 border-black shadow-brutal translate-x-0.5'
              : 'bg-white text-gray-700 hover:bg-gray-100 hover:text-black border-2 border-black'
          }`}
        >
          <Music className="w-5 h-5 text-brand-red" />
          <span>Sản Phẩm Âm Nhạc ({songs.length})</span>
        </button>

        <button
          onClick={() => setMainTab('SHOWS')}
          className={`neo-btn px-5 py-3 text-sm sm:text-base font-black gap-2 transition-all ${
            mainTab === 'SHOWS'
              ? 'bg-brand-red text-white border-3 border-black shadow-brutal translate-x-0.5'
              : 'bg-white text-gray-700 hover:bg-red-50 hover:text-black border-2 border-black'
          }`}
        >
          <Tv className="w-5 h-5 text-yellow-300" />
          <span>Show / Talkshow / Phỏng Vấn ({shows.length})</span>
        </button>
      </div>

      {/* ============================================================== */}
      {/* INTEGRATED MEDIA PLAYER (SONGS OR SHOWS)                       */}
      {/* ============================================================== */}
      <div ref={playerRef} className="neo-box p-4 sm:p-6 bg-white border-3 border-black shadow-brutal-xl">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          
          {/* Left: Player Viewport (7 cols) */}
          <div className="lg:col-span-7">
            <div className="relative aspect-video w-full rounded-2xl overflow-hidden border-3 border-black bg-black shadow-brutal">
              {mainTab === 'MUSIC' ? (
                currentSong?.youtubeId ? (
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
                )
              ) : (
                /* SHOWS VIEWPORT */
                currentShow?.youtubeId ? (
                  <iframe
                    src={`https://www.youtube.com/embed/${currentShow.youtubeId}?autoplay=1&enablejsapi=1`}
                    title={currentShow.title}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    className="w-full h-full border-0"
                  />
                ) : currentShow?.category === 'ARTICLE' ? (
                  <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center text-white bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 space-y-3">
                    <div className="w-14 h-14 bg-white/10 rounded-2xl border-2 border-white/20 flex items-center justify-center">
                      <Newspaper className="w-8 h-8 text-cyan-400" />
                    </div>
                    <span className="neo-sticker bg-cyan-400 text-black text-[10px] font-black uppercase">
                      BÁO CHÍ &amp; PHỎNG VẤN CHÍNH THỨC
                    </span>
                    <h4 className="font-black text-base sm:text-lg text-white font-cocogoose max-w-md">
                      {currentShow?.title}
                    </h4>
                    <p className="text-xs text-gray-300">
                      Ngày: {currentShow?.date || 'Chính thức'}
                    </p>
                    <a
                      href={currentShow?.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="neo-btn bg-brand-yellow hover:bg-yellow-400 text-black text-xs font-black px-4 py-2 gap-2 shadow-brutal"
                    >
                      <ExternalLink className="w-4 h-4 text-brand-red" />
                      <span>Đọc Bài Báo / Nghe Radio Ngay</span>
                    </a>
                  </div>
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center text-white bg-gradient-to-br from-gray-950 via-purple-950 to-black space-y-3">
                    <div className="w-14 h-14 bg-white/10 rounded-2xl border-2 border-white/20 flex items-center justify-center">
                      <Tv className="w-8 h-8 text-yellow-300" />
                    </div>
                    <span className="neo-sticker bg-brand-purple text-black text-[10px] font-black uppercase">
                      SHOW / TALKSHOW TRUYỀN HÌNH
                    </span>
                    <h4 className="font-black text-base sm:text-lg text-white font-cocogoose max-w-md">
                      {currentShow?.title}
                    </h4>
                    <p className="text-xs text-gray-300">
                      Ngày: {currentShow?.date || 'Truyền hình'}
                    </p>
                    <a
                      href={getShowWatchUrl(currentShow)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="neo-btn bg-brand-red hover:bg-red-700 text-white text-xs font-black px-4 py-2 gap-2 shadow-brutal"
                    >
                      <Search className="w-4 h-4" />
                      <span>Tìm Xem Video Trên YouTube</span>
                    </a>
                  </div>
                )
              )}
            </div>
          </div>

          {/* Right: Now Playing Info & Controls (5 cols) */}
          <div className="lg:col-span-5 space-y-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="neo-sticker bg-brand-red text-white text-[10px] font-black animate-pulse">
                  {mainTab === 'MUSIC' ? 'ĐANG PHÁT BÀI HÁT' : 'ĐANG XEM SHOW / TALKSHOW'}
                </span>
                <span className="text-xs font-bold text-gray-500 font-mono">
                  #{mainTab === 'MUSIC' ? currentSong?.stt : currentShow?.stt}
                </span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-black uppercase font-cocogoose leading-tight">
                {mainTab === 'MUSIC' ? currentSong?.title : currentShow?.title}
              </h2>
              <p className="text-sm font-bold text-gray-600 mt-1 flex items-center gap-1.5">
                {mainTab === 'MUSIC' ? (
                  <>
                    <User className="w-4 h-4 text-brand-red" />
                    <span>{currentSong?.artists}</span>
                  </>
                ) : (
                  <>
                    <Calendar className="w-4 h-4 text-brand-blue" />
                    <span>Ngày: {currentShow?.date || '—'}</span>
                  </>
                )}
              </p>
            </div>

            {/* Controls Bar */}
            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={mainTab === 'MUSIC' ? handlePrevSong : handlePrevShow}
                className="neo-btn bg-white hover:bg-gray-100 p-2.5 shadow-brutal-sm border-2 border-black"
                title="Mục trước đó"
              >
                <SkipBack className="w-5 h-5 text-black" />
              </button>

              <button
                onClick={mainTab === 'MUSIC' ? handleNextSong : handleNextShow}
                className="neo-btn bg-white hover:bg-gray-100 p-2.5 shadow-brutal-sm border-2 border-black"
                title="Mục tiếp theo"
              >
                <SkipForward className="w-5 h-5 text-black" />
              </button>

              <button
                onClick={handleCopyLink}
                className="neo-btn bg-white hover:bg-brand-pink text-black text-xs px-3 py-2 font-bold gap-1.5 shadow-brutal-sm ml-auto"
              >
                {copiedLink ? (
                  <>
                    <Check className="w-4 h-4 text-green-700" />
                    <span className="text-green-800 font-black">Đã Chép Link!</span>
                  </>
                ) : (
                  <>
                    <Share2 className="w-4 h-4" />
                    <span>Chia Sẻ Link</span>
                  </>
                )}
              </button>

              {/* Direct Link Button */}
              {mainTab === 'MUSIC' ? (
                currentSong?.youtubeUrl && (
                  <a
                    href={currentSong.youtubeUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="neo-btn bg-brand-yellow hover:bg-yellow-400 text-xs px-3 py-2 font-black gap-1.5 shadow-brutal-sm"
                  >
                    <ExternalLink className="w-4 h-4 text-brand-red" />
                    <span>YouTube</span>
                  </a>
                )
              ) : (
                <a
                  href={getShowWatchUrl(currentShow)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="neo-btn bg-brand-yellow hover:bg-yellow-400 text-xs px-3 py-2 font-black gap-1.5 shadow-brutal-sm"
                >
                  <ExternalLink className="w-4 h-4 text-brand-red" />
                  <span>Mở Liên Kết</span>
                </a>
              )}
            </div>

            {/* Fandom tip */}
            <div className="p-2.5 bg-pink-50 border border-pink-300 rounded-lg text-[11px] font-bold text-pink-900 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-brand-red shrink-0" />
              <span>Gia đình Ô Mai cùng nhau cày view và theo dõi mọi chặng đường của Chủ Tịch Mai OSAD nhé!</span>
            </div>
          </div>
        </div>
      </div>

      {/* ============================================================== */}
      {/* SECTION CONTENT: SẢN PHẨM ÂM NHẠC vs SHOW/TALKSHOW             */}
      {/* ============================================================== */}

      {mainTab === 'MUSIC' ? (
        /* --- TAB 1: SẢN PHẨM ÂM NHẠC --- */
        <div className="space-y-4">
          {/* Filter & Search Bar */}
          <div className="neo-box p-4 bg-white flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
              <button
                onClick={() => setSongFilter('ALL')}
                className={`neo-btn px-3 py-1.5 text-xs font-black ${
                  songFilter === 'ALL'
                    ? 'bg-black text-white'
                    : 'bg-white text-black hover:bg-gray-100'
                }`}
              >
                Tất Cả ({songs.length})
              </button>
              <button
                onClick={() => setSongFilter('ATVNCG')}
                className={`neo-btn px-3 py-1.5 text-xs font-black ${
                  songFilter === 'ATVNCG'
                    ? 'bg-brand-yellow text-black'
                    : 'bg-white text-black hover:bg-amber-100'
                }`}
              >
                ⭐ Anh Trai VNCG
              </button>
              <button
                onClick={() => setSongFilter('COLLAB')}
                className={`neo-btn px-3 py-1.5 text-xs font-black ${
                  songFilter === 'COLLAB'
                    ? 'bg-brand-lightblue text-black'
                    : 'bg-white text-black hover:bg-blue-100'
                }`}
              >
                🤝 Hợp Tác (Collab)
              </button>
              <button
                onClick={() => setSongFilter('SOLO')}
                className={`neo-btn px-3 py-1.5 text-xs font-black ${
                  songFilter === 'SOLO'
                    ? 'bg-brand-pink text-black'
                    : 'bg-white text-black hover:bg-pink-100'
                }`}
              >
                🎤 Solo
              </button>
            </div>

            <div className="relative w-full md:w-80">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Tìm bài hát, nghệ sĩ collab..."
                value={searchSong}
                onChange={(e) => setSearchSong(e.target.value)}
                className="neo-input pl-9 pr-3 py-1.5 text-xs w-full"
              />
            </div>
          </div>

          {/* Song Table */}
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
                          <td className="p-3.5 text-center text-gray-500 font-mono text-xs">
                            {isCurrent ? (
                              <span className="inline-block w-2.5 h-2.5 bg-brand-red rounded-full animate-ping" />
                            ) : (
                              song.stt
                            )}
                          </td>
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
                          <td className="p-3.5 text-gray-700 font-semibold">
                            {song.artists}
                          </td>
                          <td className="p-3.5 whitespace-nowrap text-gray-500">
                            {song.releaseDate || '—'}
                          </td>
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
      ) : (
        /* --- TAB 2: SHOW / TALKSHOW / PHỎNG VẤN --- */
        <div className="space-y-4">
          {/* Show Filter & Search Bar */}
          <div className="neo-box p-4 bg-white flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
              <button
                onClick={() => setShowFilter('ALL')}
                className={`neo-btn px-3 py-1.5 text-xs font-black ${
                  showFilter === 'ALL'
                    ? 'bg-black text-white'
                    : 'bg-white text-black hover:bg-gray-100'
                }`}
              >
                Tất Cả ({shows.length})
              </button>
              <button
                onClick={() => setShowFilter('YOUTUBE')}
                className={`neo-btn px-3 py-1.5 text-xs font-black ${
                  showFilter === 'YOUTUBE'
                    ? 'bg-brand-red text-white'
                    : 'bg-white text-black hover:bg-red-50'
                }`}
              >
                🎬 Video YouTube ({shows.filter((s) => s.category === 'YOUTUBE').length})
              </button>
              <button
                onClick={() => setShowFilter('ARTICLE')}
                className={`neo-btn px-3 py-1.5 text-xs font-black ${
                  showFilter === 'ARTICLE'
                    ? 'bg-brand-lightblue text-black'
                    : 'bg-white text-black hover:bg-blue-50'
                }`}
              >
                📰 Báo Chí &amp; Radio ({shows.filter((s) => s.category === 'ARTICLE').length})
              </button>
              <button
                onClick={() => setShowFilter('SEARCH')}
                className={`neo-btn px-3 py-1.5 text-xs font-black ${
                  showFilter === 'SEARCH'
                    ? 'bg-brand-purple text-black'
                    : 'bg-white text-black hover:bg-purple-50'
                }`}
              >
                📺 TV Show / Phỏng Vấn ({shows.filter((s) => s.category === 'SEARCH').length})
              </button>
            </div>

            <div className="relative w-full md:w-80">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Tìm show, phỏng vấn, ngày..."
                value={searchShow}
                onChange={(e) => setSearchShow(e.target.value)}
                className="neo-input pl-9 pr-3 py-1.5 text-xs w-full"
              />
            </div>
          </div>

          {/* Show List Table */}
          <div className="neo-box bg-white overflow-hidden border-3 border-black">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-100 border-b-2 border-black text-[11px] font-black uppercase text-gray-700 font-cocogoose">
                    <th className="p-3.5 w-14 text-center">STT</th>
                    <th className="p-3.5 w-28 whitespace-nowrap">Ngày</th>
                    <th className="p-3.5">Tên Show / Talkshow / Phỏng Vấn</th>
                    <th className="p-3.5 w-36 whitespace-nowrap">Thể Loại</th>
                    <th className="p-3.5 text-right whitespace-nowrap">Theo Dõi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 text-xs font-bold text-gray-800">
                  {filteredShows.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="p-8 text-center text-gray-400 italic">
                        Không tìm thấy show nào phù hợp với tìm kiếm.
                      </td>
                    </tr>
                  ) : (
                    filteredShows.map((show) => {
                      const isCurrent = currentShow?.id === show.id;
                      return (
                        <tr
                          key={show.id}
                          onClick={() => handlePlayShow(show)}
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
                              show.stt
                            )}
                          </td>

                          {/* Date */}
                          <td className="p-3.5 whitespace-nowrap text-gray-600 font-mono">
                            {show.date ? `📅 ${show.date}` : '—'}
                          </td>

                          {/* Title & Link note */}
                          <td className="p-3.5">
                            <div>
                              <div className="flex items-center gap-2">
                                <span className={`text-sm uppercase font-cocogoose ${isCurrent ? 'text-brand-red font-black' : 'text-black font-extrabold'}`}>
                                  {show.title}
                                </span>
                                {isCurrent && (
                                  <span className="neo-sticker bg-brand-red text-white text-[9px] px-1 py-0.2">
                                    CURRENT
                                  </span>
                                )}
                              </div>
                              {show.link && !show.link.startsWith('http') && (
                                <p className="text-[11px] font-semibold text-gray-500 line-clamp-1 mt-0.5">
                                  {show.link}
                                </p>
                              )}
                            </div>
                          </td>

                          {/* Category Badge */}
                          <td className="p-3.5 whitespace-nowrap">
                            {show.category === 'YOUTUBE' ? (
                              <span className="inline-flex items-center gap-1 text-[10px] font-black bg-red-100 text-red-800 border border-black px-2 py-0.5 rounded">
                                <Film className="w-3 h-3 text-red-600" />
                                Video YouTube
                              </span>
                            ) : show.category === 'ARTICLE' ? (
                              <span className="inline-flex items-center gap-1 text-[10px] font-black bg-blue-100 text-blue-800 border border-black px-2 py-0.5 rounded">
                                <Newspaper className="w-3 h-3 text-blue-600" />
                                Báo Chí / Radio
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 text-[10px] font-black bg-purple-100 text-purple-800 border border-black px-2 py-0.5 rounded">
                                <Tv className="w-3 h-3 text-purple-600" />
                                Talkshow TV
                              </span>
                            )}
                          </td>

                          {/* Action Button */}
                          <td className="p-3.5 text-right whitespace-nowrap">
                            <div className="inline-flex items-center gap-1.5">
                              {show.youtubeId ? (
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handlePlayShow(show);
                                  }}
                                  className={`neo-btn text-xs px-2.5 py-1 gap-1 ${
                                    isCurrent
                                      ? 'bg-brand-red text-white font-black'
                                      : 'bg-white hover:bg-brand-yellow text-black'
                                  }`}
                                >
                                  <Play className="w-3 h-3 fill-current" />
                                  <span>{isCurrent ? 'Đang xem' : 'Phát'}</span>
                                </button>
                              ) : null}

                              <a
                                href={getShowWatchUrl(show)}
                                target="_blank"
                                rel="noopener noreferrer"
                                onClick={(e) => e.stopPropagation()}
                                className="neo-btn bg-white hover:bg-gray-100 text-black text-xs px-2.5 py-1 gap-1"
                                title="Mở liên kết"
                              >
                                <ExternalLink className="w-3 h-3 text-brand-blue" />
                                <span>
                                  {show.category === 'ARTICLE'
                                    ? 'Đọc Báo'
                                    : 'Mở Link'}
                                </span>
                              </a>
                            </div>
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
      )}
    </div>
  );
}
