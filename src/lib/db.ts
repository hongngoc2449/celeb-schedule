import { MongoClient, Db } from 'mongodb';
import { initialProfile, initialSchedules, initialGallery } from './initialData';
import {
  ScheduleItem,
  CelebrityProfile,
  GalleryItem,
  SongItem,
  ShowItem,
  AdminUser,
  FanMessage,
  StackScore,
} from '@/types';
import initialSongsData from './musicData.json';
import { initialShowsData } from './initialShows';
import fs from 'fs';
import path from 'path';
import { hashPassword, isBcryptHash } from './password';
import { isSongType, resolveSongType } from './songType';

const uri = process.env.MONGODB_URI || '';
const dbName = process.env.MONGODB_DB || 'osad_celebrity';

let cachedClient: MongoClient | null = null;
let cachedDb: Db | null = null;

// Local persistent JSON storage fallback when MongoDB_URI is not provided yet
const LOCAL_DATA_FILE = path.join(process.cwd(), 'data-store.json');

interface LocalStore {
  schedules: ScheduleItem[];
  profile: CelebrityProfile;
  gallery: GalleryItem[];
  songs?: SongItem[];
  shows?: ShowItem[];
  users?: AdminUser[];
  images?: any[];
  messages?: FanMessage[];
  stackScores?: StackScore[];
}

/**
 * Username tài khoản quản trị gốc, lấy từ env.
 * @returns {string} Username đã chuẩn hóa chữ thường.
 */
function getPrimaryAdminUsername(): string {
  return (process.env.ADMIN_USERNAME || 'admin').trim().toLowerCase();
}

/**
 * Tạo tài khoản admin gốc với mật khẩu đã băm.
 * Chỉ ghi xuống kho khi chưa có user nào.
 * @returns {Promise<AdminUser>} User admin mặc định.
 */
async function buildDefaultAdminUser(): Promise<AdminUser> {
  const plainPassword = process.env.ADMIN_PASSWORD || 'lena2202';
  return {
    id: 'usr-primary-admin',
    username: getPrimaryAdminUsername(),
    password: await hashPassword(plainPassword),
    name: 'Chủ Tịch Mai (Admin)',
    role: 'admin',
    createdAt: '2026-11-01T00:00:00.000Z',
  };
}

function getLocalStore(): LocalStore {
  try {
    if (fs.existsSync(LOCAL_DATA_FILE)) {
      const content = fs.readFileSync(LOCAL_DATA_FILE, 'utf-8');
      if (content && content.trim()) {
        const parsed = JSON.parse(content);
        if (!parsed.songs || parsed.songs.length === 0) {
          parsed.songs = initialSongsData as SongItem[];
        }
        if (!parsed.shows || parsed.shows.length === 0) {
          parsed.shows = initialShowsData as ShowItem[];
        }
        if (!parsed.users) {
          parsed.users = [];
        }
        return parsed;
      }
    }
  } catch (e) {
    console.warn('Local data store read error or empty, using defaults:', e);
  }
  return {
    schedules: initialSchedules,
    profile: initialProfile,
    gallery: initialGallery,
    songs: initialSongsData as SongItem[],
    shows: initialShowsData as ShowItem[],
    users: [],
  };
}

function saveLocalStore(data: LocalStore) {
  try {
    fs.writeFileSync(LOCAL_DATA_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch (e) {
    console.error('Error writing local data store:', e);
  }
}

export async function connectToDatabase(): Promise<{ client: MongoClient | null; db: Db | null }> {
  if (!uri) {
    return { client: null, db: null };
  }

  if (cachedClient && cachedDb) {
    return { client: cachedClient, db: cachedDb };
  }

  try {
    const client = await MongoClient.connect(uri);
    const db = client.db(dbName);
    cachedClient = client;
    cachedDb = db;
    return { client, db };
  } catch (error) {
    console.warn('MongoDB connection failed, falling back to local store:', error);
    return { client: null, db: null };
  }
}

// ----------------- SCHEDULES -----------------

export async function getSchedules(): Promise<ScheduleItem[]> {
  const { db } = await connectToDatabase();
  if (db) {
    const items = await db.collection<ScheduleItem>('schedules').find({}).sort({ startDate: 1 }).toArray();
    if (items.length > 0) {
      return items.map(({ _id, ...rest }: any) => ({
        ...rest,
        id: rest.id || _id.toString(),
      }));
    } else {
      // First time seed to MongoDB
      await db.collection('schedules').insertMany(initialSchedules as any);
      return initialSchedules;
    }
  }
  return getLocalStore().schedules;
}

export async function createSchedule(item: Omit<ScheduleItem, 'id'>): Promise<ScheduleItem> {
  const newItem: ScheduleItem = {
    ...item,
    id: 'sch-' + Date.now(),
    createdAt: new Date().toISOString(),
  };

  const { db } = await connectToDatabase();
  if (db) {
    await db.collection('schedules').insertOne({ ...newItem });
    return newItem;
  }

  const store = getLocalStore();
  store.schedules.push(newItem);
  saveLocalStore(store);
  return newItem;
}

export async function updateSchedule(id: string, updates: Partial<ScheduleItem>): Promise<ScheduleItem | null> {
  const { _id, id: _ignoreId, ...cleanUpdates } = updates as any;
  const { db } = await connectToDatabase();
  if (db) {
    await db.collection('schedules').updateOne(
      { id },
      { $set: { ...cleanUpdates, updatedAt: new Date().toISOString() } }
    );
    const updated = await db.collection<ScheduleItem>('schedules').findOne({ id });
    if (!updated) return null;
    const { _id: docId, ...rest } = updated as any;
    return { ...rest, id: rest.id || docId.toString() };
  }

  const store = getLocalStore();
  const index = store.schedules.findIndex((s) => s.id === id);
  if (index === -1) return null;
  store.schedules[index] = { ...store.schedules[index], ...cleanUpdates, updatedAt: new Date().toISOString() };
  saveLocalStore(store);
  return store.schedules[index];
}

export async function deleteSchedule(id: string): Promise<boolean> {
  const { db } = await connectToDatabase();
  if (db) {
    const res = await db.collection('schedules').deleteOne({ id });
    return res.deletedCount > 0;
  }

  const store = getLocalStore();
  const beforeLen = store.schedules.length;
  store.schedules = store.schedules.filter((s) => s.id !== id);
  saveLocalStore(store);
  return store.schedules.length < beforeLen;
}

// ----------------- PROFILE -----------------

export async function getProfile(): Promise<CelebrityProfile> {
  const { db } = await connectToDatabase();
  let profileData: CelebrityProfile;
  if (db) {
    const p = await db.collection('profiles').findOne({ key: 'main_profile' });
    if (p) {
      const { _id, key, ...rest } = p as any;
      profileData = rest;
    } else {
      await db.collection('profiles').insertOne({ key: 'main_profile', ...initialProfile });
      profileData = initialProfile;
    }
  } else {
    profileData = getLocalStore().profile;
  }

  if (profileData?.bio) {
    profileData.bio = profileData.bio.replace(/"Anh Mệt Rồi",?\s*/gi, '');
  }
  return profileData;
}

export async function updateProfile(updates: Partial<CelebrityProfile>): Promise<CelebrityProfile> {
  const { _id, key: _ignoreKey, ...cleanUpdates } = updates as any;
  const { db } = await connectToDatabase();
  if (db) {
    await db.collection('profiles').updateOne(
      { key: 'main_profile' },
      { $set: cleanUpdates },
      { upsert: true }
    );
    return getProfile();
  }

  const store = getLocalStore();
  store.profile = { ...store.profile, ...cleanUpdates };
  saveLocalStore(store);
  return store.profile;
}

// ----------------- GALLERY -----------------

export async function getGallery(): Promise<GalleryItem[]> {
  const { db } = await connectToDatabase();
  if (db) {
    const items = await db.collection('gallery').find({}).toArray();
    if (items.length > 0) {
      return items.map(({ _id, ...rest }: any) => ({
        ...rest,
        id: rest.id || _id.toString(),
      }));
    } else {
      await db.collection('gallery').insertMany(initialGallery as any);
      return initialGallery;
    }
  }
  return getLocalStore().gallery;
}

export async function addGalleryItem(item: Omit<GalleryItem, 'id'>): Promise<GalleryItem> {
  const newItem: GalleryItem = {
    ...item,
    id: 'gal-' + Date.now(),
    date: item.date || new Date().toISOString().substring(0, 7),
  };

  const { db } = await connectToDatabase();
  if (db) {
    await db.collection('gallery').insertOne({ ...newItem });
    return newItem;
  }

  const store = getLocalStore();
  store.gallery.unshift(newItem);
  saveLocalStore(store);
  return newItem;
}

export async function updateGalleryItem(id: string, updates: Partial<GalleryItem>): Promise<GalleryItem | null> {
  const { _id, id: _ignoreId, ...cleanUpdates } = updates as any;
  const { db } = await connectToDatabase();
  if (db) {
    await db.collection('gallery').updateOne(
      { id },
      { $set: { ...cleanUpdates, updatedAt: new Date().toISOString() } }
    );
    const updated = await db.collection<GalleryItem>('gallery').findOne({ id });
    if (!updated) return null;
    const { _id: docId, ...rest } = updated as any;
    return { ...rest, id: rest.id || docId.toString() };
  }

  const store = getLocalStore();
  const index = store.gallery.findIndex((g) => g.id === id);
  if (index === -1) return null;
  store.gallery[index] = { ...store.gallery[index], ...cleanUpdates, updatedAt: new Date().toISOString() };
  saveLocalStore(store);
  return store.gallery[index];
}

export async function deleteGalleryItem(id: string): Promise<boolean> {
  const { db } = await connectToDatabase();
  if (db) {
    const item = await db.collection('gallery').findOne({ id });
    if (item && (item as any).imageUrl && (item as any).imageUrl.includes('/api/images/')) {
      const filename = (item as any).imageUrl.split('/api/images/')[1];
      const cleanId = filename.replace(/\.[a-zA-Z0-9]+$/, '');
      await db.collection('uploaded_images').deleteOne({
        $or: [{ id: cleanId }, { filename }, { id: filename }],
      });
    }
    const res = await db.collection('gallery').deleteOne({ id });
    return res.deletedCount > 0;
  }

  const store = getLocalStore();
  store.gallery = store.gallery.filter((g) => g.id !== id);
  saveLocalStore(store);
  return true;
}

// ----------------- UPLOADED IMAGES STORAGE (MONGODB / VERCEL SAFE) -----------------

export async function saveUploadedImage(image: {
  id: string;
  filename: string;
  contentType: string;
  size: number;
  dataBuffer: Buffer;
}): Promise<string> {
  const { db } = await connectToDatabase();
  const base64Data = image.dataBuffer.toString('base64');

  if (db) {
    await db.collection('uploaded_images').updateOne(
      { id: image.id },
      {
        $set: {
          id: image.id,
          filename: image.filename,
          contentType: image.contentType,
          size: image.size,
          data: base64Data,
          createdAt: new Date().toISOString(),
        },
      },
      { upsert: true }
    );
  } else {
    const store = getLocalStore();
    if (!store.images) store.images = [];
    store.images.unshift({
      id: image.id,
      filename: image.filename,
      contentType: image.contentType,
      size: image.size,
      data: base64Data,
      createdAt: new Date().toISOString(),
    });
    saveLocalStore(store);
  }

  return `/api/images/${image.filename}`;
}

export async function getUploadedImage(filenameOrId: string): Promise<{
  contentType: string;
  buffer: Buffer;
} | null> {
  const cleanId = filenameOrId.replace(/\.[a-zA-Z0-9]+$/, '');
  const { db } = await connectToDatabase();

  if (db) {
    const doc = await db.collection('uploaded_images').findOne({
      $or: [{ id: cleanId }, { filename: filenameOrId }, { id: filenameOrId }],
    });
    if (doc && (doc as any).data) {
      return {
        contentType: (doc as any).contentType || 'image/webp',
        buffer: Buffer.from((doc as any).data, 'base64'),
      };
    }
  } else {
    const store = getLocalStore();
    const doc = store.images?.find(
      (img: any) => img.id === cleanId || img.filename === filenameOrId || img.id === filenameOrId
    );
    if (doc && doc.data) {
      return {
        contentType: doc.contentType || 'image/webp',
        buffer: Buffer.from(doc.data, 'base64'),
      };
    }
  }

  // Fallback to local public/uploads if exists
  try {
    const localPath = path.join(process.cwd(), 'public', 'uploads', filenameOrId);
    if (fs.existsSync(localPath)) {
      const buffer = fs.readFileSync(localPath);
      const ext = path.extname(filenameOrId).toLowerCase();
      const contentType = ext === '.webp' ? 'image/webp' : ext === '.png' ? 'image/png' : 'image/jpeg';
      return { contentType, buffer };
    }
  } catch (e) {
    // ignore
  }

  return null;
}

// ----------------- FAN MESSAGES -----------------

/**
 * Xóa ảnh đã lưu qua /api/images khi lời nhắn bị gỡ.
 * @param {string | undefined} imageUrl Đường dẫn ảnh của lời nhắn.
 * @returns {Promise<void>}
 */
async function deleteUploadedImageByUrl(imageUrl?: string): Promise<void> {
  if (!imageUrl || !imageUrl.includes('/api/images/')) return;
  const filename = decodeURIComponent(imageUrl.split('/api/images/')[1] || '');
  if (!filename) return;
  const cleanId = filename.replace(/\.[a-zA-Z0-9]+$/, '');

  try {
    const { db } = await connectToDatabase();
    if (db) {
      await db.collection('uploaded_images').deleteOne({
        $or: [{ id: cleanId }, { filename }, { id: filename }],
      });
      return;
    }

    const store = getLocalStore();
    if (store.images) {
      store.images = store.images.filter(
        (img: { id?: string; filename?: string }) =>
          img.id !== cleanId && img.filename !== filename && img.id !== filename
      );
      saveLocalStore(store);
    }
  } catch (error) {
    console.error('Delete uploaded image failed:', error);
  }
}

/**
 * Sắp xếp: card đã ghim trước (pinnedAt mới hơn đứng đầu), rồi lời nhắn thường theo ngày.
 * @param {FanMessage[]} messages Danh sách gốc.
 * @returns {FanMessage[]}
 */
function sortFanMessages(messages: FanMessage[]): FanMessage[] {
  return [...messages].sort((left, right) => {
    const leftPinned = Boolean(left.pinned);
    const rightPinned = Boolean(right.pinned);
    if (leftPinned !== rightPinned) return leftPinned ? -1 : 1;
    if (leftPinned && rightPinned) {
      return (right.pinnedAt || '').localeCompare(left.pinnedAt || '');
    }
    return right.createdAt.localeCompare(left.createdAt);
  });
}

/**
 * Danh sách lời nhắn: ghim trước, còn lại mới nhất trước.
 * @returns {Promise<FanMessage[]>}
 */
export async function getFanMessages(): Promise<FanMessage[]> {
  const { db } = await connectToDatabase();
  if (db) {
    const items = await db.collection<FanMessage>('fan_messages').find({}).toArray();
    return sortFanMessages(
      items.map(({ _id, ...rest }: FanMessage & { _id?: { toString(): string } }) => ({
        ...rest,
        id: rest.id || _id?.toString() || '',
      }))
    );
  }
  return sortFanMessages(getLocalStore().messages || []);
}

/**
 * Lưu lời nhắn mới.
 * @param {Omit<FanMessage, 'id' | 'createdAt'>} item Nội dung đã kiểm tra.
 * @returns {Promise<FanMessage>}
 */
export async function createFanMessage(item: Omit<FanMessage, 'id' | 'createdAt'>): Promise<FanMessage> {
  const message: FanMessage = {
    ...item,
    id: 'msg-' + Date.now(),
    createdAt: new Date().toISOString(),
    heartCount: item.heartCount ?? 0,
  };

  const { db } = await connectToDatabase();
  if (db) {
    await db.collection('fan_messages').insertOne({ ...message });
    return message;
  }

  const store = getLocalStore();
  if (!store.messages) store.messages = [];
  store.messages.unshift(message);
  saveLocalStore(store);
  return message;
}

/**
 * Cộng / trừ reaction tim. delta chỉ nhận 1 hoặc -1.
 * @param {string} id Id lời nhắn.
 * @param {1 | -1} delta Hướng cập nhật.
 * @returns {Promise<FanMessage | null>}
 */
export async function reactFanMessage(id: string, delta: 1 | -1): Promise<FanMessage | null> {
  const { db } = await connectToDatabase();
  if (db) {
    const existing = await db.collection<FanMessage>('fan_messages').findOne({ id });
    if (!existing) return null;
    const nextCount = Math.max(0, (existing.heartCount || 0) + delta);
    await db.collection('fan_messages').updateOne({ id }, { $set: { heartCount: nextCount } });
    const { _id, ...rest } = existing as FanMessage & { _id?: unknown };
    return { ...rest, id: rest.id || id, heartCount: nextCount };
  }

  const store = getLocalStore();
  const index = store.messages?.findIndex((item) => item.id === id) ?? -1;
  if (index < 0 || !store.messages) return null;
  const current = store.messages[index];
  const updated: FanMessage = {
    ...current,
    heartCount: Math.max(0, (current.heartCount || 0) + delta),
  };
  store.messages[index] = updated;
  saveLocalStore(store);
  return updated;
}

/**
 * Ghim / bỏ ghim lời nhắn. Chỉ gọi sau khi đã kiểm tra quyền admin.
 * @param {string} id Id lời nhắn.
 * @param {boolean} pinned true = ghim lên đầu.
 * @returns {Promise<FanMessage | null>} Bản ghi sau cập nhật, hoặc null nếu không tìm thấy.
 */
export async function setFanMessagePinned(id: string, pinned: boolean): Promise<FanMessage | null> {
  const pinnedAt = pinned ? new Date().toISOString() : undefined;
  const { db } = await connectToDatabase();
  if (db) {
    const existing = await db.collection<FanMessage>('fan_messages').findOne({ id });
    if (!existing) return null;
    const { _id, ...rest } = existing as FanMessage & { _id?: unknown };
    const updated: FanMessage = {
      ...rest,
      id: rest.id || id,
      pinned,
      pinnedAt: pinned ? pinnedAt : undefined,
    };
    if (pinned) {
      await db.collection('fan_messages').updateOne({ id }, { $set: { pinned: true, pinnedAt } });
    } else {
      await db.collection('fan_messages').updateOne({ id }, { $set: { pinned: false }, $unset: { pinnedAt: '' } });
    }
    return updated;
  }

  const store = getLocalStore();
  const index = store.messages?.findIndex((item) => item.id === id) ?? -1;
  if (index < 0 || !store.messages) return null;
  const current = store.messages[index];
  const updated: FanMessage = {
    ...current,
    pinned,
    pinnedAt: pinned ? pinnedAt : undefined,
  };
  if (!pinned) delete updated.pinnedAt;
  store.messages[index] = updated;
  saveLocalStore(store);
  return updated;
}

/**
 * Xóa một lời nhắn và ảnh đính kèm. Chỉ gọi sau khi đã kiểm tra quyền admin.
 * @param {string} id Id lời nhắn.
 * @returns {Promise<boolean>} true nếu đã xóa.
 */
export async function deleteFanMessage(id: string): Promise<boolean> {
  const { db } = await connectToDatabase();
  if (db) {
    const existing = await db.collection<FanMessage>('fan_messages').findOne({ id });
    if (!existing) return false;
    await deleteUploadedImageByUrl(existing.imageUrl);
    await deleteUploadedImageByUrl(existing.signatureUrl);
    const result = await db.collection('fan_messages').deleteOne({ id });
    return result.deletedCount > 0;
  }

  const store = getLocalStore();
  const existing = store.messages?.find((item) => item.id === id);
  if (!existing) return false;
  store.messages = (store.messages || []).filter((item) => item.id !== id);

  const filenames = [existing.imageUrl, existing.signatureUrl]
    .map((url) => (url && url.includes('/api/images/') ? decodeURIComponent(url.split('/api/images/')[1] || '') : ''))
    .filter(Boolean);
  if (store.images && filenames.length > 0) {
    store.images = store.images.filter((img: { id?: string; filename?: string }) => {
      return !filenames.some((filename) => {
        const cleanId = filename.replace(/\.[a-zA-Z0-9]+$/, '');
        return img.id === cleanId || img.filename === filename || img.id === filename;
      });
    });
  }
  saveLocalStore(store);
  return true;
}

const STACK_SCORE_TOP = 10;

/**
 * Top điểm minigame xếp ảnh, cao nhất trước.
 * @returns {Promise<StackScore[]>} Tối đa 10 bản ghi.
 */
export async function getStackScores(): Promise<StackScore[]> {
  const { db } = await connectToDatabase();
  if (db) {
    const items = await db
      .collection<StackScore>('stack_scores')
      .find({})
      .sort({ score: -1, createdAt: 1 })
      .limit(STACK_SCORE_TOP)
      .toArray();
    return items.map(({ _id, ...rest }: StackScore & { _id?: { toString(): string } }) => ({
      ...rest,
      id: rest.id || _id?.toString() || '',
    }));
  }
  const scores = getLocalStore().stackScores || [];
  return [...scores]
    .sort((left, right) => right.score - left.score || left.createdAt.localeCompare(right.createdAt))
    .slice(0, STACK_SCORE_TOP);
}

/**
 * Thêm điểm mới rồi giữ lại top 10.
 * @param {Omit<StackScore, 'id' | 'createdAt'>} item Tên và điểm đã kiểm tra.
 * @returns {Promise<StackScore[]>} Bảng xếp hạng sau khi cập nhật.
 */
export async function createStackScore(item: Omit<StackScore, 'id' | 'createdAt'>): Promise<StackScore[]> {
  const entry: StackScore = {
    ...item,
    id: 'stk-' + Date.now(),
    createdAt: new Date().toISOString(),
  };

  const { db } = await connectToDatabase();
  if (db) {
    await db.collection('stack_scores').insertOne({ ...entry });
    const items = await db
      .collection<StackScore>('stack_scores')
      .find({})
      .sort({ score: -1, createdAt: 1 })
      .toArray();
    const ranked = items.map(({ _id, ...rest }: StackScore & { _id?: { toString(): string } }) => ({
      ...rest,
      id: rest.id || _id?.toString() || '',
    }));
    const keepIds = new Set(ranked.slice(0, STACK_SCORE_TOP).map((row) => row.id));
    const dropIds = ranked.filter((row) => !keepIds.has(row.id)).map((row) => row.id);
    if (dropIds.length > 0) {
      await db.collection('stack_scores').deleteMany({ id: { $in: dropIds } });
    }
    return ranked.slice(0, STACK_SCORE_TOP);
  }

  const store = getLocalStore();
  const next = [...(store.stackScores || []), entry]
    .sort((left, right) => right.score - left.score || left.createdAt.localeCompare(right.createdAt))
    .slice(0, STACK_SCORE_TOP);
  store.stackScores = next;
  saveLocalStore(store);
  return next;
}

// ----------------- SONGS (MUSIC LIST) -----------------

export function extractYoutubeId(url: string): string {
  if (!url) return '';
  const match = url.match(/(?:youtu\.be\/|v=|\/embed\/|\/v\/|watch\?v=|\&v=)([a-zA-Z0-9_-]{11})/);
  return match ? match[1] : '';
}

/**
 * Gắn songType đã lưu, hoặc loại đoán được nếu bài cũ chưa chọn.
 * @param {SongItem} song Bài hát thô từ kho.
 * @returns {SongItem} Bài hát có songType.
 */
function withResolvedSongType(song: SongItem): SongItem {
  return { ...song, songType: resolveSongType(song) };
}

export async function getSongs(): Promise<SongItem[]> {
  const { db } = await connectToDatabase();
  if (db) {
    const items = await db.collection<SongItem>('songs').find({}).toArray();
    if (items.length > 0) {
      return items.map(({ _id, ...rest }: any) => withResolvedSongType({
        ...rest,
        id: rest.id || _id.toString(),
      }));
    } else {
      await db.collection('songs').insertMany(initialSongsData as any);
      return (initialSongsData as SongItem[]).map(withResolvedSongType);
    }
  }
  return (getLocalStore().songs || (initialSongsData as SongItem[])).map(withResolvedSongType);
}

export async function createSong(item: {
  title: string;
  artists?: string;
  releaseDate?: string;
  youtubeUrl?: string;
  songType?: string;
}): Promise<SongItem> {
  const songs = await getSongs();
  const nextStt = (songs.length + 1).toString();
  const ytId = extractYoutubeId(item.youtubeUrl || '');

  const newSong: SongItem = {
    id: 'song-' + Date.now(),
    stt: nextStt,
    title: item.title.trim(),
    artists: item.artists?.trim() || 'OSAD',
    releaseDate: item.releaseDate?.trim() || new Date().toLocaleDateString('vi-VN'),
    youtubeUrl: item.youtubeUrl?.trim() || '',
    youtubeId: ytId,
    songType: isSongType(item.songType) ? item.songType : 'SOLO',
  };

  const { db } = await connectToDatabase();
  if (db) {
    await db.collection('songs').insertOne({ ...newSong });
    return newSong;
  }

  const store = getLocalStore();
  if (!store.songs) store.songs = [...(initialSongsData as SongItem[])];
  store.songs.unshift(newSong);
  saveLocalStore(store);
  return newSong;
}

export async function updateSong(id: string, updates: Partial<SongItem>): Promise<SongItem | null> {
  const { _id, id: _ignoreId, ...cleanUpdates } = updates as any;
  if (cleanUpdates.youtubeUrl !== undefined) {
    cleanUpdates.youtubeId = extractYoutubeId(cleanUpdates.youtubeUrl || '');
  }
  if (cleanUpdates.songType !== undefined && !isSongType(cleanUpdates.songType)) {
    delete cleanUpdates.songType;
  }

  const { db } = await connectToDatabase();
  if (db) {
    await db.collection('songs').updateOne(
      { id },
      { $set: { ...cleanUpdates, updatedAt: new Date().toISOString() } }
    );
    const updated = await db.collection<SongItem>('songs').findOne({ id });
    if (!updated) return null;
    const { _id: docId, ...rest } = updated as any;
    return { ...rest, id: rest.id || docId.toString() };
  }

  const store = getLocalStore();
  if (!store.songs) store.songs = [...(initialSongsData as SongItem[])];
  const idx = store.songs.findIndex((s) => s.id === id);
  if (idx === -1) return null;
  store.songs[idx] = { ...store.songs[idx], ...cleanUpdates, updatedAt: new Date().toISOString() };
  saveLocalStore(store);
  return store.songs[idx];
}

export async function deleteSong(id: string): Promise<boolean> {
  const { db } = await connectToDatabase();
  if (db) {
    const res = await db.collection('songs').deleteOne({ id });
    return res.deletedCount > 0;
  }

  const store = getLocalStore();
  if (!store.songs) store.songs = [...(initialSongsData as SongItem[])];
  const beforeLen = store.songs.length;
  store.songs = store.songs.filter((s) => s.id !== id);
  saveLocalStore(store);
  return store.songs.length < beforeLen;
}

// ----------------- SHOWS & TALKSHOWS -----------------

export async function getShows(): Promise<ShowItem[]> {
  const { db } = await connectToDatabase();
  if (db) {
    const items = await db.collection<ShowItem>('shows').find({}).sort({ stt: 1 }).toArray();
    if (items.length > 0) {
      return items.map(({ _id, ...rest }: any) => ({
        ...rest,
        id: rest.id || _id.toString(),
      }));
    } else {
      await db.collection('shows').insertMany(initialShowsData as any);
      return initialShowsData;
    }
  }
  return getLocalStore().shows || initialShowsData;
}

export async function addShow(item: Omit<ShowItem, 'id' | 'stt'> & { stt?: number }): Promise<ShowItem> {
  const shows = await getShows();
  const nextStt = item.stt || shows.length + 1;
  const newShow: ShowItem = {
    id: 'show-' + Date.now(),
    stt: nextStt,
    date: item.date?.trim() || new Date().toLocaleDateString('vi-VN'),
    title: item.title.trim(),
    link: item.link?.trim() || '',
    category: item.category || (item.youtubeId ? 'YOUTUBE' : item.link?.startsWith('http') ? 'ARTICLE' : 'SEARCH'),
    youtubeId: item.youtubeId || null,
    youtubeUrl: item.youtubeUrl || null,
    searchQuery: item.searchQuery || null,
    createdAt: new Date().toISOString(),
  };

  const { db } = await connectToDatabase();
  if (db) {
    await db.collection('shows').insertOne(newShow as any);
    return newShow;
  }

  const store = getLocalStore();
  if (!store.shows) store.shows = [...initialShowsData];
  store.shows.push(newShow);
  saveLocalStore(store);
  return newShow;
}

export async function updateShow(id: string, updates: Partial<ShowItem>): Promise<ShowItem | null> {
  const { _id, id: _ignoreId, ...cleanUpdates } = updates as any;
  if (cleanUpdates.link !== undefined) {
    const ytId = extractYoutubeId(cleanUpdates.link || '');
    if (ytId) {
      cleanUpdates.youtubeId = ytId;
      cleanUpdates.youtubeUrl = `https://www.youtube.com/watch?v=${ytId}`;
      cleanUpdates.category = 'YOUTUBE';
    } else if (cleanUpdates.link && (cleanUpdates.link.startsWith('http://') || cleanUpdates.link.startsWith('https://'))) {
      cleanUpdates.category = 'ARTICLE';
    }
  }

  const { db } = await connectToDatabase();
  if (db) {
    await db.collection('shows').updateOne(
      { id },
      { $set: { ...cleanUpdates, updatedAt: new Date().toISOString() } }
    );
    const updated = await db.collection<ShowItem>('shows').findOne({ id });
    if (!updated) return null;
    const { _id: docId, ...rest } = updated as any;
    return { ...rest, id: rest.id || docId.toString() };
  }

  const store = getLocalStore();
  if (!store.shows) store.shows = [...initialShowsData];
  const idx = store.shows.findIndex((s) => s.id === id);
  if (idx === -1) return null;
  store.shows[idx] = { ...store.shows[idx], ...cleanUpdates, updatedAt: new Date().toISOString() };
  saveLocalStore(store);
  return store.shows[idx];
}

export async function deleteShow(id: string): Promise<boolean> {
  const { db } = await connectToDatabase();
  if (db) {
    const res = await db.collection('shows').deleteOne({ id });
    return res.deletedCount > 0;
  }

  const store = getLocalStore();
  if (!store.shows) return false;
  const beforeLen = store.shows.length;
  store.shows = store.shows.filter((s) => s.id !== id);
  saveLocalStore(store);
  return store.shows.length < beforeLen;
}

// ----------------- ADMIN USERS & ACCOUNTS -----------------

/**
 * Đọc danh sách admin. Kho trống thì seed admin gốc (mật khẩu đã băm).
 * Mật khẩu plaintext còn sót được băm lại ngay khi đọc.
 * @returns {Promise<AdminUser[]>} Danh sách user, kèm hash mật khẩu.
 */
async function loadAdminUsers(): Promise<AdminUser[]> {
  const { db } = await connectToDatabase();

  if (db) {
    const docs = await db.collection<AdminUser>('admin_users').find({}).toArray();
    if (docs.length === 0) {
      const seed = await buildDefaultAdminUser();
      await db.collection('admin_users').insertOne({ ...seed });
      return [seed];
    }

    const users: AdminUser[] = [];
    for (const raw of docs) {
      const { _id, ...rest } = raw as AdminUser & { _id?: { toString(): string } };
      const user: AdminUser = {
        ...rest,
        id: rest.id || _id?.toString() || '',
      };
      if (user.password && !isBcryptHash(user.password)) {
        const hashed = await hashPassword(user.password);
        await db.collection('admin_users').updateOne(
          { username: user.username },
          { $set: { password: hashed, updatedAt: new Date().toISOString() } }
        );
        user.password = hashed;
      }
      users.push(user);
    }
    return users;
  }

  const store = getLocalStore();
  if (!store.users || store.users.length === 0) {
    store.users = [await buildDefaultAdminUser()];
    saveLocalStore(store);
    return store.users;
  }

  let changed = false;
  for (const user of store.users) {
    if (user.password && !isBcryptHash(user.password)) {
      user.password = await hashPassword(user.password);
      changed = true;
    }
  }
  if (changed) {
    saveLocalStore(store);
  }
  return store.users;
}

/**
 * Ghi thêm một tài khoản vào MongoDB hoặc file local.
 * @param {AdminUser} user Tài khoản, password phải là hash.
 * @returns {Promise<void>}
 */
async function persistAdminUser(user: AdminUser): Promise<void> {
  const { db } = await connectToDatabase();
  if (db) {
    await db.collection('admin_users').insertOne({ ...user });
    return;
  }

  const store = getLocalStore();
  if (!store.users) store.users = [];
  store.users.push(user);
  saveLocalStore(store);
}

/**
 * Danh sách tài khoản admin, đã bỏ trường password.
 * @returns {Promise<Omit<AdminUser, 'password'>[]>}
 */
export async function getAdminUsers(): Promise<Omit<AdminUser, 'password'>[]> {
  const users = await loadAdminUsers();
  return users.map(({ password, ...rest }) => rest);
}

/**
 * Tìm admin theo username. Thiếu tài khoản gốc thì seed một lần.
 * @param {string} username Tên đăng nhập.
 * @returns {Promise<AdminUser | null>}
 */
export async function getAdminUserByUsername(username: string): Promise<AdminUser | null> {
  const clean = username.trim().toLowerCase();
  const users = await loadAdminUsers();
  const found = users.find((user) => user.username.toLowerCase() === clean);
  if (found) return found;

  if (clean === getPrimaryAdminUsername()) {
    const seed = await buildDefaultAdminUser();
    await persistAdminUser(seed);
    return seed;
  }
  return null;
}

/**
 * Tạo tài khoản admin/editor. Mật khẩu được băm trước khi lưu.
 * @param {{ username: string; password: string; name: string; role: 'admin' | 'editor' }} data
 * @returns {Promise<{ success: boolean; user?: Omit<AdminUser, 'password'>; error?: string }>}
 */
export async function createAdminUser(data: {
  username: string;
  password: string;
  name: string;
  role: 'admin' | 'editor';
}): Promise<{ success: boolean; user?: Omit<AdminUser, 'password'>; error?: string }> {
  const username = data.username.trim().toLowerCase();
  const existing = await getAdminUserByUsername(username);
  if (existing) {
    return { success: false, error: 'Tên đăng nhập này đã tồn tại trong hệ thống' };
  }

  const newUser: AdminUser = {
    id: 'usr-' + Date.now(),
    username,
    password: await hashPassword(data.password),
    name: data.name || username,
    role: data.role || 'admin',
    createdAt: new Date().toISOString(),
  };

  await persistAdminUser(newUser);
  const { password, ...safe } = newUser;
  return { success: true, user: safe };
}

/**
 * Đổi mật khẩu và lưu dưới dạng hash bcrypt.
 * @param {string} username Tài khoản cần đổi.
 * @param {string} newPassword Mật khẩu mới, plaintext.
 * @returns {Promise<{ success: boolean; error?: string }>}
 */
export async function updateUserPassword(
  username: string,
  newPassword: string
): Promise<{ success: boolean; error?: string }> {
  const clean = username.trim().toLowerCase();
  const hashed = await hashPassword(newPassword);
  const { db } = await connectToDatabase();

  if (db) {
    const existing = await db.collection<AdminUser>('admin_users').findOne({ username: clean });
    if (!existing) {
      if (clean === getPrimaryAdminUsername()) {
        const seed = await buildDefaultAdminUser();
        await db.collection('admin_users').insertOne({
          ...seed,
          password: hashed,
          updatedAt: new Date().toISOString(),
        });
        return { success: true };
      }
      return { success: false, error: 'Không tìm thấy tài khoản người dùng' };
    }

    await db.collection('admin_users').updateOne(
      { username: clean },
      { $set: { password: hashed, updatedAt: new Date().toISOString() } }
    );
    return { success: true };
  }

  const store = getLocalStore();
  if (!store.users) store.users = [];
  const index = store.users.findIndex((user) => user.username.toLowerCase() === clean);
  if (index !== -1) {
    store.users[index].password = hashed;
    store.users[index].updatedAt = new Date().toISOString();
    saveLocalStore(store);
    return { success: true };
  }

  if (clean === getPrimaryAdminUsername()) {
    const seed = await buildDefaultAdminUser();
    store.users.push({
      ...seed,
      password: hashed,
      updatedAt: new Date().toISOString(),
    });
    saveLocalStore(store);
    return { success: true };
  }

  return { success: false, error: 'Không tìm thấy tài khoản' };
}

/**
 * Xóa tài khoản phụ. Không cho xóa admin gốc.
 * @param {string} id Id tài khoản.
 * @returns {Promise<{ success: boolean; error?: string }>}
 */
export async function deleteAdminUser(id: string): Promise<{ success: boolean; error?: string }> {
  const { db } = await connectToDatabase();
  const primaryUsername = getPrimaryAdminUsername();

  if (db) {
    const user = await db.collection<AdminUser>('admin_users').findOne({
      $or: [{ id }, { _id: id as any }],
    });
    if (!user) return { success: false, error: 'Tài khoản không tồn tại' };
    if (user.username === primaryUsername || user.username === 'admin') {
      return { success: false, error: 'Không thể xóa tài khoản Quản trị viên chính' };
    }
    await db.collection('admin_users').deleteOne({
      $or: [{ id }, { _id: id as any }],
    });
    return { success: true };
  }

  const store = getLocalStore();
  if (!store.users) return { success: false, error: 'Không tìm thấy danh sách tài khoản' };
  const user = store.users.find((item) => item.id === id);
  if (!user) return { success: false, error: 'Tài khoản không tồn tại' };
  if (user.username === primaryUsername || user.username === 'admin') {
    return { success: false, error: 'Không thể xóa tài khoản Quản trị viên chính' };
  }
  store.users = store.users.filter((item) => item.id !== id);
  saveLocalStore(store);
  return { success: true };
}
