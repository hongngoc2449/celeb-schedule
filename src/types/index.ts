export type ScheduleCategory =
  | 'STAGE'
  | 'SHOOTING'
  | 'CONCERT'
  | 'REHEARSAL'
  | 'BRAND_COLLAB'
  | 'LIVESTREAM'
  | 'FAN_MEETING'
  | 'POP_UP'
  | 'EVENT';

export type ScheduleStatus = 'UPCOMING' | 'TBU' | 'COMPLETED' | 'CANCELLED';

export type LocationBadgeColor =
  | 'yellow'
  | 'purple'
  | 'green'
  | 'pink'
  | 'cyan'
  | 'orange'
  | 'blue';

export interface ScheduleItem {
  id: string;
  title: string;
  dateDisplay: string;
  startDate: string; // YYYY-MM-DD
  endDate?: string;
  month: number;
  year: number;
  time?: string; // e.g. "19:30" or "20:00 - 22:30"
  category: ScheduleCategory;
  location?: string; // Tỉnh / Thành phố: TP. HỒ CHÍ MINH, HÀ NỘI...
  venue?: string; // Địa điểm cụ thể / Sân khấu: Sân Vận Động Mỹ Đình, Aeon Mall...
  locationColor?: LocationBadgeColor;
  status: ScheduleStatus;
  noteIcon?: string;
  organizer?: string; // Đơn vị tổ chức: Shopee, YSL, Tomorrowland, Fandom Ô Mai...
  lineup?: string; // Khách mời / Nghệ sĩ biểu diễn cùng: Jun Phạm, Hà An Huy...
  ticketUrl?: string; // Link mua vé / Livestream
  ticketInfo?: string; // Thông tin vé: Vé miễn phí, Vé VIP, Vào cửa tự do...
  note?: string; // Ghi chú & Lưu ý cho Fandom Ô Mai
  createdAt?: string;
  updatedAt?: string;
}

export interface CelebrityProfile {
  stageName: string;
  fullName: string;
  title: string;
  quote: string;
  bio: string;
  fandomName: string;
  avatarUrl: string;
  signatureUrl: string;
  signatureTitle: string;
  blogContact: {
    blogName: string;
    email: string;
    facebook: string;
    threads: string;
  };
  socialLinks: {
    facebook: string;
    instagram: string;
    tiktok: string;
    youtube: string;
    spotify: string;
  };
  siteTexts?: Record<string, string>;
}

export interface SiteTextDefinition {
  id: string;
  section: string;
  location: string;
  defaultValue: string;
}

export interface GalleryItem {
  id: string;
  imageUrl: string;
  title: string;
  category: string;
  date?: string;
}

export interface SongItem {
  id: string;
  stt: string;
  title: string;
  releaseDate: string;
  artists: string;
  youtubeUrl: string;
  youtubeId: string;
}

export interface AdminUser {
  id: string;
  username: string;
  password?: string;
  name: string;
  role: 'admin' | 'editor';
  createdAt: string;
  updatedAt?: string;
}
