'use client';

import { useState } from 'react';
import { AdminUser } from '@/types';
import {
  KeyRound,
  UserPlus,
  Users,
  Shield,
  Check,
  AlertCircle,
  Trash2,
  Lock,
  UserCheck,
  ShieldAlert
} from 'lucide-react';

interface Props {
  initialUsers: Omit<AdminUser, 'password'>[];
  currentUsername: string;
}

export default function AccountsManagerClient({ initialUsers, currentUsername }: Props) {
  const [users, setUsers] = useState<Omit<AdminUser, 'password'>[]>(initialUsers);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Password change state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordError, setPasswordError] = useState('');

  // Create user state
  const [newUsername, setNewUsername] = useState('');
  const [newName, setNewName] = useState('');
  const [newUserPassword, setNewUserPassword] = useState('');
  const [newUserRole, setNewUserRole] = useState<'admin' | 'editor'>('admin');
  const [createUserLoading, setCreateUserLoading] = useState(false);
  const [createUserError, setCreateUserError] = useState('');

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // 1. Handle Change Password
  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError('');

    if (newPassword.length < 4) {
      setPasswordError('Mật khẩu mới phải từ 4 ký tự trở lên');
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError('Mật khẩu xác nhận không khớp');
      return;
    }

    setPasswordLoading(true);

    try {
      const res = await fetch('/api/auth/password', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentPassword,
          newPassword,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        showToast('Đổi mật khẩu thành công!');
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      } else {
        setPasswordError(data.error || 'Lỗi khi đổi mật khẩu');
      }
    } catch (err) {
      setPasswordError('Lỗi kết nối máy chủ');
    } finally {
      setPasswordLoading(false);
    }
  };

  // 2. Handle Create New Admin / Editor Account
  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreateUserError('');

    if (!newUsername.trim()) {
      setCreateUserError('Vui lòng nhập tên đăng nhập');
      return;
    }

    if (newUserPassword.length < 4) {
      setCreateUserError('Mật khẩu phải từ 4 ký tự trở lên');
      return;
    }

    setCreateUserLoading(true);

    try {
      const res = await fetch('/api/auth/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: newUsername.trim(),
          name: newName.trim(),
          password: newUserPassword,
          role: newUserRole,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        showToast(`Tạo tài khoản "${newUsername}" thành công!`);
        setUsers((prev) => [...prev, data.user]);
        setNewUsername('');
        setNewName('');
        setNewUserPassword('');
      } else {
        setCreateUserError(data.error || 'Lỗi khi tạo tài khoản');
      }
    } catch (err) {
      setCreateUserError('Lỗi kết nối máy chủ');
    } finally {
      setCreateUserLoading(false);
    }
  };

  // 3. Handle Delete User
  const handleDeleteUser = async (id: string, username: string) => {
    if (username === 'admin' || username === currentUsername) {
      alert('Không thể xóa tài khoản Quản trị viên chính hoặc tài khoản đang đăng nhập!');
      return;
    }

    if (!confirm(`Bạn có chắc muốn xóa tài khoản "${username}"?`)) return;

    try {
      const res = await fetch(`/api/auth/users/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (res.ok) {
        setUsers((prev) => prev.filter((u) => u.id !== id));
        showToast(`Đã xóa tài khoản "${username}"`);
      } else {
        alert(data.error || 'Lỗi khi xóa tài khoản');
      }
    } catch (e) {
      alert('Lỗi kết nối máy chủ');
    }
  };

  return (
    <div className="space-y-8">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 neo-box p-3.5 bg-brand-yellow text-black flex items-center gap-2 text-sm font-black animate-bounce shadow-brutal">
          <Check className="w-5 h-5 text-green-700" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <div>
        <span className="neo-sticker bg-brand-yellow text-black text-xs font-black">
          BẢO MẬT &amp; PHÂN QUYỀN HỆ THỐNG
        </span>
        <h1 className="text-2xl sm:text-4xl font-black text-black uppercase font-cocogoose mt-1">
          Quản Lý Tài Khoản &amp; Mật Khẩu
        </h1>
        <p className="text-xs sm:text-sm font-bold text-gray-600">
          Đổi mật khẩu tài khoản hiện tại (đang đăng nhập: <strong className="text-brand-red">{currentUsername}</strong>) hoặc tạo thêm tài khoản quản trị cho ekip.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* LEFT COLUMN: ĐỔI MẬT KHẨU (6 COLS) */}
        <div className="lg:col-span-6">
          <div className="neo-box p-6 bg-white border-3 border-black shadow-brutal h-full flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 mb-4 pb-3 border-b-2 border-black">
                <div className="w-9 h-9 bg-brand-yellow rounded-xl border-2 border-black flex items-center justify-center">
                  <KeyRound className="w-5 h-5 text-black" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-black uppercase font-cocogoose leading-tight">
                    Đổi Mật Khẩu
                  </h3>
                  <p className="text-[11px] font-bold text-gray-500">
                    Cập nhật mật khẩu mới cho tài khoản: <strong>{currentUsername}</strong>
                  </p>
                </div>
              </div>

              {passwordError && (
                <div className="mb-4 p-3 bg-red-100 border-2 border-brand-red rounded-lg flex items-center gap-2 text-xs font-bold text-red-800">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{passwordError}</span>
                </div>
              )}

              <form onSubmit={handleChangePassword} className="space-y-4">
                <div>
                  <label className="block text-xs font-black uppercase text-gray-700 mb-1 flex items-center gap-1.5">
                    <Lock className="w-3.5 h-3.5" />
                    Mật Khẩu Hiện Tại *
                  </label>
                  <input
                    type="password"
                    required
                    placeholder="Nhập mật khẩu hiện tại..."
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="neo-input w-full text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-black uppercase text-gray-700 mb-1 flex items-center gap-1.5">
                    <KeyRound className="w-3.5 h-3.5 text-brand-red" />
                    Mật Khẩu Mới *
                  </label>
                  <input
                    type="password"
                    required
                    placeholder="Tối thiểu 4 ký tự..."
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="neo-input w-full text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-black uppercase text-gray-700 mb-1 flex items-center gap-1.5">
                    <Check className="w-3.5 h-3.5 text-brand-green" />
                    Xác Nhận Mật Khẩu Mới *
                  </label>
                  <input
                    type="password"
                    required
                    placeholder="Nhập lại mật khẩu mới..."
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="neo-input w-full text-sm"
                  />
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={passwordLoading}
                    className="neo-btn bg-brand-yellow hover:bg-yellow-400 text-black w-full py-2.5 text-sm font-black shadow-brutal gap-2"
                  >
                    <KeyRound className="w-4 h-4" />
                    <span>{passwordLoading ? 'Đang cập nhật...' : 'Cập Nhật Mật Khẩu Mới'}</span>
                  </button>
                </div>
              </form>
            </div>

            <div className="mt-5 p-3 bg-amber-50 rounded-lg border border-amber-300 text-[11px] font-semibold text-gray-700">
              💡 <strong>Lưu ý:</strong> Sau khi đổi mật khẩu thành công, mật khẩu mới sẽ lưu vào cơ sở dữ liệu MongoDB và có hiệu lực ngay lập tức.
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: TẠO TÀI KHOẢN MỚI (6 COLS) */}
        <div className="lg:col-span-6">
          <div className="neo-box p-6 bg-white border-3 border-black shadow-brutal h-full flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 mb-4 pb-3 border-b-2 border-black">
                <div className="w-9 h-9 bg-brand-lightgreen rounded-xl border-2 border-black flex items-center justify-center">
                  <UserPlus className="w-5 h-5 text-black" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-black uppercase font-cocogoose leading-tight">
                    Tạo Tài Khoản Mới
                  </h3>
                  <p className="text-[11px] font-bold text-gray-500">
                    Cấp quyền truy cập hệ thống cho ekip hoặc cộng tác viên
                  </p>
                </div>
              </div>

              {createUserError && (
                <div className="mb-4 p-3 bg-red-100 border-2 border-brand-red rounded-lg flex items-center gap-2 text-xs font-bold text-red-800">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{createUserError}</span>
                </div>
              )}

              <form onSubmit={handleCreateUser} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-black uppercase text-gray-700 mb-1">
                      Tên Đăng Nhập *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="VD: quanly, troly..."
                      value={newUsername}
                      onChange={(e) => setNewUsername(e.target.value)}
                      className="neo-input w-full text-sm font-mono lowercase"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-black uppercase text-gray-700 mb-1">
                      Họ Tên / Biệt Danh
                    </label>
                    <input
                      type="text"
                      placeholder="VD: Trợ lý Nam, Quản lý..."
                      value={newName}
                      onChange={(e) => setNewName(e.target.value)}
                      className="neo-input w-full text-sm"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-black uppercase text-gray-700 mb-1">
                      Mật Khẩu Khởi Tạo *
                    </label>
                    <input
                      type="password"
                      required
                      placeholder="Tối thiểu 4 ký tự..."
                      value={newUserPassword}
                      onChange={(e) => setNewUserPassword(e.target.value)}
                      className="neo-input w-full text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-black uppercase text-gray-700 mb-1">
                      Vai Trò / Phân Quyền
                    </label>
                    <select
                      value={newUserRole}
                      onChange={(e) => setNewUserRole(e.target.value as 'admin' | 'editor')}
                      className="neo-input w-full text-sm"
                    >
                      <option value="admin">Quản Trị Viên (Admin)</option>
                      <option value="editor">Biên Tập Viên (Editor)</option>
                    </select>
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={createUserLoading}
                    className="neo-btn bg-brand-lightgreen hover:bg-emerald-300 text-black w-full py-2.5 text-sm font-black shadow-brutal gap-2"
                  >
                    <UserPlus className="w-4 h-4" />
                    <span>{createUserLoading ? 'Đang tạo...' : 'Tạo Tài Khoản Mới'}</span>
                  </button>
                </div>
              </form>
            </div>

            <div className="mt-5 p-3 bg-emerald-50 rounded-lg border border-emerald-300 text-[11px] font-semibold text-gray-700">
              👥 Tài khoản mới tạo có thể đăng nhập ngay lập tức tại trang <code>/admin/login</code> với tên đăng nhập và mật khẩu vừa đặt.
            </div>
          </div>
        </div>

      </div>

      {/* SECTION 3: DANH SÁCH TÀI KHOẢN HIỆN CÓ */}
      <div className="neo-box p-6 bg-white border-3 border-black shadow-brutal">
        <div className="flex items-center justify-between gap-4 mb-4 pb-3 border-b-2 border-black">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 bg-brand-pink rounded-xl border-2 border-black flex items-center justify-center">
              <Users className="w-5 h-5 text-black" />
            </div>
            <div>
              <h3 className="text-lg font-black text-black uppercase font-cocogoose">
                Danh Sách Tài Khoản Trong Hệ Thống ({users.length})
              </h3>
              <p className="text-[11px] font-bold text-gray-500">
                Các tài khoản có quyền truy cập vào cổng quản trị nội bộ
              </p>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b-2 border-black bg-brand-paper text-[11px] font-black uppercase text-gray-700 font-cocogoose">
                <th className="p-3">Tài Khoản</th>
                <th className="p-3">Họ Tên / Biệt Danh</th>
                <th className="p-3">Vai Trò</th>
                <th className="p-3">Ngày Tạo</th>
                <th className="p-3 text-right">Thao Tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 text-xs font-bold text-gray-800">
              {users.map((u) => {
                const isCurrent = u.username === currentUsername;
                const isPrimary = u.username === 'admin';

                return (
                  <tr key={u.id} className="hover:bg-amber-50/50">
                    <td className="p-3 font-mono">
                      <div className="flex items-center gap-2">
                        <span className="font-black text-black text-sm">{u.username}</span>
                        {isCurrent && (
                          <span className="text-[10px] bg-brand-yellow px-1.5 py-0.5 rounded border border-black font-black">
                            Đang Đăng Nhập
                          </span>
                        )}
                        {isPrimary && (
                          <span className="text-[10px] bg-brand-red text-white px-1.5 py-0.5 rounded border border-black font-black">
                            Chính
                          </span>
                        )}
                      </div>
                    </td>

                    <td className="p-3">
                      <span className="text-gray-900 font-extrabold">{u.name || '—'}</span>
                    </td>

                    <td className="p-3">
                      <span
                        className={`text-[10px] font-black px-2 py-0.5 rounded-full border border-black uppercase ${
                          u.role === 'admin'
                            ? 'bg-purple-100 text-purple-900'
                            : 'bg-blue-100 text-blue-900'
                        }`}
                      >
                        {u.role === 'admin' ? 'Quản Trị Viên' : 'Biên Tập Viên'}
                      </span>
                    </td>

                    <td className="p-3 text-gray-500 font-normal">
                      {u.createdAt ? new Date(u.createdAt).toLocaleDateString('vi-VN') : 'Mặc định'}
                    </td>

                    <td className="p-3 text-right">
                      {isPrimary ? (
                        <span className="text-[10px] text-gray-400 font-bold italic">
                          Không thể xóa
                        </span>
                      ) : isCurrent ? (
                        <span className="text-[10px] text-gray-400 font-bold italic">
                          Tài khoản của bạn
                        </span>
                      ) : (
                        <button
                          onClick={() => handleDeleteUser(u.id, u.username)}
                          className="neo-btn bg-white hover:bg-brand-red hover:text-white p-1.5"
                          title="Xóa tài khoản"
                        >
                          <Trash2 className="w-3.5 h-3.5 text-red-600 hover:text-white" />
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
