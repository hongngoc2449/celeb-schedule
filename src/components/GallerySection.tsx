'use client';

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { GalleryItem, CelebrityProfile } from '@/types';
import {
  X,
  Maximize2,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Sparkles
} from 'lucide-react';
import { getSiteText } from '@/lib/siteTexts';

export default function GallerySection({
  gallery,
  profile,
}: {
  gallery: GalleryItem[];
  profile?: CelebrityProfile;
}) {
  const t = (id: string) => getSiteText(profile?.siteTexts, id);

  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [zoomScale, setZoomScale] = useState<number>(1);

  const activeImage = selectedIndex !== null ? gallery[selectedIndex] : null;

  const handlePrev = useCallback(() => {
    setZoomScale(1);
    setSelectedIndex((prev) =>
      prev !== null ? (prev - 1 + gallery.length) % gallery.length : 0
    );
  }, [gallery.length]);

  const handleNext = useCallback(() => {
    setZoomScale(1);
    setSelectedIndex((prev) =>
      prev !== null ? (prev + 1) % gallery.length : 0
    );
  }, [gallery.length]);

  const handleZoomToggle = () => {
    setZoomScale((prev) => (prev > 1 ? 1 : 1.75));
  };

  const handleZoomIn = (e: React.MouseEvent) => {
    e.stopPropagation();
    setZoomScale((prev) => Math.min(2.5, +(prev + 0.35).toFixed(2)));
  };

  const handleZoomOut = (e: React.MouseEvent) => {
    e.stopPropagation();
    setZoomScale((prev) => Math.max(1, +(prev - 0.35).toFixed(2)));
  };

  const handleResetZoom = (e: React.MouseEvent) => {
    e.stopPropagation();
    setZoomScale(1);
  };

  const handleClose = () => {
    setSelectedIndex(null);
    setZoomScale(1);
  };

  // Keyboard navigation
  useEffect(() => {
    if (selectedIndex === null) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') handleClose();
      if (e.key === 'ArrowLeft') handlePrev();
      if (e.key === 'ArrowRight') handleNext();
      if (e.key === '+' || e.key === '=') {
        setZoomScale((prev) => Math.min(2.5, +(prev + 0.35).toFixed(2)));
      }
      if (e.key === '-') {
        setZoomScale((prev) => Math.max(1, +(prev - 0.35).toFixed(2)));
      }
      if (e.key === '0') {
        setZoomScale(1);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedIndex, handlePrev, handleNext]);

  // Lock body scroll when modal is active
  useEffect(() => {
    if (selectedIndex !== null) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [selectedIndex]);

  return (
    <section id="gallery" className="py-16 sm:py-24 px-4 sm:px-8 border-b-3 border-black bg-white">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12 space-y-3">
          <span className="neo-sticker bg-brand-lightgreen text-black rotate-1 text-xs sm:text-sm font-black">
            {t('gallery_header_tag')}
          </span>
          <h2 className="text-3xl sm:text-5xl font-black text-black uppercase font-cocogoose">
            {t('gallery_section_title')}
          </h2>
          <p className="text-gray-700 text-sm sm:text-base font-semibold max-w-xl mx-auto">
            {t('gallery_section_desc')}
          </p>
        </div>

        {/* Gallery Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {gallery.map((item, idx) => (
            <div
              key={item.id}
              onClick={() => {
                setSelectedIndex(idx);
                setZoomScale(1);
              }}
              className="neo-box p-3 bg-[#fffef9] group cursor-pointer hover:-translate-y-1 hover:shadow-brutal-lg transition-all"
            >
              {/* Photo Canvas */}
              <div className="relative aspect-[4/3] rounded-lg overflow-hidden border-2 border-black bg-gray-100">
                <Image
                  src={item.imageUrl}
                  alt={item.title}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-black/35 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <span className="neo-btn bg-brand-yellow text-black text-xs px-3.5 py-1.5 gap-1.5 shadow-brutal-sm font-black scale-95 group-hover:scale-100 transition-transform">
                    <Maximize2 className="w-4 h-4 text-brand-red" />
                    <span>Nhấp để phóng to</span>
                  </span>
                </div>
              </div>

              {/* Caption */}
              <div className="pt-3 pb-1 flex items-center justify-between">
                <div>
                  <h4 className="font-extrabold text-sm text-black truncate max-w-[200px] font-cocogoose">
                    {item.title}
                  </h4>
                  <span className="text-[11px] font-bold text-gray-500 uppercase">
                    {item.category}
                  </span>
                </div>
                {item.date && (
                  <span className="text-[10px] font-bold bg-amber-100 border border-black px-1.5 py-0.5 rounded">
                    {item.date}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* ============================================================== */}
        {/* ENHANCED FULLSCREEN LIGHTBOX & ZOOM VIEWER                    */}
        {/* ============================================================== */}
        {activeImage && selectedIndex !== null && (
          <div
            className="fixed inset-0 z-50 bg-black/95 backdrop-blur-md flex flex-col justify-between p-3 sm:p-5 select-none animate-fadeIn"
            onClick={handleClose}
          >
            {/* 1. TOP TOOLBAR */}
            <div
              className="flex items-center justify-between gap-3 text-white border-b border-white/20 pb-3"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Left: Info */}
              <div className="flex items-center gap-3 min-w-0">
                <span className="neo-sticker bg-brand-yellow text-black text-[10px] font-black shrink-0">
                  {selectedIndex + 1} / {gallery.length}
                </span>
                <div className="min-w-0">
                  <h3 className="font-black text-sm sm:text-base text-white truncate font-cocogoose">
                    {activeImage.title}
                  </h3>
                  <span className="text-[11px] font-semibold text-gray-400 block truncate">
                    Chuyên mục: {activeImage.category} {activeImage.date ? `• ${activeImage.date}` : ''}
                  </span>
                </div>
              </div>

              {/* Right: Zoom & Window Controls */}
              <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
                {/* Zoom Out */}
                <button
                  type="button"
                  onClick={handleZoomOut}
                  disabled={zoomScale <= 1}
                  className="neo-btn bg-white hover:bg-gray-200 disabled:opacity-40 disabled:hover:bg-white text-black p-2 text-xs font-black shadow-brutal-xs"
                  title="Thu nhỏ (-)"
                >
                  <ZoomOut className="w-4 h-4" />
                </button>

                {/* Zoom Indicator / Toggle */}
                <button
                  type="button"
                  onClick={handleZoomToggle}
                  className="neo-btn bg-brand-yellow hover:bg-yellow-400 text-black px-3 py-1.5 text-xs font-black shadow-brutal-xs whitespace-nowrap"
                  title="Nhấp để chuyển đổi 100% / 175%"
                >
                  <span>{Math.round(zoomScale * 100)}%</span>
                </button>

                {/* Zoom In */}
                <button
                  type="button"
                  onClick={handleZoomIn}
                  disabled={zoomScale >= 2.5}
                  className="neo-btn bg-white hover:bg-gray-200 disabled:opacity-40 disabled:hover:bg-white text-black p-2 text-xs font-black shadow-brutal-xs"
                  title="Phóng to (+)"
                >
                  <ZoomIn className="w-4 h-4" />
                </button>

                {/* Reset Zoom */}
                {zoomScale > 1 && (
                  <button
                    type="button"
                    onClick={handleResetZoom}
                    className="neo-btn bg-gray-200 hover:bg-white text-black p-2 text-xs font-black shadow-brutal-xs"
                    title="Về kích thước chuẩn (0)"
                  >
                    <RotateCcw className="w-4 h-4" />
                  </button>
                )}

                {/* Open Raw in New Tab */}
                <a
                  href={activeImage.imageUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="neo-btn bg-white hover:bg-gray-100 text-black p-2 text-xs font-black shadow-brutal-xs"
                  title="Mở ảnh gốc chất lượng cao"
                >
                  <ExternalLink className="w-4 h-4 text-brand-blue" />
                </a>

                {/* Close Button */}
                <button
                  type="button"
                  onClick={handleClose}
                  className="neo-btn bg-brand-red hover:bg-red-700 text-white p-2 text-xs font-black shadow-brutal-xs"
                  title="Đóng (Esc)"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* 2. MAIN STAGE (PHOTO WITH ZOOM & PAN) */}
            <div
              className="relative flex-1 flex items-center justify-center overflow-auto w-full my-2 max-h-[75vh]"
              onClick={(e) => {
                // If user clicks the background around the image, close
                if (e.target === e.currentTarget) {
                  handleClose();
                }
              }}
            >
              {/* Prev Button */}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handlePrev();
                }}
                className="absolute left-2 sm:left-4 z-30 neo-btn bg-white hover:bg-brand-yellow text-black p-2.5 sm:p-3 rounded-full shadow-brutal border-2 border-black"
                title="Ảnh trước (Mũi tên trái)"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>

              {/* Next Button */}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleNext();
                }}
                className="absolute right-2 sm:right-4 z-30 neo-btn bg-white hover:bg-brand-yellow text-black p-2.5 sm:p-3 rounded-full shadow-brutal border-2 border-black"
                title="Ảnh tiếp theo (Mũi tên phải)"
              >
                <ChevronRight className="w-6 h-6" />
              </button>

              {/* Image Container with Zoom */}
              <div
                className="relative max-w-full max-h-full flex items-center justify-center transition-transform duration-200 ease-out"
                style={{
                  transform: `scale(${zoomScale})`,
                  cursor: zoomScale > 1 ? 'zoom-out' : 'zoom-in',
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  handleZoomToggle();
                }}
                title={zoomScale > 1 ? 'Nhấp để thu nhỏ về 100%' : 'Nhấp vào ảnh để phóng to chi tiết'}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={activeImage.imageUrl}
                  alt={activeImage.title}
                  className="max-h-[70vh] sm:max-h-[74vh] max-w-[90vw] object-contain rounded-xl border-3 border-black shadow-brutal-xl bg-black"
                />

                {/* Subtle Click Tip Badge when 100% */}
                {zoomScale === 1 && (
                  <div className="absolute bottom-3 bg-black/75 backdrop-blur-sm text-white px-3 py-1 rounded-full text-[11px] font-bold border border-white/20 pointer-events-none opacity-90">
                    🔍 Nhấp vào ảnh hoặc dùng nút + / - để phóng to
                  </div>
                )}
              </div>
            </div>

            {/* 3. BOTTOM THUMBNAILS CAROUSEL */}
            <div
              className="border-t border-white/20 pt-3 flex items-center justify-center gap-2 overflow-x-auto max-w-4xl mx-auto w-full scrollbar-none"
              onClick={(e) => e.stopPropagation()}
            >
              {gallery.map((thumb, idx) => {
                const isCurrent = idx === selectedIndex;
                return (
                  <button
                    key={thumb.id}
                    type="button"
                    onClick={() => {
                      setSelectedIndex(idx);
                      setZoomScale(1);
                    }}
                    className={`relative w-14 h-12 rounded-lg overflow-hidden border-2 shrink-0 transition-all ${
                      isCurrent
                        ? 'border-brand-yellow ring-2 ring-brand-yellow scale-105 shadow-brutal-xs'
                        : 'border-white/30 opacity-60 hover:opacity-100 hover:border-white'
                    }`}
                  >
                    <Image
                      src={thumb.imageUrl}
                      alt={thumb.title}
                      fill
                      className="object-cover"
                    />
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
