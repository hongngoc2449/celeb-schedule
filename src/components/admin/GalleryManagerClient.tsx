'use client';

import { useState } from 'react';
import Image from 'next/image';
import { GalleryItem } from '@/types';
import { UploadCloud, Trash2, Plus, Check, ImageIcon } from 'lucide-react';

export default function GalleryManagerClient({ initialGallery }: { initialGallery: GalleryItem[] }) {
  const [gallery, setGallery] = useState<GalleryItem[]>(initialGallery);
  const [uploading, setUploading] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  // Form for new photo
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Concert');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

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
                  <Image src={previewUrl} alt="Preview" fill className="object-cover" />
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
                <Image src={item.imageUrl} alt={item.title} fill className="object-cover" />
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

                <button
                  onClick={() => handleDelete(item.id)}
                  className="neo-btn bg-white hover:bg-brand-red hover:text-white p-1.5"
                  title="Xóa ảnh"
                >
                  <Trash2 className="w-3.5 h-3.5 text-red-600 hover:text-white" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

