'use client';

import { useState } from 'react';
import Image from 'next/image';
import { GalleryItem } from '@/types';
import { UploadCloud, Trash2, Plus, Check, ImageIcon, Pencil, X } from 'lucide-react';

export default function GalleryManagerClient({ initialGallery }: { initialGallery: GalleryItem[] }) {
  const [gallery, setGallery] = useState<GalleryItem[]>(initialGallery);
  const [uploading, setUploading] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  // Form for new photo
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Concert');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  // Edit state
  const [editingItem, setEditingItem] = useState<GalleryItem | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editCategory, setEditCategory] = useState('Concert');
  const [editFile, setEditFile] = useState<File | null>(null);
  const [editPreviewUrl, setEditPreviewUrl] = useState<string | null>(null);
  const [savingEdit, setSavingEdit] = useState(false);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleEditFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setEditFile(file);
      setEditPreviewUrl(URL.createObjectURL(file));
    }
  };

  const openEditModal = (item: GalleryItem) => {
    setEditingItem(item);
    setEditTitle(item.title);
    setEditCategory(item.category);
    setEditFile(null);
    setEditPreviewUrl(item.imageUrl);
  };

  const closeEditModal = () => {
    setEditingItem(null);
    setEditFile(null);
    setEditPreviewUrl(null);
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem) return;
    if (!editTitle.trim()) {
      alert('Vui lòng nhập tiêu đề ảnh');
      return;
    }

    setSavingEdit(true);
    try {
      let finalImageUrl = editingItem.imageUrl;

      // If user uploaded a new replacement photo
      if (editFile) {
        const formData = new FormData();
        formData.append('file', editFile);

        const upRes = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });
        const upData = await upRes.json();
        if (!upRes.ok || !upData.url) {
          alert(upData.error || 'Lỗi khi tải ảnh mới lên');
          setSavingEdit(false);
          return;
        }
        finalImageUrl = upData.url;
      }

      // Update gallery item in DB
      const res = await fetch(`/api/gallery/${editingItem.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: editTitle.trim(),
          category: editCategory,
          imageUrl: finalImageUrl,
        }),
      });

      const data = await res.json();
      if (res.ok && data.item) {
        setGallery((prev) =>
          prev.map((g) => (g.id === editingItem.id ? data.item : g))
        );
        closeEditModal();
        showToast('Đã cập nhật thông tin ảnh thành công!');
      } else {
        alert(data.error || 'Lỗi cập nhật ảnh');
      }
    } catch (err) {
      alert('Lỗi kết nối khi cập nhật ảnh');
    } finally {
      setSavingEdit(false);
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile || !title) {
      alert('Vui lòng chọn ảnh và nhập tiêu đề');
      return;
    }

    setUploading(true);
    try {
      // 1. Upload file
      const formData = new FormData();
      formData.append('file', selectedFile);

      const upRes = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });
      const upData = await upRes.json();

      if (!upRes.ok || !upData.url) {
        alert(upData.error || 'Lỗi tải ảnh lên');
        setUploading(false);
        return;
      }

      // 2. Add to gallery DB
      const galRes = await fetch('/api/gallery', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageUrl: upData.url,
          title,
          category,
        }),
      });

      const galData = await galRes.json();
      if (galRes.ok) {
        setGallery((prev) => [galData.item, ...prev]);
        setTitle('');
        setSelectedFile(null);
        setPreviewUrl(null);
        showToast('Đã tải ảnh lên thành công!');
      } else {
        alert(galData.error || 'Lỗi lưu thông tin ảnh');
      }
    } catch (err) {
      alert('Lỗi kết nối khi tải ảnh');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Bạn có chắc muốn xóa ảnh này?')) return;

    try {
      const res = await fetch(`/api/gallery?id=${id}`, { method: 'DELETE' });
      if (res.ok) {
        setGallery((prev) => prev.filter((g) => g.id !== id));
        showToast('Đã xóa ảnh');
      } else {
        alert('Lỗi khi xóa ảnh');
      }
    } catch (err) {
      alert('Lỗi kết nối');
    }
  };

  return (
    <div className="space-y-8">
      {/* Toast */}
      {toast && (
        <div className="fixed top-20 right-6 z-50 neo-box p-3 bg-brand-yellow text-black flex items-center gap-2 text-sm font-black animate-bounce">
          <Check className="w-5 h-5 text-green-700" />
          <span>{toast}</span>
        </div>
      )}

      {/* Header */}
      <div>
        <span className="neo-sticker bg-brand-lightgreen text-black text-xs font-black">
          MEDIA & ASSETS
        </span>
        <h1 className="text-2xl sm:text-4xl font-black text-black uppercase font-cocogoose mt-1">
          Quản Lý Thư Viện Ảnh
        </h1>
        <p className="text-xs sm:text-sm font-bold text-gray-600">
          Tải ảnh mới lên Cloudinary hoặc bộ nhớ website • Hiển thị trực tiếp trên trang chủ
        </p>
      </div>

      {/* Upload Box */}
      <div className="neo-box p-6 bg-white border-3 border-black">
        <h3 className="text-lg font-black text-black uppercase font-cocogoose mb-4 flex items-center gap-2">
          <UploadCloud className="w-5 h-5 text-brand-blue" />
          Tải Ảnh Mới Lên Website
        </h3>

        <form onSubmit={handleUpload} className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
          {/* File Picker / Preview Canvas */}
          <div className="md:col-span-5">
            <label className="block text-xs font-black uppercase text-gray-700 mb-2">
              Chọn Tệp Ảnh (JPG, PNG, WEBP)
            </label>
            <div className="border-3 border-dashed border-black rounded-xl p-4 text-center bg-gray-50 hover:bg-amber-50 transition-colors relative cursor-pointer min-h-[180px] flex flex-col items-center justify-center">
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="absolute inset-0 opacity-0 cursor-pointer z-10"
              />
              {previewUrl ? (
                <div className="relative w-full aspect-[4/3] rounded-lg overflow-hidden border-2 border-black">
                  <Image src={previewUrl} alt="Preview" fill unoptimized className="object-cover" />
                </div>
              ) : (
                <div className="space-y-2 pointer-events-none">
                  <ImageIcon className="w-10 h-10 text-gray-400 mx-auto" />
                  <p className="text-xs font-black text-black">Bấm hoặc kéo thả ảnh vào đây</p>
                  <p className="text-[10px] text-gray-500 font-bold">Dung lượng tối đa 10MB</p>
                </div>
              )}
            </div>
          </div>

          {/* Metadata Inputs */}
          <div className="md:col-span-7 space-y-4">
            <div>
              <label className="block text-xs font-black uppercase text-gray-700 mb-1">
                Tiêu Đề / Chú Thích Ảnh *
              </label>
              <input
                type="text"
                required
                placeholder="VD: Chủ tịch Mai biểu diễn tại ATVNCG..."
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="neo-input w-full text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-black uppercase text-gray-700 mb-1">
                Chuyên Mục
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="neo-input w-full text-sm"
              >
                <option value="Concert">Concert / Sân Khấu</option>
                <option value="Merchandise">Thời Trang & Merch</option>
                <option value="Editorial">Chụp Ảnh Concept (Editorial)</option>
                <option value="Behind-the-scenes">Hậu Trường (Behind-the-scenes)</option>
              </select>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={uploading || !selectedFile}
                className="neo-btn bg-brand-yellow hover:bg-yellow-400 text-black px-6 py-2.5 text-sm font-black gap-2 w-full sm:w-auto"
              >
                <UploadCloud className="w-4 h-4" />
                <span>{uploading ? 'Đang Tải Ảnh Lên...' : 'Tải Lên Thư Viện'}</span>
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* Existing Gallery Grid */}
      <div>
        <h3 className="text-xl font-black text-black uppercase font-cocogoose mb-4">
          Ảnh Đang Hiển Thị ({gallery.length})
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {gallery.map((item) => (
            <div key={item.id} className="neo-box p-3 bg-white space-y-2">
              <div className="relative aspect-[4/3] rounded-lg overflow-hidden border-2 border-black bg-gray-100">
                <Image src={item.imageUrl} alt={item.title} fill unoptimized className="object-cover" />
              </div>

              <div className="flex items-center justify-between pt-1">
                <div>
                  <h4 className="font-black text-xs text-black truncate max-w-[180px] font-cocogoose">
                    {item.title}
                  </h4>
                  <span className="text-[10px] font-bold text-gray-500 uppercase">
                    {item.category}
                  </span>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => openEditModal(item)}
                    className="neo-btn bg-white hover:bg-brand-yellow p-1.5"
                    title="Chỉnh sửa thông tin ảnh"
                  >
                    <Pencil className="w-3.5 h-3.5 text-black" />
                  </button>
                  <button
                    onClick={() => handleDelete(item.id)}
                    className="neo-btn bg-white hover:bg-brand-red hover:text-white p-1.5"
                    title="Xóa ảnh"
                  >
                    <Trash2 className="w-3.5 h-3.5 text-red-600 hover:text-white" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Edit Photo Modal */}
      {editingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="neo-box bg-white max-w-lg w-full p-6 border-3 border-black shadow-brutal-lg max-h-[90vh] overflow-y-auto space-y-5">
            <div className="flex items-center justify-between border-b-2 border-black pb-3">
              <div>
                <span className="neo-sticker bg-brand-yellow text-black text-[10px] font-black">
                  CHỈNH SỬA
                </span>
                <h3 className="text-lg font-black text-black uppercase font-cocogoose mt-1">
                  Cập Nhật Thông Tin Ảnh
                </h3>
              </div>
              <button
                type="button"
                onClick={closeEditModal}
                className="neo-btn p-1.5 bg-gray-100 hover:bg-black hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-4">
              {/* Image Preview */}
              <div>
                <label className="block text-xs font-black uppercase text-gray-700 mb-1">
                  Hình Ảnh Hiện Tại
                </label>
                <div className="relative aspect-[4/3] rounded-xl overflow-hidden border-2 border-black bg-gray-100 max-h-[220px]">
                  {editPreviewUrl && (
                    <Image
                      src={editPreviewUrl}
                      alt="Preview"
                      fill
                      unoptimized
                      className="object-cover"
                    />
                  )}
                </div>
              </div>

              {/* Change Image File Optional */}
              <div>
                <label className="block text-xs font-black uppercase text-gray-700 mb-1">
                  Thay Ảnh Khác (Tùy chọn)
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleEditFileChange}
                  className="neo-input w-full text-xs"
                />
                <p className="text-[10px] text-gray-500 font-bold mt-1">
                  Để trống nếu bạn chỉ muốn sửa tiêu đề hoặc chuyên mục
                </p>
              </div>

              {/* Title */}
              <div>
                <label className="block text-xs font-black uppercase text-gray-700 mb-1">
                  Tiêu Đề / Chú Thích Ảnh *
                </label>
                <input
                  type="text"
                  required
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="neo-input w-full text-sm"
                  placeholder="Nhập tiêu đề hoặc chú thích..."
                />
              </div>

              {/* Category */}
              <div>
                <label className="block text-xs font-black uppercase text-gray-700 mb-1">
                  Chuyên Mục
                </label>
                <select
                  value={editCategory}
                  onChange={(e) => setEditCategory(e.target.value)}
                  className="neo-input w-full text-sm"
                >
                  <option value="Concert">Concert / Sân Khấu</option>
                  <option value="Merchandise">Thời Trang & Merch</option>
                  <option value="Editorial">Chụp Ảnh Concept (Editorial)</option>
                  <option value="Behind-the-scenes">Hậu Trường (Behind-the-scenes)</option>
                </select>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t-2 border-gray-100">
                <button
                  type="button"
                  onClick={closeEditModal}
                  className="neo-btn bg-white hover:bg-gray-100 text-gray-700 px-4 py-2 text-xs font-black"
                >
                  Hủy Bỏ
                </button>
                <button
                  type="submit"
                  disabled={savingEdit || !editTitle.trim()}
                  className="neo-btn bg-brand-yellow hover:bg-yellow-400 text-black px-5 py-2 text-xs font-black gap-1.5 shadow-brutal"
                >
                  <Check className="w-4 h-4 text-green-700" />
                  <span>{savingEdit ? 'Đang Lưu Thay Đổi...' : 'Lưu Thay Đổi'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

