'use client';

import { useState } from 'react';
import { ImagePlus, RotateCcw } from 'lucide-react';
import { resolveStackImages } from '@/lib/stackDropGame';

interface StackImageManagerProps {
  initialImages?: string[];
  onSaved: (images: string[]) => void;
}

/**
 * Lưu 6 ảnh hình tròn vào profile. Ô trống được lưu là chuỗi rỗng để dùng ảnh mặc định.
 * @param {string[]} images Danh sách đúng 6 đường dẫn.
 * @returns {Promise<void>}
 */
async function saveStackImages(images: string[]): Promise<void> {
  const response = await fetch('/api/profile', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ stackImages: images }),
  });
  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    throw new Error(data.error || 'Không lưu được ảnh game');
  }
}

export default function StackImageManager({ initialImages, onSaved }: StackImageManagerProps) {
  const [images, setImages] = useState<string[]>(() => resolveStackImages(initialImages));
  const [busyIndex, setBusyIndex] = useState(-1);
  const [error, setError] = useState('');

  /**
   * Ghi một size rồi cập nhật state.
   * @param {string[]} next Danh sách mới.
   * @param {number} index Size đang sửa.
   */
  async function persist(next: string[], index: number) {
    setBusyIndex(index);
    setError('');
    try {
      await saveStackImages(next);
      setImages(resolveStackImages(next));
      onSaved(next);
    } catch (saveError) {
      console.error('Save stack images failed:', saveError);
      setError(saveError instanceof Error ? saveError.message : 'Không lưu được ảnh game');
    } finally {
      setBusyIndex(-1);
    }
  }

  async function handleUpload(index: number, file: File | null) {
    if (!file) return;
    setBusyIndex(index);
    setError('');
    try {
      const formData = new FormData();
      formData.append('file', file);
      const response = await fetch('/api/upload', { method: 'POST', body: formData });
      const data = await response.json().catch(() => ({}));
      if (!response.ok || !data.url) {
        throw new Error(data.error || 'Không tải được ảnh');
      }
      const next = [...images];
      next[index] = data.url;
      await saveStackImages(next);
      setImages(next);
      onSaved(next);
    } catch (uploadError) {
      console.error('Upload stack image failed:', uploadError);
      setError(uploadError instanceof Error ? uploadError.message : 'Không tải được ảnh');
    } finally {
      setBusyIndex(-1);
    }
  }

  return (
    <section className="neo-box bg-white p-6">
      <h3 className="border-b-2 border-gray-200 pb-2 text-lg font-black uppercase text-black font-cocogoose">
        Ảnh hình tròn minigame
      </h3>
      <p className="mt-2 text-sm font-bold text-gray-600">
        Size 1 là hình nhỏ nhất được thả. Size 6 là hình lớn nhất, hai hình này chạm nhau thì biến mất.
      </p>
      <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
        {images.map((src, index) => (
          <div key={index} className="flex flex-col items-center gap-2">
            <img
              src={src}
              alt={`Size ${index + 1}`}
              className="h-20 w-20 rounded-full border-2 border-black object-cover"
            />
            <p className="text-sm font-black">Size {index + 1}</p>
            <label className="neo-btn cursor-pointer bg-brand-yellow px-3 py-2 text-sm">
              <ImagePlus className="h-4 w-4" />
              <span className="ml-1">{busyIndex === index ? 'Đang lưu' : 'Đổi ảnh'}</span>
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                className="sr-only"
                disabled={busyIndex === index}
                onChange={(event) => {
                  const file = event.target.files?.[0] || null;
                  event.target.value = '';
                  handleUpload(index, file);
                }}
              />
            </label>
            <button
              type="button"
              disabled={busyIndex === index}
              onClick={() => {
                const next = [...images];
                next[index] = '';
                persist(next, index);
              }}
              className="inline-flex items-center text-sm font-bold text-gray-600 disabled:opacity-60"
            >
              <RotateCcw className="mr-1 h-4 w-4" />
              Mặc định
            </button>
          </div>
        ))}
      </div>
      {error && <p className="mt-3 text-sm font-bold text-brand-red">{error}</p>}
    </section>
  );
}
