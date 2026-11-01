'use client';

import { useState } from 'react';
import { CelebrityProfile } from '@/types';
import { User, Save, Check, Globe, Heart } from 'lucide-react';

export default function ProfileManagerClient({ initialProfile }: { initialProfile: CelebrityProfile }) {
  const [profile, setProfile] = useState<CelebrityProfile>(initialProfile);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const res = await fetch('/api/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profile),
      });

      if (res.ok) {
        showToast('Đã lưu thông tin Profile thành công!');
      } else {
        alert('Lỗi cập nhật profile');
      }
    } catch (err) {
      alert('Lỗi kết nối máy chủ');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Toast */}
      {toast && (
        <div className="fixed top-20 right-6 z-50 neo-box p-3 bg-brand-yellow text-black flex items-center gap-2 text-sm font-black animate-bounce">
          <Check className="w-5 h-5 text-green-700" />
          <span>{toast}</span>
        </div>
      )}

      {/* Header */}
      <div>
        <span className="neo-sticker bg-brand-pink text-black text-xs font-black">
          PROFILE & BRANDING
        </span>
        <h1 className="text-2xl sm:text-4xl font-black text-black uppercase font-cocogoose mt-1">
          Cập Nhật Thông Tin OwO
        </h1>
        <p className="text-xs sm:text-sm font-bold text-gray-600">
          Chỉnh sửa thông tin giới thiệu, trích dẫn, tên fandom và liên kết mạng xã hội
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Box 1: General Info */}
        <div className="neo-box p-6 bg-white space-y-4">
          <h3 className="text-lg font-black text-black uppercase font-cocogoose flex items-center gap-2 border-b-2 border-gray-200 pb-2">
            <User className="w-5 h-5 text-brand-red" />
            Thông Tin Cá Nhân & Nghệ Danh
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-black uppercase text-gray-700 mb-1">
                Nghệ Danh (Stage Name) *
              </label>
              <input
                type="text"
                required
                value={profile.stageName}
                onChange={(e) => setProfile({ ...profile, stageName: e.target.value })}
                className="neo-input w-full text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-black uppercase text-gray-700 mb-1">
                Họ và Tên Thật *
              </label>
              <input
                type="text"
                required
                value={profile.fullName}
                onChange={(e) => setProfile({ ...profile, fullName: e.target.value })}
                className="neo-input w-full text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-black uppercase text-gray-700 mb-1">
                Danh Xưng / Title *
              </label>
              <input
                type="text"
                required
                value={profile.title}
                onChange={(e) => setProfile({ ...profile, title: e.target.value })}
                className="neo-input w-full text-sm"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-black uppercase text-gray-700 mb-1 flex items-center gap-1">
                <Heart className="w-3.5 h-3.5 text-brand-red" />
                Tên Fandom Chính Thức *
              </label>
              <input
                type="text"
                required
                value={profile.fandomName || 'Ô Mai'}
                onChange={(e) => setProfile({ ...profile, fandomName: e.target.value })}
                className="neo-input w-full text-sm font-black text-brand-red"
              />
            </div>

            <div>
              <label className="block text-xs font-black uppercase text-gray-700 mb-1">
                Câu Trích Dẫn Nổi Bật (Quote)
              </label>
              <input
                type="text"
                value={profile.quote}
                onChange={(e) => setProfile({ ...profile, quote: e.target.value })}
                className="neo-input w-full text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-black uppercase text-gray-700 mb-1">
              Tiểu Sử / Giới Thiệu Sự Nghiệp
            </label>
            <textarea
              rows={4}
              value={profile.bio}
              onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
              className="neo-input w-full text-sm"
            />
          </div>
        </div>

        {/* Box 2: Social Links */}
        <div className="neo-box p-6 bg-white space-y-4">
          <h3 className="text-lg font-black text-black uppercase font-cocogoose flex items-center gap-2 border-b-2 border-gray-200 pb-2">
            <Globe className="w-5 h-5 text-brand-blue" />
            Liên Kết Mạng Xã Hội Chính Thức
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-black uppercase text-gray-700 mb-1">
                Facebook Link
              </label>
              <input
                type="url"
                value={profile.socialLinks.facebook}
                onChange={(e) =>
                  setProfile({
                    ...profile,
                    socialLinks: { ...profile.socialLinks, facebook: e.target.value },
                  })
                }
                className="neo-input w-full text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-black uppercase text-gray-700 mb-1">
                Instagram Link
              </label>
              <input
                type="url"
                value={profile.socialLinks.instagram}
                onChange={(e) =>
                  setProfile({
                    ...profile,
                    socialLinks: { ...profile.socialLinks, instagram: e.target.value },
                  })
                }
                className="neo-input w-full text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-black uppercase text-gray-700 mb-1">
                TikTok Link
              </label>
              <input
                type="url"
                value={profile.socialLinks.tiktok}
                onChange={(e) =>
                  setProfile({
                    ...profile,
                    socialLinks: { ...profile.socialLinks, tiktok: e.target.value },
                  })
                }
                className="neo-input w-full text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-black uppercase text-gray-700 mb-1">
                YouTube Channel
              </label>
              <input
                type="url"
                value={profile.socialLinks.youtube}
                onChange={(e) =>
                  setProfile({
                    ...profile,
                    socialLinks: { ...profile.socialLinks, youtube: e.target.value },
                  })
                }
                className="neo-input w-full text-sm"
              />
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div>
          <button
            type="submit"
            disabled={saving}
            className="neo-btn bg-brand-yellow hover:bg-yellow-400 text-black px-8 py-3 text-base font-black gap-2 shadow-brutal"
          >
            <Save className="w-5 h-5" />
            <span>{saving ? 'Đang Lưu...' : 'Lưu Thay Đổi Profile'}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
