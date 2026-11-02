'use client';

import { useState } from 'react';
import { ScheduleItem, ScheduleCategory, LocationBadgeColor, ScheduleStatus, LocationType } from '@/types';
import {
  Plus,
  Edit2,
  Trash2,
  Calendar,
  Search,
  MapPin,
  Tag,
  Check,
  X,
  Clock,
  Building2,
  Users,
  Ticket,
  Sparkles,
  ExternalLink,
  Info,
  Globe,
  Lock
} from 'lucide-react';

interface Props {
  initialSchedules: ScheduleItem[];
}

const DEFAULT_FORM: Partial<ScheduleItem> = {
  title: '',
  dateDisplay: '',
  startDate: new Date().toISOString().substring(0, 10),
  endDate: '',
  month: 11,
  year: 2026,
  time: '',
  category: 'STAGE',
  locationType: 'OFFLINE',
  location: '',
  venue: '',
  locationColor: 'green',
  status: 'UPCOMING',
  noteIcon: '',
  organizer: '',
  lineup: '',
  ticketInfo: '',
  ticketUrl: '',
  note: '',
};

export default function ScheduleManagerClient({ initialSchedules }: Props) {
  const [schedules, setSchedules] = useState<ScheduleItem[]>(initialSchedules);
  const [search, setSearch] = useState('');
  const [filterMonth, setFilterMonth] = useState<'ALL' | 11 | 12>('ALL');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<ScheduleItem | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Form State
  const [formData, setFormData] = useState<Partial<ScheduleItem>>(DEFAULT_FORM);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const openCreateModal = () => {
    setEditingItem(null);
    setFormData({
      ...DEFAULT_FORM,
      startDate: new Date().toISOString().substring(0, 10),
    });
    setIsModalOpen(true);
  };

  const openEditModal = (item: ScheduleItem) => {
    setEditingItem(item);
    const detectedType: LocationType =
      item.locationType ||
      (item.location?.toUpperCase() === 'ONLINE' || item.location?.toLowerCase().includes('online')
        ? 'ONLINE'
        : item.location?.toUpperCase() === 'PRIVATE' || item.location?.toLowerCase().includes('private')
        ? 'PRIVATE'
        : 'OFFLINE');
    setFormData({
      ...DEFAULT_FORM,
      ...item,
      locationType: detectedType,
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Bạn có chắc muốn xóa lịch trình: "${title}"?`)) return;

    try {
      const res = await fetch(`/api/schedules/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setSchedules((prev) => prev.filter((s) => s.id !== id));
        showToast('Đã xóa sự kiện thành công!');
      } else {
        alert('Lỗi khi xóa sự kiện');
      }
    } catch (e) {
      alert('Lỗi kết nối');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const { _id, ...cleanData } = formData as any;

      if (editingItem) {
        // Update
        const res = await fetch(`/api/schedules/${editingItem.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(cleanData),
        });
        const data = await res.json();
        if (res.ok && data.schedule) {
          setSchedules((prev) =>
            prev.map((s) => (s.id === editingItem.id ? data.schedule : s))
          );
          setIsModalOpen(false);
          showToast('Đã cập nhật lịch trình thành công!');
        } else {
          alert(data.error || 'Lỗi cập nhật');
        }
      } else {
        // Create
        const res = await fetch('/api/schedules', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(cleanData),
        });
        const data = await res.json();
        if (res.ok) {
          setSchedules((prev) => [...prev, data.schedule]);
          setIsModalOpen(false);
          showToast('Đã thêm lịch trình mới thành công!');
        } else {
          alert(data.error || 'Lỗi thêm mới');
        }
      }
    } catch (err) {
      alert('Lỗi mạng hoặc server');
    } finally {
      setSubmitting(false);
    }
  };

  // Filtered List
  const displayList = schedules.filter((s) => {
    if (filterMonth !== 'ALL' && s.month !== filterMonth) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      return (
        s.title.toLowerCase().includes(q) ||
        s.dateDisplay.toLowerCase().includes(q) ||
        (s.location && s.location.toLowerCase().includes(q)) ||
        (s.venue && s.venue.toLowerCase().includes(q)) ||
        (s.organizer && s.organizer.toLowerCase().includes(q))
      );
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 neo-box p-3 bg-brand-yellow text-black flex items-center gap-2 text-sm font-black animate-bounce">
          <Check className="w-5 h-5 text-green-700" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Bar with Title & Add Button */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <span className="neo-sticker bg-brand-yellow text-black text-xs font-black">
            LỊCH CÔNG TÁC CHỦ TỊCH MAI
          </span>
          <h1 className="text-2xl sm:text-4xl font-black text-black uppercase font-cocogoose mt-1">
            Quản Lý Lịch Trình
          </h1>
          <p className="text-xs sm:text-sm font-bold text-gray-600">
            Tổng cộng: <strong className="text-brand-red">{schedules.length}</strong> sự kiện • Dữ liệu đồng bộ với trang lịch trình &amp; bảng chi tiết
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="neo-btn bg-brand-yellow hover:bg-yellow-400 text-black px-4 py-2.5 text-sm font-black gap-2 shadow-brutal"
        >
          <Plus className="w-4 h-4" />
          <span>Thêm Sự Kiện Mới</span>
        </button>
      </div>

      {/* Search & Month Filters */}
      <div className="neo-box p-4 bg-white flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button
            onClick={() => setFilterMonth('ALL')}
            className={`neo-btn px-3 py-1.5 text-xs ${
              filterMonth === 'ALL' ? 'bg-black text-white' : 'bg-white text-black'
            }`}
          >
            Tất Cả ({schedules.length})
          </button>
          <button
            onClick={() => setFilterMonth(11)}
            className={`neo-btn px-3 py-1.5 text-xs ${
              filterMonth === 11 ? 'bg-brand-red text-white' : 'bg-white text-black'
            }`}
          >
            Tháng 11 ({schedules.filter((s) => s.month === 11).length})
          </button>
          <button
            onClick={() => setFilterMonth(12)}
            className={`neo-btn px-3 py-1.5 text-xs ${
              filterMonth === 12 ? 'bg-brand-green text-white' : 'bg-white text-black'
            }`}
          >
            Tháng 12 ({schedules.filter((s) => s.month === 12).length})
          </button>
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          <input
            type="text"
            placeholder="Tìm theo show, địa điểm, venue..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="neo-input pl-10 pr-3 py-1.5 text-xs w-full"
          />
        </div>
      </div>

      {/* Schedules Table */}
      <div className="neo-box bg-white overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b-2 border-black bg-brand-paper text-[11px] font-black uppercase text-gray-700 font-cocogoose">
                <th className="p-3.5">Thời Gian</th>
                <th className="p-3.5">Tên Sự Kiện / Show</th>
                <th className="p-3.5">Phân Loại</th>
                <th className="p-3.5">Địa Điểm &amp; Sân Khấu</th>
                <th className="p-3.5">Trạng Thái &amp; Vé</th>
                <th className="p-3.5 text-right">Thao Tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 text-xs font-bold text-gray-800">
              {displayList.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-6 text-center text-gray-400 italic">
                    Không tìm thấy lịch trình nào.
                  </td>
                </tr>
              ) : (
                displayList.map((item) => (
                  <tr key={item.id} className="hover:bg-amber-50/50 transition-colors">
                    {/* Date */}
                    <td className="p-3.5 whitespace-nowrap">
                      <span className={`font-black text-sm font-cocogoose ${item.month === 11 ? 'text-brand-red' : 'text-brand-green'}`}>
                        {item.dateDisplay}
                      </span>
                      {item.time && (
                        <span className="block text-[11px] text-gray-600 font-bold">
                          ⏰ {item.time}
                        </span>
                      )}
                      <span className="block text-[10px] text-gray-400 font-normal">
                        T{item.month}/{item.year}
                      </span>
                    </td>

                    {/* Title & Icon */}
                    <td className="p-3.5">
                      <div className="space-y-1">
                        <div className="flex items-center gap-1.5">
                          <span className="font-extrabold text-black uppercase font-cocogoose">
                            {item.title}
                          </span>
                          {item.noteIcon && <span>{item.noteIcon}</span>}
                        </div>
                        {item.organizer && (
                          <span className="text-[10px] text-emerald-800 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200 inline-block">
                            BTC: {item.organizer}
                          </span>
                        )}
                        {item.lineup && (
                          <span className="text-[10px] text-purple-800 bg-purple-50 px-1.5 py-0.5 rounded border border-purple-200 inline-block ml-1">
                            ft. {item.lineup}
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Category */}
                    <td className="p-3.5 whitespace-nowrap">
                      <span className="neo-sticker bg-white text-black text-[10px] px-2 py-0.5">
                        {item.category}
                      </span>
                    </td>

                    {/* Location & Venue */}
                    <td className="p-3.5">
                      <div className="space-y-1">
                        {item.venue && (
                          <div className="text-[11px] font-black text-black">
                            🏛️ {item.venue}
                          </div>
                        )}
                        {item.location?.toUpperCase() === 'ONLINE' || item.locationType === 'ONLINE' ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-black bg-cyan-100 text-cyan-900 border border-cyan-400 px-2 py-0.5 rounded shadow-xs">
                            🌐 ONLINE
                          </span>
                        ) : item.location?.toUpperCase() === 'PRIVATE' || item.locationType === 'PRIVATE' ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-black bg-purple-100 text-purple-900 border border-purple-400 px-2 py-0.5 rounded shadow-xs">
                            🔒 PRIVATE
                          </span>
                        ) : item.location ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-black bg-gray-100 border border-black px-2 py-0.5 rounded">
                            <MapPin className="w-3 h-3 text-brand-red" />
                            {item.location}
                          </span>
                        ) : (
                          <span className="text-gray-400 italic text-[11px]">Chưa xác định</span>
                        )}
                      </div>
                    </td>

                    {/* Status & Ticket */}
                    <td className="p-3.5 whitespace-nowrap">
                      <div className="space-y-1">
                        {item.status === 'TBU' ? (
                          <span className="text-[10px] font-black text-orange-700 bg-orange-100 border border-orange-300 px-2 py-0.5 rounded block text-center">
                            Dự Kiến (TBU)
                          </span>
                        ) : item.status === 'UPCOMING' ? (
                          <span className="text-[10px] font-black text-emerald-800 bg-emerald-100 border border-emerald-300 px-2 py-0.5 rounded block text-center">
                            Sắp Diễn Ra
                          </span>
                        ) : (
                          <span className="text-[10px] font-black text-gray-600 bg-gray-100 border border-gray-300 px-2 py-0.5 rounded block text-center">
                            {item.status}
                          </span>
                        )}

                        {item.ticketUrl && (
                          <span className="text-[10px] font-black text-brand-red bg-red-50 border border-red-200 px-1.5 py-0.5 rounded flex items-center justify-center gap-1">
                            <Ticket className="w-2.5 h-2.5" />
                            <span>{item.ticketInfo || 'Có link vé'}</span>
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Actions */}
                    <td className="p-3.5 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => openEditModal(item)}
                          className="neo-btn bg-white hover:bg-brand-yellow p-1.5"
                          title="Chỉnh sửa"
                        >
                          <Edit2 className="w-3.5 h-3.5 text-blue-700" />
                        </button>
                        <button
                          onClick={() => handleDelete(item.id, item.title)}
                          className="neo-btn bg-white hover:bg-brand-red hover:text-white p-1.5"
                          title="Xóa"
                        >
                          <Trash2 className="w-3.5 h-3.5 text-red-600 hover:text-white" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* CREATE / EDIT MODAL (EXPANDED TO INCLUDE ALL FIELDS) */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="neo-box bg-white max-w-3xl w-full p-5 sm:p-7 relative max-h-[92vh] overflow-y-auto border-3 border-black shadow-brutal-xl my-auto">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 neo-btn bg-white hover:bg-gray-100 p-1"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="mb-5 pb-3 border-b-2 border-black">
              <span className="neo-sticker bg-brand-yellow text-black text-[10px] font-black">
                {editingItem ? 'CHỈNH SỬA SỰ KIỆN' : 'TẠO MỚI SỰ KIỆN'}
              </span>
              <h3 className="text-xl sm:text-2xl font-black text-black uppercase font-cocogoose mt-1">
                {editingItem ? 'Cập Nhật Lịch Trình' : 'Thêm Lịch Trình Mới'}
              </h3>
              <p className="text-xs font-bold text-gray-600">
                Nhập đầy đủ thông tin để hiển thị chi tiết tại bảng kẹp giấy và cột thông tin bên phải.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              
              {/* PHẦN 1: THÔNG TIN CƠ BẢN */}
              <div className="p-4 bg-brand-paper rounded-xl border-2 border-black space-y-3">
                <span className="text-xs font-black uppercase text-brand-red font-cocogoose flex items-center gap-1.5">
                  <Tag className="w-4 h-4" />
                  1. Thông Tin Cơ Bản
                </span>

                <div>
                  <label className="block text-xs font-black uppercase text-gray-700 mb-1">
                    Tên Sự Kiện / Tiêu Đề Show *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="VD: SHOPEE SAO LIVE ĐỈNH CHÓP, YSL HOLIDAY SHOW..."
                    value={formData.title || ''}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="neo-input w-full text-sm"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-black uppercase text-gray-700 mb-1">
                      Phân Loại *
                    </label>
                    <select
                      value={formData.category || 'STAGE'}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value as ScheduleCategory })}
                      className="neo-input w-full text-sm"
                    >
                      <option value="STAGE">STAGE (Sân khấu)</option>
                      <option value="CONCERT">CONCERT (Đại nhạc hội)</option>
                      <option value="SHOOTING">SHOOTING (Ghi hình / Quảng cáo)</option>
                      <option value="REHEARSAL">REHEARSAL (Tổng duyệt)</option>
                      <option value="BRAND_COLLAB">BRAND COLLAB (Hợp tác nhãn hàng)</option>
                      <option value="LIVESTREAM">LIVESTREAM</option>
                      <option value="FAN_MEETING">FAN MEETING</option>
                      <option value="POP_UP">POP UP EVENT</option>
                      <option value="EVENT">EVENT KHÁC</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-black uppercase text-gray-700 mb-1">
                      Trạng Thái *
                    </label>
                    <select
                      value={formData.status || 'UPCOMING'}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value as ScheduleStatus })}
                      className="neo-input w-full text-sm"
                    >
                      <option value="UPCOMING">Sắp diễn ra (Confirmed)</option>
                      <option value="TBU">Dự kiến / Chưa chốt (TBU)</option>
                      <option value="COMPLETED">Đã kết thúc</option>
                      <option value="CANCELLED">Hủy / Hoãn</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-black uppercase text-gray-700 mb-1">
                      Icon Doodle Trang Trí
                    </label>
                    <input
                      type="text"
                      placeholder="VD: 🎁, 🎮, 🤫, 😎, ⭐, ✨, 🎤"
                      value={formData.noteIcon || ''}
                      onChange={(e) => setFormData({ ...formData, noteIcon: e.target.value })}
                      className="neo-input w-full text-sm"
                    />
                  </div>
                </div>
              </div>

              {/* PHẦN 2: THỜI GIAN DIỄN RA */}
              <div className="p-4 bg-amber-50/70 rounded-xl border-2 border-black space-y-3">
                <span className="text-xs font-black uppercase text-amber-800 font-cocogoose flex items-center gap-1.5">
                  <Clock className="w-4 h-4" />
                  2. Thời Gian &amp; Lịch Trình
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-black uppercase text-gray-700 mb-1">
                      Ngày Hiển Thị (Format tự do) *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="VD: 10.11 hoặc 05-09.11 hoặc ??.11"
                      value={formData.dateDisplay || ''}
                      onChange={(e) => setFormData({ ...formData, dateDisplay: e.target.value })}
                      className="neo-input w-full text-sm font-cocogoose"
                    />
                    <span className="text-[10px] text-gray-500 font-semibold block mt-1">
                      Đây là chữ số hiển thị to trên bảng kẹp giấy.
                    </span>
                  </div>

                  <div>
                    <label className="block text-xs font-black uppercase text-gray-700 mb-1">
                      Giờ Diễn Ra (Khung giờ)
                    </label>
                    <input
                      type="text"
                      placeholder="VD: 19:30 hoặc 20:00 - 22:30 hoặc Cả ngày"
                      value={formData.time || ''}
                      onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                      className="neo-input w-full text-sm"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div>
                    <label className="block text-xs font-black uppercase text-gray-700 mb-1">
                      Tháng *
                    </label>
                    <select
                      value={formData.month || 11}
                      onChange={(e) => setFormData({ ...formData, month: Number(e.target.value) })}
                      className="neo-input w-full text-sm"
                    >
                      <option value={11}>Tháng 11</option>
                      <option value={12}>Tháng 12</option>
                      <option value={1}>Tháng 1</option>
                      <option value={2}>Tháng 2</option>
                      <option value={3}>Tháng 3</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-black uppercase text-gray-700 mb-1">
                      Năm
                    </label>
                    <input
                      type="number"
                      value={formData.year || 2026}
                      onChange={(e) => setFormData({ ...formData, year: Number(e.target.value) })}
                      className="neo-input w-full text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-black uppercase text-gray-700 mb-1">
                      Ngày Bắt Đầu (Lịch)
                    </label>
                    <input
                      type="date"
                      value={formData.startDate || ''}
                      onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                      className="neo-input w-full text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-black uppercase text-gray-700 mb-1">
                      Ngày Kết Thúc (Nếu có)
                    </label>
                    <input
                      type="date"
                      value={formData.endDate || ''}
                      onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                      className="neo-input w-full text-sm"
                    />
                  </div>
                </div>
              </div>

              {/* PHẦN 3: HÌNH THỨC & ĐỊA ĐIỂM TỔ CHỨC */}
              <div className="p-4 bg-emerald-50/70 rounded-xl border-2 border-black space-y-3">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <span className="text-xs font-black uppercase text-emerald-800 font-cocogoose flex items-center gap-1.5">
                    <MapPin className="w-4 h-4" />
                    3. Hình Thức &amp; Địa Điểm Tổ Chức
                  </span>

                  {/* 3 Quick Option Buttons: Offline, Online, Private */}
                  <div className="flex items-center gap-1 bg-white p-1 rounded-lg border-2 border-black shadow-brutal-xs">
                    <button
                      type="button"
                      onClick={() =>
                        setFormData({
                          ...formData,
                          locationType: 'OFFLINE',
                          location: formData.location === 'ONLINE' || formData.location === 'PRIVATE' ? '' : formData.location,
                          locationColor: 'green',
                        })
                      }
                      className={`px-2.5 py-1 text-xs font-black rounded transition-all ${
                        (formData.locationType || 'OFFLINE') === 'OFFLINE'
                          ? 'bg-brand-yellow text-black border border-black shadow-brutal-xs'
                          : 'text-gray-600 hover:text-black'
                      }`}
                    >
                      🏢 Địa Điểm Cụ Thể
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        setFormData({
                          ...formData,
                          locationType: 'ONLINE',
                          location: 'ONLINE',
                          venue: formData.venue || 'Livestream Trực Tuyến',
                          locationColor: 'cyan',
                        })
                      }
                      className={`px-2.5 py-1 text-xs font-black rounded transition-all ${
                        formData.locationType === 'ONLINE'
                          ? 'bg-cyan-300 text-black border border-black shadow-brutal-xs'
                          : 'text-gray-600 hover:text-black'
                      }`}
                    >
                      🌐 Online
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        setFormData({
                          ...formData,
                          locationType: 'PRIVATE',
                          location: 'PRIVATE',
                          venue: formData.venue || 'Sự Kiện Kín / Nội Bộ',
                          locationColor: 'purple',
                        })
                      }
                      className={`px-2.5 py-1 text-xs font-black rounded transition-all ${
                        formData.locationType === 'PRIVATE'
                          ? 'bg-purple-300 text-black border border-black shadow-brutal-xs'
                          : 'text-gray-600 hover:text-black'
                      }`}
                    >
                      🔒 Private
                    </button>
                  </div>
                </div>

                {formData.locationType === 'ONLINE' ? (
                  /* --- ONLINE FORM --- */
                  <div className="p-3.5 bg-cyan-50 border-2 border-cyan-400 rounded-xl space-y-3">
                    <div className="flex items-center gap-2 text-xs font-black text-cyan-900 font-cocogoose">
                      <Globe className="w-4 h-4 text-cyan-700" />
                      <span>SỰ KIỆN TRỰC TUYẾN (ONLINE)</span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-black uppercase text-gray-700 mb-1">
                          Nền Tảng Phát Sóng / Kênh Online (Venue)
                        </label>
                        <input
                          type="text"
                          placeholder="VD: Shopee Live, TikTok Live, YouTube, Zoom, Fanpage..."
                          value={formData.venue || ''}
                          onChange={(e) => setFormData({ ...formData, venue: e.target.value })}
                          className="neo-input w-full text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-black uppercase text-gray-700 mb-1">
                          Hiển Thị Badge Trên Bảng
                        </label>
                        <input
                          type="text"
                          value={formData.location || 'ONLINE'}
                          onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                          className="neo-input w-full text-sm font-bold uppercase"
                          placeholder="ONLINE"
                        />
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-[11px] text-cyan-800 font-semibold">
                      <Info className="w-3.5 h-3.5 shrink-0" />
                      <span>Sự kiện Online sẽ tự động ẩn nút Google Maps và hiển thị biểu tượng Online trực quan.</span>
                    </div>
                  </div>
                ) : formData.locationType === 'PRIVATE' ? (
                  /* --- PRIVATE FORM --- */
                  <div className="p-3.5 bg-purple-50 border-2 border-purple-400 rounded-xl space-y-3">
                    <div className="flex items-center gap-2 text-xs font-black text-purple-900 font-cocogoose">
                      <Lock className="w-4 h-4 text-purple-700" />
                      <span>SỰ KIỆN KÍN (PRIVATE SHOW / NỘI BỘ)</span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-black uppercase text-gray-700 mb-1">
                          Ghi Chú Tính Chất Sự Kiện (Venue)
                        </label>
                        <input
                          type="text"
                          placeholder="VD: Private Party, Nội bộ nhãn hàng, Không công khai..."
                          value={formData.venue || ''}
                          onChange={(e) => setFormData({ ...formData, venue: e.target.value })}
                          className="neo-input w-full text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-black uppercase text-gray-700 mb-1">
                          Hiển Thị Badge Trên Bảng
                        </label>
                        <input
                          type="text"
                          value={formData.location || 'PRIVATE'}
                          onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                          className="neo-input w-full text-sm font-bold uppercase"
                          placeholder="PRIVATE"
                        />
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-[11px] text-purple-800 font-semibold">
                      <Info className="w-3.5 h-3.5 shrink-0" />
                      <span>Địa điểm được bảo mật, tự động ẩn nút chỉ đường Google Maps để đảm bảo quyền riêng tư.</span>
                    </div>
                  </div>
                ) : (
                  /* --- OFFLINE SPECIFIC LOCATION FORM --- */
                  <div className="space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-black uppercase text-gray-700 mb-1">
                          Tỉnh / Thành Phố / Khu Vực
                        </label>
                        <input
                          type="text"
                          placeholder="VD: TP. HỒ CHÍ MINH, HÀ NỘI, HƯNG YÊN, TIỀN GIANG..."
                          value={formData.location || ''}
                          onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                          className="neo-input w-full text-sm uppercase"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-black uppercase text-gray-700 mb-1">
                          Sân Khấu / Địa Điểm Cụ Thể (Venue)
                        </label>
                        <input
                          type="text"
                          placeholder="VD: Sân Vận Động Mỹ Đình, Aeon Mall Long Biên, SECC..."
                          value={formData.venue || ''}
                          onChange={(e) => setFormData({ ...formData, venue: e.target.value })}
                          className="neo-input w-full text-sm"
                        />
                        <span className="text-[10px] text-gray-500 font-semibold block mt-1">
                          Dùng để tạo đường link chỉ đường Google Maps chính xác.
                        </span>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-black uppercase text-gray-700 mb-1">
                        Màu Sắc Badge Địa Điểm (Trên bảng kẹp giấy)
                      </label>
                      <select
                        value={formData.locationColor || 'green'}
                        onChange={(e) => setFormData({ ...formData, locationColor: e.target.value as LocationBadgeColor })}
                        className="neo-input w-full text-sm"
                      >
                        <option value="green">Xanh lá (TP. Hồ Chí Minh)</option>
                        <option value="purple">Tím (Hà Nội / Mỹ Đình)</option>
                        <option value="yellow">Vàng cam (Hưng Yên)</option>
                        <option value="pink">Hồng (Buôn Ma Thuột)</option>
                        <option value="cyan">Xanh cyan (Tiền Giang, Thái Lan)</option>
                        <option value="orange">Cam nổi bật</option>
                        <option value="blue">Xanh dương đậm</option>
                      </select>
                    </div>
                  </div>
                )}
              </div>

              {/* PHẦN 4: ĐƠN VỊ TỔ CHỨC & NGHỆ SĨ ĐỒNG HÀNH */}
              <div className="p-4 bg-purple-50/70 rounded-xl border-2 border-black space-y-3">
                <span className="text-xs font-black uppercase text-purple-900 font-cocogoose flex items-center gap-1.5">
                  <Building2 className="w-4 h-4" />
                  4. Đơn Vị Tổ Chức &amp; Khách Mời
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-black uppercase text-gray-700 mb-1">
                      Đơn Vị Tổ Chức / Nhãn Hàng
                    </label>
                    <input
                      type="text"
                      placeholder="VD: Shopee, YSL Beauty, VTV3, Tomorrowland, Fandom Ô Mai..."
                      value={formData.organizer || ''}
                      onChange={(e) => setFormData({ ...formData, organizer: e.target.value })}
                      className="neo-input w-full text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-black uppercase text-gray-700 mb-1">
                      Nghệ Sĩ Đồng Hành / Lineup Khách Mời
                    </label>
                    <input
                      type="text"
                      placeholder="VD: Jun Phạm, Hà An Huy, Hoàng Dũng, Nhà Thăng Hoa..."
                      value={formData.lineup || ''}
                      onChange={(e) => setFormData({ ...formData, lineup: e.target.value })}
                      className="neo-input w-full text-sm"
                    />
                  </div>
                </div>
              </div>

              {/* PHẦN 5: THÔNG TIN VÉ & ĐƯỜNG DẪN THAM DỰ */}
              <div className="p-4 bg-red-50/70 rounded-xl border-2 border-black space-y-3">
                <span className="text-xs font-black uppercase text-brand-red font-cocogoose flex items-center gap-1.5">
                  <Ticket className="w-4 h-4" />
                  5. Thông Tin Vé &amp; Link Tham Dự
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-black uppercase text-gray-700 mb-1">
                      Thông Tin Vé / Hình Thức Vào Cửa
                    </label>
                    <input
                      type="text"
                      placeholder="VD: Vào cửa tự do, Vé VIP / GA, Đăng ký trước, Livestream miễn phí..."
                      value={formData.ticketInfo || ''}
                      onChange={(e) => setFormData({ ...formData, ticketInfo: e.target.value })}
                      className="neo-input w-full text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-black uppercase text-gray-700 mb-1">
                      Link Mua Vé / Xem Trực Tuyến
                    </label>
                    <input
                      type="url"
                      placeholder="VD: https://ticketbox.vn/... hoặc link Livestream Shopee/FB"
                      value={formData.ticketUrl || ''}
                      onChange={(e) => setFormData({ ...formData, ticketUrl: e.target.value })}
                      className="neo-input w-full text-sm font-mono"
                    />
                  </div>
                </div>
              </div>

              {/* PHẦN 6: LƯU Ý CHO FANDOM Ô MAI */}
              <div className="p-4 bg-yellow-50 rounded-xl border-2 border-black space-y-3">
                <span className="text-xs font-black uppercase text-amber-900 font-cocogoose flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4" />
                  6. Ghi Chú &amp; Hướng Dẫn Cho Fandom Ô Mai
                </span>

                <div>
                  <label className="block text-xs font-black uppercase text-gray-700 mb-1">
                    Ghi Chú Đặc Biệt (Hiển thị nổi bật ở chi tiết sự kiện)
                  </label>
                  <textarea
                    rows={3}
                    placeholder="VD: Dresscode vàng/hồng, có quà giveaway cho 100 bạn Ô Mai đến sớm, check-in từ 17:00, fanchant bài Người Âm Phủ..."
                    value={formData.note || ''}
                    onChange={(e) => setFormData({ ...formData, note: e.target.value })}
                    className="neo-input w-full text-sm"
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-4 flex items-center justify-end gap-3 border-t-2 border-gray-200 sticky bottom-0 bg-white py-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="neo-btn bg-white hover:bg-gray-100 text-black px-4 py-2 text-sm"
                >
                  Hủy Bỏ
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="neo-btn bg-brand-yellow hover:bg-yellow-400 text-black px-6 py-2.5 text-sm font-black shadow-brutal"
                >
                  {submitting ? 'Đang lưu...' : editingItem ? 'Lưu Thay Đổi' : 'Thêm Sự Kiện Mới'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
