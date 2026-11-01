import { MongoClient, Db } from 'mongodb';
import { initialProfile, initialSchedules, initialGallery } from './initialData';
import { ScheduleItem, CelebrityProfile, GalleryItem, SongItem } from '@/types';
import initialSongsData from './musicData.json';
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
  if (db) {
    const p = await db.collection('profiles').findOne({ key: 'main_profile' });
    if (p) {
      const { _id, key, ...rest } = p as any;
      return rest;
    } else {
      await db.collection('profiles').insertOne({ key: 'main_profile', ...initialProfile });
      return initialProfile;
    }
  }
  return getLocalStore().profile;
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
