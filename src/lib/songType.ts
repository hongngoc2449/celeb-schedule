import { SongItem, SongType } from '@/types';

export const SONG_TYPE_OPTIONS: { value: SongType; label: string }[] = [
  { value: 'SOLO', label: 'Solo' },
  { value: 'COLLAB', label: 'Collab' },
  { value: 'ATVNCG', label: 'ATVNCG' },
];

/**
 * Kiểm tra chuỗi có phải một trong 3 loại bài hát.
 * @param {unknown} value Giá trị cần kiểm tra.
 * @returns {boolean} true nếu là SOLO, COLLAB hoặc ATVNCG.
 */
export function isSongType(value: unknown): value is SongType {
  return value === 'SOLO' || value === 'COLLAB' || value === 'ATVNCG';
}

/**
 * Đoán loại cho bài hát cũ chưa được chọn tay.
 * Ưu tiên ATVNCG, rồi Collab, còn lại là Solo.
 * @param {{ title?: string; artists?: string }} song Bài hát nguồn.
 * @returns {SongType} Loại suy ra.
 */
export function inferSongType(song: { title?: string; artists?: string }): SongType {
  const title = (song.title || '').toLowerCase();
  const artists = song.artists || '';
  const artistsLower = artists.toLowerCase();

  const isAtvncg =
    title.includes('anh trai') ||
    artistsLower.includes('anh trai') ||
    title.includes('thăng hoa') ||
    artists.includes('Jun Phạm') ||
    artists.includes('Hoàng Dũng') ||
    artists.includes('Đông Hùng');
  if (isAtvncg) return 'ATVNCG';

  const isCollab =
    artistsLower.includes('ft') ||
    artists.includes(',') ||
    artists.includes('&');
  if (isCollab) return 'COLLAB';

  return 'SOLO';
}

/**
 * Lấy loại đã lưu. Bài chưa có loại thì đoán để form và bộ lọc vẫn chạy.
 * @param {Pick<SongItem, 'title' | 'artists' | 'songType'>} song Bài hát.
 * @returns {SongType} Loại dùng để lọc và hiển thị.
 */
export function resolveSongType(song: Pick<SongItem, 'title' | 'artists' | 'songType'>): SongType {
  if (isSongType(song.songType)) return song.songType;
  return inferSongType(song);
}
