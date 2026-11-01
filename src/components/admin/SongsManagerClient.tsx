'use client';

import { useState } from 'react';
import { SongItem, ShowItem } from '@/types';
import {
  Music,
  Plus,
  Trash2,
  Search,
  ExternalLink,
  Check,
  Youtube,
  Play,
  Tv,
  Film,
  Newspaper
} from 'lucide-react';

interface Props {
  initialSongs: SongItem[];
  initialShows?: ShowItem[];
}

export default function SongsManagerClient({ initialSongs, initialShows = [] }: Props) {
  const [adminTab, setAdminTab] = useState<'SONGS' | 'SHOWS'>('SONGS');

  // --- SONGS STATE ---
  const [songs, setSongs] = useState<SongItem[]>(initialSongs);
  const [searchSong, setSearchSong] = useState('');
  const [submittingSong, setSubmittingSong] = useState(false);

  const [title, setTitle] = useState('');
  const [artists, setArtists] = useState('OSAD');
  const [releaseDate, setReleaseDate] = useState('');
  const [youtubeUrl, setYoutubeUrl] = useState('');

  // --- SHOWS STATE ---
  const [shows, setShows] = useState<ShowItem[]>(initialShows);
  const [searchShow, setSearchShow] = useState('');
  const [submittingShow, setSubmittingShow] = useState(false);

  const [showTitle, setShowTitle] = useState('');
  const [showDate, setShowDate] = useState('');
  const [showLink, setShowLink] = useState('');

  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Helper to extract YouTube video ID in real-time
  const getPreviewYtId = (url: string) => {
    const match = url.match(/(?:youtu\.be\/|v=|\/embed\/|\/v\/|watch\?v=|\&v=)([a-zA-Z0-9_-]{11})/);
    return match ? match[1] : '';
  };

  const previewSongYtId = getPreviewYtId(youtubeUrl);
  const previewShowYtId = getPreviewYtId(showLink);

  // Add Song
  const handleAddSong = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      alert('Vui lòng nhập tên bài hát');
      return;
    }

    setSubmittingSong(true);
    try {
      const res = await fetch('/api/songs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          artists: artists || 'OSAD',
          releaseDate: releaseDate || new Date().toLocaleDateString('vi-VN'),
          youtubeUrl,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setSongs((prev) => [data.song, ...prev]);
        setTitle('');
        setArtists('OSAD');
        setReleaseDate('');
        setYoutubeUrl('');
        showToast('Đã thêm bài hát mới vào danh sách!');
      } else {
        alert(data.error || 'Lỗi thêm bài hát');
      }
    } catch (err) {
      alert('Lỗi kết nối máy chủ');
    } finally {
      setSubmittingSong(false);
    }
  };

  // Delete Song
  const handleDeleteSong = async (id: string, songTitle: string) => {
    if (!confirm(`Bạn có chắc chắn muốn xóa bài hát "${songTitle}"?`)) return;

    try {
      const res = await fetch(`/api/songs/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setSongs((prev) => prev.filter((s) => s.id !== id));
        showToast(`Đã xóa bài hát "${songTitle}"`);
      } else {
        alert('Lỗi khi xóa bài hát');
      }
    } catch (err) {
      alert('Lỗi kết nối máy chủ');
    }
  };

  // Add Show
  const handleAddShow = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!showTitle.trim()) {
      alert('Vui lòng nhập tên show / talkshow');
      return;
    }

    setSubmittingShow(true);
    try {
      const ytId = getPreviewYtId(showLink);
      let cat: 'YOUTUBE' | 'ARTICLE' | 'SEARCH' = 'SEARCH';
      if (ytId) {
        cat = 'YOUTUBE';
      } else if (showLink.startsWith('http://') || showLink.startsWith('https://')) {
        cat = 'ARTICLE';
      }

      const res = await fetch('/api/shows', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: showTitle,
          date: showDate || new Date().toLocaleDateString('vi-VN'),
          link: showLink,
          category: cat,
          youtubeId: ytId || null,
          youtubeUrl: ytId ? `https://www.youtube.com/watch?v=${ytId}` : null,
          searchQuery: !showLink.startsWith('http') ? showLink || `${showTitle} OSAD` : null,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setShows((prev) => [data.show, ...prev]);
        setShowTitle('');
        setShowDate('');
        setShowLink('');
        showToast('Đã thêm show / talkshow mới!');
      } else {
        alert(data.error || 'Lỗi thêm show');
      }
    } catch (err) {
      alert('Lỗi kết nối máy chủ');
    } finally {
      setSubmittingShow(false);
    }
  };

  // Delete Show
  const handleDeleteShow = async (id: string, sTitle: string) => {
    if (!confirm(`Bạn có chắc chắn muốn xóa show "${sTitle}"?`)) return;

    try {
      const res = await fetch(`/api/shows/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setShows((prev) => prev.filter((s) => s.id !== id));
        showToast(`Đã xóa show "${sTitle}"`);
      } else {
        alert('Lỗi khi xóa show');
      }
    } catch (err) {
      alert('Lỗi kết nối máy chủ');
    }
  };

  // Filter lists
  const displaySongs = songs.filter((s) => {
    if (!searchSong.trim()) return true;
    const q = searchSong.toLowerCase();
    return s.title.toLowerCase().includes(q) || s.artists.toLowerCase().includes(q);
  });

  const displayShows = shows.filter((s) => {
    if (!searchShow.trim()) return true;
    const q = searchShow.toLowerCase();
    return s.title.toLowerCase().includes(q) || s.link.toLowerCase().includes(q);
  });

  return (
    <div className="space-y-8">
      {/* Toast */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 neo-box p-3 bg-brand-yellow text-black flex items-center gap-2 text-sm font-black animate-bounce">
          <Check className="w-5 h-5 text-green-700" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <div>
        <span className="neo-sticker bg-brand-yellow text-black text-xs font-black">
          MEDIA &amp; SHOWS MANAGEMENT
        </span>
        <h1 className="text-2xl sm:text-4xl font-black text-black uppercase font-cocogoose mt-1">
          Quản Lý Âm Nhạc &amp; Show / Talkshow
        </h1>
        <p className="text-xs sm:text-sm font-bold text-gray-600">
          Quản lý toàn bộ danh mục bài hát ({songs.length}) và các chương trình talkshow/phỏng vấn ({shows.length}) của Chủ Tịch Mai.
        </p>
      </div>

      {/* ADMIN TABS: BÀI HÁT vs SHOWS */}
      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={() => setAdminTab('SONGS')}
          className={`neo-btn px-5 py-2.5 text-sm font-black gap-2 transition-all ${
            adminTab === 'SONGS'
              ? 'bg-brand-yellow text-black border-3 border-black shadow-brutal'
              : 'bg-white text-gray-700 hover:bg-gray-100'
          }`}
        >
          <Music className="w-4 h-4 text-brand-red" />
          <span>Quản Lý Bài Hát ({songs.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setAdminTab('SHOWS')}
          className={`neo-btn px-5 py-2.5 text-sm font-black gap-2 transition-all ${
            adminTab === 'SHOWS'
              ? 'bg-brand-red text-white border-3 border-black shadow-brutal'
              : 'bg-white text-gray-700 hover:bg-red-50'
          }`}
        >
          <Tv className="w-4 h-4 text-yellow-300" />
          <span>Quản Lý Show / Talkshow ({shows.length})</span>
        </button>
      </div>

      {/* ============================================================== */}
      {/* TAB 1: QUẢN LÝ BÀI HÁT                                         */}
      {/* ============================================================== */}
      {adminTab === 'SONGS' ? (
        <div className="space-y-8">
          {/* Add New Song Box */}
          <div className="neo-box p-6 bg-white border-3 border-black shadow-brutal">
            <h3 className="text-lg font-black text-black uppercase font-cocogoose mb-4 flex items-center gap-2 border-b-2 border-gray-200 pb-2">
              <Plus className="w-5 h-5 text-brand-red" />
              Thêm Bài Hát Mới Vào Danh Sách
            </h3>

            <form onSubmit={handleAddSong} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-black uppercase text-gray-700 mb-1">
                    Tên Bài Hát (Song Title) *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="VD: Người Âm Phủ, Thăng Hoa, Củ Lạc..."
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="neo-input w-full text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-black uppercase text-gray-700 mb-1">
                    Nghệ Sĩ Biểu Diễn / Collab
                  </label>
                  <input
                    type="text"
                    placeholder="VD: OSAD ft. Hà An Huy..."
                    value={artists}
                    onChange={(e) => setArtists(e.target.value)}
                    className="neo-input w-full text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-black uppercase text-gray-700 mb-1">
                    Ngày Phát Hành (Format: DD/MM/YYYY)
                  </label>
                  <input
                    type="text"
                    placeholder="VD: 15/11/2026 hoặc 2024"
                    value={releaseDate}
                    onChange={(e) => setReleaseDate(e.target.value)}
                    className="neo-input w-full text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-black uppercase text-gray-700 mb-1 flex items-center gap-1.5">
                    <Youtube className="w-4 h-4 text-brand-red" />
                    Đường Dẫn YouTube (URL)
                  </label>
                  <input
                    type="url"
                    placeholder="https://youtu.be/... hoặc https://www.youtube.com/watch?v=..."
                    value={youtubeUrl}
                    onChange={(e) => setYoutubeUrl(e.target.value)}
                    className="neo-input w-full text-sm"
                  />
                </div>
              </div>

              {previewSongYtId && (
                <div className="p-3 bg-red-50 border-2 border-red-200 rounded-xl flex items-center gap-3">
                  <div className="w-8 h-8 bg-brand-red text-white rounded-lg flex items-center justify-center shrink-0">
                    <Play className="w-4 h-4 fill-current" />
                  </div>
                  <div className="text-xs">
                    <span className="font-bold text-red-900 block">
                      Đã nhận diện Video ID YouTube: <code className="font-mono bg-white px-1 py-0.5 rounded border">{previewSongYtId}</code>
                    </span>
                    <span className="text-[11px] text-gray-600">Bài hát sẽ có thể phát trực tiếp trên trang /music ngay khi thêm</span>
                  </div>
                </div>
              )}

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={submittingSong || !title.trim()}
                  className="neo-btn bg-brand-yellow hover:bg-yellow-400 text-black px-6 py-2.5 text-sm font-black gap-2 shadow-brutal"
                >
                  <Plus className="w-4 h-4" />
                  <span>{submittingSong ? 'Đang thêm...' : 'Thêm Vào Kho Âm Nhạc'}</span>
                </button>
              </div>
            </form>
          </div>

          {/* Songs Table */}
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <h3 className="text-xl font-black text-black uppercase font-cocogoose">
                Danh Sách Bài Hát Hiện Có ({songs.length})
              </h3>

              <div className="relative w-full sm:w-72">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Tìm bài hát, nghệ sĩ..."
                  value={searchSong}
                  onChange={(e) => setSearchSong(e.target.value)}
                  className="neo-input pl-9 pr-3 py-1.5 text-xs w-full"
                />
              </div>
            </div>

            <div className="neo-box bg-white overflow-hidden border-3 border-black">
              <div className="overflow-x-auto max-h-[600px] overflow-y-auto">
                <table className="w-full text-left border-collapse">
                  <thead className="sticky top-0 bg-gray-100 z-10 border-b-2 border-black">
                    <tr className="text-[11px] font-black uppercase text-gray-700 font-cocogoose">
                      <th className="p-3 w-12 text-center">STT</th>
                      <th className="p-3">Tên Bài Hát</th>
                      <th className="p-3">Nghệ Sĩ</th>
                      <th className="p-3">Phát Hành</th>
                      <th className="p-3">YouTube</th>
                      <th className="p-3 text-right">Thao Tác</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 text-xs font-bold text-gray-800">
                    {displaySongs.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="p-8 text-center text-gray-400 italic">
                          Không tìm thấy bài hát nào.
                        </td>
                      </tr>
                    ) : (
                      displaySongs.map((song) => (
                        <tr key={song.id} className="hover:bg-amber-50/50 transition-colors">
                          <td className="p-3 text-center text-gray-500 font-mono text-xs">
                            {song.stt}
                          </td>
                          <td className="p-3">
                            <span className="font-black text-sm uppercase text-black font-cocogoose">
                              {song.title}
                            </span>
                          </td>
                          <td className="p-3 text-gray-700 font-semibold">
                            {song.artists}
                          </td>
                          <td className="p-3 whitespace-nowrap text-gray-500">
                            {song.releaseDate || '—'}
                          </td>
                          <td className="p-3 whitespace-nowrap">
                            {song.youtubeUrl ? (
                              <a
                                href={song.youtubeUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="neo-btn bg-white hover:bg-red-50 text-brand-red text-[11px] px-2 py-0.5 gap-1"
                              >
                                <Youtube className="w-3.5 h-3.5" />
                                <span>Xem YT</span>
                                <ExternalLink className="w-2.5 h-2.5" />
                              </a>
                            ) : (
                              <span className="text-gray-400 italic text-[11px]">Chưa có link</span>
                            )}
                          </td>
                          <td className="p-3 text-right whitespace-nowrap">
                            <button
                              onClick={() => handleDeleteSong(song.id, song.title)}
                              className="neo-btn bg-white hover:bg-brand-red hover:text-white p-1.5"
                              title="Xóa bài hát"
                            >
                              <Trash2 className="w-3.5 h-3.5 text-red-600 hover:text-white" />
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* ============================================================== */
        /* TAB 2: QUẢN LÝ SHOW / TALKSHOW                                 */
        /* ============================================================== */
        <div className="space-y-8">
          {/* Add New Show Box */}
          <div className="neo-box p-6 bg-white border-3 border-black shadow-brutal">
            <h3 className="text-lg font-black text-black uppercase font-cocogoose mb-4 flex items-center gap-2 border-b-2 border-gray-200 pb-2">
              <Plus className="w-5 h-5 text-brand-red" />
              Thêm Show / Talkshow Mới Vào Danh Sách
            </h3>

            <form onSubmit={handleAddShow} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-black uppercase text-gray-700 mb-1">
                    Tên Show / Talkshow / Bài Phỏng Vấn *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="VD: BẮT BÀI by AA Original, Harper's Bazaar..."
                    value={showTitle}
                    onChange={(e) => setShowTitle(e.target.value)}
                    className="neo-input w-full text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-black uppercase text-gray-700 mb-1">
                    Ngày Phát Hành / Phát Sóng
                  </label>
                  <input
                    type="text"
                    placeholder="VD: 21/10/2026 hoặc 2024"
                    value={showDate}
                    onChange={(e) => setShowDate(e.target.value)}
                    className="neo-input w-full text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-black uppercase text-gray-700 mb-1">
                  Đường Dẫn (URL YouTube / Bài Báo hoặc Tiêu Đề Video YouTube)
                </label>
                <input
                  type="text"
                  placeholder="https://youtu.be/... hoặc link bài báo hoặc tên tập video"
                  value={showLink}
                  onChange={(e) => setShowLink(e.target.value)}
                  className="neo-input w-full text-sm"
                />
              </div>

              {previewShowYtId && (
                <div className="p-3 bg-red-50 border-2 border-red-200 rounded-xl flex items-center gap-3">
                  <div className="w-8 h-8 bg-brand-red text-white rounded-lg flex items-center justify-center shrink-0">
                    <Play className="w-4 h-4 fill-current" />
                  </div>
                  <div className="text-xs">
                    <span className="font-bold text-red-900 block">
                      Đã nhận diện Video ID YouTube: <code className="font-mono bg-white px-1 py-0.5 rounded border">{previewShowYtId}</code>
                    </span>
                    <span className="text-[11px] text-gray-600">Video sẽ có thể phát trực tiếp trên trang Show / Talkshow</span>
                  </div>
                </div>
              )}

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={submittingShow || !showTitle.trim()}
                  className="neo-btn bg-brand-yellow hover:bg-yellow-400 text-black px-6 py-2.5 text-sm font-black gap-2 shadow-brutal"
                >
                  <Plus className="w-4 h-4" />
                  <span>{submittingShow ? 'Đang thêm...' : 'Thêm Vào Danh Sách Show'}</span>
                </button>
              </div>
            </form>
          </div>

          {/* Shows Table */}
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <h3 className="text-xl font-black text-black uppercase font-cocogoose">
                Danh Sách Show &amp; Talkshow Hiện Có ({shows.length})
              </h3>

              <div className="relative w-full sm:w-72">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Tìm show, tiêu đề..."
                  value={searchShow}
                  onChange={(e) => setSearchShow(e.target.value)}
                  className="neo-input pl-9 pr-3 py-1.5 text-xs w-full"
                />
              </div>
            </div>

            <div className="neo-box bg-white overflow-hidden border-3 border-black">
              <div className="overflow-x-auto max-h-[600px] overflow-y-auto">
                <table className="w-full text-left border-collapse">
                  <thead className="sticky top-0 bg-gray-100 z-10 border-b-2 border-black">
                    <tr className="text-[11px] font-black uppercase text-gray-700 font-cocogoose">
                      <th className="p-3 w-12 text-center">STT</th>
                      <th className="p-3 w-28 whitespace-nowrap">Ngày</th>
                      <th className="p-3">Tên Show / Talkshow</th>
                      <th className="p-3 w-32 whitespace-nowrap">Thể Loại</th>
                      <th className="p-3">Đường Dẫn / Tiêu Đề</th>
                      <th className="p-3 text-right">Thao Tác</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 text-xs font-bold text-gray-800">
                    {displayShows.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="p-8 text-center text-gray-400 italic">
                          Không tìm thấy show nào.
                        </td>
                      </tr>
                    ) : (
                      displayShows.map((show) => (
                        <tr key={show.id} className="hover:bg-amber-50/50 transition-colors">
                          <td className="p-3 text-center text-gray-500 font-mono text-xs">
                            {show.stt}
                          </td>
                          <td className="p-3 whitespace-nowrap text-gray-600 font-mono">
                            {show.date ? `📅 ${show.date}` : '—'}
                          </td>
                          <td className="p-3">
                            <span className="font-black text-sm uppercase text-black font-cocogoose block">
                              {show.title}
                            </span>
                          </td>
                          <td className="p-3 whitespace-nowrap">
                            {show.category === 'YOUTUBE' ? (
                              <span className="text-[10px] font-black bg-red-100 text-red-800 px-2 py-0.5 rounded border border-black inline-flex items-center gap-1">
                                <Film className="w-3 h-3 text-red-600" />
                                Video
                              </span>
                            ) : show.category === 'ARTICLE' ? (
                              <span className="text-[10px] font-black bg-blue-100 text-blue-800 px-2 py-0.5 rounded border border-black inline-flex items-center gap-1">
                                <Newspaper className="w-3 h-3 text-blue-600" />
                                Báo Chí
                              </span>
                            ) : (
                              <span className="text-[10px] font-black bg-purple-100 text-purple-800 px-2 py-0.5 rounded border border-black inline-flex items-center gap-1">
                                <Tv className="w-3 h-3 text-purple-600" />
                                TV Show
                              </span>
                            )}
                          </td>
                          <td className="p-3">
                            {show.link.startsWith('http') ? (
                              <a
                                href={show.link}
                                target="_blank"
                                rel="noreferrer"
                                className="text-blue-600 hover:underline text-xs flex items-center gap-1 max-w-xs truncate"
                              >
                                <span className="truncate">{show.link}</span>
                                <ExternalLink className="w-3 h-3 shrink-0" />
                              </a>
                            ) : (
                              <span className="text-gray-600 text-xs line-clamp-1">
                                {show.link || '—'}
                              </span>
                            )}
                          </td>
                          <td className="p-3 text-right whitespace-nowrap">
                            <button
                              onClick={() => handleDeleteShow(show.id, show.title)}
                              className="neo-btn bg-white hover:bg-brand-red hover:text-white p-1.5"
                              title="Xóa show"
                            >
                              <Trash2 className="w-3.5 h-3.5 text-red-600 hover:text-white" />
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
