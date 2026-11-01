'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Shield, Lock, User, ArrowRight, AlertCircle } from 'lucide-react';

export default function AdminLoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('osad2026');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Đăng nhập không thành công');
        setLoading(false);
        return;
      }

      router.push('/admin');
      router.refresh();
    } catch (err) {
      setError('Lỗi kết nối máy chủ');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f3ede2] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo Card */}
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-brand-yellow rounded-2xl border-3 border-black shadow-brutal mx-auto mb-3 flex items-center justify-center p-2 rotate-2">
            <Image
              src="/images/logo 3.png"
              alt="OSAD Logo Mascot"
              width={50}
              height={50}
              className="object-contain"
            />
          </div>
          <span className="neo-sticker bg-brand-red text-white text-xs font-black uppercase">
            HỆ THỐNG QUẢN TRỊ NỘI BỘ
          </span>
          <h1 className="text-3xl font-black text-black mt-2 font-cocogoose uppercase">
            ADMIN PORTAL
          </h1>
          <p className="text-xs font-bold text-gray-600 mt-1">
            Quản lý lịch công tác, hình ảnh & thông tin của Chủ Tịch Mai
          </p>
        </div>

        {/* Login Form Box */}
        <div className="neo-box p-6 sm:p-8 bg-white border-3 border-black">
          {error && (
            <div className="mb-4 p-3 bg-red-100 border-2 border-brand-red rounded-lg flex items-center gap-2 text-xs font-bold text-red-800">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-black uppercase text-gray-700 mb-1.5 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-black" />
                Tài khoản Quản trị
              </label>
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="neo-input w-full text-sm"
                placeholder="admin"
              />
            </div>

            <div>
              <label className="block text-xs font-black uppercase text-gray-700 mb-1.5 flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-black" />
                Mật khẩu
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="neo-input w-full text-sm"
                placeholder="••••••••"
              />
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="neo-btn bg-brand-yellow hover:bg-yellow-400 text-black w-full py-3 text-sm font-black gap-2"
              >
                <Shield className="w-4 h-4" />
                <span>{loading ? 'Đang xác thực...' : 'Đăng Nhập Quản Trị'}</span>
                <ArrowRight className="w-4 h-4 ml-auto" />
              </button>
            </div>
          </form>

          {/* Dev credentials tip */}
          <div className="mt-6 pt-4 border-t-2 border-dashed border-gray-300 text-center">
            <p className="text-[11px] font-bold text-gray-500">
              Mặc định dev: <code className="bg-gray-100 px-1 py-0.5 rounded border border-gray-300 font-mono text-black">admin</code> / <code className="bg-gray-100 px-1 py-0.5 rounded border border-gray-300 font-mono text-black">osad2026</code>
            </p>
          </div>
        </div>

        {/* Back Link */}
        <div className="text-center mt-6">
          <a
            href="/"
            className="text-xs font-extrabold text-gray-700 hover:text-black hover:underline"
          >
            ← Quay lại Trang Chủ Website
          </a>
        </div>
      </div>
    </div>
  );
}

