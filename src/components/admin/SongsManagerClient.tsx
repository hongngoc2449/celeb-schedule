'use client';

import { useState } from 'react';
import { SongItem } from '@/types';
import { Music, Plus, Trash2, Search, ExternalLink, Check, Youtube, Play, AlertCircle } from 'lucide-react';

interface Props {
  initialSongs: SongItem[];
}

export default function SongsManagerClient({ initialSongs }: Props) {
  const [songs, setSongs] = useState<SongItem[]>(initialSongs);
  const [search, setSearch] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Form State
  const [title, setTitle] = useState('');
  const [artists, setArtists] = useState('OSAD');
  const [releaseDate, setReleaseDate] = useState('');
  const [youtubeUrl, setYoutubeUrl] = useState('');

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Helper to extract YouTube video ID in real-time
  const getPreviewYtId = (url: string) => {
    const match = url.match(/(?:youtu\.be\/|v=|\/embed\/|\/v\/|watch\?v=|\&v=)([a-zA-Z0-9_-]{11})/);
    return match ? match[1] : '';
  };

  const previewId = getPreviewYtId(youtubeUrl);

  const handleAddSong = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      alert('Vui lòng nhập tên bài hát');
      return;
    }

    setSubmitting(true);
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
      setSubmitting(false);
    }
  };

  const handleDeleteSong = async (id: string, songTitle: string) => {
    if (!confirm(`Bạn có chắc muốn xóa bài hát "${songTitle}" khỏi danh sách?`)) return;

    try {
      const res = await fetch(`/api/songs/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setSongs((prev) => prev.filter((s) => s.id !== id));
        showToast('Đã xóa bài hát thành công!');
      } else {
        alert('Lỗi khi xóa bài hát');
      }
    } catch (err) {
      alert('Lỗi kết nối máy chủ');
    }
  };

  // Filtered List
  const displayList = songs.filter((s) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      s.title.toLowerCase().includes(q) ||
      s.artists.toLowerCase().includes(q) ||
      s.releaseDate.includes(q)
    );
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
          DISCOGRAPHY MANAGEMENT
        </span>
        <h1 className="text-2xl sm:text-4xl font-black text-black uppercase font-cocogoose mt-1">
          Quản Lý Kho Âm Nhạc
        </h1>
        <p className="text-xs sm:text-sm font-bold text-gray-600">
          Tổng cộng: <strong className="text-brand-red font-cocogoose">{songs.length}</strong> bài hát • Thêm nhạc mới và cập nhật link YouTube phát trực tiếp
        </p>
      </div>

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

          {/* YouTube Video ID Preview */}
          {previewId && (
            <div className="p-3 bg-red-50 border-2 border-red-200 rounded-xl flex items-center gap-3">
              <div className="w-8 h-8 bg-brand-red text-white rounded-lg flex items-center justify-center shrink-0">
                <Play className="w-4 h-4 fill-current" />
              </div>
              <div className="text-xs">
                <span className="font-bold text-red-900 block">Đã nhận diện Video ID YouTube: <code className="font-mono bg-white px-1 py-0.5 rounded border">{previewId}</code></span>
                <span className="text-[11px] text-gray-600">Bài hát sẽ có thể phát trực tiếp trên trang /music ngay khi thêm</span>
              </div>
            </div>
          )}

          <div className="pt-2">
            <button
              type="submit"
              disabled={submitting || !title.trim()}
              className="neo-btn bg-brand-yellow hover:bg-yellow-400 text-black px-6 py-2.5 text-sm font-black gap-2 shadow-brutal"
            >
              <Plus className="w-4 h-4" />
              <span>{submitting ? 'Đang thêm...' : 'Thêm Vào Kho Âm Nhạc'}</span>
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
              value={search}
              onChange={(e) => setSearch(e.target.value)}
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
                {displayList.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-gray-400 italic">
                      Không tìm thấy bài hát nào.
                    </td>
                  </tr>
                ) : (
                  displayList.map((song) => (
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
  );
}

