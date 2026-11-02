import { MongoClient, Db } from 'mongodb';
import { initialProfile, initialSchedules, initialGallery } from './initialData';
import { ScheduleItem, CelebrityProfile, GalleryItem, SongItem, ShowItem, AdminUser } from '@/types';
import initialSongsData from './musicData.json';
import { initialShowsData } from './initialShows';
import fs from 'fs';
import path from 'path';

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
}

function getDefaultAdminUser(): AdminUser {
  return {
    id: 'usr-primary-admin',
    username: process.env.ADMIN_USERNAME || 'admin',
    password: process.env.ADMIN_PASSWORD || 'lena2202',
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
        if (!parsed.users || parsed.users.length === 0) {
          parsed.users = [getDefaultAdminUser()];
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
    users: [getDefaultAdminUser()],
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
  const { db } = await connectToDatabase();
  if (db) {
    await db.collection('schedules').updateOne({ id }, { $set: { ...updates, updatedAt: new Date().toISOString() } });
    const updated = await db.collection<ScheduleItem>('schedules').findOne({ id });
    return updated as any;
  }

  const store = getLocalStore();
  const index = store.schedules.findIndex((s) => s.id === id);
  if (index === -1) return null;
  store.schedules[index] = { ...store.schedules[index], ...updates, updatedAt: new Date().toISOString() };
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
  const { db } = await connectToDatabase();
  if (db) {
    await db.collection('profiles').updateOne(
      { key: 'main_profile' },
      { $set: updates },
      { upsert: true }
    );
    return getProfile();
  }

  const store = getLocalStore();
  store.profile = { ...store.profile, ...updates };
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

export async function deleteGalleryItem(id: string): Promise<boolean> {
  const { db } = await connectToDatabase();
  if (db) {
    const res = await db.collection('gallery').deleteOne({ id });
    return res.deletedCount > 0;
  }

  const store = getLocalStore();
  store.gallery = store.gallery.filter((g) => g.id !== id);
  saveLocalStore(store);
  return true;
}

// ----------------- SONGS (MUSIC LIST) -----------------

export function extractYoutubeId(url: string): string {
  if (!url) return '';
  const match = url.match(/(?:youtu\.be\/|v=|\/embed\/|\/v\/|watch\?v=|\&v=)([a-zA-Z0-9_-]{11})/);
  return match ? match[1] : '';
}

export async function getSongs(): Promise<SongItem[]> {
  const { db } = await connectToDatabase();
  if (db) {
    const items = await db.collection<SongItem>('songs').find({}).toArray();
    if (items.length > 0) {
      return items.map(({ _id, ...rest }: any) => ({
        ...rest,
        id: rest.id || _id.toString(),
      }));
    } else {
      await db.collection('songs').insertMany(initialSongsData as any);
      return initialSongsData as SongItem[];
    }
  }
  return getLocalStore().songs || (initialSongsData as SongItem[]);
}

export async function createSong(item: {
  title: string;
  artists?: string;
  releaseDate?: string;
  youtubeUrl?: string;
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
  const { db } = await connectToDatabase();
  if (db) {
    await db.collection('shows').updateOne({ id }, { $set: { ...updates, updatedAt: new Date().toISOString() } });
    const updated = await db.collection<ShowItem>('shows').findOne({ id });
    return updated as any;
  }

  const store = getLocalStore();
  if (!store.shows) store.shows = [...initialShowsData];
  const idx = store.shows.findIndex((s) => s.id === id);
  if (idx === -1) return null;
  store.shows[idx] = { ...store.shows[idx], ...updates, updatedAt: new Date().toISOString() };
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

export async function getAdminUsers(): Promise<Omit<AdminUser, 'password'>[]> {
  const { db } = await connectToDatabase();
  const defaultAdmin = getDefaultAdminUser();

  if (db) {
    const users = await db.collection<AdminUser>('admin_users').find({}).toArray();
    if (users.length === 0) {
      await db.collection('admin_users').insertOne({ ...defaultAdmin });
      const { password, _id, ...safe } = defaultAdmin as any;
      return [safe];
    }
    return users.map(({ password, _id, ...rest }: any) => ({
      ...rest,
      id: rest.id || _id.toString(),
    }));
  }

  const store = getLocalStore();
  if (!store.users || store.users.length === 0) {
    store.users = [defaultAdmin];
    saveLocalStore(store);
  }
  return store.users.map(({ password, ...rest }) => rest);
}

export async function getAdminUserByUsername(username: string): Promise<AdminUser | null> {
  const { db } = await connectToDatabase();
  const defaultAdmin = getDefaultAdminUser();

  if (db) {
    const user = await db.collection<AdminUser>('admin_users').findOne({ username });
    if (user) {
      const { _id, ...rest } = user as any;
      return { ...rest, id: rest.id || _id.toString() };
    }
    // If database is empty or user is default admin from env, auto-seed default admin
    if (username === defaultAdmin.username) {
      await db.collection('admin_users').insertOne({ ...defaultAdmin });
      return defaultAdmin;
    }
    return null;
  }

  const store = getLocalStore();
  if (!store.users) store.users = [defaultAdmin];
  const found = store.users.find((u) => u.username === username);
  if (found) return found;
  if (username === defaultAdmin.username) return defaultAdmin;
  return null;
}

export async function createAdminUser(data: {
  username: string;
  password: string;
  name: string;
  role: 'admin' | 'editor';
}): Promise<{ success: boolean; user?: Omit<AdminUser, 'password'>; error?: string }> {
  const existing = await getAdminUserByUsername(data.username);
  if (existing) {
    return { success: false, error: 'Tên đăng nhập này đã tồn tại trong hệ thống' };
  }

  const newUser: AdminUser = {
    id: 'usr-' + Date.now(),
    username: data.username.trim().toLowerCase(),
    password: data.password,
    name: data.name || data.username,
    role: data.role || 'admin',
    createdAt: new Date().toISOString(),
  };

  const { db } = await connectToDatabase();
  if (db) {
    await db.collection('admin_users').insertOne({ ...newUser });
  } else {
    const store = getLocalStore();
    if (!store.users) store.users = [getDefaultAdminUser()];
    store.users.push(newUser);
    saveLocalStore(store);
  }

  const { password, ...safe } = newUser;
  return { success: true, user: safe };
}

export async function updateUserPassword(
  username: string,
  newPassword: string
): Promise<{ success: boolean; error?: string }> {
  const { db } = await connectToDatabase();
  const defaultAdmin = getDefaultAdminUser();

  if (db) {
    const existing = await db.collection<AdminUser>('admin_users').findOne({ username });
    if (!existing) {
      if (username === defaultAdmin.username) {
        await db.collection('admin_users').insertOne({
          ...defaultAdmin,
          password: newPassword,
          updatedAt: new Date().toISOString(),
        });
        return { success: true };
      }
      return { success: false, error: 'Không tìm thấy tài khoản người dùng' };
    }

    await db.collection('admin_users').updateOne(
      { username },
      { $set: { password: newPassword, updatedAt: new Date().toISOString() } }
    );
    return { success: true };
  }

  const store = getLocalStore();
  if (!store.users) store.users = [defaultAdmin];
  const idx = store.users.findIndex((u) => u.username === username);
  if (idx !== -1) {
    store.users[idx].password = newPassword;
    store.users[idx].updatedAt = new Date().toISOString();
    saveLocalStore(store);
    return { success: true };
  } else if (username === defaultAdmin.username) {
    store.users.push({
      ...defaultAdmin,
      password: newPassword,
      updatedAt: new Date().toISOString(),
    });
    saveLocalStore(store);
    return { success: true };
  }

  return { success: false, error: 'Không tìm thấy tài khoản' };
}

export async function deleteAdminUser(id: string): Promise<{ success: boolean; error?: string }> {
  const { db } = await connectToDatabase();
  const defaultAdmin = getDefaultAdminUser();

  if (db) {
    const user = await db.collection<AdminUser>('admin_users').findOne({
      $or: [{ id }, { _id: id as any }],
    });
    if (!user) return { success: false, error: 'Tài khoản không tồn tại' };
    if (user.username === defaultAdmin.username || user.username === 'admin') {
      return { success: false, error: 'Không thể xóa tài khoản Quản trị viên chính' };
    }
    await db.collection('admin_users').deleteOne({
      $or: [{ id }, { _id: id as any }],
    });
    return { success: true };
  }

  const store = getLocalStore();
  if (!store.users) return { success: false, error: 'Không tìm thấy danh sách tài khoản' };
  const user = store.users.find((u) => u.id === id);
  if (!user) return { success: false, error: 'Tài khoản không tồn tại' };
  if (user.username === defaultAdmin.username || user.username === 'admin') {
    return { success: false, error: 'Không thể xóa tài khoản Quản trị viên chính' };
  }
  store.users = store.users.filter((u) => u.id !== id);
  saveLocalStore(store);
  return { success: true };
}
